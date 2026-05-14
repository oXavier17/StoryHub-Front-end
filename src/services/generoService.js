import api from "./api";

const generoService = {
    listar: () => api.get("/obras/generos"),
};

export default generoService;