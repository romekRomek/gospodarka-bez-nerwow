/* Komponent: Okno szczegółów węzła, nagłówki w oknie (zakładki pos/neu/neg) */
var md=document.getElementById('md'),mi=0;
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
  l.querySelector('b').textContent=s.m;l.querySelector('span').textContent=s.mc;l.querySelector('.metric').insertAdjacentHTML('beforeend',prevHtml(s.id));
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
  w.innerHTML='<h3 class="lab">Nagłówki z ostatnich wiadomości</h3><div class="tabs" role="tablist" aria-label="Rodzaj nagłówków"></div><div class="nwp" role="tabpanel"></div><p class="nt">Przykładowe nagłówki napisane na podstawie danych z tej karty (stan na '+(LAST?LAST.label:'')+'). Nie cytujemy żadnej redakcji.</p>';
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
