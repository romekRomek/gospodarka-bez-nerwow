var ICON={
 oil:'M7 21 L12 5 L17 21 M9.5 15 H14.5 M4 6 H13',
 gate:'M5 20 V8 M19 20 V8 M3 8 H21 M9 20 V14 M15 20 V14',
 pump:'M6 21 V5 a2 2 0 0 1 2 -2 H14 a2 2 0 0 1 2 2 V21 M4 21 H18 M8 8 H14 M16 9 l3 2 v6 a1.5 1.5 0 0 0 3 0 v-5 l-2 -3',
 shop:'M5 8 H19 L18 20 H6 Z M9 8 V6 a3 3 0 0 1 6 0 V8',
 bank:'M3 10 L12 4 L21 10 M5 10 V18 M9.5 10 V18 M14.5 10 V18 M19 10 V18 M3 20 H21',
 wallet:'M4 7 H18 a2 2 0 0 1 2 2 V18 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 V7 Z M4 7 L15 4 V7 M16 14 H18',
 debt:'M3 20 L9 10 L12 15 L15 11 L21 20 Z',
 chart:'M4 17 L9 12 L12 15 L19 8 M15 7 H20 V12',
 sun:'M12 8 a4 4 0 1 0 0.01 0 M12 2 V4 M12 20 V22 M2 12 H4 M20 12 H22 M5 5 L6.5 6.5 M17.5 17.5 L19 19 M19 5 L17.5 6.5 M6.5 17.5 L5 19',
 cloud:'M7 18 a4 4 0 0 1 0 -8 a5 5 0 0 1 9.5 -1 A3.5 3.5 0 0 1 17 18 Z',
 shield:'M12 3 L20 6 V12 C20 17 16.5 20 12 21 C7.5 20 4 17 4 12 V6 Z',
 star:'M12 3 L14.7 8.6 L20.8 9.5 L16.4 13.8 L17.4 19.9 L12 17 L6.6 19.9 L7.6 13.8 L3.2 9.5 L9.3 8.6 Z',
 box:'M3 8 L12 3 L21 8 V16 L12 21 L3 16 Z M3 8 L12 13 L21 8 M12 13 V21'
};
/* węzły: id, kategoria, ikona, pozycja, podpis, położenie podpisu */
var NODES=DATA.nodes;
var STEPS=DATA.steps;
var EMO={derrick:'🛢️',gate:'🚢',pump:'⛽',shop:'🛒',bank:'🏦',worker:'👛',debt:'⛰️',tree:'📈',sun:'☀️',west:'🌦️',ukraine:'🛡️',usa:'🦅',china:'🐉'};
var Q=['Wszystko zaczyna się od baryłki.','Jedne wąskie drzwi i mnóstwo tankowców.','Tu ropa spotyka Twój portfel.','Koszyk zakupowy wie pierwszy.','Bank trzyma rękę na pokrętle.','Pensja goni ceny, na razie z lekką przewagą.','Rachunek państwa to osobna historia.','Giełda żyje własnym życiem.','Cała gospodarka w jednym wskaźniku.','Kiedy sąsiedzi za Odrą kichają, my słuchamy uważnie.','Sąsiad, o którym warto wiedzieć wszystko.','Daleko za oceanem, ale blisko w sprawach bezpieczeństwa.','Daleki wschód, krótka dostawa.'];
var NS='http://www.w3.org/2000/svg';
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
var byId={};STEPS.forEach(function(s,i){byId[s.id]=i;});

