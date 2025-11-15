// Данные игр с цветовыми схемами вместо картинок
const games = [
    {
        id: 1,
        title: "Cyberpunk 2077",
        genre: "action",
        platform: "pc",
        price: 49.99,
        emoji: "🔮",
        description: "Приключение в темном будущем Найт-Сити, где технологии и человечность сталкиваются.",
        rating: 4.5
    },
    {
        id: 2,
        title: "The Witcher 3",
        genre: "rpg",
        platform: "pc",
        price: 39.99,
        emoji: "⚔️",
        description: "Эпическая RPG о ведьмаке Геральте из Ривии в мире темного фэнтези.",
        rating: 4.9
    },
    {
        id: 3,
        title: "God of War",
        genre: "action",
        platform: "playstation",
        price: 59.99,
        emoji: "🔱",
        description: "Кратос и его сын Атрей отправляются в опасное путешествие по миру скандинавских мифов.",
        rating: 4.8
    },
    {
        id: 4,
        title: "FIFA 23",
        genre: "sports",
        platform: "xbox",
        price: 29.99,
        emoji: "⚽",
        description: "Лучший футбольный симулятор с реалистичной графикой и геймплеем.",
        rating: 4.3
    },
    {
        id: 5,
        title: "The Legend of Zelda",
        genre: "rpg",
        platform: "nintendo",
        price: 44.99,
        emoji: "🛡️",
        description: "Приключение Линка в огромном открытом мире Хайрула.",
        rating: 4.7
    },
    {
        id: 6,
        title: "StarCraft II",
        genre: "strategy",
        platform: "pc",
        price: 19.99,
        emoji: "🚀",
        description: "Легендарная стратегия в реальном времени в космической вселенной.",
        rating: 4.6
    },
    {
        id: 7,
        title: "Call of Duty",
        genre: "action",
        platform: "pc",
        price: 69.99,
        emoji: "🎯",
        description: "Экшн-шутер с захватывающим сюжетом и многопользовательским режимом.",
        rating: 4.4
    },
    {
        id: 8,
        title: "NBA 2K23",
        genre: "sports",
        platform: "playstation",
        price: 34.99,
        emoji: "🏀",
        description: "Баскетбольный симулятор с реалистичной физикой и графикой.",
        rating: 4.2
    }
];

let cart = [];
let filteredGames = [...games];

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    displayGames(filteredGames);
    updateCartCount();
});

// Отображение игр в сетке
function displayGames(gamesArray) {
    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.innerHTML = '';
    
    if (gamesArray.length === 0) {
        gamesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #ccc;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎮</div>
                <h3 style="color: #00ff88; margin-bottom: 1rem;">Игры не найдены</h3>
                <p>Попробуйте изменить параметры поиска или фильтры</p>
            </div>
        `;
        return;
    }
    
    gamesArray.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.setAttribute('data-game', game.id);
        gameCard.innerHTML = `
            <div class="game-image">
                ${game.emoji}
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-details">
                    <span>${getGenreName(game.genre)}</span> • 
                    <span>${getPlatformName(game.platform)}</span>
                </p>
                <div class="game-rating">
                    <span>⭐ ${game.rating}/5</span>
                </div>
                <div class="game-price">$${game.price}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${game.id})">
                    🛒 Добавить в корзину
                </button>
            </div>
        `;
        gameCard.addEventListener('click', () => {
            showGameDetails(game.id);
        });
        gamesGrid.appendChild(gameCard);
    });
}

// Фильтрация игр
function filterGames() {
    const genre = document.getElementById('genreFilter').value;
    const platform = document.getElementById('platformFilter').value;
    const price = document.getElementById('priceFilter').value;
    
    filteredGames = games.filter(game => {
        const genreMatch = genre === 'all' || game.genre === genre;
        const platformMatch = platform === 'all' || game.platform === platform;
        const priceMatch = checkPriceRange(game.price, price);
        
        return genreMatch && platformMatch && priceMatch;
    });
    
    displayGames(filteredGames);
}

// Проверка диапазона цен
function checkPriceRange(price, range) {
    if (range === 'all') return true;
    
    if (range.endsWith('+')) {
        return price >= 60;
    }
    
    const [min, max] = range.split('-').map(Number);
    return price >= min && price <= max;
}

// Поиск игр
function searchGames() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (query === '') {
        filteredGames = [...games];
    } else {
        filteredGames = games.filter(game => 
            game.title.toLowerCase().includes(query) ||
            game.description.toLowerCase().includes(query) ||
            getGenreName(game.genre).toLowerCase().includes(query) ||
            getPlatformName(game.platform).toLowerCase().includes(query)
        );
    }
    
    displayGames(filteredGames);
}

// Функциональность корзины
function addToCart(gameId) {
    const game = games.find(g => g.id === gameId);
    const existingItem = cart.find(item => item.id === gameId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...game,
            quantity: 1
        });
    }
    
    updateCartCount();
    showNotification(`🎮 "${game.title}" добавлена в корзину!`);
}

function removeFromCart(gameId) {
    cart = cart.filter(item => item.id !== gameId);
    updateCartCount();
    updateCartDisplay();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
    if (cartModal.style.display === 'block') {
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; color: #ccc; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
                <p>Корзина пуста</p>
            </div>
        `;
        totalPrice.textContent = '0';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <strong>${item.title}</strong>
                <p style="color: #ccc; font-size: 0.9rem; margin-top: 0.3rem;">
                    $${item.price} × ${item.quantity}
                </p>
            </div>
            <div style="text-align: right;">
                <strong style="color: #ffd700; display: block; margin-bottom: 0.5rem;">
                    $${itemTotal.toFixed(2)}
                </strong>
                <button class="remove-btn" onclick="event.stopPropagation(); removeFromCart(${item.id})">
                    🗑️ Удалить
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    totalPrice.textContent = total.toFixed(2);
}

