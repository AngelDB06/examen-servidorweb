# Documentación de JavaScript

Este proyecto utiliza **JavaScript Vainilla (ES6+)** para manejar toda la lógica del cliente, incluyendo la comunicación con la API, la gestión del estado (carrito, usuario) y la navegación SPA (Single Page Application).

El código se divide en dos archivos principales:

## 1. `js/api.js` (Capa de Datos)
Este archivo encapsula todas las peticiones a la API externa (`DummyJSON`). Su función es puramente obtener y devolver datos.

*   **`URL_BASE`**: Constante con la dirección de la API (`https://dummyjson.com`).
*   **`loginAPI(username, password)`**: Autentica al usuario mediante POST. Returns: Datos del usuario y token.
*   **`getCategoriesAPI()`**: Obtiene el listado de categorías de productos.
*   **`getProductsAPI(limit, skip)`**: Obtiene productos paginados.
*   **`getProductsByCategoryAPI(category, limit, skip)`**: Obtiene productos filtrados por categoría y paginados.
*   **`searchProductsAPI(query)`**: Busca productos en el servidor basándose en un texto.
*   **`getProductByIdAPI(id)`**: Obtiene el detalle de un único producto.

## 2. `js/app.js` (Lógica de Aplicación)
Este archivo maneja la interacción con el DOM, los eventos y el estado global.

### Estado Global
Se utilizan variables globales para mantener el estado de la sesión y la navegación:
*   `user`: Objeto del usuario logueado (persistido en `localStorage`).
*   `cart`: Array de objetos del carrito (persistido en `localStorage`).
*   `products`: Array acumulativo de productos cargados.
*   `currentCategory`, `searchQuery`, `sortOrder`: Variables para filtros y ordenación.
*   `limit`, `isLoading`, `hasMore`: Variables de control para el **Scroll Infinito**.

### Funciones Principales

#### Inicialización y Eventos
*   **`DOMContentLoaded`**: Inicializa la UI, carga categorías y productos, y asigna listeners globales (navegación, filtros, scroll).
*   **Scroll Infinito**: Detecta cuando el usuario llega al final de la página (`scrollTop + clientHeight >= scrollHeight - 200`) para llamar a `loadProducts()`.

#### Lógica de Navegación (SPA)
*   **`changeView(viewName)`**: Oculta todas las secciones (`.view`) y muestra solo la solicitada por ID (`view-home`, `view-cart`, etc.), actualizando también el estado activo del menú.

#### Gestión de Productos
*   **`loadProducts()`**: Función central que decide qué endpoint llamar (Búsqueda, Categoría o General) basándose en el estado actual. También aplica ordenación local (`sort`) y concatena los resultados al array `products`.
*   **`renderizarProductos(lista)`**: Genera el HTML de las tarjetas de producto y las inyecta en el DOM.
*   **`verDetalle(id)`**: Busca el producto en memoria o API y muestra la vista de detalle.

#### Carrito de Compras
*   **`addToCart(id)`**: Añade un producto al array `cart` o incrementa su cantidad si ya existe.
*   **`updateCartUI()`**: Renderiza el listado del carrito y calcula el precio total.
*   **`cambiarCantidad(id, delta)`**: Incrementa o decrementa unidades. Elimina el item si llega a 0.
*   **`doCheckout()`**: Valida el estado (login, items, email) y utiliza la librería **EmailJS** para enviar un correo de confirmación con el resumen del pedido.

#### Autenticación y Seguridad
*   **`generateCaptcha()`**: Crea un desafío matemático simple (n1 + n2) para validar el login en el cliente.
*   **`login-form` submit**: Verifica el captcha, llama a `loginAPI` y guarda el usuario en `localStorage`.

### Librerías Externas
*   **EmailJS**: Utilizada en `doCheckout` para el envío de correos transaccionales.
*   **Toastify**: Utilizada en `mostrarNotificacion` para alertas visuales no intrusivas.
