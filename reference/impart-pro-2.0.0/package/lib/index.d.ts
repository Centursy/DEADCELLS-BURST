import { Context } from 'koishi';
import { Config, usage } from './config';
import './types';
export declare const name = "impart-pro";
export { Config, usage };
export declare const inject: {
    required: string[];
    optional: string[];
};
export declare function apply(ctx: Context, config: Config): void;
