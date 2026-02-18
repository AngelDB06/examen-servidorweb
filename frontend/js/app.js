let user = JSON.parse(localStorage.getItem('user')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let currentCategory = '';
let limit = 8;
let isLoading = false;
let hasMore = true;
let searchQuery = '';
let sortOrder = 'asc';
let captchaResult = 0;

document.addEventListener('DOMContentLoaded', () => {

    updateAuthUI();
    updateCartUI();
    loadCategories();
    generateCaptcha();
    loadProducts();
    displayBackendPromo();

    window.addEventListener('scroll', () => {
        const home = document.getElementById('view-home');
        if (!home.classList.contains('hidden')) {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 200) {
                loadProducts();
            }
        }
    });

    const links = document.querySelectorAll('.nav__link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            links.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');

            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

            const viewId = e.currentTarget.dataset.view;
            if (viewId) {
                const view = document.getElementById('view-' + viewId);
                if (view) view.classList.remove('hidden');

                if (viewId === 'login') generateCaptcha();
            }

            document.getElementById('nav-menu').classList.remove('open');
            window.scrollTo(0, 0);
        });
    });

    document.getElementById('nav-toggle').addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('open');
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const captchaInput = parseInt(document.getElementById('captcha-input').value);

        if (captchaInput !== captchaResult) {
            document.getElementById('login-error').textContent = "Captcha incorrecto.";
            mostrarNotificacion("Captcha incorrecto", "error");
            generateCaptcha();
            return;
        }

        try {
            const data = await loginAPI(username, password);

            user = data;
            localStorage.setItem('user', JSON.stringify(user));
            updateAuthUI();
            mostrarNotificacion(`Bienvenido, ${data.firstName}`, "success");
            changeView('home');

        } catch (error) {
            document.getElementById('login-error').textContent = "Credenciales incorrectas.";
            mostrarNotificacion("Error de login", "error");
        }
    });

    document.getElementById('category-select').addEventListener('change', (e) => {
        currentCategory = e.target.value;
        resetearProductos();
        loadProducts();
    });

    document.getElementById('sort-select').addEventListener('change', (e) => {
        sortOrder = e.target.value;
        resetearProductos();
        loadProducts();
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            resetearProductos();
            loadProducts();
        }, 500);
    });

    document.getElementById('back-to-home').addEventListener('click', () => changeView('home'));
    document.getElementById('checkout-btn').addEventListener('click', doCheckout);
});

/**
 * Cambia la vista visible de la aplicación (SPA).
 * @param {string} viewName - El sufijo del ID de la vista a mostrar (ej: 'home', 'cart')
 */
function changeView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('active'));

    const view = document.getElementById('view-' + viewName);
    if (view) view.classList.remove('hidden');

    const link = document.querySelector(`.nav__link[data-view="${viewName}"]`);
    if (link) link.classList.add('active');

    window.scrollTo(0, 0);
}

/**
 * Carga productos desde la API según los filtros y paginación actuales.
 * Gestiona el loader y añade los productos al array global y al DOM.
 */
async function loadProducts() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    document.getElementById('loader').classList.remove('hidden');

    try {
        let skip = products.length;
        let data;

        if (searchQuery) {
            data = await searchProductsAPI(searchQuery);
        }
        else if (currentCategory) {
            data = await getProductsByCategoryAPI(currentCategory, limit, skip);
        } else {
            data = await getProductsAPI(limit, skip);
        }

        if (sortOrder === 'desc') {
            data.products.sort((a, b) => b.price - a.price);
        } else {
            data.products.sort((a, b) => a.price - b.price);
        }

        if (data.products.length === 0) {
            hasMore = false;
        } else {
            products = products.concat(data.products);
            renderizarProductos(data.products);

            if (data.products.length < limit) {
                hasMore = false;
            }
        }

    } catch (error) {
        console.log("Error: " + error);
        mostrarNotificacion("Error cargando productos", "error");
    } finally {
        isLoading = false;
        document.getElementById('loader').classList.add('hidden');
    }
}

