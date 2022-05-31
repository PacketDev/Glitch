"use strict";

const PermissionBitField = require("../Utils/PermissionBitField");
const { DiscordSnowflake } = require("@sapphire/snowflake");
const { InteractionType, ApplicationCommandType, ComponentType } = require("discord-api-types/v10");
const Base = require("./Base");

class Interaction extends Base {
    constructor(client, data) {
        super(client);

        this.type = data.type;
        this.id = data.id;
        Object.defineProperty(this, "token", { value: data.token });
        this.applicationId = data.application_id;
        this.channelId = data.channel_id;
        this.guildId = data.guild_id;
        this.user = this.client.users._add(data.user ?? data.member.user);
        this.member = data.member ? this.guild?.members._add(data.member) ?? data.member : null;
        this.version = data.version;
        this.memberPermissions = data.member?.permissions ? new PermissionBitField(data.member.permissions).freeze() : null;
        this.locale = data.locale;
        this.guildLocacle = data.guild_locacle;
    }

    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    }

    get createdAt() {
        return new Date(this.createdTimestamp);
    }

    get guild() {
        return this.client.guilds.cache.get(this.guildId) ?? null;
    }

    inGuild() {
        return Boolean(this.guildId && this.member);
    }

    inCachedGuild() {
        return Boolean(this.guild && this.member);
    }

    isCommand() {
        return this.type === InteractionType.ApplicationCommand;
    }

    isChatInputCommand() {
        return this.isCommand() && this.commandType === ApplicationCommandType.ChatInput;
    }

    isContextMenuCommand() {
        return this.isCommand() && [ApplicationCommandType.User, ApplicationCommandType.Message].includes(this.commandType);
    }

    isUserContextMenuCommand() {
        return this.isContextMenuCommand() && this.commandType === ApplicationCommandType.User;
    }

    isMessageContextMenuCommand() {
        return this.isContextMenuCommand() && this.commandType === ApplicationCommandType.Message;
    }

    isModalSubmit() {
        return this.type === InteractionType.ModalSubmit;
    }

    isAutocomplete() {
        return this.type === InteractionType.ApplicationCommandAutocomplete;
    }

    isMessageComponent() {
        return this.type === InteractionType.MessageComponent;
    }

    isButton() {
        return this.isMessageComponent() && this.componentType === ComponentType.Button;
    }

    isSelectMenu() {
        return this.isMessageComponent() && this.componentType === ComponentType.SelectMenu;
    }

    isRepliable() {
        return ![InteractionType.Ping, InteractionType.ApplicationCommandAutocomplete].includes(this.type);
    }
}

module.exports = Interaction;