export interface ImpartproTable {
    userid: string;
    username: string;
    channelId: string[];
    length: number;
    injectml: string;
    growthFactor: number;
    lastGrowthTime: string;
    lastDuelTime: string;
    locked: boolean;
}
declare module 'koishi' {
    interface Tables {
        impartpro: ImpartproTable;
        monetary: {
            uid: number;
            currency: string;
            value: number;
        };
    }
}
