"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodManager = void 0;
class period {
    constructor(date_start, date_end) {
        this.date_start = date_start;
        this.date_end = date_end;
    }
}
class PeriodManager {
    static resolvePeriodByDate(date) {
        let closestPastPeriod = null;
        for (const [periodName, periodDates] of Object.entries(this.periods)) {
            if (date >= periodDates.date_start && date <= periodDates.date_end) {
                return periodName;
            }
            if (periodDates.date_end < date) {
                if (!closestPastPeriod ||
                    periodDates.date_end > closestPastPeriod.end) {
                    closestPastPeriod = { name: periodName, end: periodDates.date_end };
                }
            }
        }
        if (closestPastPeriod) {
            return closestPastPeriod.name;
        }
        throw new Error("❌ No se encontró un período válido (ni actual ni anterior).");
    }
    static getPeriod(period) {
        const periodDates = this.periods[period];
        if (!periodDates) {
            throw new Error(`El periodo ${period} no existe.`);
        }
        return { date_start: periodDates.date_start, date_end: periodDates.date_end };
    }
}
exports.PeriodManager = PeriodManager;
PeriodManager.periods = {
    "2025-1": new period(new Date("2025-03-17"), new Date("2025-07-04")),
    "2025-2": new period(new Date("2025-07-21"), new Date("2026-03-16")),
};