/**
 * Renderiza tarjetas de producto en el contenedor principal.
 * @param {Array} lista - Array de productos a renderizar
 */
function renderizarProductos(lista) {
    const container = document.getElementById('products-container');
    lista.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.thumbnail}" class="product-card__image">
            <div class="product-card__content">
                <h3 class="product-card__title">${product.title}</h3>
                <p class="product-card__price">$${product.price}</p>
                <button class="btn btn--primary" onclick="addToCart(${product.id})">
                    <span class="material-icons" style="vertical-align:middle;">add_shopping_cart</span> Añadir
                </button>
                <button class="btn btn--secondary" onclick="verDetalle(${product.id})" style="margin-top:5px;">
                    <span class="material-icons" style="vertical-align:middle;">visibility</span> Ver
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Resetea la lista de productos y limpia el contenedor.
 * Útil cuando se aplica un nuevo filtro.
 */
function resetearProductos() {
    products = [];
    hasMore = true;
    document.getElementById('products-container').innerHTML = '';
}

/**
 * Obtiene y rellena el select de categorías.
 */
async function loadCategories() {
    try {
        const cats = await getCategoriesAPI();
        const select = document.getElementById('category-select');
        cats.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.slug || cat;
            option.textContent = cat.name || cat;
            select.appendChild(option);
        });
    } catch (e) {
        console.log("Error categorias");
    }
}

/**
 * Muestra el detalle de un producto seleccionado.
 * Si no está en memoria, intenta buscarlo de nuevo en la API.
 * @param {number} id - ID del producto
 */
async function verDetalle(id) {
    let product = products.find(p => p.id === id);
    if (!product) {
        try {
            product = await getProductByIdAPI(id);
        } catch (e) { return; }
    }

    const container = document.getElementById('product-detail-container');
    container.innerHTML = `
        <img src="${product.thumbnail}" class="product-detail__image">
        <div class="product-detail__info">
            <h2>${product.title}</h2>
            <p style="background:#eee; padding:5px; display:inline-block; border-radius:5px;">${product.category}</p>
            <h3 style="color:blue; margin:10px 0;">$${product.price}</h3>
            <p>${product.description}</p>
            <br>
            <button class="btn btn--primary" onclick="addToCart(${product.id})">Añadir al Carrito</button>
        </div>
    `;
    changeView('product');
}

/**
 * Añade un producto al carrito. Si ya existe, incrementa la cantidad.
 * @param {number} id - ID del producto a añadir
 */
