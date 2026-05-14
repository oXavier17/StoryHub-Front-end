import { useEffect, useState } from "react"
import colecaoService from "../services/colecaoService"
import obraService from "../services/obraService"
import volumeService from "../services/volumeService"
import {
    Plus, Trash2, Pencil, Search, X,
    BookOpen, Package, DollarSign, CheckCircle
} from "lucide-react"

const getImagem = (imagemUrl) => {
    if (!imagemUrl) return "/placeholder.jpg"
    if (imagemUrl.startsWith("/uploads")) return `http://localhost:8080${imagemUrl}`
    return imagemUrl
}

const formVazio = {
    volumeId: "", possui: true, lido: false,
    dataCompra: "", valorPago: ""
}

export default function Colecao() {
    const [itens, setItens]             = useState([])
    const [obras, setObras]             = useState([])
    const [volumes, setVolumes]         = useState([])
    const [obraSelecionada, setObraSelecionada] = useState("")
    const [busca, setBusca]             = useState("")
    const [carregando, setCarregando]   = useState(true)
    const [modalAberto, setModalAberto] = useState(false)
    const [editando, setEditando]       = useState(null)
    const [form, setForm]               = useState(formVazio)
    const [erro, setErro]               = useState("")
    const [salvando, setSalvando]       = useState(false)
    const [modalDeletar, setModalDeletar] = useState(null)

    useEffect(() => {
        carregarDados()
    }, [])

    useEffect(() => {
        if (obraSelecionada) {
            volumeService.listarPorObra(obraSelecionada)
                .then(res => setVolumes(res.data))
                .catch(err => console.error(err))
        } else {
            setVolumes([])
        }
    }, [obraSelecionada])

    const carregarDados = async () => {
        try {
            const [colRes, obrasRes] = await Promise.all([
                colecaoService.listar(),
                obraService.listar()
            ])
            setItens(colRes.data)
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
        setObraSelecionada("")
        setVolumes([])
        setErro("")
        setModalAberto(true)
    }

    const abrirEditar = (item) => {
        setEditando(item)
        setForm({
            volumeId:   item.volumeId,
            possui:     item.possui,
            lido:       item.lido,
            dataCompra: item.dataCompra || "",
            valorPago:  item.valorPago  || ""
        })
        setErro("")
        setModalAberto(true)
    }

    const fecharModal = () => {
        setModalAberto(false)
        setEditando(null)
        setForm(formVazio)
        setObraSelecionada("")
        setVolumes([])
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
                volumeId:   parseInt(form.volumeId),
                possui:     Boolean(form.possui),
                lido:       Boolean(form.lido),
                dataCompra: form.dataCompra || null,
                valorPago:  form.valorPago  ? parseFloat(form.valorPago) : null
            }
            if (editando) {
                await colecaoService.atualizar(editando.idColecao, payload)
            } else {
                await colecaoService.criar(payload)
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
            await colecaoService.deletar(modalDeletar.idColecao)
            setModalDeletar(null)
            await carregarDados()
        } catch (err) {
            console.error(err)
        }
    }

    const itensFiltrados = itens.filter(i =>
        i.tituloObra.toLowerCase().includes(busca.toLowerCase())
    )

    const totalGasto = itens
        .filter(i => i.valorPago)
        .reduce((acc, i) => acc + parseFloat(i.valorPago), 0)

    const totalVolumes  = itens.length
    const totalPossui   = itens.filter(i => i.possui).length
    const totalLidos    = itens.filter(i => i.lido).length

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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Coleção</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{totalVolumes} volume(s) na coleção</p>
                </div>
                <button
                    onClick={abrirCriar}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
                >
                    <Plus size={16} /> Adicionar
                </button>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total de Volumes", valor: totalVolumes,                    icon: BookOpen,    cor: "bg-indigo-500" },
                    { label: "Volumes que Possuo", valor: totalPossui,                   icon: Package,     cor: "bg-blue-500"   },
                    { label: "Volumes Lidos",      valor: totalLidos,                    icon: CheckCircle, cor: "bg-green-500"  },
                    { label: "Total Gasto",        valor: `R$ ${totalGasto.toFixed(2)}`, icon: DollarSign,  cor: "bg-pink-500"   },
                ].map(({ label, valor, icon: Icon, cor }) => (
                    <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className={`${cor} p-2.5 rounded-xl`}>
                            <Icon size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-800 dark:text-white">{valor}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        </div>
                    </div>
                ))}
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

            {/* Tabela */}
            {itensFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Package size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Nenhum volume na coleção.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12"></th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Obra</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Volume</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Possui</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lido</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Compra</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Pago</th>
                                    <th className="px-4 py-3 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {itensFiltrados.map(item => (
                                    <tr key={item.idColecao} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">

                                        {/* Imagem */}
                                        <td className="px-4 py-3">
                                            <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                <img
                                                    src={getImagem(item.imagemUrl)}
                                                    alt={item.tituloObra}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => e.target.src = "/placeholder.jpg"}
                                                />
                                            </div>
                                        </td>

                                        {/* Obra */}
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.tituloObra}</p>
                                        </td>

                                        {/* Volume */}
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Vol. {item.numeroVolume}
                                            </span>
                                        </td>

                                        {/* Possui */}
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                item.possui
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                            }`}>
                                                {item.possui ? "Sim" : "Não"}
                                            </span>
                                        </td>

                                        {/* Lido */}
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                item.lido
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                            }`}>
                                                {item.lido ? "Sim" : "Não"}
                                            </span>
                                        </td>

                                        {/* Data Compra */}
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.dataCompra
                                                    ? new Date(item.dataCompra).toLocaleDateString("pt-BR")
                                                    : "—"}
                                            </span>
                                        </td>

                                        {/* Valor Pago */}
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.valorPago
                                                    ? `R$ ${parseFloat(item.valorPago).toFixed(2)}`
                                                    : "—"}
                                            </span>
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
                                ))}
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
                                {editando ? "Editar volume" : "Adicionar à coleção"}
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

                            {/* Só mostra seleção de obra/volume ao criar */}
                            {!editando && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Obra *</label>
                                        <select
                                            value={obraSelecionada}
                                            onChange={(e) => {
                                                setObraSelecionada(e.target.value)
                                                setForm(prev => ({ ...prev, volumeId: "" }))
                                            }}
                                            required
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                                            <option value="">Selecione uma obra</option>
                                            {obras.map(o => (
                                                <option key={o.idObra} value={o.idObra}>{o.titulo}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Volume *</label>
                                        <select name="volumeId" value={form.volumeId} onChange={handleChange} required
                                            disabled={!obraSelecionada || volumes.length === 0}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60">
                                            <option value="">
                                                {!obraSelecionada ? "Selecione uma obra primeiro" :
                                                 volumes.length === 0 ? "Nenhum volume cadastrado" : "Selecione o volume"}
                                            </option>
                                            {volumes.map(v => (
                                                <option key={v.idVolume} value={v.idVolume}>
                                                    Vol. {v.numeroVolume}{v.isbn ? ` — ${v.isbn}` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Possui */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="possui" checked={form.possui}
                                    onChange={handleChange} className="w-4 h-4 accent-indigo-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Possuo este volume</span>
                            </label>

                            {/* Lido */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="lido" checked={form.lido}
                                    onChange={handleChange} className="w-4 h-4 accent-indigo-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Já li este volume</span>
                            </label>

                            {/* Data Compra */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Compra</label>
                                <input type="date" name="dataCompra" value={form.dataCompra}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                            </div>

                            {/* Valor Pago */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Pago (R$)</label>
                                <input type="number" name="valorPago" value={form.valorPago}
                                    onChange={handleChange} min={0} step="0.01" placeholder="0.00"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                            </div>

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
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Remover da coleção</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Tem certeza que deseja remover <span className="font-medium text-gray-700 dark:text-gray-200">"{modalDeletar.tituloObra} Vol. {modalDeletar.numeroVolume}"</span> da sua coleção?
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