"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isActivityActive = isActivityActive;
exports.markActivityActive = markActivityActive;
exports.clearActivityActive = clearActivityActive;
exports.clearAllActivities = clearAllActivities;
const activeUsers = new Set();
function isActivityActive(userId) {
    return activeUsers.has(userId);
}
function markActivityActive(userId) {
    activeUsers.add(userId);
}
function clearActivityActive(userId) {
    activeUsers.delete(userId);
}
function clearAllActivities() {
    activeUsers.clear();
}
