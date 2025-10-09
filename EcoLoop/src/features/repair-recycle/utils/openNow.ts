const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;

export type Interval = { open: string; close: string };

export function isOpenNow(
  hours: Record<string, Interval[]>
): boolean {
  try {
    const now = new Date();                        // device local time
    const dayIdx = now.getDay();                   // 0 = Sun
    const key = DAY_KEYS[dayIdx];
    const prevKey = DAY_KEYS[(dayIdx + 6) % 7];    // previous day
    const minsNow = now.getHours() * 60 + now.getMinutes();

    const toMins = (t: string) => {
      const m = /^(\d{1,2}):(\d{2})$/.exec(t || "");
      return m ? (+m[1] * 60 + +m[2]) : NaN;
    };

    const inList = (list: Interval[], overnightOnly = false) =>
      list.some(({ open, close }) => {
        const a = toMins(open);
        const b = toMins(close);
        if (isNaN(a) || isNaN(b)) return false;

        // overnight window (18:00 -> 02:00)
        if (b < a) {
          return overnightOnly ? minsNow < b : (minsNow >= a || minsNow < b);
        }
        if (overnightOnly) return false;
        return minsNow >= a && minsNow < b;
      });

    // today or overnight from yesterday
    return inList(hours[key] || []) || inList(hours[prevKey] || [], true);
  } catch {
    return false;
  }
}
