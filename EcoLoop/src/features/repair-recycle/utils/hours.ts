// src/features/repair-recycle/utils/hours.ts
export type Interval = { open: string; close: string };
export type Hours = Record<"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun", Interval[]>;

const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;
const DAY_LABELS: Record<typeof DAY_KEYS[number], string> = {
  sun:"Sun", mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat"
};

const toMins = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || "");
  return m ? (+m[1] * 60 + +m[2]) : NaN;
};
const pad = (n:number) => (n<10 ? `0${n}` : `${n}`);

export function isOpenNow(hours: Hours): boolean {
  try {
    const now = new Date();
    const d = now.getDay();                // 0=Sun
    const today = DAY_KEYS[d];
    const prev = DAY_KEYS[(d + 6) % 7];
    const minsNow = now.getHours()*60 + now.getMinutes();

    const inList = (list: Interval[], overnightOnly = false) =>
      list?.some(({open, close})=>{
        const a = toMins(open), b = toMins(close);
        if (isNaN(a)||isNaN(b)) return false;
        if (b < a) { // overnight (e.g., 18:00 -> 02:00)
          return overnightOnly ? minsNow < b : (minsNow >= a || minsNow < b);
        }
        if (overnightOnly) return false;
        return minsNow >= a && minsNow < b;
      });

    return inList(hours[today]||[]) || inList(hours[prev]||[], true);
  } catch { return false; }
}

/** Returns e.g. { kind:"until", time:"12:00" } or { kind:"opens", time:"10:00" } */
export function nextChange(hours: Hours): {kind:"until"|"opens"; time:string} | null {
  try {
    const now = new Date();
    const dayIdx = now.getDay();
    const minsNow = now.getHours()*60 + now.getMinutes();

    const daySeq: Array<{key: typeof DAY_KEYS[number]; baseDay:number}> = [];
    for (let i=0;i<8;i++){ // look up to one full cycle
      daySeq.push({ key: DAY_KEYS[(dayIdx + i) % 7], baseDay: i });
    }

    const openNow = isOpenNow(hours);
    if (openNow) {
      // find the current interval end today or via overnight from previous
      const todayKey = DAY_KEYS[dayIdx];
      const prevKey = DAY_KEYS[(dayIdx + 6) % 7];

      // Check today's intervals (non-overnight only)
      let closeMins: number | null = null;
      for (const {open, close} of (hours[todayKey]||[])) {
        const a = toMins(open), b = toMins(close);
        if (isNaN(a)||isNaN(b)) continue;
        if (b < a) continue; // overnight; handled below
        if (minsNow >= a && minsNow < b) { closeMins = b; break; }
      }
      // If not found, we might be in overnight window carried from yesterday
      if (closeMins == null) {
        for (const {open, close} of (hours[prevKey]||[])) {
          const a = toMins(open), b = toMins(close);
          if (isNaN(a)||isNaN(b)) continue;
          if (b < a) { // overnight
            if (minsNow < b) { closeMins = b; break; }
          }
        }
      }
      if (closeMins != null) {
        const hh = Math.floor(closeMins/60), mm = closeMins%60;
        return { kind:"until", time:`${pad(hh)}:${pad(mm)}` };
      }
      return null;
    } else {
      // find the next opening time today or upcoming days (handle overnight implicitly)
      // today non-overnight openings after now
      const todayKey = DAY_KEYS[dayIdx];
      let openMins: number | null = null;

      for (const {open, close} of (hours[todayKey]||[])) {
        const a = toMins(open), b = toMins(close);
        if (isNaN(a)||isNaN(b)) continue;
        if (b < a) continue; // skip overnight as "next open" would be previous day
        if (minsNow < a) { openMins = a; break; }
      }
      if (openMins != null) {
        const hh = Math.floor(openMins/60), mm = openMins%60;
        return { kind:"opens", time:`${pad(hh)}:${pad(mm)}` };
      }

      // else, search next days' first interval
      for (let i=1;i<7;i++){
        const k = DAY_KEYS[(dayIdx + i) % 7];
        const list = hours[k]||[];
        if (list.length) {
          const a = toMins(list[0].open);
          if (!isNaN(a)) {
            const hh = Math.floor(a/60), mm = a%60;
            return { kind:"opens", time:`${pad(hh)}:${pad(mm)}` };
          }
        }
      }
      return null;
    }
  } catch { return null; }
}

export function formatIntervals(list: Interval[]): string {
  if (!list || list.length===0) return "Closed";
  return list.map(({open,close})=>`${open}–${close}`).join(", ");
}

export function dayLabel(key: keyof Hours | typeof DAY_KEYS[number]) {
  return DAY_LABELS[key as typeof DAY_KEYS[number]] || key;
}
