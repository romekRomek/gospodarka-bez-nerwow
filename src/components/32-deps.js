/* Komponent: Zależności klikniętego węzła (LinkLayer + DepsBlock). Dane: links.json (tylko krawędzie bezpośrednie, każda z „why” i cytatem w treści węzła).
   Klik węzła: podświetla jego krawędzie na mapie (wychodzące: linia ciągła „wpływa na”, przychodzące: przerywana „zależy od”, grot zawsze przy odbiorcy),
   wygasza pozostałe węzły, a w panelu pokazuje listy „Wpływa na” i „Zależy od” (zasada A2: nie tylko kolor, lista jest odpowiednikiem tekstowym grafiki). */
var LINKS=(DATA.links&&DATA.links.links)||[];
var NPOS={};NODES.forEach(function(n){NPOS[n.id]=n;});
(function(){
  var g=document.getElementById('deps');if(!g)return;
  LINKS.forEach(function(l){
    var a=NPOS[l.from],b=NPOS[l.to];if(!a||!b)return;
    var dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,R=42;
    var x1=a.x+ux*R,y1=a.y+uy*R,x2=b.x-ux*(R+6),y2=b.y-uy*(R+6),off=Math.min(70,d*.16),mx=(x1+x2)/2-uy*off,my=(y1+y2)/2+ux*off;
    el('path',{'class':'dep','data-from':l.from,'data-to':l.to,'marker-end':'url(#arr-dep)',
      d:'M'+x1.toFixed(1)+' '+y1.toFixed(1)+' Q'+mx.toFixed(1)+' '+my.toFixed(1)+' '+x2.toFixed(1)+' '+y2.toFixed(1)},g);
  });
})();
function depsOf(id){return{out:LINKS.filter(function(l){return l.from===id;}),inn:LINKS.filter(function(l){return l.to===id;})};}
function depsClear(){
  document.querySelectorAll('#deps .dep').forEach(function(p){p.classList.remove('on','in');});
  document.querySelectorAll('#nodes .node').forEach(function(n){n.classList.remove('dim','rel');n.removeAttribute('aria-pressed');});
}
function depsRender(i){
  var id=STEPS[i].id,d=depsOf(id),rel={};rel[id]=1;
  d.out.forEach(function(l){rel[l.to]=1;});d.inn.forEach(function(l){rel[l.from]=1;});
  var any=d.out.length+d.inn.length>0;
  document.querySelectorAll('#deps .dep').forEach(function(p){
    var o=p.dataset.from===id,n=p.dataset.to===id;p.classList.toggle('on',o||n);p.classList.toggle('in',n);});
  document.querySelectorAll('#nodes .node').forEach(function(n){var k=n.id.slice(2);
    n.classList.toggle('dim',any&&!rel[k]);n.classList.toggle('rel',any&&!!rel[k]&&k!==id);n.setAttribute('aria-pressed',String(k===id));});
}
function selectNode(i){stop();show(i);if(isPhone())sheet(true);}
/* Powrót do stanu początkowego mapy i panelu (bez zaznaczenia i bez podświetlonych zależności). Migawkę robimy tuż przed pierwszym wyborem węzła. */
var HOME_IDS=['tag','bt','qp','mn','mc','fl','bp'];
function homeSnap(){HOME={};HOME_IDS.forEach(function(id){var e=document.getElementById(id);HOME[id]={h:e.innerHTML,c:e.className};});}
function deselect(){
  if(cur<0&&!document.querySelector('.node.on'))return;
  stop();
  if(HOME)HOME_IDS.forEach(function(id){var e=document.getElementById(id);e.innerHTML=HOME[id].h;e.className=HOME[id].c;});
  var mtp=document.querySelector('#mt .prev');if(mtp)mtp.remove();
  ['pv2','pv3'].forEach(function(id){var e=document.getElementById(id);if(e)e.innerHTML='';});
  closeTerm(false);pLocal=false;syncPanelLevel();
  document.querySelectorAll('.node.on,.step.on').forEach(function(n){n.classList.remove('on');});
  depsClear();cur=-1;sheet(false);
}
/* klik w puste miejsce mapy (nie w węzeł) odznacza; Esc działa tak samo, gdy nie ma otwartego okna */
document.getElementById('map').addEventListener('click',function(e){if(!e.target.closest('.node'))deselect();});
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape'||e.defaultPrevented)return;
  if(document.querySelector('dialog[open]'))return;
  if(cur>=0)deselect();
});
function depsEl(s){
  var d=depsOf(s.id);
  function item(l,dir){var oid=dir==='out'?l.to:l.from,o=STEPS[byId[oid]];
    var b=h('button','dpi',[h('span','dpa',dir==='out'?'→':'←',{'aria-hidden':'true'}),h('b',null,o.t),h('span','dpw',l.why)],{type:'button'});
    b.addEventListener('click',function(){selectNode(byId[oid]);});return h('li',null,b);}
  function list(title,items,dir){return h('div','dpg',[h('h4',null,title),h('ul','dpl',items.map(function(l){return item(l,dir);}))]);}
  var kids=[h('div','alh',[h('b',null,'Zależności')])];
  if(d.out.length)kids.push(list('Wpływa na',d.out,'out'));
  if(d.inn.length)kids.push(list('Zależy od',d.inn,'in'));
  if(!d.out.length&&!d.inn.length)kids.push(h('p','cgs','Dla tego węzła nie mamy jeszcze zapisanych bezpośrednich zależności.'));
  else kids.push(h('p','cgs','Pokazujemy tylko bezpośrednie związki, każdy oparty na treści tego opisu. Strzałka wskazuje, na co zmiana się przenosi.'));
  var mapb=h('button','btn dpmap','Pokaż na mapie',{type:'button'});
  mapb.addEventListener('click',function(){sheet(false);var m=document.getElementById('map');if(m)m.scrollIntoView({block:'center',behavior:'smooth'});});
  if(d.out.length+d.inn.length)kids.push(mapb);
  return h('section','deps',kids);
}
