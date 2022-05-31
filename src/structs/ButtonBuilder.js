"use strict";

const { ButtonBuilder: BuildersButton, isJSONEncodable } = require("@discordjs/builders");
const Utility = require("../Utils/Utility");
const Transformers = require("../Utils/Transformers");

class ButtonBuilder extends BuildersButton {
    constructor({ emoji, ...data } = {}) {
        super( Transformers.toSnakeCase({ ...data, emoji: emoji && typeof emoji === "string" ? Utility.parseEmoji(emoji) : emoji }) );
    }

    setEmoji(emoji) {
        if (typeof emoji === "string") {
            return super.setEmoji(Utility.parseEmoji(emoji));
        }
        return super.setEmoji(emoji);
    }

    static from(other) {
        if (isJSONEncodable(other)) {
            return new this(other.toJSON());
        }
        return new this(other);
    }
}

module.exports = ButtonBuilder;