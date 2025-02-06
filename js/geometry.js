function isHorizontal(segment) {
    return segment.a.y == segment.b.y;
}

function isVertical(segment) {
    return segment.a.x == segment.b.x;
}

function isBetweenX(a, b, c) {
    return ((a.x <= c.x) && (c.x <= b.x)) || ((b.x <= c.x) && (c.x <= a.x));
}

function isBetweenY(a, b, c) {
    return ((a.y <= c.y) && (c.y <= b.y)) || ((b.y <= c.y) && (c.y <= a.y));
}

function middle(segment) {
    return {x: (segment.a.x + segment.b.x) / 2, y: (segment.a.y + segment.b.y) / 2};
}

function intersection(segments, segment) {
    for (let i = 0; i < segments.length; i++) {
        if (isHorizontal(segment) && isVertical(segments[i])
                && isBetweenX(segment.a, segment.b, segments[i].a)
                && isBetweenY(segments[i].a, segments[i].b, segment.a)) {
            return {i: i, x: segments[i].a.x, y: segment.a.y};
        } else if (isVertical(segment) && isHorizontal(segments[i])
                && isBetweenY(segment.a, segment.b, segments[i].a)
                && isBetweenX(segments[i].a, segments[i].b, segment.a)) {
            return {i: i, x: segment.a.x, y: segments[i].a.y};
        }
    }
    return null;
}

function inside(segments, point) {
    const ys = segments.filter(isHorizontal)
            .map(segment => segment.a.y)
            .toSorted((a, b) => a - b)
            .filter((v, i, a) => a.indexOf(v) == i);
    for (let i = 1; i < ys.length; i++) {
        const xs = segments.filter(isVertical)
                .filter(segment => ((segment.a.y <= ys[i - 1]) && (ys[i] <= segment.b.y))
                        || ((segment.b.y <= ys[i - 1]) && (ys[i] <= segment.a.y)))
                .map(segment => segment.a.x)
                .toSorted((a, b) => a - b)
                .filter((v, i, a) => a.indexOf(v) == i);
        for (let j = 0; j < xs.length / 2; j++) {
            if ((ys[i - 1] <= point.y) && (point.y <= ys[i]) && (xs[2 * j] <= point.x) && (point.x <= xs[2 * j + 1])) {
                return true;
            }
        }
    }
    return false;
}

function area(segments) {
    let area = 0;
    const ys = segments.filter(isHorizontal)
            .map(segment => segment.a.y)
            .toSorted((a, b) => a - b)
            .filter((v, i, a) => a.indexOf(v) == i);
    for (let i = 1; i < ys.length; i++) {
        const xs = segments.filter(isVertical)
                .filter(segment => ((segment.a.y <= ys[i - 1]) && (ys[i] <= segment.b.y))
                    || ((segment.b.y <= ys[i - 1]) && (ys[i] <= segment.a.y)))
                .map(segment => segment.a.x)
                .toSorted((a, b) => a - b)
                .filter((v, i, a) => a.indexOf(v) == i);
        for (let j = 0; j < xs.length / 2; j++) {
            area += (ys[i] - ys[i - 1]) * (xs[2 * j + 1] - xs[2 * j]);
        }
    }
    return area;
}

function distance(segment, point) {
    if (isHorizontal(segment) && (((segment.a.x <= point.x) && (point.x <= segment.b.x))
            || ((segment.b.x <= point.x) && (point.x <= segment.a.x)))) {
        return Math.abs(segment.a.y - point.y);
    } else if (isVertical(segment) && (((segment.a.y <= point.y) && (point.y <= segment.b.y))
            || ((segment.b.y <= point.y) && (point.y <= segment.a.y)))) {
        return Math.abs(segment.a.x - point.x);
    }
    return Math.min(Math.sqrt(Math.pow(segment.a.x - point.x, 2) + Math.pow(segment.a.y - point.y, 2)),
            Math.sqrt(Math.pow(segment.b.x - point.x, 2) + Math.pow(segment.b.y - point.y, 2)));
}
