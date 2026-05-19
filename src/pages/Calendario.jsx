import { useEffect, useState } from "react"
import lancamentoService from "../services/lancamentoService"
import { Calendar, Clock } from "lucide-react"
import { getImagem } from "../utils/imagem"

const DIAS_SEMANA = [
    { valor: 1, label: "Segunda" },
    { valor: 2, label: "Terça"   },
    { valor: 3, label: "Quarta"  },
    { valor: 4, label: "Quinta"  },
    { valor: 5, label: "Sexta"   },
    { valor: 6, label: "Sábado"  },
    { valor: 0, label: "Domingo" },
]

const getDiaSemanaHoje = () => new Date().getDay()

export default function Calendario() {
    const [lancamentos, setLancamentos] = useState([])
    const [carregando, setCarregando]   = useState(true)
    const [diaAtivo, setDiaAtivo]       = useState(getDiaSemanaHoje())

    useEffect(() => {
        lancamentoService.listarMeus()
            .then(res => setLancamentos(res.data))
            .catch(err => console.error(err))
            .finally(() => setCarregando(false))
    }, [])

    const lancamentosPorDia = (dia) =>
        lancamentos.filter(l => l.frequencia === "SEMANAL" && l.diaSemana === dia)

    const lancamentosDiarios = lancamentos.filter(l => l.frequencia === "DIARIO")
    const lancamentosIrregulares = lancamentos.filter(l => l.frequencia === "IRREGULAR")
    const lancamentosMensais = lancamentos.filter(l => l.frequencia === "MENSAL")

    const lancamentosAtivos = [
        ...lancamentosPorDia(diaAtivo),
        ...lancamentosDiarios
    ]

    if (carregando) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
    )

    return (
        <div className="space-y-6">

            {/* Cabeçalho */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calendário</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Obras que você acompanha e seus dias de lançamento
                </p>
            </div>

            {lancamentos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Calendar size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Nenhum lançamento cadastrado.</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        Cadastre lançamentos nas obras que está acompanhando.
                    </p>
                </div>
            ) : (
                <>
                    {/* Visualização semanal */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        {/* Dias da semana */}
                        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
                            {DIAS_SEMANA.map(dia => {
                                const isHoje = dia.valor === getDiaSemanaHoje()
                                const isAtivo = dia.valor === diaAtivo
                                const qtd = lancamentosPorDia(dia.valor).length
                                return (
                                    <button
                                        key={dia.valor}
                                        onClick={() => setDiaAtivo(dia.valor)}
                                        className={`flex flex-col items-center py-4 gap-1 transition relative ${
                                            isAtivo
                                                ? "bg-indigo-600 text-white"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                        }`}
                                    >
                                        <span className="text-xs font-medium">{dia.label}</span>
                                        {isHoje && !isAtivo && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute top-2" />
                                        )}
                                        {qtd > 0 && (
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                                isAtivo
                                                    ? "bg-white/20 text-white"
                                                    : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                            }`}>
                                                {qtd}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Cards do dia selecionado */}
                        <div className="p-4">
                            {lancamentosAtivos.length === 0 ? (
                                <p className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
                                    Nenhum lançamento neste dia.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {lancamentosAtivos.map(l => (
                                        <div key={l.idLancamento} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                                            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                                                <img
                                                    src={getImagem(l.imagemUrl)}
                                                    alt={l.tituloObra}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => e.target.src = "/placeholder.jpg"}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{l.tituloObra}</p>
                                                <p className="text-xs text-indigo-500 mt-0.5">{l.tipoObra}</p>
                                                {l.horarioLancamento && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Clock size={11} className="text-gray-400" />
                                                        <span className="text-xs text-gray-400">{l.horarioLancamento.slice(0, 5)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lista agrupada por dia */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Todos os lançamentos</h2>
                        <div className="overflow-y-auto max-h-[calc(100vh-420px)] space-y-4 pr-1">
                            {/* Diários */}
                            {lancamentosDiarios.length > 0 && (
                                <LancamentoGrupo titulo="Diário" itens={lancamentosDiarios} cor="bg-purple-500" />
                            )}

                            {/* Por dia da semana */}
                            {DIAS_SEMANA.map(dia => {
                                const itens = lancamentosPorDia(dia.valor)
                                if (itens.length === 0) return null
                                const isHoje = dia.valor === getDiaSemanaHoje()
                                return (
                                    <LancamentoGrupo
                                        key={dia.valor}
                                        titulo={dia.label}
                                        itens={itens}
                                        cor="bg-indigo-500"
                                        destaque={isHoje}
                                    />
                                )
                            })}

                            {/* Mensais */}
                            {lancamentosMensais.length > 0 && (
                                <LancamentoGrupo titulo="Mensal" itens={lancamentosMensais} cor="bg-blue-500" />
                            )}

                            {/* Irregulares */}
                            {lancamentosIrregulares.length > 0 && (
                                <LancamentoGrupo titulo="Irregular" itens={lancamentosIrregulares} cor="bg-gray-400" />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function LancamentoGrupo({ titulo, itens, cor, destaque }) {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm overflow-hidden ${
            destaque
                ? "border-indigo-300 dark:border-indigo-700"
                : "border-gray-100 dark:border-gray-800"
        }`}>
            <div className={`flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800`}>
                <span className={`w-2 h-2 rounded-full ${cor}`} />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{titulo}</span>
                {destaque && (
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full ml-1">
                        Hoje
                    </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">{itens.length} obra(s)</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {itens.map(l => (
                    <div key={l.idLancamento} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                            <img
                                src={getImagem(l.imagemUrl)}
                                alt={l.tituloObra}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = "/placeholder.jpg"}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{l.tituloObra}</p>
                            <p className="text-xs text-indigo-500 mt-0.5">{l.tipoObra}</p>
                        </div>
                        {l.horarioLancamento && (
                            <div className="flex items-center gap-1">
                                <Clock size={13} className="text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{l.horarioLancamento.slice(0, 5)}</span>
                            </div>
                        )}
                        {l.diaMes && (
                            <span className="text-xs text-gray-400">Dia {l.diaMes}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}