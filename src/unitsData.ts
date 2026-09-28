export interface Unit {
  key: string;
  label: string; // short symbol
  name: string;
  factor: number; // multiply by this to reach the category's base unit
}

export interface Category {
  key: string;
  label: string;
  base: string;
  units: Unit[];
  defaults: [string, string];
  note?: string;
}

const u = (key: string, label: string, name: string, factor: number): Unit => ({ key, label, name, factor });

export const CATEGORIES: Category[] = [
  {
    key: 'length',
    label: 'Length',
    base: 'm',
    defaults: ['km', 'mi'],
    units: [
      u('mm', 'mm', 'Millimetre', 0.001),
      u('cm', 'cm', 'Centimetre', 0.01),
      u('m', 'm', 'Metre', 1),
      u('km', 'km', 'Kilometre', 1000),
      u('in', 'in', 'Inch', 0.0254),
      u('ft', 'ft', 'Foot', 0.3048),
      u('yd', 'yd', 'Yard', 0.9144),
      u('mi', 'mi', 'Mile', 1609.344),
      u('nmi', 'nmi', 'Nautical mile', 1852),
    ],
  },
  {
    key: 'weight',
    label: 'Weight',
    base: 'kg',
    defaults: ['kg', 'lb'],
    units: [
      u('mg', 'mg', 'Milligram', 0.000001),
      u('g', 'g', 'Gram', 0.001),
      u('kg', 'kg', 'Kilogram', 1),
      u('qtl', 'qtl', 'Quintal', 100),
      u('t', 't', 'Tonne', 1000),
      u('oz', 'oz', 'Ounce', 0.028349523125),
      u('lb', 'lb', 'Pound', 0.45359237),
      u('st', 'st', 'Stone', 6.35029318),
    ],
  },
  {
    key: 'temperature',
    label: 'Temperature',
    base: '°C',
    defaults: ['c', 'f'],
    units: [u('c', '°C', 'Celsius', 1), u('f', '°F', 'Fahrenheit', 1), u('k', 'K', 'Kelvin', 1)],
  },
  {
    key: 'area',
    label: 'Area',
    base: 'm²',
    defaults: ['sqft', 'sqm'],
    units: [
      u('sqmm', 'mm²', 'Square millimetre', 0.000001),
      u('sqcm', 'cm²', 'Square centimetre', 0.0001),
      u('sqm', 'm²', 'Square metre', 1),
      u('sqkm', 'km²', 'Square kilometre', 1000000),
      u('sqin', 'in²', 'Square inch', 0.00064516),
      u('sqft', 'ft²', 'Square foot', 0.09290304),
      u('sqyd', 'yd²', 'Square yard', 0.83612736),
      u('ha', 'ha', 'Hectare', 10000),
      u('ac', 'ac', 'Acre', 4046.8564224),
      u('cent', 'cent', 'Cent (1/100 acre)', 40.468564224),
      u('guntha', 'guntha', 'Guntha (1,089 ft²)', 101.1714106),
      u('ground', 'ground', 'Ground (2,400 ft²)', 222.967296),
    ],
  },
  {
    key: 'volume',
    label: 'Volume',
    base: 'L',
    defaults: ['l', 'galus'],
    units: [
      u('ml', 'mL', 'Millilitre', 0.001),
      u('l', 'L', 'Litre', 1),
      u('m3', 'm³', 'Cubic metre', 1000),
      u('tsp', 'tsp', 'Teaspoon (US)', 0.00492892159375),
      u('tbsp', 'tbsp', 'Tablespoon (US)', 0.01478676478125),
      u('floz', 'fl oz', 'Fluid ounce (US)', 0.0295735295625),
      u('cup', 'cup', 'Cup (US)', 0.2365882365),
      u('pt', 'pt', 'Pint (US)', 0.473176473),
      u('qt', 'qt', 'Quart (US)', 0.946352946),
      u('galus', 'gal', 'Gallon (US)', 3.785411784),
    ],
  },
  {
    key: 'speed',
    label: 'Speed',
    base: 'm/s',
    defaults: ['kmh', 'mph'],
    units: [
      u('ms', 'm/s', 'Metre per second', 1),
      u('kmh', 'km/h', 'Kilometre per hour', 1 / 3.6),
      u('mph', 'mph', 'Mile per hour', 0.44704),
      u('kn', 'kn', 'Knot', 1852 / 3600),
      u('fts', 'ft/s', 'Foot per second', 0.3048),
    ],
  },
  {
    key: 'time',
    label: 'Time',
    base: 's',
    defaults: ['h', 'min'],
    units: [
      u('ms', 'ms', 'Millisecond', 0.001),
      u('s', 's', 'Second', 1),
      u('min', 'min', 'Minute', 60),
      u('h', 'h', 'Hour', 3600),
      u('d', 'day', 'Day', 86400),
      u('wk', 'wk', 'Week', 604800),
      u('yr', 'yr', 'Year (365.25 days)', 31557600),
    ],
  },
  {
    key: 'data',
    label: 'Data',
    base: 'B',
    defaults: ['mb', 'gb'],
    note: 'Binary units: 1 KB = 1,024 B',
    units: [
      u('bit', 'bit', 'Bit', 0.125),
      u('b', 'B', 'Byte', 1),
      u('kb', 'KB', 'Kilobyte', 1024),
      u('mb', 'MB', 'Megabyte', 1024 ** 2),
      u('gb', 'GB', 'Gigabyte', 1024 ** 3),
      u('tb', 'TB', 'Terabyte', 1024 ** 4),
    ],
  },
];

function toCelsius(v: number, unit: string): number {
  if (unit === 'f') return ((v - 32) * 5) / 9;
  if (unit === 'k') return v - 273.15;
  return v;
}

function fromCelsius(c: number, unit: string): number {
  if (unit === 'f') return (c * 9) / 5 + 32;
  if (unit === 'k') return c + 273.15;
  return c;
}

export function convertUnit(cat: Category, value: number, from: string, to: string): number {
  if (cat.key === 'temperature') return fromCelsius(toCelsius(value, from), to);
  const f = cat.units.find((x) => x.key === from);
  const t = cat.units.find((x) => x.key === to);
  if (!f || !t) return NaN;
  return (value * f.factor) / t.factor;
}
