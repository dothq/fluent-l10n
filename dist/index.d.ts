import { FluentBundle } from "@fluent/bundle";
interface L10nArgs {
    availableLocales: string[];
    defaultLocale: string;
    localesDirectory: string;
    filter: (...args: any[]) => string;
    loader?: ({ locales, defaultLocale, localesDirectory }: any) => Promise<Record<string, string>> | Record<string, string>;
}
export declare class L10n {
    languages: {
        [key: string]: FluentBundle;
    };
    filter: (...args: any[]) => string;
    format(id: string, ctx?: Record<string, any>): string;
    private load;
    constructor(args: L10nArgs);
}
export default L10n;
