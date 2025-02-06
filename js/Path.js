class Path {
    static #COLOR = 'white';
    static #DASH = [5, 5];
    static #WIDTH = 1.25;

    #path;

    constructor(point) {
        this.#path = [point];
    }

    get path() {
        return this.#path;
    }

    get segments() {
        const segments = [];
        for (let i = 1; i < this.#path.length; i++) {
            segments.push({a: this.#path[i - 1], b: this.#path[i]});
        }
        return segments;
    }

    update(pen, border) {
        if (this.#hasMoved(pen)) { // add point if pen has moved
            this.#path.push({x: pen.x, y: pen.y});
        }
        if (this.#liesOn(border)) { // remove first segment if it lies on border
            this.#path.splice(0, 1);
        }
        const xsection = this.intersects(border);
        if (xsection?.begin != null) { // move first point to intersection begin with border
            this.#path[0] = xsection.begin;
        }
        if (this.#hasConsecutiveStraightSegments()) { // concatenate consecutive straight segments
            this.#path.splice(this.#path.length - 2, 1);
        }
        if (this.#crossesSelf()) { // reset if path crossing itself
            pen.reset(this.#path[0]);
            this.reset(this.#path[0]);
        }
    }

    reset(point) {
        this.#path = [point];
    }

    intersects(border) {
        return (this.#path.length > 1) ? {
            begin: (intersection(border.segments, (this.segments.length == 1)
                ? {a: this.#path[0], b: middle(this.segments[0])}
                : this.segments[0])),
            end: (intersection(border.segments, (this.segments.length == 1)
                ? {a: middle(this.segments[this.segments.length -1]), b: this.#path[this.#path.length - 1]}
                : this.segments[this.segments.length - 1]))
        } : null;
    }

    render(context) {
        context.save();
        context.beginPath();
        context.moveTo(this.#path[0].x, this.#path[0].y);
        for (let i = 1; i < this.#path.length; i++) {
            context.lineTo(this.#path[i].x, this.#path[i].y);
        }
        context.lineWidth = Path.#WIDTH;
        context.setLineDash(Path.#DASH);
        context.strokeStyle = Path.#COLOR;
        context.stroke();
        context.restore();
    }

    get #ultimate() {
        return this.#path[this.#path.length - 1];
    }

    get #penultimate() {
        return this.#path[this.#path.length - 2];
    }

    get #antepenultimate() {
        return this.#path[this.#path.length - 3];
    }

    #hasMoved(pen) {
        return (this.#path.length == 0) || (pen.x != this.#ultimate.x) || (pen.y != this.#ultimate.y);
    }

    #liesOn(border) {
        return (this.#path.length > 1) && border.segments.some(segment =>
                    (isHorizontal(this.segments[0]) && isHorizontal(segment)
                    && isHorizontal({a: this.segments[0].a, b: segment.a})
                    && isBetweenX(segment.a, segment.b, this.segments[0].a)
                    && isBetweenX(segment.a, segment.b, this.segments[0].b))
                    || (isVertical(this.segments[0]) && isVertical(segment)
                    && isVertical({a: this.segments[0].a, b: segment.a})
                    && isBetweenY(segment.a, segment.b, this.segments[0].a)
                    && isBetweenY(segment.a, segment.b, this.segments[0].b)));
    }

    #hasConsecutiveStraightSegments() {
        return (this.#path.length > 2)
                && ((isHorizontal({a: this.#ultimate, b: this.#penultimate})
                && isHorizontal({a: this.#penultimate, b: this.#antepenultimate}))
                || (isVertical({a: this.#ultimate, b: this.#penultimate})
                && isVertical({a: this.#penultimate, b: this.#antepenultimate})));
    }

    #crossesSelf() {
        for (let i = 0; i < this.segments.length; i++) {
            const xsection = intersection(this.segments, this.segments[i]);
            if ((xsection != null) && ((xsection.i < i - 1) || (xsection.i > i + 1))) {
                return true;
            }
        }
        return false;
    }
}
