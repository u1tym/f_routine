import type { Adapt } from '../types';

const WEEK_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

/** Convert an Adapt object to a human-readable Japanese label */
export function adaptLabel(adapt: Adapt): string {
  const { number, week } = adapt;
  if (week === -1) {
    // Calendar-day mode
    if (number === -1) return '毎月末';
    if (number > 0) return `毎月${number}日`;
    // number <= -2: counted from end
    return `毎月末から${Math.abs(number) - 1}日前`;
  }
  // Weekday mode
  const weekName = WEEK_NAMES[week] ?? '?';
  if (number > 0) return `第${number} ${weekName}曜日`;
  if (number < 0) return `最終から${Math.abs(number)}番目 ${weekName}曜日`;
  return `${weekName}曜日`;
}
