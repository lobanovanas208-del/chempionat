// Состояние приложения
let currentTool = 'pen';
let currentColor = '#000000';
let currentSize = 3;
let isDrawing = false;
let selectedElement = null;
let lastX = 0;
let lastY = 0;
let drawingHistory = [];
let historyIndex = -1;

// Элементы DOM
let canvas, ctx;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация доски...');
    initializeCanvas();
    initializeTools();
    initializeBoard();
    updateSizeValue();
    saveState();
    initializeKeyboardShortcuts();
    
    showNotification('🎨 Добро пожаловать! Выберите карандаш и рисуйте мышью на белой области');
});

// Инициализация Canvas
function initializeCanvas() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    
    // Устанавливаем размер canvas
    resizeCanvas();
    
    // Очистка canvas белым цветом
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // События мыши для canvas
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Предотвращаем контекстное меню на canvas
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    
    console.log('Canvas инициализирован, размер:', canvas.width, 'x', canvas.height);
}

// Изменение размера canvas
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    console.log('Canvas размер изменен на:', canvas.width, 'x', canvas.height);
}

// Инициализация инструментов
function initializeTools() {
    // Обработчик для размера кисти
    const sizeSlider = document.getElementById('brushSize');
    sizeSlider.addEventListener('input', function() {
        currentSize = parseInt(this.value);
        updateSizeValue();
    });
    
    // Обработчик для ввода сообщений
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Горячие клавиши
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+Z - отменить
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        // Ctrl+Y - повторить
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
        }
        // Ctrl+S - сохранить
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveBoard();
        }
        // Ctrl+E - ластик
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            switchTool('eraser');
        }
        // Ctrl+P - карандаш
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            switchTool('pen');
        }
        // Delete - удалить выделенное
        if (e.key === 'Delete' && selectedElement) {
            selectedElement.remove();
            selectedElement = null;
            saveState();
        }
    });
}

// Переключение инструмента
function switchTool(tool) {
    console.log('Переключение инструмента на:', tool);
    
    // Обновляем кнопки
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    
    currentTool = tool;
    
    // Обновляем курсор
    if (tool === 'pen' || tool === 'eraser') {
        canvas.style.cursor = 'crosshair';
    } else {
        canvas.style.cursor = 'default';
    }
    
    showNotification(getToolMessage(tool));
}

// Выбор цвета
function selectColor(color) {
    console.log('Выбор цвета:', color);
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('active');
    });
    event.target.classList.add('active');
    currentColor = color;
}

// Получение сообщения для инструмента
function getToolMessage(tool) {
    const messages = {
        pen: '✏️ Карандаш выбран. Рисуйте мышью на белой области',
        eraser: '🧽 Ластик выбран. Стирайте рисунки мышью',
        select: '✋ Режим выделения. Перетаскивайте элементы',
        text: '📝 Текст добавлен. Кликните для редактирования'
    };
    return messages[tool] || 'Инструмент изменен';
}

// Начало рисования
function startDrawing(e) {
    if (currentTool === 'pen' || currentTool === 'eraser') {
        console.log('Начало рисования в позиции:', e.clientX, e.clientY);
        
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        
        // Начинаем новый путь
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        
        // Рисуем точку в начале
        ctx.lineTo(lastX, lastY);
        ctx.stroke();
        
        console.log('Координаты canvas:', lastX, lastY);
    }
}

// Процесс рисования
function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Настройки рисования
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = 1.0;
    
    if (currentTool === 'pen') {
        // Рисование карандашом
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
    } else if (currentTool === 'eraser') {
        // Стирание ластиком
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = currentSize * 3;
    }
    
    // Рисуем линию
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

// Остановка рисования
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.closePath();
        saveState();
        console.log('Рисование завершено');
    }
}

// Инициализация доски
function initializeBoard() {
    // Обработчики для элементов доски
    document.querySelectorAll('.board-element').forEach(element => {
        makeElementDraggable(element);
    });
}

// Сделать элемент перемещаемым
function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    
    element.addEventListener('mousedown', function(e) {
        if (currentTool !== 'select') return;
        
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        
        // Получить позицию курсора при старте
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('mousemove', elementDrag);
        
        // Выделить элемент
        document.querySelectorAll('.board-element').forEach(el => {
            el.classList.remove('selected');
        });
        element.classList.add('selected');
        selectedElement = element;
    });
    
    function elementDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        // Вычислить новую позицию
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Установить новую позицию
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        isDragging = false;
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        saveState();
    }
}

// Обновление отображения размера
function updateSizeValue() {
    document.getElementById('sizeValue').textContent = currentSize + 'px';
}

// Добавление фигур
function addRectangle() {
    const board = document.getElementById('drawingBoard');
    const rect = document.createElement('div');
    rect.className = 'board-element shape-element';
    rect.style.top = '200px';
    rect.style.left = '200px';
    rect.style.width = '150px';
    rect.style.height = '100px';
    rect.innerHTML = `<div class="element-content rectangle" style="background: ${currentColor}"></div>`;
    board.appendChild(rect);
    makeElementDraggable(rect);
    saveState();
    showNotification('⬜ Прямоугольник добавлен');
}

function addCircle() {
    const board = document.getElementById('drawingBoard');
    const circle = document.createElement('div');
    circle.className = 'board-element shape-element circle';
    circle.style.top = '200px';
    circle.style.left = '400px';
    circle.style.width = '100px';
    circle.style.height = '100px';
    circle.innerHTML = `<div class="element-content circle-shape" style="background: ${currentColor}"></div>`;
    board.appendChild(circle);
    makeElementDraggable(circle);
    saveState();
    showNotification('⭕ Круг добавлен');
}

