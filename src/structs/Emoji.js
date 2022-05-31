"use strict";

const Base = require("./Base");
const { DiscordSnowflake } = require("@sapphire/snowflake");

class Emoji extends Base {
    constructor(client, emoji) {
        super(client);

        this.animated = emoji.animated ?? null;
        this.name = emoji.name ?? null;
        this.id = emoji.id;
    }

    get identifier() {
        if (this.id) return `${this.animated ? "a:" : ": "}${this.name}:${this.id}`;
        return encodeURIComponent(this.name);
    }

    get url() {
        return this.id && this.client.rest.cdn.emoji(this.id, this.animated ? "gif" : "png");
    }

    get createdTimestamp() {
        return this.id && DiscordSnowflake.timestampFrom(this.id);
    }

    get createdAt() {
        return this.id && new Date(this.createdTimestamp);
    }

    toString() {
        return this.id ? `<${this.animated ? 'a' : ''}:${this.name}:${this.id}>` : this.name;
    }

    toJSON() {
        return super.toJSON({
            guild: "guildId",
            createdTimestamp: true,
            url: true,
            identifier: true
        });
    }
}

module.exports = Emoji;