/* węzły na mapie */
var host=document.getElementById('nodes');
NODES.forEach(function(n){
  var g=el('g',{'class':'node '+n.cat,id:'n-'+n.id,tabindex:'0',role:'button','aria-label':STEPS[byId[n.id]].t+', krok '+(byId[n.id]+1),transform:'translate('+n.x+' '+n.y+')'},host);
  el('rect',{'class':'ring',x:-36,y:-36,width:72,height:72,rx:24},g);
  var pp=el('g',{'class':'pop'},g);
  var tl=el('rect',{'class':'tile',x:-32,y:-32,width:64,height:64,rx:22},pp);tl.setAttribute('fill','url(#g-'+n.cat+')');
  var us=el('use',{x:-27,y:-27,width:54,height:54},pp);us.setAttribute('href','#i-'+n.id);
  el('circle',{'class':'bn',cx:24,cy:-24,r:11},g);var bt=el('text',{'class':'bt',x:24,y:-19.5},g);bt.textContent=byId[n.id]+1;
  var w=n.lb.length*8+24,lx,ly,tx;
  if(n.lp==='r'){lx=38;ly=-14;}else if(n.lp==='l'){lx=-38-w;ly=-14;}else if(n.lp==='t'){lx=-w/2;ly=-62;}else{lx=-w/2;ly=36;}
  var lb=el('g',{'class':'lb',transform:'translate('+lx+' '+ly+')'},g);
  el('rect',{'class':'lbbg',x:0,y:0,width:w,height:26,rx:13},lb);var t=el('text',{'class':'lbt',x:11,y:19},lb);t.textContent=n.lb;
});
/* podpis Polski */
(function(){var g=el('g',{'class':'node',style:'pointer-events:none'},document.getElementById('sv'));})();

/* lista kroków */
var steps=document.getElementById('steps');
var groups=[['Energia','oil'],['Łańcuch cen','chain'],['Osobne wskaźniki','ind'],['Otoczenie','ext']];
groups.forEach(function(gr){
  var h=document.createElement('h3');h.textContent=gr[0];steps.appendChild(h);
  var ol=document.createElement('ol');
  STEPS.forEach(function(s,i){if(s.cat!==gr[1])return;var li=document.createElement('li');var b=document.createElement('button');b.type='button';b.className='step '+s.cat;b.id='st-'+s.id;b.innerHTML='<b>'+(i+1)+'</b>'+s.t;b.addEventListener('click',function(){stop();show(i);});li.appendChild(b);ol.appendChild(li);});
  steps.appendChild(ol);
});

/* panel */
var cur=-1;
function show(i,scroll){
  cur=i;var s=STEPS[i];
  var tg=document.getElementById('tag');tg.textContent=s.tag;tg.className='tag '+s.cat;
  document.getElementById('bt').textContent=s.t;document.getElementById('qp').textContent=Q[i];
  document.getElementById('mn').textContent=s.m;document.getElementById('mc').textContent=s.mc;
  var ul=document.getElementById('fl');ul.innerHTML='';s.f.forEach(function(x){var li=document.createElement('li');li.textContent=x;ul.appendChild(li);});
  document.getElementById('bp').textContent=s.i;
  document.querySelectorAll('.node').forEach(function(n){n.classList.toggle('on',n.id==='n-'+s.id);});
  document.querySelectorAll('.step').forEach(function(b){b.classList.toggle('on',b.id==='st-'+s.id);});
  if(scroll&&window.innerWidth<=1020){document.getElementById('panel').scrollIntoView({behavior:'smooth',block:'start'});}
}
document.querySelectorAll('.node').forEach(function(g){
  var id=g.id.slice(2);
  g.addEventListener('click',function(){stop();openModal(byId[id]);});
  g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();stop();openModal(byId[id]);}});
});
function go(d){stop();var i=cur<0?(d>0?0:STEPS.length-1):(cur+d+STEPS.length)%STEPS.length;show(i);}
document.getElementById('prev').addEventListener('click',function(){go(-1);});
document.getElementById('next').addEventListener('click',function(){go(1);});
document.addEventListener('keydown',function(e){if(e.target.closest&&e.target.closest('details'))return;if(e.key==='ArrowRight'){go(1);}else if(e.key==='ArrowLeft'){go(-1);}});
var timer=null,pt=null,btn=document.getElementById('play'),pg=document.getElementById('pg');
var DUR=7000;
function stop(){if(timer){clearInterval(timer);timer=null;}if(pt){cancelAnimationFrame(pt);pt=null;}pg.style.width='0';btn.textContent='Odtwórz';btn.setAttribute('aria-pressed','false');}
function tick(t0){var p=Math.min(1,(performance.now()-t0)/DUR);pg.style.width=(p*100)+'%';if(timer)pt=requestAnimationFrame(function(){tick(t0);});}
function start(){btn.textContent='Zatrzymaj';btn.setAttribute('aria-pressed','true');var i=0;show(0);var t0=performance.now();timer=setInterval(function(){i=(i+1)%STEPS.length;show(i);t0=performance.now();},DUR);pt=requestAnimationFrame(function loop(){var p=Math.min(1,(performance.now()-t0)/DUR);pg.style.width=(p*100)+'%';if(timer)pt=requestAnimationFrame(loop);});}
btn.addEventListener('click',function(){timer?stop():start();});

