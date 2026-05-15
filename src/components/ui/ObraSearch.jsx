import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"

export default function ObraSearch({ obras, value, onChange, placeholder = "Buscar obra..." }) {
    const [busca, setBusca]         = useState("")
    const [aberto, setAberto]       = useState(false)
    const [selecionado, setSelecionado] = useState(null)
    const ref = useRef(null)

    // sincroniza quando value vem de fora (editar)
    useEffect(() => {
        if (value && obras.length > 0) {
            const obra = obras.find(o => o.idObra === parseInt(value))
            if (obra) setSelecionado(obra)
        }
        if (!value) {
            setSelecionado(null)
            setBusca("")
        }
    }, [value, obras])

    // fecha ao clicar fora
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setAberto(false)
                if (!selecionado) setBusca("")
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [selecionado])

    const obrasFiltradas = obras.filter(o =>
        `${o.titulo} ${o.tipo}`.toLowerCase().includes(busca.toLowerCase())
    )

    const handleSelecionar = (obra) => {
        setSelecionado(obra)
        setBusca("")
        setAberto(false)
        onChange(obra.idObra)
    }

    const handleLimpar = () => {
        setSelecionado(null)
        setBusca("")
        onChange("")
    }

    return (
        <div ref={ref} className="relative">
            {selecionado ? (
                // Obra selecionada
                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-indigo-500 bg-gray-50 dark:bg-gray-800">
                    <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selecionado.titulo}</span>
                        <span className="ml-2 text-xs text-indigo-500">{selecionado.tipo}</span>
                    </div>
                    <button type="button" onClick={handleLimpar} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={16} />
                    </button>
                </div>
            ) : (
                // Input de busca
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={busca}
                        onChange={(e) => { setBusca(e.target.value); setAberto(true) }}
                        onFocus={() => setAberto(true)}
                        placeholder={placeholder}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                    />
                </div>
            )}

            {/* Dropdown */}
            {aberto && !selecionado && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {obrasFiltradas.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">Nenhuma obra encontrada</p>
                    ) : (
                        obrasFiltradas.map(o => (
                            <button
                                key={o.idObra}
                                type="button"
                                onClick={() => handleSelecionar(o)}
                                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
                            >
                                <span className="text-sm text-gray-800 dark:text-white">{o.titulo}</span>
                                <span className="text-xs text-indigo-500 ml-2 shrink-0">{o.tipo}</span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}