import { FluentBundle } from "@fluent/bundle";
interface L10nArgs {
    availableLocales: string[];
    defaultLocale: string;
    localesDirectory?: string;
    filter: (...args: any[]) => string;
}
export declare class L10n {
    languages: {
        [key: string]: FluentBundle;
    };
    defaultLocale: string;
    filter: (...args: any[]) => string;
    format(id: string, ctx?: Record<string, any>): string;
    private load;
    constructor(args: L10nArgs);
}
export default L10n;
