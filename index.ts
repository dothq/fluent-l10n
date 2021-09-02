import { FluentBundle, FluentResource } from "@fluent/bundle";
import { readFileSync } from "fs";
import { resolve } from "path";

interface L10nArgs {
    availableLocales: string[],
    defaultLocale: string,

    localesDirectory: string,

    filter: (...args: any[]) => string
    loader?: ({ locales, defaultLocale, localesDirectory }: any) => Promise<Record<string, string>> | Record<string, string>
}

export class L10n {
    public languages: { [key: string]: FluentBundle } = {};

    public filter: (...args: any[]) => string;

    public format(id: string, ctx?: Record<string, any>) {
        const language = this.filter();
        const bundle = this.languages[language];

        const raw = bundle.getMessage(id);
        
        if(raw && raw.value) {
            const formatted = bundle.formatPattern(
                raw.value, 
                ctx
            );

            return formatted;
        } else {
            throw new Error(`L10n string with id ${id} not found in ${language}.`)
        }
    }

    private async load(args: L10nArgs) {
        return new Promise(async (res) => {
            if(args.loader) {
                const data = await args.loader({ 
                    locales: args.availableLocales, 
                    defaultLocale: args.defaultLocale, 
                    localesDirectory: args.localesDirectory 
                })

                res(data);
            } else {
                let data: any = {};

                for await (const locale of args.availableLocales) {
                    const path = resolve(args.localesDirectory, `${locale}.ftl`);
        
                    const ftl = readFileSync(
                        path,
                        { encoding: "utf-8" }
                    );

                    data[locale] = ftl;
                }

                res(data);
            }
        })
    }

    constructor(args: L10nArgs) {
        if(!args.availableLocales || !args.availableLocales.length) throw new Error(`You need some locales in availableLocales.`);
        if(!args.availableLocales.includes(args.defaultLocale)) throw new Error("Default locale isn't in available locales.");
        if(!args.localesDirectory) throw new Error(`Unable to find any locales. Set the localesDirectory parameter.`);
        if(!args.filter) throw new Error(`No filter was set.`);

        this.filter = args.filter;

        this.load({ ...args }).then((data: any) => {
            for(const [key, value] of Object.entries(data)) {
                try {
                    const resource = new FluentResource(`${value}`);
                    const bundle = new FluentBundle(key);
                    const errors = bundle.addResource(resource);

                    if(errors.length) {
                        errors.forEach(error => {
                            throw error;
                        })
                    }

                    this.languages[key] = bundle;
                } catch(e: any) {
                    throw new Error(`Failed to load ${key}: ${e.message}`)
                }
            }
        })
    }
}

export default L10n;