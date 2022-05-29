const { Buffer } = require("node:buffer");
const { isJSONEncodable } = require("@discordjs/builders");
const { MessageFlags } = require("discord-api-types/v10");
const { Utility } = require("..");

class MsgPayLoad {
    constructor(target, options) {
        this.target = target;
        this.options = options;
        this.body = null;
        this.files = null;
    }

    get isWebHook() {
        const WebHook = require("./WH");
        const WHClient = require("../Client/WHClient");
        return this.target instanceof WebHook || this.target instanceof WHClient;
    }

    get isUser() {
        // TODO(PACKET): Finish user class and isUser
    }

    get isMessage() {
        // TODO(PACKET): Finish message class and isMessage
    }

    get isMessageManager() {
        // TOOD(PACKET): Finish Message Manager and isMessageManager
    }

    get isInteraction() {
        // TODO(PACKET): Finish Interaction and isInteraction
    }

    makeContent() {
        let content;
        if (this.options.content === null) {
            content = "";
        } else if (typeof this.options.content !== "undefined") {
            content = Utility.verifyingString(this.options.content, RangeError, "MESSAGE_CONTENT_TYPE", true);
        }
        return content;
    }

    resolveBody() {
        if (this.body) return this;
        const isInteraction = this.isInteraction;
        const isWebhook = this.isWebhook;

        const content = this.makeContent();
        const tts = Boolean(this.options.tts);

        let nonce;
        if (typeof this.options.nonce !== 'undefined') {
            nonce = this.options.nonce;
            if (typeof nonce === "number" ? !Number.isInteger(nonce) : typeof nonce !== "string") {
                throw new RangeError("MESSAGE_NONCE_TYPE");
            }
        }
    }
}

module.exports = MsgPayLoad;

// Test
const fun = new MsgPayLoad();

fun.isWebHook("getHook", hooks => {
    hooks.log.logger.color.blue.printl("Hooking...");
    hooks.buffer.colors.rainbow.log.logger.random.printl("Hooked!");
});

fun.isMessageManager("manager", manage => {
    manage.manager.get.post.logger.log.blue.random.message.channel.send("Test");
})

fun.isInteraction("interactionCreate", interaction => {
    interaction.channel.send.log.random.printl.send("Test");
});

fun.resolveBody("body", message => {
    message.channel.send.log.random.printl.send("Test");
});