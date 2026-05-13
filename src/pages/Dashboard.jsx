import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import dashboardService from "../services/dashboardService"
import { BookOpen, BookMarked, CheckCircle, Heart, Clock } from "lucide-react"

const statusLabel = {
    PLANEJO_VER:  { label: "Planejo Ver",   cor: "bg-gray-400"   },
    ACOMPANHANDO: { label: "Acompanhando",  cor: "bg-blue-500"   },
    COMPLETO:     { label: "Completo",      cor: "bg-green-500"  },
    ABANDONADO:   { label: "Abandonado",    cor: "bg-red-500"    },
}

const getImagem = (imagemUrl) => {
    if (!imagemUrl) return "/placeholder.jpg"
    if (imagemUrl.startsWith("/uploads")) return `http://localhost:8080${imagemUrl}`
    return imagemUrl
}

export default function Dashboard() {
    const { usuario } = useAuth()
    const [dados, setDados] = useState(null)
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
        dashboardService.getDashboard()
            .then(res => setDados(res.data))
            .catch(err => console.error(err))
            .finally(() => setCarregando(false))
    }, [])

    if (carregando) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
            </div>
        )
    }

    const cards = [
        { label: "Total na Biblioteca", valor: dados?.totalObras,     icon: BookMarked,  cor: "bg-indigo-500" },
        { label: "Acompanhando",        valor: dados?.totalLendo,      icon: BookOpen,    cor: "bg-blue-500"   },
        { label: "Completos",           valor: dados?.totalCompletos,  icon: CheckCircle, cor: "bg-green-500"  },
        { label: "Favoritos",           valor: dados?.totalFavoritos,  icon: Heart,       cor: "bg-pink-500"   },
    ]

    return (
        <div className="space-y-8">

            {/* Cabeçalho */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Olá, {usuario?.nome?.split(" ")[0]}! 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Aqui está um resumo da sua biblioteca.
                </p>
            </div>

            {/* Cards de totais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(({ label, valor, icon: Icon, cor }) => (
                    <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className={`${cor} p-3 rounded-xl`}>
                            <Icon size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{valor ?? 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Últimas adicionadas */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Últimas adicionadas
                </h2>

                {dados?.ultimasAdicionadas?.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-800">
                        <BookOpen size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Nenhuma obra na biblioteca ainda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {dados?.ultimasAdicionadas?.map((item) => (
                            <div key={item.idBiblioteca} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                                {/* Imagem */}
                                <div className="h-48 bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src={getImagem(item.imagemUrl)}
                                        alt={item.tituloObra}
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.src = "/placeholder.jpg"}
                                    />
                                </div>

                                {/* Info */}
                                <div className="p-3 space-y-2">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                        {item.tituloObra}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs text-white px-2 py-0.5 rounded-full ${statusLabel[item.status]?.cor}`}>
                                            {statusLabel[item.status]?.label}
                                        </span>
                                        {item.favorito && (
                                            <Heart size={14} className="text-pink-500 fill-pink-500" />
                                        )}
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                        <div
                                            className="bg-indigo-500 h-1.5 rounded-full transition-all"
                                            style={{ width: `${item.totalCap > 0 ? Math.min((item.progressoAtual / item.totalCap) * 100, 100) : 0}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 text-right">
                                        {item.progressoAtual}/{item.totalCap}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}