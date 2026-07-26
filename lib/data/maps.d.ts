export interface MapDefinition {
    name: string;
    arrivalRate: number;
    reward: number;
    comment: string;
    next: string[];
    boss?: string;
    bossReward?: number;
}
export declare const maps: MapDefinition[];
export declare const bossComment = "\u606D\u559C\u9003\u51FA\u76D1\u72F1\uFF01\uFF01\u4F60\u5230\u8FBE\u4E86\u771F\u6B63\u7684\u7ED3\u5C40\uFF01";
