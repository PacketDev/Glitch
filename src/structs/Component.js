"use strict";

const isEqual = require("fast-deep-equal");

class Component {
    constructor(data) {
        this.data = data;
    }

    get type() {
        return this.data.type;
    }

    equals(other) {
        if (other instanceof Component) {
            return isEqual(other.data, this.data);
        }
        return isEqual(other, this.data);
    }

    toJSON() {
        return { ...this.data };
    }
}

module.exports = Component;