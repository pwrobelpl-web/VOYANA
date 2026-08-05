import {getLanguage} from './i18n.js';

export const $=id=>document.getElementById(id);
export const iso=date=>date.toISOString().slice(0,10);

export function formatDate(value){
  if(!value) return '—';
  const locale=getLanguage()==='pl'?'pl-PL':getLanguage()==='es'?'es-ES':'en-GB';
  return new Date(value).toLocaleString(locale,{dateStyle:'medium',timeStyle:'short'});
}

export function formatMoney(currency,amount){
  const number=Number(amount);
  return `${currency||''} ${Number.isFinite(number)?number.toFixed(2):amount}`;
}
