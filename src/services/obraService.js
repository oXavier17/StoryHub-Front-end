import api from "./api";

const obraService = {
    listar:        ()        => api.get("/obras"),
    buscarPorId:   (id)      => api.get(`/obras/${id}`),
    criar:         (data)    => api.post("/obras", data),
    atualizar:     (id, data)=> api.put(`/obras/${id}`, data),
    deletar:       (id)      => api.delete(`/obras/${id}`),
    uploadImagem:  (id, formData) => api.post(`/obras/${id}/imagem`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
};

export default obraService;