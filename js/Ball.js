class Ball {
    static #COLORS = ['red', 'orange', 'yellow', 'lime', 'blue', 'navy', 'purple'];
    static #SIZES = [35, 30, 25, 20, 15, 10, 5];
    static #VELOCITIES = [2.5, 5, 7.5, 10, 12.5, 15, 17.5];

    #radius;
    #color;
    #x;
    #y;
    #vx;
    #vy;

    constructor(level, context) {
        this.#radius = Ball.#SIZES[level];
        this.#color = Ball.#COLORS[level];
        this.#x = Math.random() * (context.canvas.width - 2 * this.#radius) + this.#radius;
        this.#y = Math.random() * (context.canvas.height - 2 * this.#radius) + this.#radius;
        const azimuth = Math.random() * 2 * Math.PI;
        this.#vx = Ball.#VELOCITIES[level] * Math.cos(azimuth);
        this.#vy = Ball.#VELOCITIES[level] * Math.sin(azimuth);
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    idle(border, dt) {
        this.#x += this.#vx * dt;
        this.#y += this.#vy * dt;
        this.touches(border.segments).forEach(this.#bounce.bind(this)); // bounce if touching border
    }

    touches(segments) {
        return new Map(segments
                .map(segment => [segment, distance(segment, this)])
                .filter(([segment, distance]) => distance < this.#radius));
    }

    render(context) {
        context.save();
        context.beginPath();
        context.arc(this.#x, this.#y, this.#radius, 0, 2 * Math.PI, true);
        context.closePath();
        context.fillStyle = this.#color;
        context.fill();
        context.restore();
    }

    #bounce(distance, segment) {
        if (isHorizontal(segment)) {
            this.#y -= (this.#radius - distance) * Math.sign(this.#vy);
            this.#vy = -this.#vy;
        } else {
            this.#x -= (this.#radius - distance) * Math.sign(this.#vx);
            this.#vx = -this.#vx;
        }
    }
}
