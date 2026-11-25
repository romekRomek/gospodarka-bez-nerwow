/* Komponent: FocusPager („jeden wpis naraz”). Zamienia grupę kart w poziomy pas z przyciąganiem (swipe), przyciskami ‹ ›, licznikiem
   „3 / 8”, widocznym skrajem następnej karty i przełącznikiem „Pokaż wszystkie”. Bez automatycznego przewijania (WCAG 2.2.2), przyciski
   jako alternatywa dla gestu (2.5.1), klawisze ← →. Karty zostają w DOM bez zmian, więc inne komponenty (quiz, skaner) działają jak dotąd. */
(function(){
  var GROUPS=[['#cmps','Co napisano, a co to znaczy: nagłówki'],['#cost','Koszt klikania'],['#good','Dobre wiadomości z ostatnich tygodni'],
    ['#techs','Sztuczki w nagłówkach'],['#tab-emo .facts','Co mówią badania'],['#tab-emo .techs:not(#techs)','Pięć pytań, zanim klikniesz']];
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function mk(box,label){
    var kids=[].slice.call(box.children);if(kids.length<3||box.dataset.fp)return;box.dataset.fp='1';
    var wrap=h('section','fp',null,{role:'group','aria-roledescription':'karuzela','aria-label':label});
    var cnt=h('span','fpc','',{'aria-live':'polite'});
    var prev=h('button','fpb','‹',{type:'button','aria-label':'Poprzedni wpis'}),next=h('button','fpb','›',{type:'button','aria-label':'Następny wpis'});
    var all=h('button','fpall','Pokaż wszystkie '+kids.length,{type:'button','aria-pressed':'false'});
    var dots=h('span','fpd',kids.map(function(){return h('i');}),{'aria-hidden':'true'});
    var head=h('div','fph',[h('div','fpn',[prev,cnt,next]),all]);
    var prev2=h('button','fpb2','‹ Poprzedni',{type:'button','aria-label':'Poprzedni wpis'}),next2=h('button','fpb2','Następny ›',{type:'button','aria-label':'Następny wpis'});
    var bot=h('div','fpbot',[prev2,next2]);
    box.parentNode.insertBefore(wrap,box);wrap.appendChild(head);wrap.appendChild(dots);wrap.appendChild(box);wrap.appendChild(bot);
    box.classList.add('fp-on');box.tabIndex=0;box.setAttribute('role','region');box.setAttribute('aria-label',label+' (strzałki w lewo i w prawo przełączają wpisy)');
    kids.forEach(function(k,i){k.setAttribute('role','group');k.setAttribute('aria-roledescription','wpis');k.setAttribute('aria-label',(i+1)+' z '+kids.length);});
    var cur=0,ro=null;
    kids.forEach(function(k,j){k.addEventListener('click',function(e){if(!box.classList.contains('fp-on')||j===cur)return;e.preventDefault();e.stopPropagation();set(j,true);},true);});
    function active(){return kids[cur];}
    function fit(){if(!box.classList.contains('fp-on')){box.style.height='';return;}box.style.height=active().offsetHeight+'px';}
    function set(i,scroll){
      cur=Math.max(0,Math.min(kids.length-1,i));cnt.textContent=(cur+1)+' / '+kids.length;
      prev.disabled=prev2.disabled=cur===0;next.disabled=next2.disabled=cur===kids.length-1;
      [].forEach.call(dots.children,function(d,j){d.className=j===cur?'on':'';});
      kids.forEach(function(k,j){k.classList.toggle('fp-act',j===cur);});
      if(ro){ro.disconnect();ro.observe(active());}fit();
      if(scroll)box.scrollTo({left:active().offsetLeft-box.offsetLeft,behavior:reduce?'auto':'smooth'});
    }
    var raf=0;
    box.addEventListener('scroll',function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;if(!box.classList.contains('fp-on'))return;
      var x=box.scrollLeft+box.offsetLeft,best=0,bd=1e9;kids.forEach(function(k,j){var d=Math.abs(k.offsetLeft-x);if(d<bd){bd=d;best=j;}});
      if(best!==cur)set(best,false);});});
    function top(){var r=wrap.getBoundingClientRect();if(r.top<0)wrap.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});}
    prev.addEventListener('click',function(){set(cur-1,true);});next.addEventListener('click',function(){set(cur+1,true);});
    prev2.addEventListener('click',function(){set(cur-1,true);top();});next2.addEventListener('click',function(){set(cur+1,true);top();});
    box.addEventListener('keydown',function(e){if(!box.classList.contains('fp-on'))return;
      if(e.key==='ArrowRight'){set(cur+1,true);e.preventDefault();}else if(e.key==='ArrowLeft'){set(cur-1,true);e.preventDefault();}});
    all.addEventListener('click',function(){
      var on=box.classList.toggle('fp-on');all.setAttribute('aria-pressed',String(!on));all.textContent=on?'Pokaż wszystkie '+kids.length:'Wracaj do jednego wpisu';
      [prev,next,cnt,dots,bot].forEach(function(e){e.hidden=!on;});
      if(on){box.tabIndex=0;set(cur,true);}else{box.style.height='';}
    });
    if(window.ResizeObserver)ro=new ResizeObserver(fit);
    set(0,false);
  }
  GROUPS.forEach(function(g){var b=document.querySelector(g[0]);if(b)mk(b,g[1]);});
})();
