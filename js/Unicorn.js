class Unicorn {
    static #BACKGROUND = level => `./img/unicorn${level}.png`;
    static #DISPLAY_BLOCK = 'block';
    static #DISPLAY_NONE = 'none';
    static #FORMAT_PERCENTAGE = percentage => `${percentage}%`;
    static #LEVEL_MAX = 7;
    static #LEVEL_MIN = 1;
    static #LIVES_MAX = 10;
    static #LIVES_MIN = 1;
    static #MESSAGE_LOOSE = 'You lost!';
    static #MESSAGE_WIN = 'Well done!';
    static #PARAMETER_LEVEL = 'level';
    static #PARAMETER_LIVES = 'lives';
    static #PARAMETER_THRESHOLD = 'threshold';
    static #SELECTOR_AREA = 'span:nth-of-type(4)';
    static #SELECTOR_CANVAS = 'canvas';
    static #SELECTOR_LEVEL = 'span:nth-of-type(1)';
    static #SELECTOR_LEVEL_INPUT = 'input#level';
    static #SELECTOR_LIVES = 'span:nth-of-type(2)';
    static #SELECTOR_LIVES_INPUT = 'input#lives';
    static #SELECTOR_THRESHOLD = 'span:nth-of-type(3)';
    static #SELECTOR_THRESHOLD_INPUT = 'input-percentage#threshold';
    static #SELECTOR_PARAMETERS = 'form';
    static #THRESHOLD_MAX = 100;
    static #THRESHOLD_MIN = 1;
    static #TWO_D = '2d';
    
    #context;
    #background;
    #border;
    #balls;
    #pen;
    #path;
    #timer;

    static main() {
        const level = Unicorn.#getParameter(Unicorn.#PARAMETER_LEVEL, Unicorn.#LEVEL_MIN, Unicorn.#LEVEL_MAX);
        const lives = Unicorn.#getParameter(Unicorn.#PARAMETER_LIVES, Unicorn.#LIVES_MIN, Unicorn.#LIVES_MAX);
        const threshold = Unicorn.#getParameter(Unicorn.#PARAMETER_THRESHOLD, Unicorn.#THRESHOLD_MIN, Unicorn.#THRESHOLD_MAX);
        (level != null) && (document.querySelector(Unicorn.#SELECTOR_LEVEL_INPUT).value = level);
        (lives != null) && (document.querySelector(Unicorn.#SELECTOR_LIVES_INPUT).value = lives);
        (threshold != null) && (document.querySelector(Unicorn.#SELECTOR_THRESHOLD_INPUT).value = threshold);
        if ((level != null) && (lives != null) && (threshold != null)) {
            document.querySelector(Unicorn.#SELECTOR_PARAMETERS).style.display = Unicorn.#DISPLAY_NONE;
            const background = new Image();
            background.onload = () => {
                const unicorn = new Unicorn(level, lives, threshold, background);
                requestAnimationFrame(unicorn.render.bind(unicorn));
            };
            background.src = Unicorn.#BACKGROUND(level);
        }
    }

    static #getParameter(key, min, max) {
        const value = parseInt(new URLSearchParams(location.search).get(key));
        return ((min <= value) && (value <= max)) ? value : null;
    }

    constructor(level, lives, threshold, background) {
        this.level = level;
        this.lives = lives;
        this.threshold = threshold;
        this.#context = document.querySelector(Unicorn.#SELECTOR_CANVAS).getContext(Unicorn.#TWO_D);
        this.#background = background;
        this.#border = new Border([
            {x: 0, y: 0},
            {x: 0, y: this.#context.canvas.height},
            {x: this.#context.canvas.width, y: this.#context.canvas.height},
            {x: this.#context.canvas.width, y: 0}
        ]);
        this.#balls = [...Array(level).keys()].map(i => new Ball(i, this.#context));
        this.#pen = new Pen(this.#border.segments[0].a);
        this.#path = new Path(this.#border.segments[0].a);
        this.#timer = new Timer();
        this.#context.canvas.style.display = Unicorn.#DISPLAY_BLOCK;
    }

    get level() {
        return parseInt(document.querySelector(Unicorn.#SELECTOR_LEVEL).firstChild.nodeValue);
    }

    set level(level) {
        const span = document.querySelector(Unicorn.#SELECTOR_LEVEL);
        span.appendChild(document.createTextNode(level));
        span.parentElement.style.display = Unicorn.#DISPLAY_BLOCK;
    }

    get lives() {
        return parseInt(document.querySelector(Unicorn.#SELECTOR_LIVES).firstChild.nodeValue);
    }

    set lives(lives) {
        const span = document.querySelector(Unicorn.#SELECTOR_LIVES);
        span.firstChild && span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(lives));
        span.parentElement.style.display = Unicorn.#DISPLAY_BLOCK;
    }

    get threshold() {
        return parseInt(document.querySelector(Unicorn.#SELECTOR_THRESHOLD).firstChild.nodeValue);
    }

    set threshold(threshold) {
        const span = document.querySelector(Unicorn.#SELECTOR_THRESHOLD);
        span.firstChild && span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(Unicorn.#FORMAT_PERCENTAGE(threshold)));
        span.parentElement.style.display = Unicorn.#DISPLAY_BLOCK;
    }

    get area() {
        return parseInt(document.querySelector(Unicorn.#SELECTOR_AREA).firstChild.nodeValue);
    }

    set area(area) {
        const span = document.querySelector(Unicorn.#SELECTOR_AREA);
        span.firstChild && span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(Unicorn.#FORMAT_PERCENTAGE(Math.round(area))));
        span.parentElement.style.display = Unicorn.#DISPLAY_BLOCK;
    }

    render(time) {
        const dt = performance.now() - time;
        this.#balls.forEach(ball => ball.idle(this.#border, dt));
        this.#pen.idle(this.#border, dt);
        this.#border.update(this.#path);
        this.#path.update(this.#pen, this.#border);
        if (this.#balls.some(ball => ball.touches(this.#path.segments).size > 0)) {
            this.#pen.reset(this.#path.path[0]);
            this.#path.reset(this.#path.path[0]);
            this.lives--;
        }
        for (let i = 0; i < this.#balls.length; i++) { // remove any balls outside border
            if (!inside(this.#border.segments, this.#balls[i])) {
                this.#balls.splice(i, 1);
            }
        }
        this.area = (1 - area(this.#border.segments) / this.#context.canvas.width / this.#context.canvas.height) * 100;
        if ((this.#balls.length == 0) || (this.area > 100 - this.threshold) || (this.lives == 0)) { // game finished
            this.#clear();
        }
        this.#context.clearRect(0, 0, this.#context.canvas.width, this.#context.canvas.height);
        this.#context.drawImage(this.#background, (this.#context.canvas.width - this.#background.width) / 2,
                (this.#context.canvas.height - this.#background.height) / 2);
        this.#border?.render(this.#context);
        this.#balls.forEach(ball => ball.render(this.#context));
        this.#path?.render(this.#context);
        this.#pen?.render(this.#context);
        if (this.lives == 0) {
            this.#loose();
        } else if (this.#balls.length == 0) {
            this.#win();
        } else {
            requestAnimationFrame(this.render.bind(this));
        }
    }
    // TODO balls should not disappear out of the blue

    #clear() {
        this.#border = null;
        this.#balls = [];
        this.#pen = null;
        this.#path = null;
    }
    
    #loose() {
        this.#timer.stop();
        alert(Unicorn.#MESSAGE_LOOSE);
        location.reload();
    }
    
    #win() {
        this.#timer.stop();
        alert(Unicorn.#MESSAGE_WIN);
        const parameters = new URLSearchParams(location.search);
        parameters.set(Unicorn.#PARAMETER_LEVEL, ++this.level);
        const url = new URL(location);
        url.search = parameters.toString();
        location = url;
    }
}
