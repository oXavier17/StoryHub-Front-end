import api from "./api";

const volumeService = {
    listarPorObra: (obraId) => api.get(`/volumes/obra/${obraId}`),
};

export default volumeService;