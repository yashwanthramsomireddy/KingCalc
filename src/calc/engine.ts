/**
 * Safe expression evaluator (no eval). Supports + − × ÷ ^ ( ) % ² √ π,
 * unary minus, implicit multiplication, and "percent of left operand"
 * behaviour for + and − (200 + 10% = 220).
 */
export type CalcErrorCode = 'syntax' | 'div0' | 'domain' | 'range';

export class CalcError extends Error {
  code: CalcErrorCode;
  constructor(code: CalcErrorCode) {
    super(code);
    this.code = code;
  }
}

type Tok =
  | { t: 'num'; v: number }
  | { t: 'op'; v: '+' | '−' | '×' | '÷' | '^' }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'pi' }
  | { t: 'sqrt' }
  | { t: 'pct' }
  | { t: 'sq' };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      let dot = false;
      while (j < src.length && /[0-9.]/.test(src[j])) {
        if (src[j] === '.') {
          if (dot) throw new CalcError('syntax');
          dot = true;
        }
        j++;
      }
      const exp = /^[eE][+-]?\d+/.exec(src.slice(j));
      if (exp) j += exp[0].length;
      const text = src.slice(i, j);
      const v = Number(text);
      if (text === '.' || isNaN(v)) throw new CalcError('syntax');
      out.push({ t: 'num', v });
      i = j;
      continue;
    }
    switch (c) {
      case '+':
        out.push({ t: 'op', v: '+' });
        break;
      case '−':
      case '-':
        out.push({ t: 'op', v: '−' });
        break;
      case '×':
      case '*':
        out.push({ t: 'op', v: '×' });
        break;
      case '÷':
      case '/':
        out.push({ t: 'op', v: '÷' });
        break;
      case '^':
        out.push({ t: 'op', v: '^' });
        break;
      case '(':
        out.push({ t: 'lp' });
        break;
      case ')':
        out.push({ t: 'rp' });
        break;
      case '%':
        out.push({ t: 'pct' });
        break;
      case '²':
        out.push({ t: 'sq' });
        break;
      case 'π':
        out.push({ t: 'pi' });
        break;
      case '√':
        out.push({ t: 'sqrt' });
        break;
      default:
        throw new CalcError('syntax');
    }
    i++;
  }
  return out;
}

interface Val {
  v: number;
  pct: boolean;
}

function parse(tokens: Tok[]): number {
  let p = 0;
  const peek = (): Tok | undefined => tokens[p];

  function expr(): Val {
    let left = term();
    for (;;) {
      const t = peek();
      if (t && t.t === 'op' && (t.v === '+' || t.v === '−')) {
        p++;
        const r = term();
        const rv = r.pct ? left.v * r.v : r.v;
        left = { v: t.v === '+' ? left.v + rv : left.v - rv, pct: false };
      } else break;
    }
    return left;
  }

  function term(): Val {
    let left = unary();
    for (;;) {
      const t = peek();
      if (t && t.t === 'op' && (t.v === '×' || t.v === '÷')) {
        p++;
        const r = unary();
        if (t.v === '×') left = { v: left.v * r.v, pct: false };
        else {
          if (r.v === 0) throw new CalcError('div0');
          left = { v: left.v / r.v, pct: false };
        }
      } else if (t && (t.t === 'num' || t.t === 'pi' || t.t === 'lp' || t.t === 'sqrt')) {
        const r = unary();
        left = { v: left.v * r.v, pct: false };
      } else break;
    }
    return left;
  }

  function unary(): Val {
    const t = peek();
    if (t && t.t === 'op' && (t.v === '−' || t.v === '+')) {
      p++;
      const r = unary();
      return { v: t.v === '−' ? -r.v : r.v, pct: r.pct };
    }
    return power();
  }

  function power(): Val {
    const base = postfix();
    const t = peek();
    if (t && t.t === 'op' && t.v === '^') {
      p++;
      const e = unary();
      if (base.v === 0 && e.v < 0) throw new CalcError('div0');
      const v = Math.pow(base.v, e.v);
      if (isNaN(v)) throw new CalcError('domain');
      return { v, pct: false };
    }
    return base;
  }

  function postfix(): Val {
    let x = primary();
    for (;;) {
      const t = peek();
      if (t && t.t === 'pct') {
        p++;
        x = { v: x.v / 100, pct: true };
      } else if (t && t.t === 'sq') {
        p++;
        x = { v: x.v * x.v, pct: false };
      } else break;
    }
    return x;
  }

  function primary(): Val {
    const t = peek();
    if (!t) throw new CalcError('syntax');
    if (t.t === 'num') {
      p++;
      return { v: t.v, pct: false };
    }
    if (t.t === 'pi') {
      p++;
      return { v: Math.PI, pct: false };
    }
    if (t.t === 'lp') {
      p++;
      const e = expr();
      const n = peek();
      if (!n || n.t !== 'rp') throw new CalcError('syntax');
      p++;
      return { v: e.v, pct: false };
    }
    if (t.t === 'sqrt') {
      p++;
      const a = primary();
      if (a.v < 0) throw new CalcError('domain');
      return { v: Math.sqrt(a.v), pct: false };
    }
    throw new CalcError('syntax');
  }

  const result = expr();
  if (p < tokens.length) throw new CalcError('syntax');
  return result.v;
}

export function evaluate(src: string): number {
  const v = parse(tokenize(src));
  if (!isFinite(v)) throw new CalcError('range');
  return Number(v.toPrecision(12));
}

/** Drop trailing operators and close any open brackets so partial input can be previewed. */
export function autoComplete(src: string): string {
  let s = src;
  while (/[+−×÷^(√\-*/]$/.test(s)) s = s.slice(0, -1);
  const open = (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length;
  return s + ')'.repeat(Math.max(0, open));
}

/** True when the expression is more than a single plain number. */
export function isCompound(s: string): boolean {
  const body = s.replace(/^−/, '').replace(/e[+-]?\d+/gi, '');
  return /[+−×÷^%²√π()]/.test(body);
}

export function resultToString(v: number): string {
  const s = String(Number(v.toPrecision(12)));
  return s.startsWith('-') ? '−' + s.slice(1) : s;
}

export function errorMessage(e: unknown): string {
  const code = e instanceof CalcError ? e.code : 'syntax';
  switch (code) {
    case 'div0':
      return "Can't divide by zero";
    case 'domain':
      return 'Invalid input';
    case 'range':
      return 'Result too large';
    default:
      return 'Invalid expression';
  }
}
