type Vector2 = {x: number, y: number};

export function getIntersection(a: Vector2, b: Vector2, a1: Vector2, b1: Vector2) {
    const s1_x = b.x - a.x;
    const s1_y = b.y - a.y;
    const s2_x = b1.x - a1.x;
    const s2_y = b1.y - a1.y;

    const denom = (-s2_x * s1_y + s1_x * s2_y);
    
    // Если знаменатель 0, отрезки параллельны или коллинеарны
    if (Math.abs(denom) < Number.EPSILON) {
        return null; 
    }

    const s = (-s1_y * (a.x - a1.x) + s1_x * (a.y - a1.y)) / denom;
    const t = (s2_x * (a.y - a1.y) - s2_y * (a.x - a1.x)) / denom;

    // Проверяем, лежат ли точки пересечения внутри обоих отрезков (от 0 до 1)
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    //if (s > 0 && s < 1 && t > 0 && t < 1) {
        // Возвращаем точные координаты точки пересечения
        return {
            x: a.x + (t * s1_x),
            y: a.y + (t * s1_y)
        };
    }

    return null; // Пересечения нет (продолжения прямых пересекаются, но сами отрезки — нет)
}

export function reflectVector(v: Vector2, n: Vector2) {
    // 1. Находим длину нормали, чтобы сделать её единичной
    const lengthN = Math.sqrt(n.x * n.x + n.y * n.y);
    
    if (lengthN === 0) {
        throw new Error("Вектор нормали не может быть нулевым.");
    }
    
    const nx = n.x / lengthN;
    const ny = n.y / lengthN;

    // 2. Вычисляем скалярное произведение (v * n)
    const dotProduct = v.x * nx + v.y * ny;

    // 3. Формула: v_reflected = v - 2 * (v * n) * n
    return {
        x: v.x - 2 * dotProduct * nx,
        y: v.y - 2 * dotProduct * ny
    };
}

export function getNormalFromPoints(p1: Vector2, p2: Vector2) {
    // 1. Находим вектор направления прямой (от p1 к p2)
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // 2. Поворачиваем вектор на 90 градусов.
    // Для вектора (x, y) перпендикуляром будет (-y, x) или (y, -x)
    return {
        x: -dy,
        y: dx
    };
}