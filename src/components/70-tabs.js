/* Komponent: Nawigacja zakładek Mapa / Newsy / Polska */
/* zakładki */
var tbs={map:document.getElementById('tb-map'),emo:document.getElementById('tb-emo'),pl:document.getElementById('tb-pl')},TO=['map','emo','pl'];
var lead=document.querySelector('.lead'),leadMap=lead.textContent;
function tab(n){
  TO.forEach(function(k){document.getElementById('tab-'+k).hidden=k!==n;});
  for(var k in tbs){tbs[k].setAttribute('aria-selected',k===n?'true':'false');}
  lead.textContent=n==='map'?leadMap:n==='emo'?'Nagłówki potrafią sterować tym, co czujesz, zanim zdążysz pomyśleć. Tu zobaczysz, jak to działa, i nauczysz się to widzieć.':'Spór polityczny, deficyt, malejąca liczba ludności, ceny energii. Zobacz, co Polacy uważają za największe zagrożenia i co na to dane.';
  if(n==='pl')plCharts();
  if(md.open)md.close();
}
TO.forEach(function(k){tbs[k].addEventListener('click',function(){tab(k);});});
document.querySelector('.tabs').addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var c=TO.filter(function(k){return document.activeElement===tbs[k];})[0]||'map',n=TO[(TO.indexOf(c)+(e.key==='ArrowRight'?1:-1)+TO.length)%TO.length];tab(n);tbs[n].focus();e.stopPropagation();}});
