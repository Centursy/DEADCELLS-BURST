import type { Context } from 'koishi';
import { Config, usage } from './config';
export declare const name = "deadcells-burst";
export { Config, usage };
export declare const inject: {
    required: string[];
    optional: string[];
};
export declare function apply(ctx: Context, config: Config): void;
