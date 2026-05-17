import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import perfilService from "../services/perfilService"
import { getImagem } from "../utils/imagem"
import { User, Upload, Check, X } from "lucide-react"

const getFoto = (fotoPerfil) => {
    if (!fotoPerfil) return null
    if (fotoPerfil.startsWith("/uploads")) return `${import.meta.env.VITE_API_URL}${fotoPerfil}`
    return fotoPerfil
}

export default function Perfil() {
    const { usuario, atualizarUsuario } = useAuth()

    const [perfil, setPerfil]             = useState(null)
    const [carregando, setCarregando]     = useState(true)
    const [arquivoFoto, setArquivoFoto]   = useState(null)
    const [fotoUrl, setFotoUrl]           = useState("")
    const [salvandoFoto, setSalvandoFoto] = useState(false)
    const [erroFoto, setErroFoto]         = useState("")
    const [sucessoFoto, setSucessoFoto]   = useState(false)

    const [formPerfil, setFormPerfil]         = useState({ nome: "", email: "" })
    const [salvandoPerfil, setSalvandoPerfil] = useState(false)
    const [erroPerfil, setErroPerfil]         = useState("")
    const [sucessoPerfil, setSucessoPerfil]   = useState(false)

    const [formSenha, setFormSenha]         = useState({ senhaAtual: "", novaSenha: "", confirmarSenha: "" })
    const [salvandoSenha, setSalvandoSenha] = useState(false)
    const [erroSenha, setErroSenha]         = useState("")
    const [sucessoSenha, setSucessoSenha]   = useState(false)

    useEffect(() => {
        perfilService.getPerfil()
            .then(res => {
                setPerfil(res.data)
                setFormPerfil({ nome: res.data.nome, email: res.data.email })
                setFotoUrl(res.data.fotoPerfil || "")
            })
            .finally(() => setCarregando(false))
    }, [])

    const handleSalvarPerfil = async (e) => {
        e.preventDefault()
        setErroPerfil("")
        setSucessoPerfil(false)
        setSalvandoPerfil(true)
        try {
            const res = await perfilService.atualizar(formPerfil)
            setPerfil(res.data)
            atualizarUsuario({ nome: res.data.nome, email: res.data.email })
            setSucessoPerfil(true)
            setTimeout(() => setSucessoPerfil(false), 3000)
        } catch (err) {
            setErroPerfil(err.response?.data?.erro || "Erro ao salvar")
        } finally {
            setSalvandoPerfil(false)
        }
    }

    const handleTrocarSenha = async (e) => {
        e.preventDefault()
        setErroSenha("")
        setSucessoSenha(false)

        if (formSenha.novaSenha !== formSenha.confirmarSenha) {
            setErroSenha("As senhas não coincidem")
            return
        }

        setSalvandoSenha(true)
        try {
            await perfilService.trocarSenha({
                senhaAtual: formSenha.senhaAtual,
                novaSenha:  formSenha.novaSenha
            })
            setSucessoSenha(true)
            setFormSenha({ senhaAtual: "", novaSenha: "", confirmarSenha: "" })
            setTimeout(() => setSucessoSenha(false), 3000)
        } catch (err) {
            setErroSenha(err.response?.data?.erro || "Erro ao trocar senha")
        } finally {
            setSalvandoSenha(false)
        }
    }

    const handleSalvarFoto = async () => {
        setErroFoto("")
        setSucessoFoto(false)
        setSalvandoFoto(true)
        try {
            let res
            if (arquivoFoto) {
                const formData = new FormData()
                formData.append("arquivo", arquivoFoto)
                res = await perfilService.uploadFoto(formData)
            } else if (fotoUrl) {
                res = await perfilService.atualizarFotoUrl(fotoUrl)
            } else return

            setPerfil(res.data)
            atualizarUsuario({ fotoPerfil: res.data.fotoPerfil })
            setArquivoFoto(null)
            setSucessoFoto(true)
            setTimeout(() => setSucessoFoto(false), 3000)
        } catch (err) {
            setErroFoto(err.response?.data?.erro || "Erro ao salvar foto")
        } finally {
            setSalvandoFoto(false)
        }
    }

    if (carregando) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
    )

    return (
        <div className="space-y-6">

            {/* Cabeçalho */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Perfil</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie suas informações pessoais</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* Coluna esquerda — foto + dados */}
                <div className="space-y-6">

                    {/* Card foto */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Foto de perfil</h2>

                        {/* Preview */}
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                {getFoto(perfil?.fotoPerfil) ? (
                                    <img
                                        src={getFoto(perfil?.fotoPerfil)}
                                        alt="Foto de perfil"
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.style.display = "none"}
                                    />
                                ) : (
                                    <User size={32} className="text-white" />
                                )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <p className="font-medium text-gray-700 dark:text-gray-300">{perfil?.nome}</p>
                                <p>{perfil?.email}</p>
                            </div>
                        </div>

                        {erroFoto && (
                            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                {erroFoto}
                            </div>
                        )}
                        {sucessoFoto && (
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                                <Check size={16} /> Foto atualizada!
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL da foto</label>
                            <input
                                type="text"
                                value={fotoUrl}
                                onChange={(e) => { setFotoUrl(e.target.value); setArquivoFoto(null) }}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ou envie uma foto</label>
                            <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-indigo-500 transition">
                                <Upload size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {arquivoFoto ? arquivoFoto.name : "Clique para selecionar"}
                                </span>
                                <input type="file" accept="image/*" className="hidden"
                                    onChange={(e) => { setArquivoFoto(e.target.files[0]); setFotoUrl("") }} />
                            </label>
                        </div>

                        <button
                            onClick={handleSalvarFoto}
                            disabled={salvandoFoto || (!arquivoFoto && !fotoUrl)}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                        >
                            {salvandoFoto ? "Salvando..." : "Salvar foto"}
                        </button>
                    </div>

                    {/* Card dados pessoais */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Dados pessoais</h2>

                        {erroPerfil && (
                            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                {erroPerfil}
                            </div>
                        )}
                        {sucessoPerfil && (
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                                <Check size={16} /> Dados atualizados!
                            </div>
                        )}

                        <form onSubmit={handleSalvarPerfil} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={formPerfil.nome}
                                    onChange={(e) => setFormPerfil(prev => ({ ...prev, nome: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formPerfil.email}
                                    onChange={(e) => setFormPerfil(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={salvandoPerfil}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                            >
                                {salvandoPerfil ? "Salvando..." : "Salvar dados"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Coluna direita — senha */}
                <div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Trocar senha</h2>

                        {erroSenha && (
                            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                {erroSenha}
                            </div>
                        )}
                        {sucessoSenha && (
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                                <Check size={16} /> Senha alterada com sucesso!
                            </div>
                        )}

                        <form onSubmit={handleTrocarSenha} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha atual</label>
                                <input
                                    type="password"
                                    value={formSenha.senhaAtual}
                                    onChange={(e) => setFormSenha(prev => ({ ...prev, senhaAtual: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova senha</label>
                                <input
                                    type="password"
                                    value={formSenha.novaSenha}
                                    onChange={(e) => setFormSenha(prev => ({ ...prev, novaSenha: e.target.value }))}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar nova senha</label>
                                <input
                                    type="password"
                                    value={formSenha.confirmarSenha}
                                    onChange={(e) => setFormSenha(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={salvandoSenha}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                            >
                                {salvandoSenha ? "Salvando..." : "Trocar senha"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}