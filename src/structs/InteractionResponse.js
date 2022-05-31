"use strict";

const { InteractionType } = require("discord-api-types/v10");

class InteractionResponse {
    constructor(interaction, id) {
        this.interaction = interaction;
        this.id = id ?? interaction.id;
        this.client = interaction.client;
    }

    awaitMessageComponent(options = {}) {
        const _options = { ...options, max: 1 };
        return new Promise((resolve, reject) => {
            const collector = this.createMessageComponentCollector(_options);
            collector.once("end", (interactions, reason) => {
                const interaction = interactions.first();
                if (interaction) resolve(interaction);
                else reject(new Error("INTERACTION_COLLECTOR_ERROR", reason));
            });
        });
    }

    createMessageComponentCollector(options = {}) {
        return new InteractionCollector(this.client, {
            ...options,
            interactionResponse: this,
            interactionType: InteractionType.MessageComponent
        });
    }
}

const InteractionCollector = require('./InteractionCollector');
module.exports = InteractionResponse;