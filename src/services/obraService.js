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
    criarComImagem: (formData) => api.post("/obras", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    listarVolumes: (id) => api.get(`/volumes/obra/${id}`),
    listarGeneros: () => api.get("/obras/generos"),
    criarVolume:   (data) => api.post("/volumes", data),
    criarVolumesLote: (data) => api.post("/volumes/lote", data),
    deletarVolume: (id) => api.delete(`/volumes/${id}`),
};

export default obraService;