/* wykresy w oknie szczegółów; ds[i].c: 1 = kolor kategorii, 2 = złoty */
var MS=[1,32,60,91,121,152,182,213,244,274,305],MN=['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis'];
var CH=DATA.charts;
var charts=[];
function cvr(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();}
function fm(v,s){return v==null?'':v.toLocaleString('pl-PL',{minimumFractionDigits:s.dec,maximumFractionDigits:s.dec});}
var VL={id:'vl',afterDatasetsDraw:function(ch){
  var s=ch.options.plugins.vl&&ch.options.plugins.vl.spec;if(!s)return;var ctx=ch.ctx,bar=ch.config.type==='bar',multi=ch.data.datasets.length>1;
  ctx.save();ctx.font='600 11px Geist, system-ui, sans-serif';ctx.fillStyle=cvr('--ink');
  ch.data.datasets.forEach(function(ds,i){var m=ch.getDatasetMeta(i);if(m.hidden)return;
    if(bar){m.data.forEach(function(el,j){var v=ds.data[j];if(v==null)return;ctx.textAlign='center';ctx.textBaseline=v>=0?'bottom':'top';ctx.fillText(fm(v,s)+(s.unit&&!multi?s.unit:''),el.x,el.y+(v>=0?-4:4));});}
    else if(!multi){var k=ds.data.length-1,el=m.data[k],v=typeof ds.data[k]==='object'?ds.data[k].y:ds.data[k];ctx.textAlign='right';ctx.textBaseline='bottom';ctx.fillText(fm(v,s)+(s.unit||''),el.x-2,el.y-6);}
  });ctx.restore();}};
function mdChart(cv,s,cat,into){
  var ink=cvr('--ink'),mut=cvr('--mut'),line=cvr('--line');
  Chart.defaults.font.family='Geist, system-ui, sans-serif';Chart.defaults.font.size=11.5;Chart.defaults.color=mut;
  var cols=[cvr('--'+cat),cvr('--s2'),cvr('--ext')];
  var isLine=s.type==='line'||s.type==='xline',x=s.type==='xline';
  var ds=s.ds.map(function(d,i){var c=cols[d.c-1],o={label:d.n,data:x?s.pts.map(function(p){return {x:p[0],y:p[1],l:p[2]};}):d.d};
    if(isLine){o.borderColor=c;o.backgroundColor=c;o.borderWidth=2.5;o.tension=0;o.stepped=(d.step||s.step)?'before':false;o.pointRadius=4;o.pointBackgroundColor=c;o.pointBorderColor=cvr('--surface');o.pointBorderWidth=2;}
    else{o.backgroundColor=s.sign&&s.ds.length===1?function(q){return q.raw!=null&&q.raw<0?cvr('--s2'):c;}:c;o.borderRadius=6;o.borderSkipped=false;o.maxBarThickness=46;}
    return o;});
  var y={grid:{color:line},border:{display:false},ticks:{color:mut,callback:function(v){return v.toLocaleString('pl-PL')+(s.unit||'');}}};if(s.ymin!=null)y.min=s.ymin;if(s.ymax!=null)y.max=s.ymax;
  var xa={grid:{display:false},border:{color:line},ticks:{color:mut,maxRotation:0,autoSkip:true}};
  if(x)xa={type:'linear',min:1,max:305,grid:{display:false},border:{color:line},ticks:{color:mut,callback:function(v){var i=MS.indexOf(v);return i>=0?MN[i]:'';}},afterBuildTicks:function(a){a.ticks=MS.map(function(v){return {value:v};});}};
  (into||charts).push(new Chart(cv,{type:isLine?'line':'bar',data:{labels:x?undefined:s.labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,animation:false,layout:{padding:{top:20,right:12}},
    interaction:{mode:x?'nearest':'index',intersect:false},
    plugins:{legend:{display:s.ds.length>1,position:'top',align:'start',labels:{color:ink,usePointStyle:true,pointStyle:'rectRounded',boxWidth:9,boxHeight:9}},
      tooltip:{callbacks:{title:function(it){var r=it[0].raw;return r&&r.l?r.l:it[0].label;},label:function(c){var v=c.raw&&typeof c.raw==='object'?c.raw.y:c.raw;return ' '+c.dataset.label+': '+fm(v,s)+(s.unit||'');}}},vl:{spec:s}},
    scales:{x:xa,y:y}},plugins:[VL]}));
}
var md=document.getElementById('md'),mi=0;
function chartTable(s){var h='<table><tr><th></th>'+s.ds.map(function(d){return '<th>'+d.n+'</th>';}).join('')+'</tr>';
  (s.type==='xline'?s.pts.map(function(p){return p[2];}):s.labels).forEach(function(l,i){h+='<tr><td>'+l+'</td>'+s.ds.map(function(d){var v=s.type==='xline'?s.pts[i][1]:d.d[i];return '<td>'+fm(v,s)+(s.unit||'')+'</td>';}).join('')+'</tr>';});return h+'</table>';}