async function addToCart(id) {
    let product = products.find(p => p.id === id);
    if (!product) {
        product = await getProductByIdAPI(id);
    }

    const existe = cart.find(item => item.id === id);
    if (existe) {
        existe.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    guardarCarrito();
    mostrarNotificacion('Añadido al carrito', 'success');
}

/**
 * Guarda el estado actual del carrito en localStorage y actualiza la UI.
 */
function guardarCarrito() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

/**
 * Actualiza la visualización del carrito (lista de items y totales).
 */
function updateCartUI() {
    let count = 0;
    let total = 0;

    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';

    cart.forEach(item => {
        count += item.quantity;
        total += item.price * item.quantity;

        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.thumbnail}" style="width:50px;">
                <div>
                     <h4>${item.title}</h4>
                     <p>$${item.price} x ${item.quantity}</p>
                </div>
                <div class="cart-item__controls">
                    <button class="cart-item__btn" onclick="cambiarCantidad(${item.id}, 1)">
                        <span class="material-icons">add</span>
                    </button>
                    <button class="cart-item__btn" onclick="cambiarCantidad(${item.id}, -1)">
                        <span class="material-icons">remove</span>
                    </button>
                    <button class="cart-item__btn cart-item__btn--remove" onclick="borrarItem(${item.id})">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `;
    });

    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

/**
 * Modifica la cantidad de un item en el carrito.
 * @param {number} id - ID del producto
 * @param {number} delta - Cantidad a sumar o restar (1 o -1)
 */
window.cambiarCantidad = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) borrarItem(id);
        else guardarCarrito();
    }
};

/**
 * Elimina un producto completamente del carrito.
 * @param {number} id - ID del producto a eliminar
 */
window.borrarItem = (id) => {
    cart = cart.filter(i => i.id !== id);
    guardarCarrito();
};

/**
 * Genera un nuevo desafío matemático simple para el Captcha.
 */
function generateCaptcha() {
    const n1 = Math.floor(Math.random() * 10);
    const n2 = Math.floor(Math.random() * 10);
    captchaResult = n1 + n2;
    document.getElementById('captcha-question').textContent = `${n1} + ${n2}`;
    document.getElementById('captcha-input').value = '';
}

/**
 * Actualiza la UI de autenticación en la barra de navegación.
 * Muestra el nombre del usuario y botón Logout si está logueado, o botón Login si no.
 */
function updateAuthUI() {
    const container = document.getElementById('auth-link-container');
    if (user) {
        container.innerHTML = `<a href="#" class="nav__link" onclick="logout()">Logout (${user.firstName})</a>`;
    } else {
        container.innerHTML = `<a href="#" class="nav__link" data-view="login">Login</a>`;
    }
}

/**
 * Cierra la sesión del usuario, limpia localStorage y redirige a login.
 */
window.logout = () => {
    user = null;
    localStorage.removeItem('user');
    updateAuthUI();
    changeView('login');
}

/**
 * Procesa el pedido final.
 * Valida usuario, carrito y email antes de enviar la confirmación vía EmailJS.
 */
function doCheckout() {
    if (!user) {
        mostrarNotificacion("Inicia sesión primero", "error");
        changeView('login');
        return;
    }
    if (cart.length === 0) {
        mostrarNotificacion("Carrito vacío", "error");
        return;
    }

    const emailInput = document.getElementById('checkout-email');
    const email = emailInput.value;

    if (!email || !email.includes('@')) {
        mostrarNotificacion("Por favor ingresa un email válido.", "error");
        return;
    }

    const btn = document.getElementById('checkout-btn');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    const detalles = cart.map(item => `${item.title} (x${item.quantity})`).join(', ');
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

    let totalStr = document.getElementById('cart-total').textContent;
    if (totalStr.startsWith('$')) {
        totalStr = totalStr.substring(1);
    }

    const params = {
        to_email: email,
        to_name: user.firstName,
        order_summary: detalles,
        total_price: totalStr,
        total_qty: totalQty
    };

    emailjs.send("service_re69oct", "template_tl1d63b", params)
        .then(() => {
            mostrarNotificacion(`Pedido realizado! Se ha enviado un correo a ${email}`, "success");
            cart = [];
            guardarCarrito();
            emailInput.value = '';
            changeView('home');
        })
        .catch((err) => {
            console.error(err);
            mostrarNotificacion("Hubo un error al enviar el pedido. Inténtalo de nuevo.", "error");
        })
        .finally(() => {
            btn.textContent = 'Finalizar Pedido';
            btn.disabled = false;
        });
}

/**
 * Muestra una notificación emergente usando Toastify.
 * @param {string} msg - Mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje ('error' o 'success')
 */
function mostrarNotificacion(msg, tipo) {
    Toastify({
        text: msg,
        duration: 3000,
        style: {
            background: tipo === 'error' ? "red" : "green"
        }
    }).showToast();
}

/**
 * Obtiene la promo del backend PHP y la muestra en un banner.
 */
async function displayBackendPromo() {
    const data = await getBackendInfoAPI();
    if (data) {
        const header = document.querySelector('.header');
        const banner = document.createElement('div');
        banner.style.background = '#28a745';
        banner.style.color = '#fff';
        banner.style.textAlign = 'center';
        banner.style.padding = '10px';
        banner.style.fontWeight = 'bold';

        const greeting = data.greeting || "Conectado al Backend";
        const promo = data.promo_message || "";

        banner.innerHTML = `<div>${greeting}</div><div style="font-size: 0.8rem;">${promo}</div>`;
        header.parentNode.insertBefore(banner, header.nextSibling);
    }
}
