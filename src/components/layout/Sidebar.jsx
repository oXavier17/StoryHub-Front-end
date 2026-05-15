import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import {
    BookOpen, Library, Star, LayoutDashboard,
    LogOut, Sun, Moon, BookMarked, Calendar, User 
} from "lucide-react"

const menuItems = [
    { path: "/",         label: "Dashboard",  icon: LayoutDashboard },
    { path: "/obras",    label: "Obras",       icon: BookOpen        },
    { path: "/biblioteca", label: "Biblioteca", icon: Library        },
    { path: "/colecao",  label: "Coleção",     icon: Star            },
    { path: "/calendario", label: "Calendário", icon: Calendar },
    { path: "/perfil", label: "Perfil", icon: User },
]

export default function Sidebar() {
    const { usuario, logout } = useAuth()
    const { darkMode, toggleTheme } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <aside className="w-64 min-h-screen flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors duration-300">

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <BookMarked size={20} className="text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800 dark:text-white">StoryHub</span>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map(({ path, label, icon: Icon }) => {
                    const ativo = location.pathname === path
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                                ${ativo
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* Rodapé */}
            <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">

                {/* Usuário */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg">

                    {usuario?.fotoPerfil ? (
                        <img
                            src={usuario.fotoPerfil.startsWith("/uploads")
                                ? `http://localhost:8080${usuario.fotoPerfil}`
                                : usuario.fotoPerfil
                            }
                            alt={usuario.nome}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                            {usuario?.nome?.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {usuario?.nome}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {usuario?.email}
                        </p>
                    </div>
                </div>

                {/* Tema */}
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    {darkMode ? "Modo Claro" : "Modo Escuro"}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    )
}