function openModal(i){
  mi=i;var s=STEPS[i];
  charts.forEach(function(c){c.destroy();});charts=[];
  var tg=document.getElementById('mtag');tg.textContent=s.tag;tg.className='tag '+s.cat;
  document.getElementById('mt-t').textContent=s.t;document.getElementById('mq').textContent=Q[i];
  var big=document.getElementById('mbig');big.className='big node '+s.cat;
  big.innerHTML='<svg viewBox="-38 -38 76 76"><rect x="-34" y="-34" width="68" height="68" rx="24" fill="url(#g-'+s.cat+')" stroke="var(--ink)" stroke-opacity=".75" stroke-width="2"/><use href="#i-'+s.id+'" x="-28" y="-28" width="56" height="56"/></svg>';
  var b=document.getElementById('mbody');b.innerHTML='';
  var top=document.createElement('div');top.className='mgrid';
  var l=document.createElement('div');l.className='sec';l.innerHTML='<div class="metric"><b></b><span></span></div><h3 style="margin-top:14px">Fakty</h3><ul></ul>';
  l.querySelector('b').textContent=s.m;l.querySelector('span').textContent=s.mc;
  s.f.forEach(function(x){var li=document.createElement('li');li.textContent=x;l.querySelector('ul').appendChild(li);});
  var r=document.createElement('div');r.className='interp';r.innerHTML='<h3>Interpretacja</h3><p></p>';r.querySelector('p').textContent=s.i;
  top.appendChild(l);top.appendChild(r);b.appendChild(top);
  var cs=CH[s.id]||[];
  if(cs.length){var h=document.createElement('h3');h.className='sec';h.style.cssText='font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:0';h.textContent='Jak to wyglądało w ostatnich latach';b.appendChild(h);
    var g=document.createElement('div');g.className='chs';b.appendChild(g);
    cs.forEach(function(c,k){var d=document.createElement('div');d.className='ch';d.innerHTML='<h3></h3><div class="sub"></div><div class="cv"><canvas role="img"></canvas></div><div class="nt"></div><details><summary>Pokaż dane</summary></details><div class="nt"></div>';
      var q=d.querySelectorAll('.nt');d.querySelector('h3').textContent=c.t;d.querySelector('.sub').textContent=c.sub;q[0].textContent=c.note;q[1].textContent='Źródło: '+c.src;d.querySelector('details').insertAdjacentHTML('beforeend',chartTable(c));
      d.querySelector('canvas').setAttribute('aria-label',c.t);g.appendChild(d);});
    if(!md.open)md.showModal();
    cs.forEach(function(c,k){mdChart(g.children[k].querySelector('canvas'),c,s.cat==='ext'?'ext':s.cat);});
  }else{var p=document.createElement('p');p.className='foot';p.textContent='Dla tego tematu nie mam w źródłach serii z kilku lat, więc nie pokazuję wykresu zamiast zgadywać.';b.appendChild(p);}
  if(NEWS[s.id])b.appendChild(newsBlock(NEWS[s.id]));
  document.getElementById('mct').textContent=(i+1)+' z '+STEPS.length;
  if(!md.open)md.showModal();
  b.scrollTop=0;show(i);
}
/* nagłówki w oknie szczegółów: pozytywne, neutralne, negatywne (od razu przerysowane) */
var NEWS=DATA.news,NT=[['pos','Pozytywne'],['neu','Neutralne'],['neg','Negatywne, na wesoło']],nsel='pos';
function newsBlock(n){var w=document.createElement('section');w.className='nws';
  w.innerHTML='<h3 class="lab">Nagłówki z ostatnich wiadomości</h3><div class="tabs" role="tablist" aria-label="Rodzaj nagłówków"></div><div class="nwp" role="tabpanel"></div><p class="nt">Przykładowe nagłówki napisane na podstawie danych z tej karty (stan na 28.10.2026). Nie cytujemy żadnej redakcji.</p>';
  var tl=w.querySelector('.tabs'),pn=w.querySelector('.nwp'),bs=[];
  function pick(k){nsel=k;bs.forEach(function(x){x.setAttribute('aria-selected',x.dataset.k===k?'true':'false');x.tabIndex=x.dataset.k===k?0:-1;});
    pn.innerHTML='';pn.className='nwp '+k;pn.setAttribute('aria-label',NT.filter(function(t){return t[0]===k;})[0][1]);
    (n[k]||[]).forEach(function(x){var d=document.createElement('article');d.className='nwi';d.innerHTML='<p class="hl"></p><p class="nf"></p>';
      d.querySelector('.hl').textContent='„'+x.h+'”';var f=d.querySelector('.nf');
      if(x.f)f.textContent='Naprawdę: '+x.f;else if(x.hk)f.textContent='Haczyk uczciwości: '+x.hk;else f.remove();
      pn.appendChild(d);});}
  NT.forEach(function(t){var b=document.createElement('button');b.className='tab';b.type='button';b.setAttribute('role','tab');b.dataset.k=t[0];b.textContent=t[1];
    b.addEventListener('click',function(){pick(t[0]);});tl.appendChild(b);bs.push(b);});
  tl.addEventListener('keydown',function(e){if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;e.stopPropagation();
    var k=NT.map(function(t){return t[0];}),j=(k.indexOf(nsel)+(e.key==='ArrowRight'?1:-1)+k.length)%k.length;pick(k[j]);bs[j].focus();});
  pick(nsel);return w;}
