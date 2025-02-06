class Border {
    static #COLOR = 'rgba(127, 127, 127, 0.9375)';

    #border;

    constructor(border) {
        this.#border = border;
    }

    get segments() {
        const segments = [];
        for (let i = 0; i < this.#border.length; i++) {
            segments.push({a: this.#border[i], b: this.#border[(i + 1) % this.#border.length]});
        }
        return segments;
    }

    update(path) {
        const xsection = path.intersects(this);
        if ((xsection?.begin != null) && (xsection?.end != null)) { // splice with path if intersecting twice
            const [[border1, area1], [border2, area2]] = this.#splice(path, xsection.begin, xsection.end).entries();
            this.#border = (area1 < area2) ? border2 : border1;
            path.reset(xsection.end);
        }
    }

    render(context) {
        context.save();
        context.beginPath();
        context.moveTo(this.#border[0].x, this.#border[0].y);
        for (let i = 1; i < this.#border.length; i++) {
            context.lineTo(this.#border[i].x, this.#border[i].y);
        }
        context.fillStyle = Border.#COLOR;
        context.fill();
        context.restore();
    }

    #splice(path, begin, end) {
        const min = Math.min(begin.i, end.i);
        const max = Math.max(begin.i, end.i);
        const revert = (begin.i > end.i) || ((begin.i == end.i)
                && ((isHorizontal(this.segments[begin.i])
                && ((this.segments[begin.i].b.x - this.segments[begin.i].a.x)
                * (path.path[path.path.length - 1].x - path.path[0].x) < 0))
                || (isVertical(this.segments[begin.i])
                && ((this.segments[begin.i].b.y - this.segments[begin.i].a.y)
                * (path.path[path.path.length - 1].y - path.path[0].y) < 0))));
        const border1 = this.#border.toSpliced(min + 1, max - min, ...(revert ? path.path.toReversed() : path.path));
        const border2 = this.#border.toSpliced(max + 1, this.#border.length - max - 1)
                .toSpliced(0, min + 1, ...(revert ? path.path : path.path.toReversed()));
        return new Map([[border1, area(new Border(border1).segments)], [border2, area(new Border(border2).segments)]]);
    }
}
