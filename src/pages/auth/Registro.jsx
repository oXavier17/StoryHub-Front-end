import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { BookOpen, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Registro() {
    const { login } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [form, setForm] = useState({ nome: "", email: "", senha: "" });
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const response = await authService.registro(form);
            const { token, nome, email } = response.data;
            login(token, { nome, email });
            navigate("/");
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao criar conta");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors duration-300">

            {/* Botão tema */}
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:opacity-80 transition"
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-600 p-3 rounded-full mb-3">
                        <BookOpen size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Minha Biblioteca</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Crie sua conta</p>
                </div>

                {/* Erro */}
                {erro && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                        {erro}
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={form.nome}
                            onChange={handleChange}
                            required
                            placeholder="Seu nome"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="seu@email.com"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            name="senha"
                            value={form.senha}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            minLength={6}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-60"
                    >
                        {carregando ? "Criando conta..." : "Criar conta"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    Já tem conta?{" "}
                    <Link to="/login" className="text-indigo-500 hover:underline font-medium">
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    );
}