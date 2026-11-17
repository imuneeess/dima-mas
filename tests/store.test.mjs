import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanName,cleanNumber,normalizeConfig,addItem,setQuantity,unitPrice,cartTotal,restoreCart} from '../dist/store.js';
test('Arabic and Persian keyboard digits are accepted as jersey numbers',()=>{assert.equal(cleanNumber('١٠'),'10');assert.equal(cleanNumber('۰۹'),'09');assert.equal(cleanNumber('abc123'),'12');});
test('Arabic and accented names survive; markup and digits cannot enter personalization',()=>{assert.equal(cleanName('  Younès  '),'YOUNÈS');assert.equal(cleanName('يوسف'),'يوسف');assert.equal(cleanName('<b>Ali123</b>'),'BALIB');});
test('printing has one surcharge regardless of name and number together',()=>{assert.equal(unitPrice(normalizeConfig({})),399);assert.equal(unitPrice(normalizeConfig({name:'Ali',number:'10'})),449);});
test('only identical configurations merge and totals follow quantities',()=>{let cart=addItem([],{name:'Ali',size:'M'});cart=addItem(cart,{name:'Ali',size:'M'});cart=addItem(cart,{name:'Ali',size:'L'});assert.equal(cart.length,2);assert.equal(cart[0].quantity,2);assert.equal(cartTotal(cart),1347);cart=setQuantity(cart,cart[0].id,0);assert.equal(cartTotal(cart),449);});
test('tampered persisted prices and ids are ignored',()=>{const cart=restoreCart(JSON.stringify([{id:'fake',config:{kit:'invalid',size:'invalid',number:'1234'},quantity:999,price:1}]));assert.equal(cart[0].config.kit,'home');assert.equal(cart[0].config.size,'M');assert.equal(cart[0].config.number,'12');assert.equal(cart[0].quantity,9);assert.equal(cartTotal(cart),4041);assert.notEqual(cart[0].id,'fake');});
test('invalid storage recovers to an empty cart',()=>{for(const s of ['{','null','{}','[null,4,"x"]'])assert.deepEqual(restoreCart(s),[]);});
