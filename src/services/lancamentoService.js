import api from "./api";

const lancamentoService = {
    listar:       ()        => api.get("/lancamentos"),
    listarMeus:   ()        => api.get("/lancamentos/meus"),
    buscarPorObra:(obraId)  => api.get(`/lancamentos/obra/${obraId}`),
    criar:        (data)    => api.post("/lancamentos", data),
    atualizar:    (id, data)=> api.put(`/lancamentos/${id}`, data),
    deletar:      (id)      => api.delete(`/lancamentos/${id}`),
};

export default lancamentoService;