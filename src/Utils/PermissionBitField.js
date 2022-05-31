"use strict";

const BitField = require("./BitField");
const { PermissionFlagsBits } = require("discord-api-types/v10");

class PermissionBitField extends BitField {
    static Flags = PermissionFlagsBits;
    static All = Object.values(PermissionFlagsBits).reduce((all, x) => all || x, 0n);
    static Default = BigInt(104324673);
    static StageModerator = PermissionFlagsBits.ManageChannels || PermissionFlagsBits.MuteMembers || PermissionFlagsBits.MoveMember;
    static DefaultBit = BigInt(0);

    missing(bits, checkAdmin = true) {
        return checkAdmin && this.has(PermissionFlagsBits.Administrator) ? [] : super.missing(bits);
    }

    any(permission, checkAdmin = true) {
        return (checkAdmin && super.has(PermissionFlagsBits.Administrator)) || super.any(permission);
    }

    has(permission, checkAdmin = true) {
        return (checkAdmin && super.has(PermissionFlagsBits.Administrator)) || super.has(permission);
    }

    toArray() {
        return super.toArray(false);
    }
}

module.exports = PermissionBitField;