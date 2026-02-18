# Documentación de Diseño (HTML y CSS)

Este documento detalla la estructura y el estilo visual del proyecto, enfocado en una experiencia de usuario moderna, responsiva y animada.

## 1. Estructura HTML (`index.html`)

El proyecto sigue una arquitectura **SPA (Single Page Application)** simulada visualmente en un solo archivo HTML, lo que permite una navegación fluida sin recargas de página.

### Semántica y Organización
Se utilizan etiquetas semánticas de HTML5 para una mejor accesibilidad y SEO:
*   `<header>`: Contiene el logotipo y la barra de navegación (`<nav>`).
*   `<main>`: Contenedor principal de las vistas dinámicas.
*   `<section>`: Cada "página" o vista (Home, Login, Cart, Contact) es una sección independiente.
*   `<footer>`: Pie de página informativo.

### Gestión de Vistas (SPA)
Cada sección principal tiene una clase `.view` y un ID único (ej: `#view-home`, `#view-cart`).
*   **Clase `.hidden`**: Helper CSS (`display: none`) utilizado para ocultar todas las vistas excepto la activa.

### Metodología BEM
Se utiliza estrictamente la metodología **BEM (Block, Element, Modifier)** para el nombrado de clases CSS, garantizando modularidad y bajo acoplamiento:
*   Bloque: `.product-card`
*   Elemento: `.product-card__image`, `.product-card__title`
*   Modificador: `.btn--primary`, `.nav__link--active`

## 2. Estilo y Diseño (`css/style.css`)

### Variables CSS (Custom Properties)
Definidas en `:root` para facilitar cambios globales de tema:
*   **Colores**: `--primary-color` (Azul corporativo), `--accent-color` (Rojo para precios/alertas), `--secondary-color` (Gris oscuro para textos/fondos).
*   **Sistema**: `--spacing-unit`, `--border-radius` y `--transition-speed`.

### Diseño Responsivo (Responsive Design)
La web se adapta a todos los dispositivos (Móvil, Tablet, Desktop) utilizando estrategias fluidas y Media Queries:

1.  **Grid Fluido**: La rejilla de productos (`.products-grid`) utiliza `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`. Esto permite que las columnas se reorganicen automáticamente según el espacio disponible sin necesidad de breakpoints específicos para cada resolución.
2.  **Navegación Móvil**: Mediante una media query `@media (max-width: 1023px)`, el menú de navegación se transforma en un desplegable (tipo acordeón) activado por un botón "hamburguesa".

### Componentes Clave
*   **Controles**: Barra de herramientas (Buscador, Filtros) con diseño Flexbox y estilos de foco (`:focus`) resaltados.
*   **Tarjetas**: Contenedores con sombra suave (`box-shadow`) que se elevan al pasar el ratón (`hover`), mejorando la interactividad.
*   **Carrito**: Lista de items con controles de cantidad alineados mediante Flexbox y botones circulares iconográficos.

### Animaciones
Se implementan animaciones CSS nativas (`@keyframes`) para enriquecer la experiencia:
1.  **`fadeIn`**: Suaviza la aparición de nuevas vistas al navegar.
2.  **`scaleUp`**: Efecto de "zoom in" suave al cargar las tarjetas de productos.
3.  **`slideDown`**: Despliegue natural para el menú móvil.
4.  **`spin`**: Rotación continua para el indicador de carga (spinner).

### Recursos Externos
*   **Fuentes**: Iconografía via **Material Icons** (Google) y favicon via **Flaticon**.
*   **Librería UI**: Estilos base de **Toastify** para las notificaciones flotantes.
