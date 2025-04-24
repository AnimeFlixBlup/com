const firebaseConfig = {
    apiKey: "AIzaSyBf9FgCDoECXoibnVdPObx9z4K6ij1Yyms",
    authDomain: "prueba-67711.firebaseapp.com",
    projectId: "prueba-67711",
    storageBucket: "prueba-67711.firebasestorage.app",
    messagingSenderId: "714732190621",
    appId: "1:714732190621:web:fbf1570a1938f34b1f8d74"
  };

// Datos de juegos de ejemplo para el catálogo
const gamesCatalog = [
    {
        id: 1,
        title: "GTA 6",
        genre: "aventura",
        platform: "pc",
        price: 59.99,
        image: "image/650_1200.jpg",
        rating: 4.8
    },
    {
        id: 2,
        title: "Red Dead Redemption II",
        genre: "accion",
        platform: "playstation",
        price: 49.99,
        image: "image/red.webp",
        rating: 4.5
    },
    {
        id: 3,
        title: "DOOM",
        genre: "accion",
        platform: "xbox",
        price: 39.99,
        image: "image/doom.avif",
        rating: 4.2
    },
    {
        id: 4,
        title: "SIMS 4",
        genre: "simulacion",
        platform: "pc",
        price: 45.99,
        image: "image/sims.jpeg",
        rating: 4.6
    },
    {
        id: 5,
        title: "Desperados III",
        genre: "estrategia",
        platform: "pc",
        price: 29.99,
        image: "image/desperados.jpg",
        rating: 4.3
    },
    {
        id: 6,
        title: "FIFA 25",
        genre: "deportes",
        platform: "playstation",
        price: 59.99,
        image: "image/fifa.png",
        rating: 4.7
    },
    {
        id: 7,
        title: "Need For Speed",
        genre: "deportes",
        platform: "xbox",
        price: 49.99,
        image: "image/need.jpg",
        rating: 4.4
    },
    {
        id: 8,
        title: "Super Mario RPG",
        genre: "rol",
        platform: "nintendo",
        price: 54.99,
        image: "image/mari.97fps_ESRB_h264",
        rating: 4.9
    },
    {
        id: 9,
        title: "TETRIS",
        genre: "puzzle",
        platform: "nintendo",
        price: 19.99,
        image: "image/ttr.avif",
        rating: 4.1
    },
    {
        id: 10,
        title: "Mortal Kombat 11",
        genre: "accion",
        platform: "pc",
        price: 39.99,
        image: "image/mk1.webp",
        rating: 4.5
    },
    {
        id: 11,
        title: "Assassin's Creed III",
        genre: "aventura",
        platform: "xbox",
        price: 49.99,
        image: "image/xxe.jpg",
        rating: 4.4
    },
    {
        id: 12,
        title: "Marvels Spider Man 2",
        genre: "accion",
        platform: "playstation",
        price: 29.99,
        image: "image/spi.webp",
        rating: 4.6
    }
];

