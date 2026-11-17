import {messages,translatePage} from './i18n.js';
import {normalizeConfig,cleanName,cleanNumber,unitPrice,addItem,setQuantity,cartTotal,cartCount,restoreCart,configKey} from './store.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const storage={get(key){try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}};
let lang=storage.get('dima-mas-language')==='ar'?'ar':'fr',paused=preference.matches||storage.get('dima-mas-motion')==='paused',filter='upcoming',config=normalizeConfig({kit:new URLSearchParams(location.search).get('kit')||'home',size:'M',name:'MASSAWI',number:'10'}),cart=restoreCart(storage.get('dima-mas-cart-v1')),lastOrder=[],studio=null,studioFailed=false,toastTimer;
const t=key=>messages[lang][key]??key;
const matches=[
  {id:1,date:'2026-11-21T20:00:00+01:00',opponent:'WAC',fr:'Wydad AC',ar:'الوداد الرياضي',home:true,round:1,type:'upcoming'},
  {id:2,date:'2026-11-28T18:00:00+01:00',opponent:'RCA',fr:'Raja CA',ar:'الرجاء الرياضي',home:false,round:2,type:'upcoming'},
  {id:3,date:'2026-12-05T20:00:00+01:00',opponent:'FAR',fr:'AS FAR',ar:'الجيش الملكي',home:true,round:3,type:'upcoming'},
  {id:4,date:'2026-11-14T18:00:00+01:00',opponent:'FUS',fr:'FUS Rabat',ar:'الفتح الرباطي',home:true,round:0,type:'results',score:'2 : 1'},
  {id:5,date:'2026-11-07T20:00:00+01:00',opponent:'RSB',fr:'RS Berkane',ar:'نهضة بركان',home:false,round:0,type:'results',score:'1 : 1'},
  {id:6,date:'2026-10-31T18:00:00+01:00',opponent:'IRT',fr:'IR Tanger',ar:'اتحاد طنجة',home:true,round:0,type:'results',score:'2 : 0'}
];
const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
const money=value=>`${new Intl.NumberFormat(lang==='ar'?'ar-MA':'fr-MA',{maximumFractionDigits:0}).format(value)} MAD`;
function notify(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function persistCart(){if(!storage.set('dima-mas-cart-v1',JSON.stringify(cart)))notify(t('storageNote'));$('#cart-count').textContent=cartCount(cart);}

function renderMatches(){
  const list=$('#match-list');if(!list)return;list.replaceChildren();const search=($('#opponent-search')?.value||'').toLocaleLowerCase().trim(),venue=$('#venue-filter')?.value||'all';
  matches.filter(m=>m.type===filter&&(venue==='all'||m.home===(venue==='home'))&&(!search||`${m.fr} ${m.ar} ${m.opponent}`.toLocaleLowerCase().includes(search))).forEach(m=>{
    const date=new Intl.DateTimeFormat(lang==='ar'?'ar-MA':'fr-FR',{day:'2-digit',month:'short',timeZone:'Africa/Casablanca'}).format(new Date(m.date)).toUpperCase();
    // Demo schedule uses its authored Casablanca wall-clock time consistently.
    const time=m.date.slice(11,16);
    const button=el('button','match-card');button.setAttribute('aria-label',`${t('demo')} : MAS ${t('versus')} ${m[lang]}, ${date}`);
    const top=el('div','match-card-top');top.append(el('span','',`${t('demo')} / ${m.type==='upcoming'?`${t('round')} ${String(m.round).padStart(2,'0')}`:t('finished')}`),el('b','',date));
    const teams=el('div','match-teams');const team=(code,label,own)=>{const n=el('span','team');n.append(el('span',`team-badge ${own?'':'opponent'}`,code),el('small','',label));return n;};
    const own=team('MAS',lang==='ar'?'المغرب الفاسي':'MAGHREB FÈS',true),opponent=team(m.opponent,m[lang].toUpperCase(),false),timeEl=el('span','match-time');timeEl.append(el('small','',m.type==='upcoming'?t('versus'):t('finished')),document.createTextNode(m.score||time));
    teams.append(m.home?own:opponent,timeEl,m.home?opponent:own);
    const bottom=el('div','match-card-bottom');bottom.append(el('span','',m.home?t('matchVenue'):t('awayVenue')),el('span','','↗'));button.append(top,teams,bottom);button.addEventListener('click',()=>showInfo(t('demoData'),t('matchModalTitle'),[`${m.home?'MAS':m[lang]} — ${m.home?m[lang]:'MAS'} · ${date} 2026${m.type==='upcoming'?` · ${time}`:` · ${m.score}`}`,t('matchModalText')]));list.append(button);
  });if(!list.children.length)list.append(el('p','no-matches',lang==='ar'?'لا توجد مباريات مطابقة. جرّب بحثاً آخر.':'Aucun match trouvé. Essaie un autre adversaire ou un autre terrain.'));
}

function updateView(view){$$('[data-view]').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
function updateConfig(){
  if(!$('#product-price'))return;$('.product-title h3').textContent=config.kit==='away'?(lang==='ar'?'الليلي.':'LA NOCTURNE.'):t('productTitle');
  const price=unitPrice(config);$('#product-price').replaceChildren(document.createTextNode(`${price} `),el('small','','MAD'));$('#print-price').textContent=`${price-399} MAD`;
  $$('[data-kit]').forEach(b=>{b.classList.toggle('active',b.dataset.kit===config.kit);b.setAttribute('aria-pressed',String(b.dataset.kit===config.kit));});$$('[data-size]').forEach(b=>{b.classList.toggle('active',b.dataset.size===config.size);b.setAttribute('aria-pressed',String(b.dataset.size===config.size));});
  $('#fallback-name').textContent=config.name;$('#fallback-number').textContent=config.number;$('.flat-shirt').classList.toggle('away',config.kit==='away');studio?.update(config);
}
function setPaused(value){paused=value;document.body.classList.toggle('motion-paused',value);$('#motion-toggle').setAttribute('aria-pressed',String(value));$('#motion-icon').textContent=value?'▷':'Ⅱ';$('#motion-label').textContent=t(value?'resume':'pause');studio?.setPaused(value);storage.set('dima-mas-motion',value?'paused':'playing');document.dispatchEvent(new CustomEvent('dima:motion',{detail:value}));}
function closeMenu(){$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').setAttribute('aria-label',t('menuOpen'));$('#main-nav').classList.remove('open');}
function setLanguage(value){lang=value;storage.set('dima-mas-language',lang);translatePage(lang);renderMatches();updateConfig();setPaused(paused);closeMenu();if($('#cart-dialog').open)renderCart();if(studioFailed)$('.stage-rotate').textContent=t('fallbackHint');document.dispatchEvent(new CustomEvent('dima:language',{detail:lang}));}
$$('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderMatches();}));
$$('[data-kit]').forEach(b=>b.addEventListener('click',()=>{config.kit=b.dataset.kit;updateConfig();}));
$$('[data-size]').forEach(b=>b.addEventListener('click',()=>{config.size=b.dataset.size;updateConfig();}));
$('#shirt-name')?.addEventListener('input',e=>{config.name=cleanName(e.target.value);updateConfig();studio?.setView('back');updateView('back');});
$('#shirt-name')?.addEventListener('blur',e=>{e.target.value=config.name;});
$('#shirt-number')?.addEventListener('input',e=>{e.target.value=cleanNumber(e.target.value);config.number=e.target.value;updateConfig();studio?.setView('back');updateView('back');});
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{studio?.setView(b.dataset.view);updateView(b.dataset.view);}));
$('#reset-view')?.addEventListener('click',()=>{studio?.setView('front');updateView('front');});
$('#motion-toggle')?.addEventListener('click',()=>setPaused(!paused));preference.addEventListener('change',e=>setPaused(e.matches));
$('#menu-toggle')?.addEventListener('click',()=>{const open=$('#menu-toggle').getAttribute('aria-expanded')!=='true';$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',t(open?'menuClose':'menuOpen'));$('#main-nav').classList.toggle('open',open);});$$('#main-nav a').forEach(a=>a.addEventListener('click',closeMenu));addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

const focusOrigins=new WeakMap();
function openDialog(dialog){focusOrigins.set(dialog,document.activeElement);dialog.showModal();document.body.style.overflow='hidden';}
$$('dialog').forEach(dialog=>{dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{document.body.style.overflow='';focusOrigins.get(dialog)?.focus({preventScroll:true});});});
function showInfo(kicker,title,paragraphs,extra){$('#info-kicker').textContent=kicker;$('#info-title').textContent=title;$('#info-body').replaceChildren(...paragraphs.map(p=>el('p','',p)));extra?.($('#info-body'));openDialog($('#info-dialog'));}
function addHistorySources(parent){const title=el('p','',t('historySources'));title.style.color='#f2cb25';parent.append(title);for(const [key,url] of [['sourceFounding','https://www.cafonline.com/media/05ebfeih/ultimate-media-guide-afcon25.pdf'],['sourceCup','https://www.fff.fr/621-palmares-coupe-de-la-confederation-de-la-caf.html']]){const p=el('p'),a=el('a','',t(key));a.href=url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);parent.append(p);}}
$('#story-trigger')?.addEventListener('click',()=>showInfo(t('legacyEyebrow'),t('storyTitle'),[t('storyText')],addHistorySources));
$('#about-trigger')?.addEventListener('click',()=>showInfo('DIMA MAS / PORTFOLIO',t('aboutTitle'),[t('aboutText'),t('aboutData'),t('aboutImage'),t('aboutTech')],addHistorySources));
$('#size-guide')?.addEventListener('click',()=>showInfo(t('conceptKit'),t('sizeTitle'),[t('sizeText')],parent=>{const table=el('table'),head=el('thead'),hr=el('tr');[t('size'),`${t('width')} (cm)`,`${t('length')} (cm)`].forEach(x=>{const th=el('th','',x);th.scope='col';hr.append(th);});head.append(hr);table.append(head);const body=el('tbody');[['S',48,68],['M',51,71],['L',54,74],['XL',57,77],['XXL',60,80]].forEach(row=>{const tr=el('tr');row.forEach(x=>tr.append(el('td','',x)));body.append(tr);});table.append(body);parent.append(table);}));

function renderCart(){
  $('#checkout-success').hidden=true;$('#cart-items').hidden=false;$('#cart-summary').hidden=cart.length===0;const items=$('#cart-items');items.replaceChildren();
  if(cart.length===0){const empty=el('div','empty-cart');empty.append(el('span','','◇'),el('h3','',t('emptyTitle')),el('p','',t('emptyText')));const b=el('button','button yellow',t('emptyCta'));b.addEventListener('click',()=>{$('#cart-dialog').close();if($('#studio'))$('#studio').scrollIntoView({behavior:paused?'instant':'smooth'});else location.href='studio.html';});empty.append(b);items.append(empty);}
  cart.forEach(item=>{
    const row=el('article','cart-item'),thumb=el('div','cart-thumb');thumb.append(el('div',`mini-shirt ${item.config.kit==='away'?'away':''}`,item.config.number||'MAS'));
    const detail=el('div','cart-item-detail');detail.append(el('h3','',`${item.config.kit==='away'?(lang==='ar'?'الليلي.':'LA NOCTURNE.'):t('productTitle')} / ${t(item.config.kit==='home'?'homeKit':'awayKit')}`),el('p','',`${t('size')} ${item.config.size} · ${item.config.name||t('noPrint')}${item.config.number?` / ${item.config.number}`:''}`),el('strong','cart-line-price',money(unitPrice(item.config)*item.quantity)));
    const actions=el('div','cart-item-actions'),qty=el('div','quantity');const minus=el('button','','−'),plus=el('button','','+');minus.setAttribute('aria-label',`${t('qtyMinus')} ${item.config.name||'MAS'} ${item.config.size}`);plus.setAttribute('aria-label',`${t('qtyPlus')} ${item.config.name||'MAS'} ${item.config.size}`);plus.disabled=item.quantity===9;
    const change=amount=>{cart=setQuantity(cart,item.id,item.quantity+amount);persistCart();renderCart();};minus.addEventListener('click',()=>change(-1));plus.addEventListener('click',()=>change(1));qty.append(minus,el('span','',item.quantity),plus);
    const remove=el('button','remove-item',t('remove'));remove.setAttribute('aria-label',`${t('remove')} ${item.config.name||'MAS'} ${item.config.size}`);remove.addEventListener('click',()=>{cart=setQuantity(cart,item.id,0);persistCart();renderCart();});actions.append(qty,remove);detail.append(actions);row.append(thumb,detail);items.append(row);
  });
  $('#cart-total').textContent=money(cartTotal(cart));
}
$('#cart-trigger')?.addEventListener('click',()=>{renderCart();openDialog($('#cart-dialog'));});
$('#add-to-cart')?.addEventListener('click',()=>{const found=cart.find(i=>i.id===configKey(config));if(found?.quantity===9)return notify(t('maxQuantity'));if(!found&&cart.length>=30)return notify(t('maxCart'));cart=addItem(cart,config);persistCart();notify(t('added'));});
$('#checkout')?.addEventListener('click',()=>{if(!cart.length)return;lastOrder=structuredClone(cart);cart=[];persistCart();$('#cart-items').hidden=true;$('#cart-summary').hidden=true;$('#checkout-success').hidden=false;$('#download-order').focus();});
$('#continue-shopping')?.addEventListener('click',()=>$('#cart-dialog').close());
function download(blob,filename){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
$('#download-order')?.addEventListener('click',()=>{const text=['DIMA MAS — DEMO / RÉCAPITULATIF','No payment, order or delivery. / لا دفع ولا طلب حقيقي.',...lastOrder.map(i=>`${i.quantity} × ${i.config.kit} · ${i.config.size} · ${i.config.name||'—'} · ${i.config.number||'—'} = ${unitPrice(i.config)*i.quantity} MAD`),`TOTAL DÉMO: ${cartTotal(lastOrder)} MAD`].join('\n\n');download(new Blob([text],{type:'text/plain;charset=utf-8'}),'dima-mas-demo.txt');});
$('#save-design')?.addEventListener('click',async()=>{const button=$('#save-design');button.disabled=true;try{if(studio&&!studio.contextLost){const blob=await studio.exportImage();if(blob)download(blob,'dima-mas-mon-design.png');else throw new Error('Image export unavailable');}else{download(new Blob([JSON.stringify({project:'DIMA MAS — unofficial concept',...config,priceMAD:unitPrice(config)},null,2)],{type:'application/json'}),'dima-mas-mon-design.json');}notify(t('designSaved'));}catch{download(new Blob([JSON.stringify(config,null,2)],{type:'application/json'}),'dima-mas-mon-design.json');notify(t('designSaved'));}finally{button.disabled=false;}});

document.documentElement.classList.add('js-motion');const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveals.unobserve(e.target);}}),{threshold:.06});$$('.reveal').forEach(n=>reveals.observe(n));
function progress(){const total=document.documentElement.scrollHeight-innerHeight;$('.progress').style.transform=`scaleX(${total>0?scrollY/total:0})`;}
addEventListener('scroll',progress,{passive:true});addEventListener('resize',progress);progress();
addEventListener('storage',e=>{if(e.key==='dima-mas-cart-v1'){cart=restoreCart(e.newValue);$('#cart-count').textContent=cartCount(cart);if($('#cart-dialog').open)renderCart();}});
setLanguage(lang);$('#cart-count').textContent=cartCount(cart);
function fallback(){studioFailed=true;$('#jersey-fallback').hidden=false;$('#jersey-mount').style.visibility='hidden';$('.stage-rotate').textContent=t('fallbackHint');$$('[data-view],#reset-view').forEach(b=>b.disabled=true);}
// Render only when the product experience approaches the viewport.
const loadStudio=new IntersectionObserver(async entries=>{if(!entries[0].isIntersecting)return;loadStudio.disconnect();try{const {JerseyStudio}=await import('./jersey.js');studio=new JerseyStudio($('#jersey-mount'),{config,paused,onView:updateView,onError:fallback,onReady:()=>{studioFailed=false;$('#jersey-fallback').hidden=true;$('#jersey-mount').style.visibility='';$('.stage-rotate').textContent=t('dragHint');$$('[data-view],#reset-view').forEach(b=>b.disabled=false);}});$('#jersey-mount canvas').setAttribute('aria-label',t('canvasLabel'));studio.autoRotate=$('#auto-rotate')?.getAttribute('aria-pressed')==='true';}catch(error){console.warn('3D studio unavailable; displaying the 2D fallback.',error);fallback();}},{rootMargin:'400px'});if($('#studio'))loadStudio.observe($('#studio'));

$('#opponent-search')?.addEventListener('input',renderMatches);
$('#venue-filter')?.addEventListener('change',renderMatches);
$('#auto-rotate')?.addEventListener('click',e=>{const button=e.currentTarget,active=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(active));if(studio)studio.autoRotate=active;});
$$('[data-light]').forEach(button=>button.addEventListener('click',()=>{const mode=button.dataset.light;$('#jersey-stage').dataset.light=mode;$$('[data-light]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});if(studio){studio.renderer.toneMappingExposure=mode==='night'?1.05:mode==='gold'?1.5:1.35;studio.dirty=true;}}));
