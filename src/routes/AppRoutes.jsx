import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/auth/Login";
import Registro from "../pages/auth/Registro";
import Layout from "../components/layout/Layout";
import Dashboard from "../pages/Dashboard";
import Obras from "../pages/Obras";
import Biblioteca from "../pages/Biblioteca";
import Colecao from "../pages/Colecao";
import Calendario from "../pages/Calendario"
import Perfil from "../pages/Perfil"

function PrivateRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
}

export default function AppRoutes() {
    const { token } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
            <Route path="/registro" element={!token ? <Registro /> : <Navigate to="/" />} />

            <Route path="/" element={
                <PrivateRoute>
                    <Layout />
                </PrivateRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="obras" element={<Obras />} />
                <Route path="biblioteca" element={<Biblioteca />} />
                <Route path="colecao" element={<Colecao />} />
                <Route path="calendario" element={<Calendario />} />
                <Route path="perfil" element={<Perfil />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}