function mdNav(d){openModal((mi+d+STEPS.length)%STEPS.length);}
document.getElementById('mx').addEventListener('click',function(){md.close();});
document.getElementById('mprev').addEventListener('click',function(){mdNav(-1);});
document.getElementById('mnext').addEventListener('click',function(){mdNav(1);});
md.addEventListener('click',function(e){if(e.target===md)md.close();});
md.addEventListener('close',function(){charts.forEach(function(c){c.destroy();});charts=[];});
md.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='ArrowRight'){mdNav(1);}else if(e.key==='ArrowLeft'){mdNav(-1);}});
document.getElementById('more').addEventListener('click',function(){openModal(cur<0?0:cur);});


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
/* z czym zmaga się Polska */
var PL=DATA.problems,plc=null;
function plCharts(){if(plc)return;plc=[];var g=document.getElementById('plch');
  PL.charts.forEach(function(c){var d=document.createElement('div');d.className='ch';d.innerHTML='<h3></h3><div class="sub"></div><div class="cv"><canvas role="img"></canvas></div><div class="nt"></div><details><summary>Pokaż dane</summary></details><div class="nt"><a target="_blank" rel="noopener"></a></div>';
    var q=d.querySelectorAll('.nt');d.querySelector('h3').textContent=c.t;d.querySelector('.sub').textContent=c.sub;q[0].textContent=c.note;
    var a=q[1].querySelector('a');a.href=c.u;a.textContent='Źródło: '+c.src;d.querySelector('details').insertAdjacentHTML('beforeend',chartTable(c));
    d.querySelector('canvas').setAttribute('aria-label',c.t);g.appendChild(d);mdChart(d.querySelector('canvas'),c,'ind',plc);});}
var pls=document.getElementById('pls');
PL.cards.forEach(function(c){var d=document.createElement('article');d.className='card plc';d.innerHTML='<h3></h3><div class="metric"><b></b><span></span></div><ul></ul><p class="src"></p>';
  d.querySelector('h3').textContent=c.t;if(c.m){d.querySelector('.metric b').textContent=c.m;d.querySelector('.metric span').textContent=c.mc;}else d.querySelector('.metric').remove();
  c.f.forEach(function(x){var li=document.createElement('li');li.textContent=x;d.querySelector('ul').appendChild(li);});
  var p=d.querySelector('.src');p.textContent='Źródła: ';c.src.forEach(function(s,i){var a=document.createElement('a');a.href=s.u;a.target='_blank';a.rel='noopener';a.textContent=s.l;if(i)p.appendChild(document.createTextNode(', '));p.appendChild(a);});
  pls.appendChild(d);});
