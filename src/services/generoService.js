import api from "./api";

const generoService = {
    listar: () => api.get("/generos"),
};

export default generoService;