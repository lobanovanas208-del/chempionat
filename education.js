// Данные курсов
const courses = [
    {
        id: 1,
        title: "Веб-разработка",
        description: "Полный курс по созданию современных веб-приложений",
        progress: 80,
        lessons: 12,
        currentLesson: 9,
        emoji: "💻",
        color1: "#667eea",
        color2: "#764ba2"
    },
    {
        id: 2,
        title: "JavaScript продвинутый",
        description: "Глубокое погружение в современный JavaScript",
        progress: 45,
        lessons: 15,
        currentLesson: 7,
        emoji: "⚡",
        color1: "#f093fb",
        color2: "#f5576c"
    },
    {
        id: 3,
        title: "React и Redux",
        description: "Создание сложных приложений на React",
        progress: 30,
        lessons: 10,
        currentLesson: 3,
        emoji: "⚛️",
        color1: "#4facfe",
        color2: "#00f2fe"
    }
];

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    displayCourses();
});

// Отображение курсов
function displayCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    coursesGrid.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-image" style="--course-color-1: ${course.color1}; --course-color-2: ${course.color2}">
                ${course.emoji}
            </div>
            <div class="course-info">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-meta">
                    <span>${course.lessons} уроков</span>
                    <span>Прогресс: ${course.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${course.progress}%"></div>
                </div>
                <button class="continue-btn" onclick="openCourse(${course.id})">
                    ▶ Продолжить обучение
                </button>
            </div>
        `;
        coursesGrid.appendChild(courseCard);
    });
}

// Открыть курс
function openCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    const modal = document.getElementById('courseModal');
    const content = document.getElementById('courseModalContent');
    
    content.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${course.emoji}</div>
            <h2 style="color: #333; margin-bottom: 1rem;">${course.title}</h2>
            <p style="color: #666; margin-bottom: 2rem;">${course.description}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                    <strong>Прогресс</strong><br>
                    <span style="color: #667eea; font-size: 1.5rem;">${course.progress}%</span>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                    <strong>Текущий урок</strong><br>
                    <span style="color: #667eea; font-size: 1.5rem;">${course.currentLesson}/${course.lessons}</span>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">Следующий урок</h4>
                <p style="margin-bottom: 1rem;">Урок ${course.currentLesson + 1}: ${getLessonTitle(course.id, course.currentLesson + 1)}</p>
                <button class="continue-btn" onclick="startLesson(${course.id}, ${course.currentLesson + 1})">
                    🎬 Начать урок
                </button>
            </div>
            
            <button onclick="closeModal('courseModal')" style="padding: 0.8rem 2rem; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Закрыть
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Записаться на курс
function enrollCourse(courseId) {
    showNotification(`✅ Вы записаны на новый курс!`);
}

// Начать урок
function startLesson(courseId, lessonNumber) {
    showNotification(`🎬 Начинаем урок ${lessonNumber}!`);
    closeModal('courseModal');
}

// Управление модальными окнами
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function toggleNotifications() {
    const modal = document.getElementById('notificationsModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function toggleProfile() {
    showNotification('👤 Профиль пользователя');
}

// Вспомогательные функции
function getLessonTitle(courseId, lessonNumber) {
    const lessons = {
        1: ["HTML основы", "CSS стилизация", "JavaScript введение"],
        2: ["ES6+ возможности", "Асинхронность", "Модули"],
        3: ["Компоненты React", "Хуки", "Маршрутизация"]
    };
    return lessons[courseId]?.[lessonNumber - 1] || `Урок ${lessonNumber}`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Закрытие модальных окон при клике вне их
window.addEventListener('click', function(event) {
    const courseModal = document.getElementById('courseModal');
    const notificationsModal = document.getElementById('notificationsModal');
    
    if (event.target === courseModal) {
        courseModal.style.display = 'none';
    }
    if (event.target === notificationsModal) {
        notificationsModal.style.display = 'none';
    }
});