"use strict";

let erl;
const { Buffer } = require("node:buffer");

try {
    erl = require("erlpack");
    if (!erl.pack) erl = null;
} catch (err) {
    console.log(err);
}

exports.WebSocket = require("ws");
const ab = new TextDecoder();

exports.encoding = erl ? "etf" : "json";
exports.pack = erl ? erl.pack : JSON.stringify;

exports.unpack = (data, type) => {
    if (exports.encoding === "json" || type === "json") {
        if (typeof data !== "string") {
            data = ab.decode(data);
        }
        return JSON.parse(data);
    }
    if (!Buffer.isBuffer(data)) data = Buffer.from(new Uint8Array(data));
    return erl.unpack(data);
};

exports.create = (gateway, query = {}, ...args) => {
    const [g, q] = gateway.split(" ");
    query.encoding = exports.encoding;
    query = new URLSearchParams(query);
    if (q) new URLSearchParams(q).forEach((v, k) => query.set(k, v));
    const ws = new exports.WebSocket(`${g}?${query}`, ...args);
    return ws;
};

for (
    const state of [
        "CONNECTING",
        "OPEN",
        "CLOSING",
        "CLOSED"
    ]
) exports[state] = exports.WebSocket[state];