function addLine() {
    const board = document.getElementById('drawingBoard');
    const line = document.createElement('div');
    line.className = 'board-element shape-element';
    line.style.top = '300px';
    line.style.left = '100px';
    line.style.width = '200px';
    line.style.height = '4px';
    line.innerHTML = `<div class="element-content line-shape" style="background: ${currentColor}"></div>`;
    board.appendChild(line);
    makeElementDraggable(line);
    saveState();
    showNotification('📏 Линия добавлена');
}

// Добавление текста
function addTextElement() {
    const board = document.getElementById('drawingBoard');
    const textElement = document.createElement('div');
    textElement.className = 'board-element text-element';
    textElement.style.top = '100px';
    textElement.style.left = '100px';
    textElement.style.minWidth = '150px';
    textElement.innerHTML = `
        <div class="element-content" 
             contenteditable="true" 
             onblur="saveState()"
             style="min-height: 20px; outline: none;"
        >Новый текст</div>
    `;
    board.appendChild(textElement);
    makeElementDraggable(textElement);
    
    // Фокус на текстовом поле
    setTimeout(() => {
        textElement.querySelector('.element-content').focus();
    }, 100);
    
    saveState();
    showNotification('📝 Текстовый блок добавлен. Кликните для редактирования');
}

// Система истории (undo/redo)
function saveState() {
    // Сохраняем состояние canvas
    const canvasState = canvas.toDataURL();
    
    // Сохраняем состояние HTML элементов
    const boardState = document.getElementById('drawingBoard').innerHTML;
    
    // Удаляем состояния после текущего индекса
    drawingHistory = drawingHistory.slice(0, historyIndex + 1);
    
    // Добавляем новое состояние
    drawingHistory.push({
        canvas: canvasState,
        board: boardState,
        timestamp: Date.now()
    });
    
    // Ограничиваем историю 20 состояниями
    if (drawingHistory.length > 20) {
        drawingHistory.shift();
    }
    
    // Обновляем индекс
    historyIndex = drawingHistory.length - 1;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState();
        showNotification('↶ Действие отменено (Ctrl+Z)');
    } else {
        showNotification('❌ Нечего отменять');
    }
}

function redo() {
    if (historyIndex < drawingHistory.length - 1) {
        historyIndex++;
        restoreState();
        showNotification('↷ Действие повторено (Ctrl+Y)');
    } else {
        showNotification('❌ Нечего повторять');
    }
}

function restoreState() {
    if (drawingHistory[historyIndex]) {
        const state = drawingHistory[historyIndex];
        
        // Восстанавливаем canvas
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = state.canvas;
        
        // Восстанавливаем HTML элементы
        document.getElementById('drawingBoard').innerHTML = state.board;
        
        // Переинициализируем обработчики для элементов
        document.querySelectorAll('.board-element').forEach(element => {
            makeElementDraggable(element);
        });
    }
}

// Отправка сообщения в чат
function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    
    if (input.value.trim()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <span class="sender">Вы:</span>
            <span class="text">${input.value}</span>
        `;
        messages.appendChild(messageDiv);
        input.value = '';
        messages.scrollTop = messages.scrollHeight;
    }
}

// Действия с доской
function saveBoard() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `collabboard-${new Date().toISOString().slice(0, 19)}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('💾 Доска сохранена как PNG (Ctrl+S)');
}

function exportBoard() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `collabboard-export-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    showNotification('📤 Доска экспортирована в PNG');
}

function clearDrawings() {
    if (confirm('Очистить только рисунки (оставить элементы)?')) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
        showNotification('🧹 Рисунки очищены');
    }
}

function clearBoard() {
    if (confirm('Очистить всю доску? Это действие нельзя отменить.')) {
        // Очищаем canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Очищаем HTML элементы
        document.getElementById('drawingBoard').innerHTML = '';
        
        // Очищаем историю
        drawingHistory = [];
        historyIndex = -1;
        saveState();
        
        showNotification('🗑️ Доска полностью очищена');
    }
}

function inviteUsers() {
    const inviteLink = window.location.href;
    navigator.clipboard.writeText(inviteLink).then(() => {
        showNotification('👥 Ссылка скопирована в буфер обмена!');
    }).catch(() => {
        showNotification('👥 Ссылка для приглашения: ' + inviteLink);
    });
}

function loadTemplate(template) {
    const templates = {
        brainstorm: () => {
            addTextElement();
            showNotification('🧠 Шаблон мозгового штурма загружен');
        },
        project: () => {
            addRectangle();
            addTextElement();
            showNotification('📊 Шаблон плана проекта загружен');
        },
        flowchart: () => {
            addRectangle();
            addCircle();
            addLine();
            showNotification('🔀 Шаблон блок-схемы загружен');
        }
    };
    
    if (templates[template]) {
        templates[template]();
    }
}

function showHelp() {
    const helpText = `
Горячие клавиши:
• Ctrl+P - Карандаш
• Ctrl+E - Ластик  
• Ctrl+T - Добавить текст
• Ctrl+Z - Отменить
• Ctrl+Y - Повторить
• Ctrl+S - Сохранить
• Delete - Удалить выделенное

Как рисовать:
1. Выберите карандаш ✏️
2. Нажмите и держите левую кнопку мыши
3. Перемещайте мышь для рисования
4. Отпустите кнопку чтобы закончить
    `.trim();
    
    showNotification(helpText);
}

// Утилиты
function showNotification(message) {
    // Удаляем предыдущие уведомления
    document.querySelectorAll('.custom-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 3000;
        font-weight: 500;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        border-left: 4px solid #5a6fd8;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Обработка изменения размера окна
window.addEventListener('resize', function() {
    setTimeout(resizeCanvas, 100);
});