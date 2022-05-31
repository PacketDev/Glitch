"use strict";

const { makeURLSearchParams } = require("@discordjs/rest");
const { DiscordSnowflake } = require("@sapphire/snowflake");
const { Routes } = require("discord-api-types/v10");
const MsgPayLoad = require("./MsgPayLoad");

class WH {
    constructor(client, data) {
        Object.defineProperty(this, "client", { value: client });
        if (data) {
            this._patch(data);
        }
    }

    _patch(data) {
        if ("name" in data) {
            this.name = data.name;
        }
        Object.defineProperty(this, "token", { value: data.token ?? null, writable: true, configurable: true });
        if ("avatar" in data) {
            this.avatar = data.avatar;
        }
        this.id = data.id;
        if ("type" in data) {
            this.type = data.type;
        }
        if ("guild_id" in data) {
            this.guildId = data.guild_id;
        }
        if ("channel_id" in data) {
            this.channelId = data.channel_id;
        }
        if ("user" in data) {
            this.owner = this.client.users?._add(data.user) ?? data.user;
        } else {
            this.owner ??= null;
        }
        if ("application_id" in data) {
            this.applicationId = data.application_id;
        } else {
            this.applicationId ??= null;
        }
        if ("source_guild" in data) {
            this.sourceGuild = this.client.guilds?.resolve(data.source_guild.id) ?? data.source_guild;
        } else {
            this.sourceGuild ??= null;
        }
        if ("source_channel" in data) {
            this.sourceChannel = this.client.channels?.resolve(data.source_channel?.id) ?? data.source_channel;
        } else {
            this.sourceChannel ??= null;
        }
    }

    async send(options) {
        if (!this.token) throw new Error("WEBHOOK_TOKEN_UNAVAILABLE");
        let messagePayLoad;

        if (options instanceof MsgPayLoad) {
            messagePayLoad = options.resolveBody();
        } else {
            messagePayLoad = MsgPayLoad.create(this, options).resolveBody();
        }

        const query = makeURLSearchParams({
            wait: true,
            thread_id: MsgPayLoad.options.threadId
        });

        const { body, files } = await MsgPayLoad.resolveFiles();
        const d = await this.client.rest.post(Routes.webhook(this.id, this.token), { body, files, query, auth: false });
        return this.client.channels?.cache.get(d.channel_id)?.messages._add(d, false) ?? d;
    }

    static applyToClass(struct, ignore = []) {
        for (const prop of [
            "send",
            "sendSlackMessage",
            "fetchMessage",
            "edit",
            "editMessage",
            "delete",
            "deleteMessage",
            "createdTimestamp",
            "createdAt",
            "url",
        ]) {
            if (ignore.includes(prop)) continue;
            // Object.defineProperties(struct.prototype, prop, Object.getOwnPropertyDescriptor(WH.prototype, prop));
        }
    }
}

module.exports = WH;