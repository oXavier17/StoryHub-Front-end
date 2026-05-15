import api from "./api";

const bibliotecaService = {
    listar:    ()        => api.get("/biblioteca"),
    buscarPorId: (id)   => api.get(`/biblioteca/${id}`),
    criar:     (data)   => api.post("/biblioteca", data),
    atualizar: (id, data) => api.put(`/biblioteca/${id}`, data),
    deletar:   (id)     => api.delete(`/biblioteca/${id}`),
    incrementar: (id) => api.patch(`/biblioteca/${id}/incrementar`),
};

export default bibliotecaService;