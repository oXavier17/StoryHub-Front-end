import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// Verifica se o token JWT ainda é válido
function tokenValido(token) {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        const salvo = localStorage.getItem("token");
        if (tokenValido(salvo)) return salvo;
        // Token expirado ou inválido — limpa tudo
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        return null;
    });

    const [usuario, setUsuario] = useState(() => {
        const salvo = localStorage.getItem("usuario");
        return salvo ? JSON.parse(salvo) : null;
    });

    const login = (token, usuario) => {
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));
        setToken(token);
        setUsuario(usuario);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setToken(null);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ token, usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}