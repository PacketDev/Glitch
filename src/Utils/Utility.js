const { parse } = require("node:path");
const { Collection } = require("@discordjs/collection");
const { ChannelType, RouteBases, Routes } = require("discord-api-types/v10");
const { fetch } = require("undici");
const Colors = {};
const isObj = d => typeof d === "object" && d !== null;

class Utility extends null {
    static flatten(obj, ...props) {
        if (!isObj(obj)) return obj;

        const objProps = Object.keys(obj)
            .filter(k => !k.startsWith("_"))
            .map(k => ({ [k]: true }));

        props = objProps.length ? Object.assign(...objProps, ...props) : Object.assign({}, ...props);
        const out = {};

        for (let [prop, newProp] of Object.entries(props)) {
            if (!newProp) continue;
            newProp = newProp === true ? prop : newProp;

            const element = obj[prop];
            const elementIsObj = isObj(element);
            const valueOf = elementIsObj && typeof element.valueOf === "function" ? element.valueOf() : null;
            const hasToJson = elementIsObj && typeof element.toJSON === "function";

            if (element instanceof Collection) out[newProp] = Array.from(element.keys());
            else if (valueOf instanceof Collection) out[newProp] = Array.from(valueOf.keys());
            else if (Array.isArray(element)) out[newProp] = element.map(e => e.toJSON?.() ?? Utility.flatten(e));
            else if (typeof valueOf !== "object") out[newProp] = valueOf;
            else if (hasToJson) out[newProp] = element.toJSON();
            else if (typeof element === "object") out[newProp] = Utility.flatten(element);
            else if (!elementIsObj) out[newProp] = element;
        }
        return out;
    }

    static EscapeMarkDown(
        text,
        {
            codeBlock = true,
            inlineCode = true,
            bold = true,
            italic = true,
            underline = true,
            strikeThrough = true,
            spoiler = true,
            codeBlockContent = true,
            inlineCodeContent = true,
        } = {},
    ) {
        if (!codeBlockContent) {
            return text
                .split('```')
                .map((subString, index, array) => {
                    if (index % 2 && index !== array.length - 1) return subString;
                    return Utility.EscapeMarkDown(subString, {
                        inlineCode,
                        bold,
                        italic,
                        underline,
                        strikeThrough,
                        spoiler,
                        inlineCodeContent
                    });
                })
                .join(codeBlock ? '\\`\\`\\`' : '```');
        }
        if (!inlineCodeContent) {
            return text
                .split(/(?<=^|[^`])`(?=[^`]|$)/g)
                .map((subString, index, array) => {
                    if (index % 2 && index !== array.length - 1) return subString;
                    return Util.escapeMarkdown(subString, {
                        codeBlock,
                        bold,
                        italic,
                        underline,
                        strikethrough,
                        spoiler,
                    });
                })
                .join(inlineCode ? '\\`' : '`');
        }
        if (inlineCode) text = Utility.escapeInlineCode(text);
        if (codeBlock) text = Util.escapeCodeBlock(text);
        if (italic) text = Util.escapeItalic(text);
        if (bold) text = Util.escapeBold(text);
        if (underline) text = Util.escapeUnderline(text);
        if (strikeThrough) text = Util.escapeStrikethrough(text);
        if (spoiler) text = Util.escapeSpoiler(text);
        return text;
    }

    static escapeCodeBlock(text) {
        return text.replaceAll('```', '\\`\\`\\`');
    }

    static escapeInlineCode(text) {
        return text.replace(/(?<=^|[^`])``?(?=[^`]|$)/g, match => (match.length === 2 ? '\\`\\`' : '\\`'));
    }

    static escapeItalic(text) {
        let i = 0;
        text = text.replace(/(?<=^|[^*])\*([^*]|\*\*|$)/g, (_, match) => {
            if (match === '**') return ++i % 2 ? `\\*${match}` : `${match}\\*`;
            return `\\*${match}`;
        });
        i = 0;
        return text.replace(/(?<=^|[^_])_([^_]|__|$)/g, (_, match) => {
            if (match === '__') return ++i % 2 ? `\\_${match}` : `${match}\\_`;
            return `\\_${match}`;
        });
    }

    static escapeBold(text) {
        let i = 0;
        return text.replace(/\*\*(\*)?/g, (_, match) => {
            if (match) return ++i % 2 ? `${match}\\*\\*` : `\\*\\*${match}`;
            return '\\*\\*';
        });
    }

    static escapeUnderline(text) {
        let i = 0;
        return text.replace(/__(_)?/g, (_, match) => {
            if (match) return ++i % 2 ? `${match}\\_\\_` : `\\_\\_${match}`;
            return '\\_\\_';
        });
    }

    static escapeStrikethrough(text) {
        return text.replaceAll('~~', '\\~\\~');
    }

    static escapeSpoiler(text) {
        return text.replaceAll('||', '\\|\\|');
    }

    static parseEmoji(text) {
        if (text.includes("%")) text = decodeURIComponent(text);
        if (!text.includes(":")) return { animated: false, name: text, id: undefined };
        const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
        return match && { animated: Boolean(match[1]), name: match[2], id: match[3] };
    }
}

module.exports = Utility;