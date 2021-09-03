"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.L10n = void 0;
const bundle_1 = require("@fluent/bundle");
class L10n {
    constructor(args) {
        this.languages = {};
        this.defaultLocale = "";
        if (!args.availableLocales || !args.availableLocales.length)
            throw new Error(`You need some locales in availableLocales.`);
        if (!args.availableLocales.includes(args.defaultLocale))
            throw new Error("Default locale isn't in available locales.");
        if (!args.filter)
            throw new Error(`No filter was set.`);
        this.filter = args.filter;
        this.defaultLocale = args.defaultLocale;
        this.load(Object.assign({}, args)).then((data) => {
            for (const [key, value] of Object.entries(data)) {
                try {
                    const resource = new bundle_1.FluentResource(`${value}`);
                    const bundle = new bundle_1.FluentBundle(key);
                    const errors = bundle.addResource(resource);
                    if (errors.length) {
                        errors.forEach(error => {
                            throw error;
                        });
                    }
                    this.languages[key] = bundle;
                }
                catch (e) {
                    throw new Error(`Failed to load ${key}: ${e.message}`);
                }
            }
        });
    }
    format(id, ctx) {
        const language = this.filter();
        let bundle = this.languages[language];
        // Check if the bundle exists first, if it doesn't just fallback to the default language.
        if (!bundle)
            bundle = this.languages[this.defaultLocale];
        // Last resort, just return the ID of the string.
        if (!bundle)
            return id;
        const raw = bundle.getMessage(id);
        if (raw && raw.value) {
            const formatted = bundle.formatPattern(raw.value, ctx);
            return formatted;
        }
        else {
            throw new Error(`L10n string with id ${id} not found in ${language}.`);
        }
    }
    load(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
                var e_1, _a;
                if (args.loader) {
                    const data = yield args.loader({
                        locales: args.availableLocales,
                        defaultLocale: args.defaultLocale,
                        localesDirectory: args.localesDirectory
                    });
                    res(data);
                }
                else {
                    const { existsSync, readFileSync } = yield Promise.resolve().then(() => __importStar(require("fs")));
                    const { resolve } = yield Promise.resolve().then(() => __importStar(require("path")));
                    let data = {};
                    try {
                        for (var _b = __asyncValues(args.availableLocales), _c; _c = yield _b.next(), !_c.done;) {
                            const locale = _c.value;
                            const path = resolve(args.localesDirectory || __dirname, `${locale}.ftl`);
                            if (existsSync(path)) {
                                const ftl = readFileSync(path, { encoding: "utf-8" });
                                data[locale] = ftl;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    res(data);
                }
            }));
        });
    }
}
exports.L10n = L10n;
exports.default = L10n;