// Inicializar Firebase (asegúrate de que esto esté al principio del script)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const registerLink = document.getElementById('register-link');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const gamesGrid = document.querySelector('.games-grid');
    const genreFilter = document.getElementById('genre-filter');
    const platformFilter = document.getElementById('platform-filter');
    const searchBar = document.getElementById('search-bar');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    const contactForm = document.getElementById('contact-form');
    const newsletterForm = document.getElementById('newsletter-form');
    const header = document.querySelector('header');

    // Variables de estado
    let currentPage = 1;
    let gamesPerPage = 8;
    let filteredGames = [...gamesCatalog];
    let isLoggedIn = false;

    // Cargar juegos en el catálogo
    loadGamesCatalog();

    // Añadir efectos de scroll al header
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Manejadores de eventos para modales de login/registro
    loginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('hidden');
        registerModal.classList.remove('hidden');
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            registerModal.classList.add('hidden');
        });
    });

    // Cerrar modales al hacer clic fuera de ellos
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
        if (e.target === registerModal) {
            registerModal.classList.add('hidden');
        }
    });

    // Manejadores para formularios
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    contactForm && contactForm.addEventListener('submit', handleContact);
    newsletterForm && newsletterForm.addEventListener('submit', handleNewsletter);

    // Manejadores para filtros de catálogo
    genreFilter.addEventListener('change', filterGames);
    platformFilter.addEventListener('change', filterGames);
    searchBar.addEventListener('input', filterGames);
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));

    // Manejador para logout
    logoutBtn.addEventListener('click', handleLogout);

    // Inicializar slider de juegos destacados con efectos
    initFeaturedGamesSlider();

    // Función para manejar el estado de autenticación
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Usuario está logueado
            isLoggedIn = true;
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            
            // Actualizar UI para usuario logueado
            updateUIForLoggedUser(user.displayName || user.email);
        } else {
            // Usuario no está logueado
            isLoggedIn = false;
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            
            // Actualizar UI para usuario deslogueado
            updateUIForLoggedOutUser();
        }
    });

    // Funciones
    function loadGamesCatalog() {
        // Generar tarjetas de juegos en el catálogo
        renderGamesPage();
        updatePagination();
    }

    function renderGamesPage() {
        if (!gamesGrid) return;
        
        gamesGrid.innerHTML = '';
        
        const startIndex = (currentPage - 1) * gamesPerPage;
        const endIndex = startIndex + gamesPerPage;
        const currentGames = filteredGames.slice(startIndex, endIndex);
        
        if (currentGames.length === 0) {
            gamesGrid.innerHTML = '<p class="no-games">No se encontraron juegos con los filtros seleccionados.</p>';
            return;
        }
        
        currentGames.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.classList.add('game-card');
            
            gameCard.innerHTML = `
                <img src="${game.image}" alt="${game.title}">
                <div class="game-info">
                    <h3>${game.title}</h3>
                    <div class="game-meta">
                        <span class="genre">${capitalizeFirstLetter(game.genre)}</span>
                        <span class="platform">${capitalizeFirstLetter(game.platform)}</span>
                    </div>
                    <div class="rating">
                        ${getRatingStars(game.rating)}
                    </div>
                    <p class="price">$${game.price.toFixed(2)}</p>
                    <button class="btn btn-secondary add-to-cart" data-id="${game.id}">Añadir al carrito</button>
                </div>
            `;
            
            gamesGrid.appendChild(gameCard);
        });
        
        // Agregar manejadores de eventos para los botones de añadir al carrito
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    }

    function updatePagination() {
        if (!pageIndicator) return;
        
        const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
        pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
        
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        
        prevPageBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
        nextPageBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
    }

    function changePage(direction) {
        currentPage += direction;
        renderGamesPage();
        updatePagination();
        
        // Scroll suave al principio del catálogo
        document.querySelector('#catalogo').scrollIntoView({ behavior: 'smooth' });
    }

    function filterGames() {
        const genreValue = genreFilter.value.toLowerCase();
        const platformValue = platformFilter.value.toLowerCase();
        const searchValue = searchBar.value.toLowerCase();
        
        filteredGames = gamesCatalog.filter(game => {
            const matchesGenre = genreValue ? game.genre === genreValue : true;
            const matchesPlatform = platformValue ? game.platform === platformValue : true;
            const matchesSearch = searchValue ? game.title.toLowerCase().includes(searchValue) : true;
            
            return matchesGenre && matchesPlatform && matchesSearch;
        });
        
        currentPage = 1;
        renderGamesPage();
        updatePagination();
    }

    // Modificado para usar Firebase Authentication
    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username && password) {
            // Autenticación con Firebase
            auth.signInWithEmailAndPassword(username, password)
                .then((userCredential) => {
                    // Login exitoso
                    const user = userCredential.user;
                    loginModal.classList.add('hidden');
                    
                    // Mostrar mensaje de bienvenida
                    showNotification(`¡Bienvenido, ${user.displayName || user.email}!`);
                })
                .catch((error) => {
                    // Error en el login
                    console.error("Error de autenticación:", error);
                    showNotification(`Error: ${error.message}`, 'error');
                });
        } else {
            showNotification('Por favor, completa todos los campos.', 'error');
        }
    }

    // Modificado para usar Firebase Authentication
    function handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('new-username').value;
        const email = document.getElementById('new-email').value;
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden.', 'error');
            return;
        }
        
        if (username && email && password) {
            // Registro con Firebase
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Registro exitoso
                    const user = userCredential.user;
                    
                    // Actualizar el perfil con el nombre de usuario
                    return user.updateProfile({
                        displayName: username
                    }).then(() => {
                        // Guardar información adicional del usuario en Firestore
                        return db.collection('users').doc(user.uid).set({
                            username: username,
                            email: email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }).then(() => {
                        registerModal.classList.add('hidden');
                        showNotification('Registro exitoso. ¡Bienvenido a GameStore!');
                    });
                })
                .catch((error) => {
                    // Error en el registro
                    console.error("Error en el registro:", error);
                    showNotification(`Error: ${error.message}`, 'error');
                });
        } else {
            showNotification('Por favor, completa todos los campos.', 'error');
        }
    }

    // Modificado para usar Firebase Authentication
    function handleLogout() {
        auth.signOut().then(() => {
            showNotification('Has cerrado sesión correctamente.');
        }).catch((error) => {
            console.error("Error al cerrar sesión:", error);
            showNotification(`Error: ${error.message}`, 'error');
        });
    }

    function handleContact(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        if (name && email && subject && message) {
            // Guardar el mensaje en Firestore
            db.collection('contactMessages').add({
                name: name,
                email: email,
                subject: subject,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                contactForm.reset();
                showNotification('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
            })
            .catch((error) => {
                console.error("Error al enviar mensaje:", error);
                showNotification(`Error: ${error.message}`, 'error');
            });
        } else {
            showNotification('Por favor, completa todos los campos.', 'error');
        }
    }

    function handleNewsletter(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        if (email) {
            // Guardar la suscripción en Firestore
            db.collection('newsletter').add({
                email: email,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                e.target.reset();
                showNotification('¡Gracias por suscribirte a nuestra newsletter!');
            })
            .catch((error) => {
                console.error("Error al suscribirse:", error);
                showNotification(`Error: ${error.message}`, 'error');
            });
        } else {
            showNotification('Por favor, introduce un email válido.', 'error');
        }
    }

    function handleAddToCart(e) {
        const gameId = parseInt(e.target.getAttribute('data-id'));
        const game = gamesCatalog.find(game => game.id === gameId);
        
        if (!isLoggedIn) {
            loginModal.classList.remove('hidden');
            showNotification('Debes iniciar sesión para añadir juegos al carrito.', 'error');
            return;
        }
        
        // Obtener el usuario actual
        const user = auth.currentUser;
        
        if (user) {
            // Añadir el juego al carrito en Firestore
            db.collection('carts').doc(user.uid).collection('items').add({
                gameId: game.id,
                title: game.title,
                price: game.price,
                quantity: 1,
                addedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                showNotification(`¡${game.title} añadido al carrito!`);
                
                // Animación de añadido al carrito
                e.target.textContent = '¡Añadido!';
                e.target.classList.add('added');
                
                setTimeout(() => {
                    e.target.textContent = 'Añadir al carrito';
                    e.target.classList.remove('added');
                }, 2000);
            })
            .catch((error) => {
                console.error("Error al añadir al carrito:", error);
                showNotification(`Error: ${error.message}`, 'error');
            });
        }
    }

    function updateUIForLoggedUser(username) {
        // Actualizar elementos de UI para un usuario logueado
        // En un caso real, podrías mostrar información personalizada, recomendaciones, etc.
        
        // Por ejemplo, obtener datos del carrito del usuario
        if (auth.currentUser) {
            db.collection('carts').doc(auth.currentUser.uid).collection('items').get()
                .then((querySnapshot) => {
                    // Aquí podrías actualizar un contador de elementos en el carrito, por ejemplo
                    const cartItemCount = querySnapshot.size;
                    // Actualizar algún elemento visual con esta información
                });
        }
    }

    function updateUIForLoggedOutUser() {
        // Actualizar elementos de UI para un usuario deslogueado
    }

    function initFeaturedGamesSlider() {
        // En un caso real, aquí podrías añadir una biblioteca de slider como Swiper.js
        // Por ahora, sólo aplicamos algunos efectos básicos con CSS
        const gameCards = document.querySelectorAll('.featured-games .game-card');
        
        gameCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('hovered');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hovered');
            });
        });
    }

    function showNotification(message, type = 'success') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        
        // Añadir al DOM
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Funciones de utilidad
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        let starsHTML = '';
        
        // Estrellas completas
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Media estrella
        if (halfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Estrellas vacías
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return starsHTML;
    }

    // Agregar estilos para notificaciones
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            background-color: #2ecc71;
            color: white;
            font-size: 14px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .notification.error {
            background-color: #e74c3c;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .game-card .added {
            background-color: #2ecc71 !important;
        }
        
        .game-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 12px;
            color: var(--gray-text);
        }
        
        .rating {
            margin-bottom: 10px;
            color: #f1c40f;
        }
    `;
    document.head.appendChild(notificationStyles);
});