const Base = require("./Base");
const { DiscordSnowflake } = require("@sapphire/snowflake");
const { makeURLSearchParams } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

class BaseGuild extends Base {
    constructor(client, data) {
        super(client);

        this.id = data.id;
        this.name = data.name;
        this.icon = data.icon;
        this.features = data.features;
    }

    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    }

    get createdAt() {
        return new Date(this.createdTimestamp);
    }

    get nameAcronym() {
        return this.name
            .replace(/'s /g, ' ')
            .replace(/\w+/g, e => e[0])
            .replace(/\s/g, '');
    }

    get partnered() {
        return this.features.includes("PARTNERED");
    }

    get verified() {
        return this.features.includes("VERIFIED");
    }

    iconURL(options = {}) {
        return this.icon && this.client.rest.cdn.icon(this.id, this.icon, options);
    }

    async fetch() {
        const data = await this.client.rest.get(Routes.guild(this.id), {
            query: makeURLSearchParams({ with_counts: true })
        });
        return this.client.guilds._add(data);
    }

    toString() {
        return this.name;
    }
}

module.exports = BaseGuild;