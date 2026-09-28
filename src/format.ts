import { Grouping } from './settings';

export function groupInt(intStr: string, grouping: Grouping): string {
  if (intStr.length <= 3) return intStr;
  if (grouping === 'intl') return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const last3 = intStr.slice(-3);
  const rest = intStr.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

function withGrouping(fixed: string, grouping: Grouping): string {
  const [i, f] = fixed.split('.');
  return f !== undefined ? `${groupInt(i, grouping)}.${f}` : groupInt(i, grouping);
}

/** Format a number, trimming trailing zeros, up to `decimals` decimal places. */
export function formatNumber(n: number, decimals: number, grouping: Grouping): string {
  if (!isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-9) return Number(n.toPrecision(10)).toExponential();
  let s = abs.toFixed(decimals);
  if (s.includes('.')) s = s.replace(/\.?0+$/, '');
  if (s === '' || s === '0') return '0';
  return (n < 0 ? '−' : '') + withGrouping(s, grouping);
}

/** Format with an exact number of decimals (used for money-style results). */
export function formatFixed(n: number, decimals: number, grouping: Grouping): string {
  if (!isFinite(n)) return '—';
  const s = Math.abs(n).toFixed(decimals);
  const neg = n < 0 && Number(s) !== 0;
  return (neg ? '−' : '') + withGrouping(s, grouping);
}

/** Add thousands separators to every number inside an expression string. */
export function formatExpression(expr: string, grouping: Grouping): string {
  return expr.replace(/\d+(\.\d*)?(e[+-]?\d+)?/gi, (m) => {
    if (/e/i.test(m)) return m;
    const [i, f] = m.split('.');
    return f !== undefined ? `${groupInt(i, grouping)}.${f}` : groupInt(i, grouping);
  });
}

export function sanitizeNumber(text: string, allowNegative = false): string {
  const neg = allowNegative && text.trim().startsWith('-');
  let s = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const i = s.indexOf('.');
  if (i >= 0) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
  return (neg ? '-' : '') + s;
}

export function parseNum(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}

/** Map a cursor index in the raw expression to the same spot in the comma-grouped display text. */
export function rawToDisp(disp: string, rawIdx: number): number {
  let count = 0;
  for (let i = 0; i < disp.length; i++) {
    if (count === rawIdx) return i;
    if (disp[i] !== ',') count++;
  }
  return disp.length;
}

/** Map a cursor index in the display text back to the raw expression (ignoring grouping commas). */
export function dispToRaw(disp: string, dispIdx: number): number {
  return disp.slice(0, dispIdx).replace(/,/g, '').length;
}
