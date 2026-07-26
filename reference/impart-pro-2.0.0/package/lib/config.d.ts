import { Schema } from 'koishi';
interface CommandList {
    command: string;
    command1: string;
    command2: string;
    command3: string;
    command4: string;
    command5: string;
    command6: string;
    command7: string;
    command8: string;
    command9: string;
}
interface RateConfigItem {
    minlength: number;
    maxlength: number;
    rate: number;
}
type PermissionScope = 'all' | 'admin' | 'owner' | 'owner_admin' | 'onlybotowner' | 'onlybotowner_admin_owner';
export interface Config {
    useCustomFont: boolean;
    font?: string;
    commandList: CommandList;
    randomdrawing: '1' | '2' | '3';
    milliliter_range: number[];
    duelLossCurrency: number;
    maintenanceCostPerUnit: number;
    currency: string;
    duelWinRateFactor: RateConfigItem[];
    exerciseCooldownTime: number;
    imagemode: boolean;
    notallowtip: boolean;
    onlybotowner_list: string[];
    permissionScope: PermissionScope;
    enableAllChannel: boolean;
    leaderboardPeopleNumber: number;
    duelLossReductionRange: number[];
    duelWinGrowthRange: number[];
    duelWinRateFactor2: number;
    duelCooldownTime: number;
    exerciseLossReductionRange: number[];
    exerciseRate: RateConfigItem[];
    loggerinfo: boolean;
    defaultLength: number[];
    exerciseWinGrowthRange: number[];
}
export declare const usage = "\n<h2><a href=\"https://www.npmjs.com/package/koishi-plugin-impart-pro\" target=\"_blank\">\u70B9\u6211\u67E5\u770B\u5B8C\u6574README</a></h2>\n<hr>\n<table>\n<thead>\n<tr>\n<th>\u6307\u4EE4</th>\n<th>\u8BF4\u660E</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>\u5F00\u5BFC [@\u67D0\u4EBA]</td>\n<td>\u957F\u725B\u725B</td>\n</tr>\n<tr>\n<td>\u51B3\u6597 [@\u67D0\u4EBA]</td>\n<td>\u6218\u6597\uFF01\u723D~</td>\n</tr>\n<tr>\n<td>\u91CD\u5F00\u725B\u725B</td>\n<td>\u725B\u725B\u5F88\u5DEE\u600E\u4E48\u529E\uFF1F\u7A33\u4E86\uFF01\u76F4\u63A5\u91CD\u5F00\uFF01</td>\n</tr>\n<tr>\n<td>\u725B\u725B\u6392\u884C\u699C</td>\n<td>\u67E5\u770B\u725B\u725B\u6392\u884C\u699C</td>\n</tr>\n<tr>\n<td>\u770B\u770B\u725B\u725B [@\u67D0\u4EBA]</td>\n<td>\u67E5\u8BE2\u81EA\u5DF1\u6216\u8005\u522B\u4EBA\u725B\u725B\u6570\u636E</td>\n</tr>\n<tr>\n<td>\u9501\u725B\u725B [@\u67D0\u4EBA]</td>\n<td>\u5F00\u542F/\u5173\u95ED \u67D0\u4EBA/\u67D0\u9891\u9053 \u7684\u725B\u725B\u5927\u4F5C\u6218</td>\n</tr>\n</tbody>\n</table>\n<hr>\n<h3>\u914D\u7F6E\u9879\u91CC\u6709 \u5F62\u5982 10 \u00B1 45% \u7684\u6570\u503C</h3>\n<p>\u4E3E\u4F8B\u8BF4\u660E\uFF1A<br>\n\u6BCF\u6B21\u953B\u70BC\u6210\u529F\u540E\uFF0C\u725B\u725B\u957F\u5EA6\u7684\u589E\u957F\u8303\u56F4\u3002<br>\n\u4EE5\u9ED8\u8BA4\u503C <code>[10, 45]</code> \u4E3A\u4F8B\uFF0C\u8868\u793A\u6210\u529F\u953B\u70BC\u540E\u725B\u725B\u957F\u5EA6\u589E\u957F\u7684\u57FA\u6570\u4E3A 10 \u5398\u7C73\uFF0C\u540C\u65F6\u5141\u8BB8\u6709 \u00B145% \u7684\u6D6E\u52A8\uFF1A</p>\n<ul>\n<li><strong>\u6700\u5927\u503C</strong>: 10 + 10 \u00D7 0.45 = 14.5 \u5398\u7C73</li>\n<li><strong>\u6700\u5C0F\u503C</strong>: 10 - 10 \u00D7 0.45 = 5.5 \u5398\u7C73</li>\n</ul>\n<p>\u56E0\u6B64\uFF0C\u953B\u70BC\u6210\u529F\u65F6\uFF0C\u725B\u725B\u7684\u957F\u5EA6\u4F1A\u5728 5.5 \u5398\u7C73\u5230 14.5 \u5398\u7C73\u4E4B\u95F4\u968F\u673A\u589E\u957F\u3002</p>\n<hr>\n\u672C\u63D2\u4EF6\u7684\u6392\u884C\u699C\u7528\u6237\u6635\u79F0\u53EF\u4EE5\u901A\u8FC7 [callme](/market?keyword=callme) \u63D2\u4EF6\u81EA\u5B9A\u4E49\n\u5728\u672A\u6307\u5B9A callme \u63D2\u4EF6\u7684\u540D\u79F0\u7684\u65F6\u5019\uFF0C\u9ED8\u8BA4\u4F7F\u7528 \u9002\u914D\u5668\u7684 username\uFF0C\u6216\u8005userid\n---\n\u5FC5\u9700\u670D\u52A1\uFF1Ai18n \n\u5FC5\u9700\u670D\u52A1\uFF1Adatabase \n\u5FC5\u9700\u670D\u52A1\uFF1Amonetary \n\u53EF\u9009\u670D\u52A1\uFF1Apuppeteer \n---\n";
export declare const Config: Schema<Config>;
export {};
