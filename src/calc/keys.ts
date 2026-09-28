export interface CalcState {
  expr: string;
  fresh: boolean; // true right after "=" so the next digit starts a new calculation
}

const OPS = ['+', '−', '×', '÷', '^'];
/** Keys that start a brand-new calculation when pressed right after "=". */
export const STARTS_NEW = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '.', 'π', '√', '()'];
const VALUE_END = /[0-9.)%²π]$/;
const lastNumber = (e: string) => (/[0-9.]+$/.exec(e) || [''])[0];

export function applyKey(state: CalcState, key: string): CalcState {
  let { expr } = state;
  if (state.fresh && STARTS_NEW.includes(key)) expr = '';
  const done = (e: string): CalcState => ({ expr: e, fresh: false });
  const last = expr.slice(-1);
  const tok = lastNumber(expr);

  if (key === 'C') return done('');
  if (key === '⌫') return done(expr.slice(0, -1));

  if (/^[0-9]$/.test(key)) {
    if (tok === '0') return done(expr.slice(0, -1) + key);
    if (/[)%²π]$/.test(expr)) return done(expr + '×' + key);
    return done(expr + key);
  }

  if (key === '00') {
    if (tok === '') return done(/[)%²π]$/.test(expr) ? expr + '×0' : expr + '0');
    if (tok === '0') return done(expr);
    return done(expr + '00');
  }

  if (key === '.') {
    if (tok.includes('.')) return done(expr);
    if (tok === '') return done(/[)%²π]$/.test(expr) ? expr + '×0.' : expr + '0.');
    return done(expr + '.');
  }

  if (OPS.includes(key)) {
    if (expr === '') return done(key === '−' ? '−' : '');
    if (expr === '−') return done(expr);
    if (last === '(') return done(key === '−' ? expr + '−' : expr);
    if (last === '√') return done(expr);
    if (OPS.includes(last)) return done(expr.slice(0, -1) + key);
    return done(expr + key);
  }

  if (key === '%') return done(/[0-9)%²π]$/.test(expr) ? expr + '%' : expr);
  if (key === '²') return done(/[0-9)%²π]$/.test(expr) ? expr + '²' : expr);

  if (key === '()') {
    const open = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
    if (open > 0 && VALUE_END.test(expr)) return done(expr + ')');
    if (VALUE_END.test(expr)) return done(expr + '×(');
    return done(expr + '(');
  }

  if (key === '√') return done(VALUE_END.test(expr) ? expr + '×√' : expr + '√');
  if (key === 'π') return done(VALUE_END.test(expr) ? expr + '×π' : expr + 'π');

  return done(expr);
}

/** Expression text plus a selection (cursor when start === end), measured in raw characters. */
export interface EditState {
  expr: string;
  start: number;
  end: number;
  fresh: boolean;
}

const MAX_LEN = 200;

/** Apply a key at the cursor (or over the selection). Text after the cursor is preserved. */
export function applyKeyAt(s: EditState, key: string): EditState {
  if (key === 'C') return { expr: '', start: 0, end: 0, fresh: false };
  let { expr, start, end } = s;
  if (s.fresh && STARTS_NEW.includes(key)) {
    expr = '';
    start = 0;
    end = 0;
  }
  const prefix = expr.slice(0, start);
  const suffix = expr.slice(end);

  if (key === '⌫') {
    if (end > start) return { expr: prefix + suffix, start, end: start, fresh: false };
    if (start === 0) return { expr, start, end, fresh: false };
    const np = prefix.slice(0, -1);
    return { expr: np + suffix, start: np.length, end: np.length, fresh: false };
  }

  const np = applyKey({ expr: prefix, fresh: false }, key).expr;
  if (np.length + suffix.length > MAX_LEN) return { ...s };
  return { expr: np + suffix, start: np.length, end: np.length, fresh: false };
}

/** Insert already-sanitised text at the cursor (used by paste). */
export function insertAt(s: EditState, text: string): EditState {
  let { expr, start, end } = s;
  if (s.fresh) {
    expr = '';
    start = 0;
    end = 0;
  }
  const next = expr.slice(0, start) + text + expr.slice(end);
  if (next.length > MAX_LEN) return { ...s };
  const cur = start + text.length;
  return { expr: next, start: cur, end: cur, fresh: false };
}

/** Keep only characters the calculator understands; map common lookalikes. */
export function sanitizeExpr(text: string): string {
  let out = '';
  for (const ch of text) {
    switch (ch) {
      case '-':
      case '–':
      case '—':
      case '−':
        out += '−';
        break;
      case '*':
      case 'x':
      case 'X':
      case '×':
        out += '×';
        break;
      case '/':
      case '÷':
        out += '÷';
        break;
      case '+':
      case '^':
      case '(':
      case ')':
      case '%':
      case '²':
      case 'π':
      case '√':
      case '.':
        out += ch;
        break;
      default:
        if (ch >= '0' && ch <= '9') out += ch;
    }
  }
  return out.slice(0, MAX_LEN);
}

/** Formula text for the clipboard: no grouping commas, ASCII minus so other apps understand it. */
export function formulaForClipboard(expr: string): string {
  return expr.replace(/−/g, '-');
}

/** Text from the clipboard, keeping only the formula part if it looks like "12+34 = 46". */
export function formulaFromClipboard(text: string): string {
  return sanitizeExpr(text.split('=')[0]);
}
