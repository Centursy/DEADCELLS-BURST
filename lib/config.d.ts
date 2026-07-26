import { Schema } from 'koishi';
import type { GameConfig } from './types';
export interface Config extends GameConfig {
    commandCharacter: string;
    commandExplore: string;
    commandUpgrade: string;
    commandDuel: string;
    commandAlchemy: string;
    commandForge: string;
    commandBoss: string;
}
export declare const Config: Schema<Config>;
export declare const usage = "\n<h2>DEADCELLS BURST / \u7206\u88C2\u585E\u5C14\u4E1D</h2>\n<p>\u4E00\u4E2A\u62E5\u6709\u63A2\u7D22\u3001\u7EC6\u80DE\u6210\u957F\u548C\u81EA\u52A8\u56DE\u5408\u5236\u73A9\u5BB6\u5BF9\u6218\u7684\u5C0F\u6E38\u620F\u3002</p>\n<ul>\n  <li><code>deadcells</code>\uFF1A\u521B\u5EFA\u89D2\u8272\u6216\u67E5\u8BE2\u72B6\u6001</li>\n  <li><code>\u4FEE\u70BC</code>\uFF1A\u63A2\u7D22\u5730\u56FE\u5E76\u83B7\u53D6\u7EC6\u80DE</li>\n  <li><code>boss\u7EC6\u80DE</code>\uFF1A\u6D88\u8017\u5F53\u524D\u7EC6\u80DE\u5347\u7EA7</li>\n  <li><code>\u5BF9\u6218 @\u7528\u6237</code>\uFF1A\u4E0E\u53E6\u4E00\u540D\u73A9\u5BB6\u8FDB\u884C\u81EA\u52A8\u6218\u6597</li>\n  <li><code>\u62A4\u7B26\u70BC\u5316 [\u6B21\u6570]</code>\uFF1A\u6D88\u8017\u7EC6\u80DE\u751F\u6210\u62A4\u7B26\u5019\u9009\uFF0C\u6B21\u6570\u4E0A\u9650\u4E3A 5</li>\n  <li><code>\u953B\u9020\u88C5\u5907 [\u6B21\u6570]</code>\uFF1A\u6BCF\u6B21\u751F\u6210\u4E09\u4E2A\u4E0D\u91CD\u590D\u88C5\u5907\uFF0C\u6B21\u6570\u4E0A\u9650\u4E3A 5</li>\n  <li><code>boss\u8BA8\u4F10</code>\uFF1A\u53C2\u52A0\u4ECA\u65E5\u5168\u670D\u5171\u4EAB Boss \u8BA8\u4F10</li>\n</ul>\n";
