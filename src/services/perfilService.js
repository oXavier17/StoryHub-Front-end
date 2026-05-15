import api from "./api";

const perfilService = {
    getPerfil:       ()       => api.get("/perfil"),
    atualizar:       (data)   => api.put("/perfil", data),
    trocarSenha:     (data)   => api.put("/perfil/senha", data),
    uploadFoto:      (formData) => api.post("/perfil/foto", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    atualizarFotoUrl: (url)   => api.put("/perfil/foto-url", { url }),
};

export default perfilService;