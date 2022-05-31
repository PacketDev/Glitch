const BitField = require("./BitField");
const { UserFlags } = require("discord-api-types/v10");

class UserFlagBitField extends BitField {
    static Flags = UserFlags;
}

module.exports = UserFlagBitField;