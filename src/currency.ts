import { getJSON, KEYS, setJSON } from './storage';

export interface RatesCache {
  base: 'USD';
  rates: Record<string, number>;
  fetchedAt: number; // ms epoch, when we downloaded them
  providerUpdated?: string; // provider's own "last updated" text
}

// Free open-access endpoint. Requires attribution (shown in the Currency screen and About).
// It updates once a day and rate-limits heavy use, so we cache and refresh at most hourly.
const URL = 'https://open.er-api.com/v6/latest/USD';
export const ATTRIBUTION_URL = 'https://www.exchangerate-api.com';
export const MIN_REFRESH_MS = 60 * 60 * 1000;
export const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

export async function loadCachedRates(): Promise<RatesCache | null> {
  return getJSON<RatesCache | null>(KEYS.rates, null);
}

export async function fetchRates(): Promise<RatesCache> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(URL, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json?.result !== 'success' || typeof json.rates !== 'object') throw new Error('Bad response');
    const cache: RatesCache = {
      base: 'USD',
      rates: json.rates as Record<string, number>,
      fetchedAt: Date.now(),
      providerUpdated: typeof json.time_last_update_utc === 'string' ? json.time_last_update_utc : undefined,
    };
    await setJSON(KEYS.rates, cache);
    return cache;
  } finally {
    clearTimeout(timer);
  }
}

export function convertCurrency(amount: number, from: string, to: string, rates: Record<string, number>): number {
  const a = rates[from];
  const b = rates[to];
  if (!a || !b) return NaN;
  return (amount / a) * b;
}

export const DEFAULT_FAVOURITES = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'JPY'];

export const CURRENCY_NAMES: Record<string, string> = {
  AED: 'UAE Dirham', AFN: 'Afghan Afghani', ALL: 'Albanian Lek', AMD: 'Armenian Dram', ARS: 'Argentine Peso',
  AUD: 'Australian Dollar', AZN: 'Azerbaijani Manat', BAM: 'Bosnia-Herzegovina Mark', BDT: 'Bangladeshi Taka',
  BGN: 'Bulgarian Lev', BHD: 'Bahraini Dinar', BRL: 'Brazilian Real', BTN: 'Bhutanese Ngultrum', BWP: 'Botswana Pula',
  BYN: 'Belarusian Ruble', CAD: 'Canadian Dollar', CHF: 'Swiss Franc', CLP: 'Chilean Peso', CNY: 'Chinese Yuan',
  COP: 'Colombian Peso', CRC: 'Costa Rican Colón', CZK: 'Czech Koruna', DKK: 'Danish Krone', DOP: 'Dominican Peso',
  DZD: 'Algerian Dinar', EGP: 'Egyptian Pound', ETB: 'Ethiopian Birr', EUR: 'Euro', GBP: 'British Pound',
  GEL: 'Georgian Lari', GHS: 'Ghanaian Cedi', HKD: 'Hong Kong Dollar', HUF: 'Hungarian Forint', IDR: 'Indonesian Rupiah',
  ILS: 'Israeli Shekel', INR: 'Indian Rupee', IQD: 'Iraqi Dinar', IRR: 'Iranian Rial', ISK: 'Icelandic Króna',
  JMD: 'Jamaican Dollar', JOD: 'Jordanian Dinar', JPY: 'Japanese Yen', KES: 'Kenyan Shilling', KGS: 'Kyrgyzstani Som',
  KHR: 'Cambodian Riel', KRW: 'South Korean Won', KWD: 'Kuwaiti Dinar', KZT: 'Kazakhstani Tenge', LAK: 'Lao Kip',
  LBP: 'Lebanese Pound', LKR: 'Sri Lankan Rupee', MAD: 'Moroccan Dirham', MDL: 'Moldovan Leu', MMK: 'Myanmar Kyat',
  MNT: 'Mongolian Tugrik', MUR: 'Mauritian Rupee', MVR: 'Maldivian Rufiyaa', MXN: 'Mexican Peso', MYR: 'Malaysian Ringgit',
  NGN: 'Nigerian Naira', NOK: 'Norwegian Krone', NPR: 'Nepalese Rupee', NZD: 'New Zealand Dollar', OMR: 'Omani Rial',
  PEN: 'Peruvian Sol', PHP: 'Philippine Peso', PKR: 'Pakistani Rupee', PLN: 'Polish Złoty', QAR: 'Qatari Riyal',
  RON: 'Romanian Leu', RSD: 'Serbian Dinar', RUB: 'Russian Ruble', SAR: 'Saudi Riyal', SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar', THB: 'Thai Baht', TND: 'Tunisian Dinar', TRY: 'Turkish Lira', TWD: 'New Taiwan Dollar',
  TZS: 'Tanzanian Shilling', UAH: 'Ukrainian Hryvnia', UGX: 'Ugandan Shilling', USD: 'US Dollar', UYU: 'Uruguayan Peso',
  UZS: 'Uzbekistani Som', VND: 'Vietnamese Dong', XAF: 'Central African CFA Franc', XOF: 'West African CFA Franc',
  ZAR: 'South African Rand', ZMW: 'Zambian Kwacha',
};
