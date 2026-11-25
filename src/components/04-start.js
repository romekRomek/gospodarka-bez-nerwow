/* Komponent: Ekran Start („Dziś w 60 sekund”): kafelki liczb, nagłówek dnia, ramowanie, technika dnia, bilans zmian. Treść z start.json i danych węzłów */
var ST=DATA.start||{};
function statTile(id){
  var s=STEPS[byId[id]],c=CHGM[id];
  var a=h('article','stat',[
    h('header',null,h('span','tl',c?c.t:s.t)),numEl(s.m),h('p','cap-s',s.mc),deltaEl(id),
    s.plain?h('p','plain',s.plain):null,whoEl(s),watchEl(s),
    h('div','ctx',[confEl(id)]),
    h('div','interp lv2',[h('b',null,'Interpretacja'),h('p',null,s.i)]),
    soonEl(s)]);
  termify(a);return a;
}
function headlineCard(){
  var idx=ST.headlines||[],cur=0;
  var items=idx.map(function(k){var x=DATA.headlines[k];
    var it=h('div','hli',[h('h3','hype',x.abs),
      h('div','parody',[h('span',null,'Parodiuje klikbajt'),h('q',null,x.h)]),
      h('div','tags',x.t.map(function(t){return h('span','chip tlo',t);})),
      h('div','hl-b',[h('div','refl',[h('b',null,'Co odzwierciedla'),h('p','emo','Emocja: '+x.e),h('p',null,x.i)]),
        h('div','polu',[h('b',null,'Po ludzku'),h('p',null,x.calm),h('p','pquip',x.lol)])]),
      h('div','hook lv2',[h('b',null,'Dzisiejszy kontekst'),h('p',null,x.f[0])]),
      h('p','askq lv2',[h('b',null,'Zadaj sobie pytanie: '),x.q])]);
    it.hidden=true;termify(it);return it;});
  var cnt=h('span','cnt'),pv=h('button',null,'‹',{type:'button','aria-label':'Poprzedni nagłówek'}),nx=h('button',null,'›',{type:'button','aria-label':'Następny nagłówek'});
  function pick(i){cur=(i+items.length)%items.length;items.forEach(function(e,j){e.hidden=j!==cur;});cnt.textContent=(cur+1)+' / '+items.length;closeTerm(false);}
  pv.addEventListener('click',function(){pick(cur-1);});nx.addEventListener('click',function(){pick(cur+1);});
  var card=h('article','card hld-card',[h('header',null,[h('span','lbl','Nagłówek dnia'),h('div','hlpg',[pv,cnt,nx])])].concat(items,[h('footer',null,h('span','fake','Wymyślony nagłówek i wymyślony klikbajt. Żaden serwis ich nie napisał.'))]));
  card.setAttribute('aria-label','Nagłówek dnia');pick(0);return card;
}
function frameCard(){
  var fr=ST.frames||[];if(!fr.length)return null;
  function ex(f){var bub=function(k,cls){var b=f[k];return h('div','fb '+cls,[h('span','ftone','Wywołuje '+b.emotion),h('p','fh',b.h),h('small',null,'Akcentuje: '+b.accent)]);};
    var e=h('div','fx',[h('div','ftop',h('span','chip tlo',f.topic)),h('div','fpair',[bub('a','a'),bub('b','b')]),
      h('div','ffact',[h('b',null,'Pod spodem ten sam fakt'),h('p',null,f.fact)]),h('div','polu',[h('b',null,'Po ludzku'),h('p',null,f.calm)]),confEl(f.node)]);
    termify(e);return e;}
  var kids=[ex(fr[0])];
  if(fr.length>1)kids.push(h('div','lv2',[h('hr')].concat(fr.slice(1).map(ex))));
  return h('article','card frame',[h('header',null,h('span','lbl','Ta sama liczba, dwa nagłówki'))].concat(kids,[h('footer',null,h('span','fake','Nagłówki wymyślone. Liczby i fakt są prawdziwe.'))]));
}
function techniqueCard(){
  var t=DATA.techniques[ST.technique||0];if(!t)return null;
  var a=h('a','lnk','Zobacz więcej sztuczek →',{href:'#'});
  a.addEventListener('click',function(e){e.preventDefault();tab('emo');var n=document.getElementById('ns2');if(n)n.scrollIntoView({block:'start'});});
  return h('article','card tech',[h('header',null,h('span','lbl','Technika dnia')),h('h3',null,t[0]),h('p',null,t[1]),h('p','ex',t[2]),a]);
}
function balanceEl(){
  if(!LAST||!LAST.changes.length)return null;
  var n={down:0,up:0,flat:0};LAST.changes.forEach(function(c){if(n[c.dir]!=null)n[c.dir]++;});var tot=LAST.changes.length;
  var bar=h('div','balb',['s1:down','s2:up','s3:flat'].map(function(x){var p=x.split(':');var i=h('i',p[0]);i.style.flex=String(n[p[1]]);return i;}),{role:'img','aria-label':n.down+' spadków, '+n.up+' wzrostów, '+n.flat+' bez zmian'});
  return h('div','bal lv2',[h('div','balh',[h('b',null,'Co się zmieniło'),h('span',null,tot+' zmian od ostatniej aktualizacji')]),bar,
    h('div','balk',[h('span',null,[h('b',null,'↓'),' '+n.down+' niżej']),h('span',null,[h('b',null,'↑'),' '+n.up+' wyżej']),h('span',null,[h('b',null,'→'),' '+n.flat+' bez zmian'])])]);
}
function renderStart(){
  var root=document.getElementById('tab-start');if(!root||!ST.hello)return;root.innerHTML='';
  var go=h('button','btn primary wide','Zobacz, jak to się łączy na mapie →',{type:'button'});
  go.addEventListener('click',function(){tab('map');});
  var body=h('div','scr-body',[h('div','hello',[h('h2',null,ST.hello.title),h('p',null,ST.hello.lead)]),
    h('div','tiles',(ST.tiles||[]).map(statTile)),headlineCard(),balanceEl(),h('div','row2',[frameCard(),techniqueCard()]),go]);
  root.appendChild(body);
}
