// ---------------------------------------------------------------------------
// 適用日 (adapt)
// order_week: 0=Sun..6=Sat, -1=calendar day mode
// what_number: positive=from start, negative=from end, -1=last day
// ---------------------------------------------------------------------------
export interface Adapt {
  number: number;
  week: number;
}

// ---------------------------------------------------------------------------
// 除外・調整 (adjust)  ※ optional - null means no adjustment
// ---------------------------------------------------------------------------
export interface Avoid {
  holiday: boolean;
  sun: boolean;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
}

export interface Adjust {
  avoid: Avoid;
  alt: 1 | -1; // 1=forward, -1=backward
}

// ---------------------------------------------------------------------------
// 各月に反映するか（routine_adapt_day 由来。API 既定は true）
// ---------------------------------------------------------------------------
export interface MonthlyAdaptFlags {
  adapt_jan: boolean;
  adapt_feb: boolean;
  adapt_mar: boolean;
  adapt_apr: boolean;
  adapt_may: boolean;
  adapt_jun: boolean;
  adapt_jul: boolean;
  adapt_aug: boolean;
  adapt_sep: boolean;
  adapt_oct: boolean;
  adapt_nov: boolean;
  adapt_dec: boolean;
}

// ---------------------------------------------------------------------------
// ルーティン
// ---------------------------------------------------------------------------
export interface Routine extends MonthlyAdaptFlags {
  id: number;
  title: string;
  activity_category_id: number;
  activity_category_name: string;
  adapt: Adapt;
  adjust?: Adjust | null;
}

// ---------------------------------------------------------------------------
// カテゴリ
// ---------------------------------------------------------------------------
export interface Category {
  id: number;
  name: string;
}

// ---------------------------------------------------------------------------
// POST /routines / PUT /routines/{id} body
// ---------------------------------------------------------------------------
export interface CreateRoutineBody extends MonthlyAdaptFlags {
  title: string;
  activity_category_id: number;
  adapt: Adapt;
  adjust?: Adjust | null;
}

// ---------------------------------------------------------------------------
// POST /api/routines/{id}/apply   OR   POST /api/routines/apply-all body
// ---------------------------------------------------------------------------
export interface ApplyBody {
  year: number;
  month: number;
}

// ---------------------------------------------------------------------------
// Apply response
// ---------------------------------------------------------------------------
export interface ApplyResult {
  inserted_count: number;
  dates: string[];
  errors: string[];
}
