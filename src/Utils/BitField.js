"use strict";

class BitField {
    static Flags = {};
    static DefaultBit = 0;
    constructor(bits = this.constructor.DefaultBit) {
        this.bitfield = this.constructor.resolve(bits);
    }

    any(bit) {
        return (this.bitfield & this.constructor.resolve(bit)) !== this.constructor.DefaultBit;
    }

    equals(bit) {
        return this.bitfield === this.constructor.resolve(bit);
    }

    has(bit) {
        bit = this.constructor.resolve(bit);
        return (this.bitfield & bit) === bit;
    }

    missing(bits, ...hasParams) {
        return new this.constructor(bits).remove(this).toArray(...hasParams);
    }

    freeze() {
        return Object.freeze(this);
    }

    add(...bits) {
        let total = this.constructor.DefaultBit;
        for (const bit of bits) {
            total |= this.constructor.resolve(bit);
        }

        if (Object.isFrozen(this)) return new this.constructor(this.bitfield | total);
        this.bitfield |= total;
        return this;
    }

    remove(...bits) {
        let total = this.constructor.DefaultBit;
        for (const bit of bits) {
          total |= this.constructor.resolve(bit);
        }
        if (Object.isFrozen(this)) return new this.constructor(this.bitfield & ~total);
        this.bitfield &= ~total;
        return this;
    }

    serialize(...hasParams) {
        const serialized = {};
        for (const [flag, bit] of Object.entries(this.constructor.Flags)) serialized[flag] = this.has(bit, ...hasParams);
        return serialized;
    }

    toArray(...hasParams) {
        return Object.keys(this.constructor.Flags).filter(bit => this.has(bit, ...hasParams));
    }

    toJSON() {
        return typeof this.bitfield === "number" ? this.bitfield : this.bitfield.toString();
    }

    valueOf() {
        return this.bitfield;
    }

    *[Symbol.iterator]() {
        yield* this.toArray();
    }

    static resolve(bit) {
        const { DefaultBit } = this;

        if (typeof DefaultBit === typeof bit && bit >= DefaultBit) return bit;
        if (bit instanceof BitField) return bit.bitfield;
        if (Array.isArray(bit)) return bit.map(x => this.resolve(x)).reduce((prev, p) => prev | p, DefaultBit);
        if (typeof bit === "string") {
            if (typeof this.Flags[bit] !== "undefined") return this.Flags[bit];
            if (!isNaN(bit)) return typeof DefaultBit === "bigint" ? BigInt(bit) : Number(bit);
        }
        throw new RangeError("BITFIELD_INVALID", bit);
    }
}

module.exports = BitField;