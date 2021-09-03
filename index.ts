import { FluentBundle, FluentResource } from "@fluent/bundle";

interface L10nArgs {
    availableLocales: string[],
    defaultLocale: string,

    localesDirectory?: string,

    filter: (...args: any[]) => string
}

export class L10n {
    public languages: { [key: string]: FluentBundle } = {};
    public defaultLocale: string = "";
    public filter: (...args: any[]) => string;

    public format(id: string, ctx?: Record<string, any>) {
        const language = this.filter();
        let bundle = this.languages[language];

        // Check if the bundle exists first, if it doesn't just fallback to the default language.
        if(!bundle) bundle = this.languages[this.defaultLocale];
        // Last resort, just return the ID of the string.
        if(!bundle) return id;

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
            if((this as any).loader) {
                const data = await (this as any).loader({ 
                    locales: args.availableLocales, 
                    defaultLocale: args.defaultLocale, 
                    localesDirectory: args.localesDirectory 
                })

                res(data);
            } else {
                const { existsSync, readFileSync } = await import("fs");
                const { resolve } = await import("path");

                let data: any = {};

                for await (const locale of args.availableLocales) {
                    const path = resolve(args.localesDirectory || __dirname, `${locale}.ftl`);
        
                    if(existsSync(path)) {
                        const ftl = readFileSync(
                            path,
                            { encoding: "utf-8" }
                        );
    
                        data[locale] = ftl;
                    }
                }

                res(data);
            }
        })
    }

    constructor(args: L10nArgs) {
        if(!args.availableLocales || !args.availableLocales.length) throw new Error(`You need some locales in availableLocales.`);
        if(!args.availableLocales.includes(args.defaultLocale)) throw new Error("Default locale isn't in available locales.");
        if(!args.filter) throw new Error(`No filter was set.`);

        this.filter = args.filter;
        this.defaultLocale = args.defaultLocale;

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