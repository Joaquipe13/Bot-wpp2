class period {
	date_start: Date;
	date_end: Date;
	constructor(date_start: Date, date_end: Date) {
		this.date_start = date_start;
		this.date_end = date_end;
	}
}
export class PeriodManager {
	private static readonly periods: Record<string, period> = {
		"2025-1": new period(new Date("2025-03-17"), new Date("2025-07-04")),
		"2025-2": new period(new Date("2025-07-21"), new Date("2026-03-16")),
	};

	static resolvePeriodByDate(date: Date): string {
		let closestPastPeriod: { name: string; end: Date } | null = null;
		for (const [periodName, periodDates] of Object.entries(this.periods)) {
			if (date >= periodDates.date_start && date <= periodDates.date_end) {
			return periodName;
			}
			if (periodDates.date_end < date) {
				if (
					!closestPastPeriod || 
					periodDates.date_end > closestPastPeriod.end
				) {
					closestPastPeriod = { name: periodName, end: periodDates.date_end };
				}
			}
		}

		if (closestPastPeriod) {
			return closestPastPeriod.name;
		}

		throw new Error("❌ No se encontró un período válido (ni actual ni anterior).");
	}

	static getPeriod(period: string): {date_start: Date, date_end: Date} {
		const periodDates = this.periods[period];
		if (!periodDates) {
			throw new Error(`El periodo ${period} no existe.`);
		}
		return { date_start: periodDates.date_start, date_end: periodDates.date_end };
	}
}