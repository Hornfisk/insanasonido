import esStrings from './es';
import enStrings from './en';

export type Locale = 'es' | 'en';

const dict = { es: esStrings, en: enStrings };

export function useTranslations(locale: string | undefined) {
  const l: Locale = locale === 'en' ? 'en' : 'es';
  return function t(key: string): string {
    const keys = key.split('.');
    let obj: any = dict[l];
    for (const k of keys) {
      obj = obj?.[k];
    }
    return typeof obj === 'string' ? obj : key;
  };
}
