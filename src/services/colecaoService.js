import api from "./api";

const colecaoService = {
    listar:    ()           => api.get("/colecao"),
    criar:     (data)       => api.post("/colecao", data),
    atualizar: (id, data)   => api.put(`/colecao/${id}`, data),
    deletar:   (id)         => api.delete(`/colecao/${id}`),
};

export default colecaoService;