document.getElementById('plint').textContent=PL.interp;
/* tłumacz nagłówków */
var CMP=DATA.headlines;
function nfo(h){var n=(h.match(/\d+/g)||[]).length+(/(jeden|dwa|trzy|cztery|pięć)\b/i.test(h)?1:0);var s=/(według|wg |dane |GUS|NBP|raport|badanie)/i.test(h)?'tak':'brak';var o=/(20\d\d|r\/r|w \w+ rok|miesiąc|kwartał)/i.test(h)?'tak':'brak';return 'Liczby: '+n+' · Źródło: '+s+' · Okres: '+o;}
var cm=document.getElementById('cmps');
CMP.forEach(function(c,i){var d=document.createElement('article');d.className='card cmp';
  d.innerHTML='<div class="w"><span class="lab">Napisano</span><p class="hl"></p><div class="chips"></div><div class="abs"><span class="lab">Podkręćmy to jeszcze bardziej</span><p class="absd"></p><p class="lol"></p></div></div><div class="m"><span class="lab">Naprawdę znaczy</span><ul></ul><p class="it"></p><div class="calm"><span class="lab">Wersja spokojna</span><p></p></div><p class="q"></p><button class="btn cover" type="button">Odkryj, co to znaczy</button></div>';
  d.querySelector('.hl').textContent='„'+c.h+'”';
  var ch=d.querySelector('.chips');c.t.forEach(function(x){var s=document.createElement('span');s.className='chip';s.textContent=x;ch.appendChild(s);});
  var se=document.createElement('span');se.className='chip e';se.textContent='Celuje w: '+c.e;ch.appendChild(se);
  var sn=document.createElement('span');sn.className='chip';sn.textContent=nfo(c.h);ch.appendChild(sn);
  d.querySelector('.absd').textContent='„'+c.abs+'”';d.querySelector('.lol').textContent='Komentarz: '+c.lol;
  c.f.forEach(function(x){var li=document.createElement('li');li.textContent=x;d.querySelector('ul').appendChild(li);});
  d.querySelector('.it').textContent='Interpretacja: '+c.i;d.querySelector('.calm p').textContent=c.calm;d.querySelector('.q').textContent='Pytanie kontrolne: '+c.q;
  d.querySelector('.cover').addEventListener('click',function(){d.classList.add('open');});
  cm.appendChild(d);});
/* koszt emocji */
var COST=DATA.cost;
var cs=document.getElementById('cost');
COST.forEach(function(c){var d=document.createElement('article');d.className='card cc';d.innerHTML='<b></b><span class="cv2"></span><p></p><p class="cav"></p><a target="_blank" rel="noopener"></a>';
  d.querySelector('b').textContent=c.b;d.querySelector('.cv2').textContent=c.v;d.querySelectorAll('p')[0].textContent=c.p;d.querySelector('.cav').textContent='Zastrzeżenie: '+c.c;
  var a=d.querySelector('a');a.href=c.u;a.textContent=c.l;cs.appendChild(d);});
function calc(){var k=+document.getElementById('i1').value,m=+document.getElementById('i2').value,u=+document.getElementById('i3').value;
  document.getElementById('o1').textContent=k;document.getElementById('o2').textContent=m;document.getElementById('o3').textContent=u;
  var h=k*m*365/60,dni=h/24,uz=h*u/100;
  document.getElementById('r1').textContent=Math.round(h).toLocaleString('pl-PL')+' h';
  document.getElementById('r2').textContent='To ok. '+dni.toLocaleString('pl-PL',{maximumFractionDigits:1})+' doby w roku. Z tego na realnie użyteczną wiedzę poszło ok. '+Math.round(uz).toLocaleString('pl-PL')+' h.';
  document.getElementById('r3').textContent=h<20?'Całkiem rozsądnie. Tak trzymać.':h<150?'To mniej więcej weekend urlopu oddany nagłówkom.':'To już prawie tydzień bez snu poświęcony cudzym przynętom. Książka i spacer wyglądają lepiej.';}
