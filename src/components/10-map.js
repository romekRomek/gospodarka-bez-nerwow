/* Komponent: Mapa: węzły na mapie świata i podpis Polski */
/* Tryb lekki mapy. Filtry SVG (szum feTurbulence + przesunięcie) i nieskończone animacje są w WebKit (Safari, a na iPhonie wszystkie przeglądarki)
   bardzo kosztowne: pomiar w WebKit dał 1-4 klatek/s na mapie i zawieszanie ze stroną „wielokrotnie wystąpił problem”; po wyłączeniu 30 klatek/s.
   Tryb lekki (bez filtrów i animacji) włącza się dla Safari, małych i dotykowych ekranów oraz prefers-reduced-motion. Pomiar: tests/e2e/perf-webkit.mjs */
/* Dwie warstwy. Cała mapa jako jeden SVG (ok. 4 mln pikseli przy 3x DPR) jest przemalowywana w całości po każdej zmianie, także po zaznaczeniu węzła
   (pomiar WebKit: ok. 1100 ms na kliknięcie). Statyczna część (morze, kontynenty, powiększenie Polski, podpisy) trafia do osobnego SVG pod spodem,
   a w nakładce zostają węzły, zależności, trasa i animacje: kliknięcie przemalowuje tylko nakładkę (ok. 320 ms). */
(function(){
  var sv=document.getElementById('sv');if(!sv||sv.parentNode.classList.contains('mapstack'))return;
  var wrap=document.createElement('div');wrap.className='mapstack';sv.parentNode.insertBefore(wrap,sv);
  var base=sv.cloneNode(false);base.removeAttribute('id');base.removeAttribute('role');base.removeAttribute('aria-label');
  base.setAttribute('aria-hidden','true');base.classList.add('base');
  wrap.appendChild(base);wrap.appendChild(sv);
  [].slice.call(sv.children).forEach(function(c){
    var dyn=c.tagName==='defs'||c.id==='nodes'||c.id==='deps'||(c.matches&&c.matches('.ship,.queue,.cloud,.rtflow,.ext-arc'))||(c.querySelector&&c.querySelector('.rtflow,.ext-arc'));
    if(!dyn)base.appendChild(c);
  });
})();
(function(){
  var sv=document.getElementById('sv');if(!sv)return;
  var maps=document.querySelectorAll('svg.map');
  var UA=navigator.userAgent,safari=/safari/i.test(UA)&&!/chrome|chromium|crios|fxios|edg|android/i.test(UA);
  var mq=window.matchMedia('(max-width:1020px),(hover:none)'),rm=window.matchMedia('(prefers-reduced-motion:reduce)');
  function apply(){
    var lite=safari||mq.matches||rm.matches;
    [].forEach.call(maps,function(m){m.classList.toggle('lite',lite);});
    [].forEach.call(document.querySelectorAll('svg.map [filter],svg.map [data-f]'),function(e){
      if(lite){if(e.hasAttribute('filter')){e.setAttribute('data-f',e.getAttribute('filter'));e.removeAttribute('filter');}}
      else if(e.hasAttribute('data-f')){e.setAttribute('filter',e.getAttribute('data-f'));e.removeAttribute('data-f');}
    });
    if(sv.pauseAnimations){if(lite)sv.pauseAnimations();else sv.unpauseAnimations();}
  }
  apply();
  [mq,rm].forEach(function(m){if(m.addEventListener)m.addEventListener('change',apply);else if(m.addListener)m.addListener(apply);});
})();
/* węzły na mapie */
var host=document.getElementById('nodes');
NODES.forEach(function(n){
  var g=el('g',{'class':'node '+n.cat,id:'n-'+n.id,tabindex:'0',role:'button','aria-label':STEPS[byId[n.id]].t+', krok '+(byId[n.id]+1),transform:'translate('+n.x+' '+n.y+')'},host);
  el('rect',{'class':'ring',x:-36,y:-36,width:72,height:72,rx:24},g);
  var pp=el('g',{'class':'pop'},g);
  var tl=el('rect',{'class':'tile',x:-32,y:-32,width:64,height:64,rx:22},pp);tl.setAttribute('fill','url(#g-'+n.cat+')');
  var us=el('use',{x:-27,y:-27,width:54,height:54},pp);us.setAttribute('href','#i-'+n.id);
  if(CHG[n.id]){el('circle',{'class':'chm',cx:-24,cy:-24,r:7},g);}
  el('circle',{'class':'bn',cx:24,cy:-24,r:11},g);var bt=el('text',{'class':'bt',x:24,y:-19.5},g);bt.textContent=byId[n.id]+1;
  var w=n.lb.length*8+24,lx,ly,tx;
  if(n.lp==='r'){lx=38;ly=-14;}else if(n.lp==='l'){lx=-38-w;ly=-14;}else if(n.lp==='t'){lx=-w/2;ly=-62;}else{lx=-w/2;ly=36;}
  var lb=el('g',{'class':'lb',transform:'translate('+lx+' '+ly+')'},g);
  el('rect',{'class':'lbbg',x:0,y:0,width:w,height:26,rx:13},lb);var t=el('text',{'class':'lbt',x:11,y:19},lb);t.textContent=n.lb;
});
/* podpis Polski */
(function(){var g=el('g',{'class':'node',style:'pointer-events:none'},document.getElementById('sv'));})();
