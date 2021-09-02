const { resolve } = require("path");
const readline = require("readline");
const L10n = require("../dist/index.js").default;

const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// If the currentLanguage is undefined, it falls back to your defined default locale
let currentLanguage;

const l10n = new L10n({
    availableLocales: ["en-GB", "es-ES"],
    defaultLocale: "en-GB",

    localesDirectory: resolve(__dirname, "l10n"),

    filter: () => {
        return currentLanguage;
    },

    // If required, you can implement your own loader
    // All it needs to do is return an object with
    // each of your locales with the value as the raw
    // .ftl file contents.
    //
    // See this example for more info:
    //
    // loader: ({ locales, defaultLocale, localesDirectory }) => {
    //    let loaded = {};
    //
    //    for(const locale of locales) {
    //       const data = loadMyFileUsingRandomAPI(`${locale}.ftl`);
    //
    //       loaded[locale] = data;
    //    }
    //    
    //    return loaded;
    // }
});

interface.question(`What language do you want to use? (Current: ${currentLanguage}) `, (language) => {
    currentLanguage = language;

    run();
});

const run = () => {
    interface.question(`Enter a string name to return it: `, (str) => {
        interface.question(`If this string requires context, please enter a KV object. `, (ctx) => {
            let parsed = {};
            if(ctx.length) parsed = JSON.parse(ctx);

            const result = l10n.format(str, parsed);

            console.log(result);
    
            run();
        });
    })
}