class Pen {
    static #COLOR = 'white';
    static #EVENT_KEY_DOWN = 'keydown';
    static #EVENT_KEY_UP = 'keyup';
    static #KEY_ARROW_DOWN = 'ArrowDown';
    static #KEY_ARROW_LEFT = 'ArrowLeft';
    static #KEY_ARROW_RIGHT = 'ArrowRight';
    static #KEY_ARROW_UP = 'ArrowUp';
    static #RADIUS = 5;
    static #VELOCITY = 10;

    #x;
    #y;
    #vx;
    #vy;

    constructor(point) {
        this.#x = point.x;
        this.#y = point.y;
        this.#vx = 0;
        this.#vy = 0;
        addEventListener(Pen.#EVENT_KEY_DOWN, this.keyboard.bind(this));
        addEventListener(Pen.#EVENT_KEY_UP, this.keyboard.bind(this));
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    keyboard(event) {
        this.#vx = 0;
        this.#vy = 0;
        if (event.type == Pen.#EVENT_KEY_DOWN) {
            switch (event.code) {
            case Pen.#KEY_ARROW_LEFT:
                this.#vx = -Pen.#VELOCITY;
                break;
            case Pen.#KEY_ARROW_RIGHT:
                this.#vx = Pen.#VELOCITY;
                break;
            case Pen.#KEY_ARROW_UP:
                this.#vy = -Pen.#VELOCITY;
                break;
            case Pen.#KEY_ARROW_DOWN:
                this.#vy = Pen.#VELOCITY;
            }
        }
    }

    idle(border, dt) {
        const x = this.#x + this.#vx * dt;
        const y = this.#y + this.#vy * dt;
        if (inside(border.segments, {x: x, y: y})) { // move inside border
            this.#x = x;
            this.#y = y;
        } else { // reset on border if moving outside
            this.reset(intersection(border.segments, {a: this, b: {x: x, y: y}}));
        }
    }

    reset(point) {
        this.#x = point.x;
        this.#y = point.y;
        this.#vx = 0;
        this.#vy = 0;
    }

    render(context) {
        context.save();
        context.beginPath();
        context.arc(this.#x, this.#y, Pen.#RADIUS, 0, 2 * Math.PI, true);
        context.closePath();
        context.fillStyle = Pen.#COLOR;
        context.fill();
        context.restore();
    }
}
