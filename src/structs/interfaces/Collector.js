"use strict";

const Utility = require("../../Utils/Utility");
const EventEmitter = require("node:events");
const { setTimeout, clearTimeout } = require("timers");
const { Collection } = require("@discordjs/collection");

class Collector extends Utility {
    constructor(client, options = {}) {
        super();

        Object.defineProperty(this, "client", { value: client });

        this.filter = options.filter ?? (() => true);
        this.options = options;
        this.collected = new Collection();
        this.ended = false;
        this._timeout = null;
        this._idletimeout = null;
        this._endReason = null;

        if (typeof this.filter !== "function") {
            throw new TypeError("INVALID_TYPE", "options.filter", "function");
        }

        this.handleCollect = this.handleCollect.bind(this);
        this.handleDispose = this.handleDispose.bind(this);

        if (options.time) this._timeout = setTimeout(() => this.stop("time"), options.time).unref();
        if (options.idle) this._idletimeout = setTimeout(() => this.stop("idle"), options.idle).unref();
    }

    async handleCollect(...args) {
        const collect = await this.collect(...args);
        if (collect && (await this.filter(...args, this.collected))) {
            this.collected.set(collect, args[0]);
            this.emit("collect", ...args);

            if (this._idletimeout) {
                clearTimeout(this._idletimeout);
                this._idletimeout = setTimeout(() => this.stop("idle"), this.options.idle).unref();
            }
        }
        this.checkEnd();
    }

    async handleDispose(...args) {
        if (!this.options.dispose) return;

        const dispose = this.dispose(...args);
        if (!dispose || !(await this.filter(...args)) || !this.collected.has(dispose)) return;
        this.collected.delete(dispose);

        this.emit("dispose", ...args);
        this.checkEnd();
    }

    get next() {
        return new Promise((resolve, reject) => {
            if (this.ended) {
                reject(this.collected);
                return;
            }

            const cleanup = () => {
                this.removeListener("collect", onCollect);
                this.removeListener("end", onEnd);
            };
            const onCollect = item => {
                cleanup();
                resolve(item);
            };

            const onEnd = () => {
                cleanup();
                reject(this.collected);
            };

            this.on("collect", onCollect);
            this.on("end", onEnd);
        });
    }

    stop(reason = "user") {
        if (this.ended) return;

        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        if (this._idletimeout) {
            clearTimeout(this._idletimeout);
            this._idletimeout = null;
        }

        this._endReason = reason;
        this.ended = true;
    }

    resetTimer({ time, idle } = {}) {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(() => this.stop("time"), time ?? this.options.time).unref();
        }
        if (this._idletimeout) {
            clearTimeout(this._idletimeout);
            this._idletimeout = setTimeout(() => this.stop("idle"), idle ?? this.options.idle).unref();
        }
    }

    checkEnd() {
        const reason = this.endReason;
        if (reason) this.stop(reason);
        return Boolean(reason);
    }

    async *[Symbol.asyncIterator]() {
        const queue = [];
        const onCollect = (...item) => queue.push(item);
        this.on("collect", onCollect);

        try {
            while (queue.length || !this.ended) {
                if (queue.length) {
                    yield queue.shift();
                } else {
                    await new Promise(resolve => {
                        const tick = () => {
                            this.removeListener("collect", tick);
                            this.removeListener("end", tick);
                            return resolve();
                        };
                        this.on("collect", tick);
                        this.on("end", tick);
                    });
                }
            }
        } finally {
            this.removeListener("collect", onCollect);
        }
    }

    toJSON() {
        return Utility.flatten(this);
    }

    get endReason() {
        return this._endReason;
    }

    dispose() {}
}

module.exports = Collector;