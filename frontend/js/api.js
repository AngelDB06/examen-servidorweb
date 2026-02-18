const URL_BASE = 'https://dummyjson.com';
const BACKEND_URL = `https://${window.location.hostname}`; // Use HTTPS and current host for production

/**
 * Obtiene información dinámica del backend PHP.
 * @returns {Promise<Object>} Promesa con los datos del backend
 */
async function getBackendInfoAPI() {
    try {
        const resp = await fetch(BACKEND_URL + '/index.php');
        if (!resp.ok) throw new Error('Error backend');
        return await resp.json();
    } catch (e) {
        console.error("No se pudo conectar con el backend PHP:", e);
        return null;
    }
}


/**
 * Realiza una petición de login a la API.
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Promesa con los datos del usuario logueado
 */
async function loginAPI(username, password) {
    const resp = await fetch(URL_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username,
            password: password,
        })
    });

    if (!resp.ok) {
        throw new Error('Error en login');
    }

    const data = await resp.json();
    return data;
}

/**
 * Obtiene la lista de categorías de productos disponibles.
 * @returns {Promise<Array>} Promesa con el array de categorías
 */
async function getCategoriesAPI() {
    const resp = await fetch(BACKEND_URL + '/index.php?action=categories');
    return await resp.json();
}

/**
 * Obtiene una lista de productos con paginación.
 * @param {number} limit - Número máximo de productos a obtener
 * @param {number} skip - Número de productos a saltar (desplazamiento)
 * @returns {Promise<Object>} Promesa con el objeto de respuesta de productos
 */
async function getProductsAPI(limit, skip) {
    const resp = await fetch(URL_BASE + '/products?limit=' + limit + '&skip=' + skip);
    return await resp.json();
}

/**
 * Obtiene productos filtrados por categoría.
 * @param {string} category - Nombre de la categoría
 * @param {number} limit - Límite de productos
 * @param {number} skip - Desplazamiento
 * @returns {Promise<Object>} Promesa con los productos filtrados
 */
async function getProductsByCategoryAPI(category, limit, skip) {
    const resp = await fetch(URL_BASE + '/products/category/' + category + '?limit=' + limit + '&skip=' + skip);
    return await resp.json();
}

/**
 * Busca productos basados en una cadena de texto.
 * @param {string} query - Texto a buscar en el título o descripción
 * @returns {Promise<Object>} Promesa con los resultados de la búsqueda
 */
async function searchProductsAPI(query) {
    const resp = await fetch(URL_BASE + '/products/search?q=' + query);
    return await resp.json();
}

/**
 * Obtiene los detalles de un producto específico por su ID.
 * @param {number} id - Identificador único del producto
 * @returns {Promise<Object>} Promesa con los detalles del producto
 */
async function getProductByIdAPI(id) {
    const resp = await fetch(URL_BASE + '/products/' + id);
    return await resp.json();
}
