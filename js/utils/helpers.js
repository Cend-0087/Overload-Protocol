// Вспомогательные функции для игры

const Helpers = {
    // Генерация случайного числа в диапазоне
    randomRange(min, max) {
        return min + Math.random() * (max - min);
    },
    
    // Ограничение значения
    clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    },
    
    // Линейная интерполяция
    lerp(start, end, amount) {
        return start + (end - start) * amount;
    },
    
    // Конвертация градусов в радианы
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    // Конвертация радиан в градусы
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },
    
    // Расстояние между двумя точками
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Генерация случайного цвета
    randomColor() {
        return Math.floor(Math.random() * 0xFFFFFF);
    },
    
    // Форматирование времени в мм:сс
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Задержка (Promise)
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Случайный элемент из массива
    randomArrayItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // Перемешивание массива (алгоритм Фишера-Йетса)
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Helpers;
}