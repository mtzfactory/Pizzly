import type winston from 'winston';
export declare function dirname(): string;
export declare function getPort(): number;
export declare function getHost(): string;
export declare function getBaseUrl(): string;
export declare function getOauthCallbackUrl(): string;
/**
 * A helper function to interpolate a string.
 * interpolateString('Hello ${name} of ${age} years", {name: 'Tester', age: 234}) -> returns 'Hello Tester of age 234 years'
 *
 * @remarks
 * Copied from https://stackoverflow.com/a/1408373/250880
 */
export declare function interpolateString(str: string, replacers: Record<string, any>): string;
/**
 * A helper function to check if replacers contains all necessary params to interpolate string.
 * interpolateString('Hello ${name} of ${age} years", {name: 'Tester'}) -> returns false
 */
export declare function missesInterpolationParam(str: string, replacers: Record<string, any>): boolean;
/**
 * A helper function to extract the additional connection configuration options from the frontend Auth request.
 */
export declare function getConnectionConfig(queryParams: any): Record<string, string>;
/**
 * A version of JSON.parse that detects Date strings and transforms them back into
 * Date objects. This depends on how dates were serialized obviously.
 *
 * @remarks
 * Source: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
 */
export declare function parseJsonDateAware(input: string): any;
/**
 *
 * @remarks
 * Yes including a full HTML template here in a string goes against many best practices.
 * Yet it also felt wrong to add another dependency to simply parse 1 template.
 * If you have an idea on how to improve this feel free to submit a pull request.
 */
export declare function html(logger: winston.Logger, res: any, providerConfigKey: string | undefined, connectionId: string | undefined, error: string | null, errorDesc: string | null): void;
