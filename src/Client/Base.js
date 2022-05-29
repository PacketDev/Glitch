"use strict";

const EventEmitter = require("events");
const { REST } = require("@discordjs/rest");
const Utility = require("../Utils/Utility");

class Base extends EventEmitter {
    constructor(options = {}) {
        super({ captureRejections: true });
        if (typeof options !== "object" || options === null) {
            throw new TypeError("INVALID_ERROR", "options", "object", true);
        }
        this.options = null;
        this.rest = new REST(this.options.rest);
    }

    destroy() {
        this.rest.requestManager.clearHashSweeper();
        this.rest.requestManager.clearHandlerSweeper();
    }

    incrementMaxListeners() {
        const maxListeners = this.getMaxListeners();
        if (maxListeners !== 0) {
            this.setMaxListeners(maxListeners + 1);
        }
    }

    decrementMaxListeners() {
        const maxListeners = this.getMaxListeners();
        if (maxListeners !== 0) {
            this.setMaxListeners(maxListeners - 1);
        }
    }

    toJSON(...props) {
        return Utility.flatten(this, { domain: false }, ...props);
    }
}

module.exports = Base;