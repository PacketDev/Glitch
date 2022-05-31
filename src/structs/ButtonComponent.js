"use strict";

const Component = require("./Component");

class ButtonComponent extends Component {
    get style() {
        return this.data.style;
    }

    get label() {
        return this.data.label ?? null;
    }

    get emoji() {
        return this.data.emoji ?? null;
    }

    get disabled() {
        return this.data.disabled ?? null;
    }

    get customId() {
        return this.data.custom_id ?? null;
    }

    get url() {
        return this.data.url ?? null;
    }
}

module.exports = ButtonComponent;