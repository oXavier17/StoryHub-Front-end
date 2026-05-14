import { useEffect, useState } from "react"
import obraService from "../services/obraService"
import generoService from "../services/generoService"
import {
    Plus, Pencil, Trash2, BookOpen, Upload, X, Search
} from "lucide-react"

const TIPOS = ["LIVRO", "MANGA", "HQ", "ANIME", "SERIE", "FILME"]

const getImagem = (imagemUrl) => {
    if (!imagemUrl) return "/placeholder.jpg"
    if (imagemUrl.startsWith("/uploads")) return `http://localhost:8080${imagemUrl}`
    return imagemUrl
}

const formVazio = {
    titulo: "", descricao: "", tipo: "MANGA",
    autor: "", estudio: "", imagemUrl: "", generos: []
}

export default function Obras() {
    const [obras, setObras]       = useState([])
    const [generos, setGeneros]   = useState([])
    const [busca, setBusca]       = useState("")
    const [carregando, setCarregando] = useState(true)
    const [modalAberto, setModalAberto] = useState(false)
    const [editando, setEditando] = useState(null)
    const [form, setForm]         = useState(formVazio)
    const [erro, setErro]         = useState("")
    const [salvando, setSalvando] = useState(false)
    const [arquivoImagem, setArquivoImagem] = useState(null)
    const [modalDeletar, setModalDeletar] = useState(null)
    const [volumesObra, setVolumesObra] = useState([])
    const [novoVolume, setNovoVolume]   = useState({ numeroVolume: "", isbn: "", dataLancamento: "" })
    const [quantidadeVolumes, setQuantidadeVolumes] = useState("")

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = async () => {
        try {
            const [obrasRes, generosRes] = await Promise.all([
                obraService.listar(),
                generoService.listar()
            ])
            setObras(obrasRes.data)
            setGeneros(generosRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setCarregando(false)
        }
    }

    const abrirEditar = async (obra) => {
        setEditando(obra)
        setForm({
            titulo:    obra.titulo,
            descricao: obra.descricao,
            tipo:      obra.tipo,
            autor:     obra.autor     || "",
            estudio:   obra.estudio   || "",
            imagemUrl: obra.imagemUrl || "",
            generos:   obra.generos   || []
        })
        setErro("")
        setArquivoImagem(null)
        setModalAberto(true)

        // carrega volumes se for tipo físico
        if (["LIVRO", "MANGA", "HQ"].includes(obra.tipo)) {
            try {
                const res = await obraService.listarVolumes(obra.idObra)
                setVolumesObra(res.data)
            } catch {
                setVolumesObra([])
            }
        } else {
            setVolumesObra([])
        }
    }

    const handleAdicionarVolumes = async () => {
        if (!quantidadeVolumes || !editando) return
        try {
            await obraService.criarVolumesLote({
                obraId:     editando.idObra,
                quantidade: parseInt(quantidadeVolumes)
            })
            const res = await obraService.listarVolumes(editando.idObra)
            setVolumesObra(res.data)
            setQuantidadeVolumes("")
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao adicionar volumes")
        }
    }

    const handleDeletarVolume = async (idVolume) => {
        try {
            await obraService.deletarVolume(idVolume)
            setVolumesObra(prev => prev.filter(v => v.idVolume !== idVolume))
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao deletar volume")
        }
    }

    const abrirCriar = () => {
        setEditando(null)
        setForm(formVazio)
        setErro("")
        setArquivoImagem(null)
        setVolumesObra([])
        setNovoVolume({ numeroVolume: "", isbn: "", dataLancamento: "" })
        setModalAberto(true)
    }

    const fecharModal = () => {
        setModalAberto(false)
        setEditando(null)
        setForm(formVazio)
        setErro("")
        setArquivoImagem(null)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleGenero = (nome) => {
        setForm(prev => ({
            ...prev,
            generos: prev.generos.includes(nome)
                ? prev.generos.filter(g => g !== nome)
                : [...prev.generos, nome]
        }))
    }

    const handleSalvar = async (e) => {
        e.preventDefault()
        setErro("")
        setSalvando(true)

        try {
            if (editando) {
                await obraService.atualizar(editando.idObra, form)
                if (arquivoImagem) {
                    const formData = new FormData()
                    formData.append("arquivo", arquivoImagem)
                    await obraService.uploadImagem(editando.idObra, formData)
                }
            } else {
                const formData = new FormData()
                formData.append("dados", new Blob([JSON.stringify(form)], { type: "application/json" }))
                if (arquivoImagem) {
                    formData.append("arquivo", arquivoImagem)
                }
                await obraService.criarComImagem(formData)
            }

            await carregarDados()
            fecharModal()
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao salvar obra")
        } finally {
            setSalvando(false)
        }
    }

    const handleDeletar = async () => {
        try {
            await obraService.deletar(modalDeletar.idObra)
            setModalDeletar(null)
            await carregarDados()
        } catch (err) {
            console.error(err)
        }
    }

    const obrasFiltradas = obras.filter(o =>
        o.titulo.toLowerCase().includes(busca.toLowerCase())
    )

    if (carregando) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
    )

    return (
        <div className="space-y-6">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Obras</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{obras.length} obra(s) cadastrada(s)</p>
                </div>
                <button
                    onClick={abrirCriar}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
                >
                    <Plus size={16} /> Nova Obra
                </button>
            </div>

            {/* Busca */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar obra..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
            </div>

            {/* Grid de obras */}
            {obrasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Nenhuma obra encontrada.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {obrasFiltradas.map(obra => (
                        <div key={obra.idObra} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 group">
                            {/* Imagem */}
                            <div className="relative h-56 bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={getImagem(obra.imagemUrl)}
                                    alt={obra.titulo}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = "/placeholder.jpg"}
                                />
                                {/* Ações no hover */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => abrirEditar(obra)}
                                        className="p-2 bg-white rounded-lg hover:bg-indigo-100 transition"
                                    >
                                        <Pencil size={16} className="text-indigo-600" />
                                    </button>
                                    <button
                                        onClick={() => setModalDeletar(obra)}
                                        className="p-2 bg-white rounded-lg hover:bg-red-100 transition"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                                {/* Badge tipo */}
                                <span className="absolute top-2 left-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                                    {obra.tipo}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{obra.titulo}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                    {obra.autor || obra.estudio || "—"}
                                </p>
                                {obra.generos?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {obra.generos.slice(0, 2).map(g => (
                                            <span key={g} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                                {g}
                                            </span>
                                        ))}
                                        {obra.generos.length > 2 && (
                                            <span className="text-xs text-gray-400">+{obra.generos.length - 2}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Criar/Editar */}
            {modalAberto && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Header modal */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {editando ? "Editar Obra" : "Nova Obra"}
                            </h2>
                            <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSalvar} className="p-5 space-y-4">
                            {erro && (
                                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                    {erro}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
                                <input name="titulo" value={form.titulo} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo *</label>
                                <select name="tipo" value={form.tipo} onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição *</label>
                                <textarea name="descricao" value={form.descricao} onChange={handleChange} required rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Autor</label>
                                    <input name="autor" value={form.autor} onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estúdio</label>
                                    <input name="estudio" value={form.estudio} onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                                </div>
                            </div>

                            {/* Imagem URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL da Imagem</label>
                                <input name="imagemUrl" value={form.imagemUrl} onChange={handleChange} placeholder="https://..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                            </div>

                            {/* Upload imagem */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ou envie uma imagem</label>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-indigo-500 transition">
                                    <Upload size={16} className="text-gray-400" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {arquivoImagem ? arquivoImagem.name : "Clique para selecionar"}
                                    </span>
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={(e) => setArquivoImagem(e.target.files[0])} />
                                </label>
                            </div>

                            {/* Gêneros */}
                            {generos.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gêneros</label>
                                    <div className="flex flex-wrap gap-2">
                                        {generos.map(g => (
                                            <button
                                                type="button"
                                                key={g}
                                                onClick={() => handleGenero(g)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                                    form.generos.includes(g)
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                }`}
                                            >
                                                {g.replace(/_/g, " ")}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(form.tipo === "LIVRO" || form.tipo === "MANGA" || form.tipo === "HQ") && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Volumes
                                </label>

                                {/* Volumes existentes */}
                                {editando && volumesObra.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {volumesObra.map(v => (
                                            <div key={v.idVolume} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                                                <span className="text-xs text-gray-700 dark:text-gray-300">Vol. {v.numeroVolume}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletarVolume(v.idVolume)}
                                                    className="text-red-400 hover:text-red-600 transition"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Adicionar volumes em lote */}
                                {editando ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Quantos volumes adicionar?"
                                            value={quantidadeVolumes}
                                            onChange={(e) => setQuantidadeVolumes(e.target.value)}
                                            min={1}
                                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAdicionarVolumes}
                                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">
                                        Salve a obra primeiro para adicionar volumes.
                                    </p>
                                )}
                            </div>
                        )}

                            {/* Botões */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={fecharModal}
                                    className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={salvando}
                                    className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition text-sm font-medium disabled:opacity-60">
                                    {salvando ? "Salvando..." : editando ? "Salvar" : "Criar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Deleção */}
            {modalDeletar && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Deletar Obra</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Tem certeza que deseja deletar <span className="font-medium text-gray-700 dark:text-gray-200">"{modalDeletar.titulo}"</span>? Essa ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setModalDeletar(null)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium">
                                Cancelar
                            </button>
                            <button onClick={handleDeletar}
                                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition text-sm font-medium">
                                Deletar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}