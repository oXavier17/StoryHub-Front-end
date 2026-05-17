export const getImagem = (imagemUrl) => {
    if (!imagemUrl) return "/placeholder.jpg"
    if (imagemUrl.startsWith("/uploads")) {
        return `${import.meta.env.VITE_API_URL}${imagemUrl}`
    }
    return imagemUrl
}