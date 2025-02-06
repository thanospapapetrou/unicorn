class Timer {
    static #FORMAT = (min, s) => `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    static #SELECTOR = 'span:nth-of-type(5)';
    static #MS_PER_S = 1000;
    static #S_PER_MIN = 60;

    #start;
    #interval;

    constructor() {
        this.#start = new Date();
        this.#interval = setInterval(this.#update.bind(this), Timer.#MS_PER_S);
        this.#update();
    }

    stop() {
        clearInterval(this.#interval);
    }

    #update() {
        const element = document.querySelector(Timer.#SELECTOR);
        element.firstChild && element.removeChild(element.firstChild);
        const seconds = Math.floor((new Date() - this.#start) / Timer.#MS_PER_S);
        element.appendChild(document.createTextNode(Timer.#FORMAT(
                Math.floor(seconds / Timer.#S_PER_MIN), seconds % Timer.#S_PER_MIN)));
    }
}