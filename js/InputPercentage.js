customElements.define('input-percentage', class InputPercentage extends HTMLElement {
    static formAssociated = true;
    static observedAttributes = ['value'];

    static #ELEMENT_INPUT = 'input';
    static #ELEMENT_OUTPUT = 'output';
    static #EVENT_INPUT = 'input';
    static #FORMAT = value => `${value}%`;
    static #MAX = 100;
    static #MIN = 1;
    static #OPTIONS = {mode: 'open'};
    static #TYPE_RANGE = 'range';

    #internals;
    #value;

    constructor() {
        super();
        this.#internals = this.attachInternals();
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#value = value;
        if (this.shadowRoot) {
            this.shadowRoot.querySelector(InputPercentage.#ELEMENT_INPUT).value = value;
            const output = this.shadowRoot.querySelector(InputPercentage.#ELEMENT_OUTPUT);
            output.firstChild && output.removeChild(output.firstChild);
            output.appendChild(document.createTextNode(InputPercentage.#FORMAT(value)));
        }
        this.#internals.setFormValue(value, InputPercentage.#FORMAT(value));
    }

    connectedCallback() {
        const shadow = this.attachShadow(InputPercentage.#OPTIONS);
        const output = document.createElement(InputPercentage.#ELEMENT_OUTPUT);
        shadow.appendChild(output);
        const input = document.createElement(InputPercentage.#ELEMENT_INPUT);
        input.type = InputPercentage.#TYPE_RANGE;
        input.min = InputPercentage.#MIN;
        input.max = InputPercentage.#MAX;
        input.addEventListener(InputPercentage.#EVENT_INPUT, event => {this.value = event.target.value;});
        shadow.appendChild(input);
        this.value = this.#value;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == InputPercentage.observedAttributes[0]) {
            this.value = newValue;
        }
    }
});