function checkout() {
    if (cart.length === 0) {
        showNotification('🛒 Корзина пуста!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`✅ Заказ оформлен! Общая сумма: $${total.toFixed(2)}\nСпасибо за покупку! 🎉`);
    cart = [];
    updateCartCount();
    toggleCart();
}

// Показать детали игры
function showGameDetails(gameId) {
    const game = games.find(g => g.id === gameId);
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            padding: 2rem;
            border-radius: 15px;
            border: 2px solid #00ff88;
            max-width: 500px;
            width: 90%;
            text-align: center;
            position: relative;
        ">
            <button onclick="this.parentElement.parentElement.remove()" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
            ">×</button>
            
            <div style="
                background: linear-gradient(45deg, var(--game-color-1), var(--game-color-2));
                width: 100px;
                height: 100px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 3rem;
                margin: 0 auto 1.5rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            ">${game.emoji}</div>
            
            <h2 style="color: #00ff88; margin-bottom: 1rem; text-shadow: 0 0 10px rgba(0,255,136,0.3);">
                ${game.title}
            </h2>
            
            <p style="margin-bottom: 1.5rem; color: #ccc; line-height: 1.6;">
                ${game.description}
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                    <strong>Жанр</strong><br>
                    <span style="color: #00ff88;">${getGenreName(game.genre)}</span>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                    <strong>Платформа</strong><br>
                    <span style="color: #00ff88;">${getPlatformName(game.platform)}</span>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                    <strong>Рейтинг</strong><br>
                    <span style="color: #ffd700;">⭐ ${game.rating}/5</span>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                    <strong>Цена</strong><br>
                    <span style="color: #ffd700; font-size: 1.2rem;">$${game.price}</span>
                </div>
            </div>
            
            <button class="add-to-cart" onclick="addToCart(${game.id}); this.parentElement.parentElement.remove()" 
                    style="margin-right: 1rem; width: auto; padding: 0.8rem 2rem;">
                🛒 Добавить в корзину
            </button>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="padding: 0.8rem 2rem; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Закрыть
            </button>
        </div>
    `;
    
    // Устанавливаем цветовую схему для модального окна
    modal.querySelector('div > div').style.setProperty('--game-color-1', getComputedStyle(document.querySelector(`[data-game="${gameId}"] .game-image`)).getPropertyValue('--game-color-1'));
    modal.querySelector('div > div').style.setProperty('--game-color-2', getComputedStyle(document.querySelector(`[data-game="${gameId}"] .game-image`)).getPropertyValue('--game-color-2'));
    
    document.body.appendChild(modal);
}

// Вспомогательные функции
function getGenreName(genre) {
    const genres = {
        'action': 'Экшен',
        'rpg': 'RPG',
        'strategy': 'Стратегия',
        'sports': 'Спортивные'
    };
    return genres[genre] || genre;
}

function getPlatformName(platform) {
    const platforms = {
        'pc': 'PC',
        'playstation': 'PlayStation',
        'xbox': 'Xbox',
        'nintendo': 'Nintendo'
    };
    return platforms[platform] || platform;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #00ff88;
        color: #1a1a2e;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        border: 2px solid #00cc6a;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function login() {
    showNotification('👤 Функция входа в систему');
}

// Поиск при нажатии Enter
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchGames();
    }
});

// Закрытие корзины при клике вне ее
window.addEventListener('click', function(event) {
    const cartModal = document.getElementById('cartModal');
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
});