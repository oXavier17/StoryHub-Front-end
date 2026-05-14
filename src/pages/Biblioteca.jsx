import { useEffect, useState } from "react"
import bibliotecaService from "../services/bibliotecaService"
import obraService from "../services/obraService"
import {
    Plus, Trash2, Pencil, Heart, BookOpen,
    Search, X, ChevronUp, ChevronDown
} from "lucide-react"

const STATUS_OPTIONS = [
    { value: "PLANEJO_VER",  label: "Planejo Ver",  cor: "bg-gray-400"  },
    { value: "ACOMPANHANDO", label: "Acompanhando", cor: "bg-blue-500"  },
    { value: "COMPLETO",     label: "Completo",     cor: "bg-green-500" },
    { value: "ABANDONADO",   label: "Abandonado",   cor: "bg-red-500"   },
]

const getImagem = (imagemUrl) => {
    if (!imagemUrl) return "/placeholder.jpg"
    if (imagemUrl.startsWith("/uploads")) return `http://localhost:8080${imagemUrl}`
    return imagemUrl
}

const formVazio = {
    obraId: "", status: "PLANEJO_VER",
    progressoAtual: 0, totalUnidade: 0, favorito: false
}

export default function Biblioteca() {
    const [itens, setItens]           = useState([])
    const [obras, setObras]           = useState([])
    const [busca, setBusca]           = useState("")
    const [filtroStatus, setFiltroStatus] = useState("TODOS")
    const [carregando, setCarregando] = useState(true)
    const [modalAberto, setModalAberto] = useState(false)
    const [editando, setEditando]     = useState(null)
    const [form, setForm]             = useState(formVazio)
    const [erro, setErro]             = useState("")
    const [salvando, setSalvando]     = useState(false)
    const [modalDeletar, setModalDeletar] = useState(null)
    const [ordenacao, setOrdenacao]   = useState({ campo: "tituloObra", asc: true })

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = async () => {
        try {
            const [bibRes, obrasRes] = await Promise.all([
                bibliotecaService.listar(),
                obraService.listar()
            ])
            setItens(bibRes.data)
            setObras(obrasRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setCarregando(false)
        }
    }

    const abrirCriar = () => {
        setEditando(null)
        setForm(formVazio)
        setErro("")
        setModalAberto(true)
    }

    const abrirEditar = (item) => {
        setEditando(item)
        setForm({
            obraId:        item.obraId,
            status:        item.status,
            progressoAtual: item.progressoAtual,
            totalUnidade:      item.totalUnidade,
            favorito:      item.favorito
        })
        setErro("")
        setModalAberto(true)
    }

    const fecharModal = () => {
        setModalAberto(false)
        setEditando(null)
        setForm(formVazio)
        setErro("")
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm({ ...form, [name]: type === "checkbox" ? checked : value })
    }

    const handleSalvar = async (e) => {
        e.preventDefault()
        setErro("")
        setSalvando(true)
        try {
            const payload = {
                ...form,
                obraId:         parseInt(form.obraId),
                progressoAtual: parseInt(form.progressoAtual),
                totalUnidade:       parseInt(form.totalUnidade),
                favorito:       Boolean(form.favorito),
            }
            if (editando) {
                await bibliotecaService.atualizar(editando.idBiblioteca, payload)
            } else {
                await bibliotecaService.criar(payload)
            }
            await carregarDados()
            fecharModal()
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao salvar")
        } finally {
            setSalvando(false)
        }
    }

    const handleDeletar = async () => {
        try {
            await bibliotecaService.deletar(modalDeletar.idBiblioteca)
            setModalDeletar(null)
            await carregarDados()
        } catch (err) {
            console.error(err)
        }
    }

    const toggleOrdenacao = (campo) => {
        setOrdenacao(prev =>
            prev.campo === campo
                ? { campo, asc: !prev.asc }
                : { campo, asc: true }
        )
    }

    const itensFiltrados = itens
        .filter(i => {
            const buscaOk = i.tituloObra.toLowerCase().includes(busca.toLowerCase())
            const statusOk = filtroStatus === "TODOS" || i.status === filtroStatus
            return buscaOk && statusOk
        })
        .sort((a, b) => {
            const valA = a[ordenacao.campo]
            const valB = b[ordenacao.campo]
            if (valA < valB) return ordenacao.asc ? -1 : 1
            if (valA > valB) return ordenacao.asc ? 1 : -1
            return 0
        })

    const ThCol = ({ campo, label }) => (
        <th
            onClick={() => toggleOrdenacao(campo)}
            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-indigo-500 select-none"
        >
            <div className="flex items-center gap-1">
                {label}
                {ordenacao.campo === campo
                    ? ordenacao.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    : <ChevronUp size={14} className="opacity-20" />
                }
            </div>
        </th>
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Biblioteca</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{itens.length} obra(s) na biblioteca</p>
                </div>
                <button
                    onClick={abrirCriar}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
                >
                    <Plus size={16} /> Adicionar
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar obra..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["TODOS", ...STATUS_OPTIONS.map(s => s.value)].map(s => {
                        const opt = STATUS_OPTIONS.find(o => o.value === s)
                        return (
                            <button
                                key={s}
                                onClick={() => setFiltroStatus(s)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                                    filtroStatus === s
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-500"
                                }`}
                            >
                                {s === "TODOS" ? "Todos" : opt?.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Tabela */}
            {itensFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Nenhuma obra encontrada.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12"></th>
                                    <ThCol campo="tituloObra" label="Obra" />
                                    <ThCol campo="tipoObra"   label="Tipo" />
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gêneros</th>
                                    <ThCol campo="status"     label="Status" />
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progresso</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10"></th>
                                    <th className="px-4 py-3 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {itensFiltrados.map(item => {
                                    const statusOpt = STATUS_OPTIONS.find(s => s.value === item.status)
                                    const pct = item.totalUnidade > 0
                                        ? Math.min((item.progressoAtual / item.totalUnidade) * 100, 100)
                                        : 0

                                    return (
                                        <tr key={item.idBiblioteca} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                            {/* Imagem */}
                                            <td className="px-4 py-3">
                                                <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                    <img
                                                        src={getImagem(item.imagemUrl)}
                                                        alt={item.tituloObra}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => e.target.src = "/placeholder.jpg"}
                                                    />
                                                </div>
                                            </td>

                                            {/* Título */}
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.tituloObra}</p>
                                            </td>

                                            {/* Tipo */}
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                                    {item.tipoObra}
                                                </span>
                                            </td>

                                            {/* Gêneros */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.generos?.slice(0, 2).map(g => (
                                                        <span key={g} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                                            {g.replace(/_/g, " ")}
                                                        </span>
                                                    ))}
                                                    {item.generos?.length > 2 && (
                                                        <span className="text-xs text-gray-400">+{item.generos.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span className={`text-xs text-white px-2 py-0.5 rounded-full ${statusOpt?.cor}`}>
                                                    {statusOpt?.label}
                                                </span>
                                            </td>

                                            {/* Progresso */}
                                            <td className="px-4 py-3 min-w-[140px]">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{item.progressoAtual}/{item.totalUnidade}</span>
                                                        <span>{Math.round(pct)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                        <div
                                                            className="bg-indigo-500 h-1.5 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Favorito */}
                                            <td className="px-4 py-3">
                                                {item.favorito && (
                                                    <Heart size={16} className="text-pink-500 fill-pink-500" />
                                                )}
                                            </td>

                                            {/* Ações */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => abrirEditar(item)}
                                                        className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-500 transition"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setModalDeletar(item)}
                                                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Criar/Editar */}
            {modalAberto && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {editando ? "Editar entrada" : "Adicionar à biblioteca"}
                            </h2>
                            <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSalvar} className="p-5 space-y-4">
                            {erro && (
                                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                    {erro}
                                </div>
                            )}

                            {/* Obra */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Obra *</label>
                                <select name="obraId" value={form.obraId} onChange={handleChange} required
                                    disabled={!!editando}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60">
                                    <option value="">Selecione uma obra</option>
                                    {obras.map(o => (
                                        <option key={o.idObra} value={o.idObra}>{o.titulo}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                                <select name="status" value={form.status} onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Progresso */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progresso atual</label>
                                    <input type="number" name="progressoAtual" value={form.progressoAtual}
                                        onChange={handleChange} min={0}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total</label>
                                    <input type="number" name="totalUnidade" value={form.totalUnidade}
                                        onChange={handleChange} min={0}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                                </div>
                            </div>

                            {/* Favorito */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="favorito" checked={form.favorito}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-indigo-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Marcar como favorito</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={fecharModal}
                                    className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={salvando}
                                    className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition text-sm font-medium disabled:opacity-60">
                                    {salvando ? "Salvando..." : editando ? "Salvar" : "Adicionar"}
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
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Remover da biblioteca</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Tem certeza que deseja remover <span className="font-medium text-gray-700 dark:text-gray-200">"{modalDeletar.tituloObra}"</span> da sua biblioteca?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setModalDeletar(null)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium">
                                Cancelar
                            </button>
                            <button onClick={handleDeletar}
                                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition text-sm font-medium">
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}