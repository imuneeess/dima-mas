/** Pure domain functions shared by the storefront and its tests. Prices are integer MAD. */
export const SIZES=['S','M','L','XL','XXL'];
export const KITS=['home','away'];
export const BASE_PRICE=399;
export const PRINT_PRICE=50;
export function cleanName(value){return String(value??'').normalize('NFC').replace(/[^\p{L}\p{M}\s.'-]/gu,'').replace(/\s+/g,' ').trim().slice(0,14).toLocaleUpperCase();}
export function cleanNumber(value){return String(value??'').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/\D/g,'').slice(0,2);}
export function normalizeConfig(input={}){return {kit:KITS.includes(input.kit)?input.kit:'home',size:SIZES.includes(input.size)?input.size:'M',name:cleanName(input.name),number:cleanNumber(input.number)};}
export function unitPrice(config){return BASE_PRICE+(config.name||config.number?PRINT_PRICE:0);}
export function configKey(config){const c=normalizeConfig(config);return JSON.stringify([c.kit,c.size,c.name,c.number]);}
export function addItem(cart,config){const c=normalizeConfig(config),key=configKey(c);const existing=cart.find(i=>i.id===key);return existing?cart.map(i=>i.id===key?{...i,quantity:Math.min(9,i.quantity+1)}:i):[...cart,{id:key,config:c,quantity:1}];}
export function setQuantity(cart,id,quantity){if(quantity<=0)return cart.filter(i=>i.id!==id);return cart.map(i=>i.id===id?{...i,quantity:Math.min(9,Math.floor(quantity))}:i);}
export function cartTotal(cart){return cart.reduce((sum,item)=>sum+unitPrice(item.config)*item.quantity,0);}
export function cartCount(cart){return cart.reduce((sum,item)=>sum+item.quantity,0);}
export function restoreCart(value){try{const parsed=JSON.parse(value);if(!Array.isArray(parsed))return [];return parsed.slice(0,30).filter(i=>i&&i.config&&Number.isInteger(i.quantity)&&i.quantity>0).reduce((acc,i)=>{const config=normalizeConfig(i.config),id=configKey(config),found=acc.find(x=>x.id===id);if(found)found.quantity=Math.min(9,found.quantity+i.quantity);else acc.push({id,config,quantity:Math.min(9,i.quantity)});return acc;},[]);}catch{return [];}}
