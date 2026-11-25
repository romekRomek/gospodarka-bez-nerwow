/* Komponent: Pomocniki interfejsu v2: budowanie DOM, poziom treści (Podstawy/Więcej), bloki z biblioteki komponentów */
function h(tag,cls,kids,attrs){var e=document.createElement(tag);if(cls)e.className=cls;[].concat(kids==null?[]:kids).forEach(function(k){if(k==null||k===false)return;e.appendChild(typeof k==='object'?k:document.createTextNode(k));});if(attrs)for(var a in attrs)e.setAttribute(a,attrs[a]);return e;}
var CONF=(DATA.confidence||{}).nodes||{};
var CHGM={};if(LAST)LAST.changes.forEach(function(c){if(c.id&&c.m)CHGM[c.id]=c;});
var ARW2={up:'↑',down:'↓',flat:'→'};
var EYE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
var FMK={ok:['✓','w porządku'],mid:['~','z zastrzeżeniem'],no:['!','problem']};
function isPhone(){return window.matchMedia('(max-width:760px)').matches;}
/* poziom treści zapamiętany lokalnie (L5); localStorage może rzucić wyjątek (tryb prywatny), wtedy poziom działa tylko w tej sesji */
var LEVEL=1;
try{if(localStorage.getItem('gbn-level')==='2')LEVEL=2;}catch(e){}
function setLevel(n){LEVEL=n;try{localStorage.setItem('gbn-level',String(n));}catch(e){}applyLevel();}
function applyLevel(){
  document.body.classList.toggle('lv2-on',LEVEL===2);
  document.querySelectorAll('#lvl button').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.level===LEVEL?'true':'false');});
  if(typeof syncPanelLevel==='function')syncPanelLevel();
}
/* Delta: kierunek (↑ ↓ →) i punkt odniesienia z najnowszego wpisu dziennika zmian */
function deltaEl(id){var c=CHGM[id];if(!c)return null;var flat=c.from===c.to;
  return h('span','delta',[h('b',null,ARW2[c.dir]||'→',{'aria-hidden':'true'}),h('span','sr',(ARRN[c.dir]||'')+': '),flat?'bez zmian od poprzedniej aktualizacji':'z '+c.from]);}
function whoEl(s){if(!s.decides&&!s.concerns)return null;
  return h('dl','who',[h('dt',null,'Decyduje'),h('dd',null,s.decides),h('dt',null,'Dotyczy'),h('dd',null,s.concerns)]);}
function watchEl(s){if(!s.watch)return null;var p=h('p','watch',[h('span',null,[h('b',null,'Obserwuj:'),' '+s.watch])]);p.insertAdjacentHTML('afterbegin',EYE);return p;}
function confEl(id){var c=CONF[id];if(!c||!c.level)return null;
  var fac=h('dl','cfac lv2',c.factors.map(function(f){var m=FMK[f.state]||FMK.mid;return [h('dt',null,f.name),h('dd','f-'+f.state,[h('b',null,m[0],{'aria-hidden':'true'}),h('span','sr',m[1]+': '),f.text])];}).reduce(function(a,b){return a.concat(b);},[]));
  return h('div','conf c-'+c.level,[h('div','cmain',[h('span','cl','Pewność danych'),h('span','pips',[h('i'),h('i'),h('i')],{'aria-hidden':'true'}),h('b',null,c.label)]),h('span','why',c.why),fac]);}
function soonEl(s){if(!s.soon||!s.soon.events)return null;
  return h('div','soon lv2',[h('b','soonh','Co może o tym zadecydować'),
    h('ul','events',s.soon.events.map(function(e){return h('li',null,[h('span','when',e.when),h('span',null,e.text)]);})),
    s.soon.question?h('p','askme',[h('b',null,'Dla Ciebie'),s.soon.question]):null]);}
function limitsEl(s){if(!s.limits)return null;
  return h('div','limits lv2',[h('b','limh','Czego ta liczba nie mówi'),h('ul',null,s.limits.map(function(x){return h('li',null,x);}))]);}
/* „Spójrz też na”: wartość i opis czytane z węzła docelowego (opis do pierwszego nawiasu lub średnika) */
function alsoEl(s){if(!s.also)return null;
  var cells=s.also.map(function(a){var t=STEPS[byId[a.node]];if(!t)return null;
    var d=t.mc.split(/\s\(|;/)[0].replace(/[.,\s]+$/,'');
    var c=h('a','acell',[h('small',null,a.role),h('b',null,t.m),h('span',null,d)],{href:'#'});
    c.addEventListener('click',function(e){e.preventDefault();stop();show(byId[a.node],true);if(isPhone())sheet(true);});return c;});
  return h('div','also lv2',[h('b','alh','Spójrz też na'),h('div','acells',cells),h('p','ctxl',s.alsoNote||'To różne miary, więc nie leżą na jednej skali.')]);}
/* liczba z jednostką: „ok. 90 USD” → liczba + mała jednostka */
function numEl(m){var x=/^(.*\d%?)\s+([A-Za-z]+)$/.exec(m);return h('div','num',x?[x[1],h('small',null,x[2])]:m);}