['i1','i2','i3'].forEach(function(id){document.getElementById(id).addEventListener('input',calc);});calc();
/* dobre wiadomości */
var GOOD=DATA.good;
var gd=document.getElementById('good');
GOOD.forEach(function(g){var d=document.createElement('article');d.className='card gc';d.innerHTML='<span class="dt"></span><b></b><ul></ul><p class="hk"></p><a target="_blank" rel="noopener"></a>';
  d.querySelector('.dt').textContent=g.d;d.querySelector('b').textContent=g.b;g.f.forEach(function(x){var li=document.createElement('li');li.textContent=x;d.querySelector('ul').appendChild(li);});
  d.querySelector('.hk').textContent='Haczyk uczciwości: '+g.h;var a=d.querySelector('a');a.href=g.u;a.textContent='Źródło: '+g.l;gd.appendChild(d);});
var qb=document.getElementById('quizb');
qb.addEventListener('click',function(){var on=!cm.classList.contains('quiz');cm.classList.toggle('quiz',on);qb.setAttribute('aria-pressed',on?'true':'false');qb.textContent=on?'Pokaż wszystko':'Tryb zgadywania';if(!on)cm.querySelectorAll('.cmp').forEach(function(x){x.classList.remove('open');});});
var TE=DATA.techniques;
var tx=document.getElementById('techs');TE.forEach(function(x){var d=document.createElement('div');d.className='card tc';d.innerHTML='<b></b><p></p><span class="sg"></span>';d.querySelector('b').textContent=x[0];d.querySelector('p').textContent=x[1];d.querySelector('.sg').textContent=x[2];tx.appendChild(d);});
/* skaner */
var RULES=[
 ['Wykrzyknik',function(s){return /!/.test(s);}],
 ['WIELKIE LITERY',function(s){return /\b[A-ZĄĆĘŁŃÓŚŹŻ]{4,}\b/.test(s);}],
 ['Słowa szokowe',function(s){return /(szok|sensacj|skandal|dramat|tragedi|katastrof|apokalips|horror|bomba|eksplod|zalew|tonie|runie|krach|wybuch)/i.test(s);}],
 ['Luka ciekawości',function(s){return /(nie uwierzysz|zaskoczy|zobacz|sprawdź|ten jeden|tego nie|ujawnia|kulisy|prawda o|oto )/i.test(s);}],
 ['Pilność / FOMO',function(s){return /(natychmiast|ostatnia szansa|zdąż|zanim|tylko dziś|nie przegap|wszyscy|teraz)/i.test(s);}],
 ['Anonimowi „eksperci”',function(s){return /(eksperci|ekonomiści|analitycy|specjaliści|lekarze|naukowcy)\b/i.test(s);}],
 ['Zwrot do „Ciebie”',function(s){return /(\btw(ój|oja|oje|oich|oim)\b|\bty\b|\bcię\b|\bciebie\b|zapłacisz|musisz|powinieneś|powinnaś)/i.test(s);}],
 ['Pytanie',function(s){return /\?/.test(s);}],
 ['Brak jakiejkolwiek liczby',function(s){return !/\d/.test(s);}]
];
var sci=document.getElementById('scin');
function scan(){var s=sci.value.trim(),ch=document.getElementById('scchips'),bar=document.getElementById('scbar'),lb=document.getElementById('sclab');ch.innerHTML='';
  if(!s){bar.style.width='0';lb.textContent='Wpisz nagłówek';return;}
  var hit=RULES.filter(function(r){return r[1](s);});
  hit.forEach(function(r){var c=document.createElement('span');c.className='chip e';c.textContent=r[0];ch.appendChild(c);});
  var n=hit.filter(function(r){return r[0]!=='Brak jakiejkolwiek liczby';}).length;
  bar.style.width=Math.min(100,n*20+(n?0:6))+'%';
  lb.textContent=n===0?'Spokojny ton: nie wykryłem znanych wzorców':n<=2?'Lekko podgrzany ('+n+' wzorce)':n<=4?'Podgrzany ('+n+' wzorce)':'Wrzący ('+n+' wzorców)';}
sci.addEventListener('input',scan);

try{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)document.getElementById('sv').pauseAnimations();}catch(e){}
