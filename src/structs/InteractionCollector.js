"use strict";

const Events = require("../Utils/Events");
const { Collection } = require("@discordjs/collection");
const Collector = require("./interfaces/Collector");

class InteractionCollector extends Collector {
    constructor(client, options = {}) {
        super(client, options);

        this.messageId = options.message?.id ?? null;
        this.messageInteractionId = options.interactionResponse?.id ?? null;
        this.channelId = options.interactionResponse?.interaction.channelId ??
            options.message?.channelId ??
            options.message?.channel_id ??
            this.client.channels.resolveId(options.channel);
        this.guildId = options.interactionResponse?.interaction.guildId ??
            options.message?.guildId ??
            options.message?.guild_id ??
            this.client.guilds.resolveId(options.channel?.guild) ??
            this.client.guilds.resolveId(options.guild);
        this.interactionType = options.interactionType ?? null;
        this.componentType = options.componentType ?? null;
        this.users = new Collection();
        this.total = 0;
        this.client.incrementMaxListeners();

        const bulkDeleteListener = messages => {
            if (messages.has(this.messageId)) this.stop("messageDelete");
        }

        if (this.messageId || this.messageInteractionId) {
            this._handleMessageDeletion = this._handleMessageDeletion.bind(this);
            this.client.on(Events.MessageDelete, this._handleMessageDeletion);
            this.client.on(Events.MessageBulkDelete, bulkDeleteListener);
        }
        if (this.channelId) {
            this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
            this._handleThreadDeletion = this._handleThreadDeletion.bind(this);
            this.client.on(Events.ChannelDelete, this._handleChannelDeletion);
            this.client.on(Events.ThreadDelete, this._handleThreadDeletion);
        }
        if (this.guildId) {
            this._handleGuildDeletion = this._handleGuildDeletion.bind(this);
            this.client.on(Events.GuildDelete, this._handleGuildDeletion);
        }
        this.client.on(Events.InteractionCreate, this.handleCollect);
        this.once("end", () => {
            this.client.removeListener(Events.InteractionCreate, this.handleCollect);
            this.client.removeListener(Events.MessageDelete, this._handleMessageDeletion);
            this.client.removeListener(Events.MessageBulkDelete, bulkDeleteListener);
            this.client.removeListener(Events.ChannelDelete, this._handleChannelDeletion);
            this.client.removeListener(Events.ThreadDelete, this._handleThreadDeletion);
            this.client.removeListener(Events.GuildDelete, this._handleGuildDeletion);
            this.client.decrementMaxListeners();
        });

        this.on("collect", interaction => {
            this.total++;
            this.users.set(interaction.user.id, interaction.user);
        });
    }

    collect(interaction) {
        if (this.interactionType && interaction.type !== this.interactionType) return null;
        if (this.componentType && interaction.componentType !== this.componentType) return null;
        if (this.messageId && interaction.message?.id !== this.messageId) return null;
        if (this.messageInteractionId && interaction.message?.interaction?.id !== this.messageInteractionId) return null;
        if (this.channelId && interaction.channelId !== this.channelId) return null;
        if (this.guildId && interaction.guildId !== this.guildId) return null;

        return interaction.id;
    }

    dispose(interaction) {
        if (this.type && interaction.type !== this.type) return null;
        if (this.componentType && interaction.componentType !== this.componentType) return null;
        if (this.messageId && interaction.message?.id !== this.messageId) return null;
        if (this.messageInteractionId && interaction.message?.interaction?.id !== this.messageInteractionId) return null;
        if (this.channelId && interaction.channelId !== this.channelId) return null;
        if (this.guildId && interaction.guildId !== this.guildId) return null;

        return interaction.id;
    }

    empty() {
        this.total = 0;
        this.collected.clear();
        this.users.clear();
        this.checkEnd();
    }

    get endReason() {
        if (this.options.max && this.total >= this.options.max) return "limit";
        if (this.options.maxComponents && this.collected.size >= this.options.maxComponents) return "componentLimit";
        if (this.options.maxUsers && this.users.size >= this.options.maxUsers) return "userLimit";

        return super.endReason;
    }

    _handleMessageDeletion(message) {
        if (message.id === this.messageId) {
            this.stop("messageDelete");
        }

        if (message.interaction?.id === this.messageInteractionId) {
            this.stop("messageDelete");
        }
    }

    _handleChannelDeletion(channel) {
        if (channel.id === this.channelId || channel.threads?.cache.has(this.channelId)) {
            this.stop("channelDelete");
        }
    }

    _handleThreadDeletion(thread) {
        if (thread.id === this.channelId) {
            this.stop("threadDelete");
        }
    }

    _handleGuildDeletion(guild) {
        if (guild.id === this.guildId) {
            this.stop("guildDelete");
        }
    }
}

module.exports = InteractionCollector;