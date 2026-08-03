"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyKey = weeklyKey;
exports.addWeeklyPoints = addWeeklyPoints;
exports.getWeeklyScores = getWeeklyScores;
function weeklyKey(timestamp = Date.now()) {
    const dateText = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(timestamp));
    // dateText 已经是东八区的日历日期，按 UTC 日历日计算星期，避免再次减去 8 小时。
    const date = new Date(`${dateText}T00:00:00Z`);
    const day = date.getUTCDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    date.setUTCDate(date.getUTCDate() + mondayOffset);
    return date.toISOString().slice(0, 10);
}
async function addWeeklyPoints(ctx, channelId, userId, username, points) {
    if (!channelId || points <= 0)
        return;
    const week = weeklyKey();
    const [existing] = await ctx.database.get('deadcells_weekly_scores', { week, channelId, userId });
    if (existing) {
        await ctx.database.set('deadcells_weekly_scores', { week, channelId, userId }, {
            username,
            points: existing.points + Math.round(points),
        });
    }
    else {
        await ctx.database.create('deadcells_weekly_scores', {
            week,
            channelId,
            userId,
            username,
            points: Math.round(points),
        });
    }
}
async function getWeeklyScores(ctx, channelId) {
    if (!channelId)
        return [];
    const rows = await ctx.database.get('deadcells_weekly_scores', { week: weeklyKey(), channelId });
    return rows.sort((a, b) => b.points - a.points || a.username.localeCompare(b.username));
}
