/* Komponent: Pomiary (Analytics). Anonimowe zliczanie odsłon i kliknięć: bez cookies, bez danych osobowych, bez treści wpisywanych przez czytelnika.
   Domyślnie WYŁĄCZONE: ładuje się dopiero, gdy w analytics.json jest kod witryny. Respektuje „Nie śledź” (DNT) i wyłączenie przez #nietrack.
   Zdarzenia zbieramy delegacją kliknięć (bez zmian w innych komponentach); lista i opis: docs/analytics.md. */
(function(){
  var A=DATA.analytics||{},Q=[],MAX=200,ready=false,optout=false;
  try{
    if(location.hash==='#nietrack'||location.hash==='#notrack')localStorage.setItem('gbn-notrack','1');
    optout=localStorage.getItem('gbn-notrack')==='1';
  }catch(e){}
  if(navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.msDoNotTrack==='1')optout=true;
  function send(name){
    if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:'zdarzenie/'+name,title:name,event:true});
  }
  function track(name){
    if(optout||!name)return;
    if(Q.length<MAX)Q.push(name);
    if(ready)send(name);
  }
  window.gbTrack=track;window.__gbq=Q;   /* kolejka widoczna dla testów */
  /* dostawca: GoatCounter (cookieless). Skrypt wczytujemy tylko przy skonfigurowanej witrynie i braku sprzeciwu */
  if(A.provider==='goatcounter'&&/^[a-z0-9-]{1,40}$/.test(A.site||'')&&!optout){
    var s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter','https://'+A.site+'.goatcounter.com/count');
    s.setAttribute('data-goatcounter-settings',JSON.stringify({allow_local:false}));
    s.onload=function(){ready=true;Q.forEach(send);};
    document.head.appendChild(s);
  }
  function slug(t){return (t||'').toLowerCase().replace(/[^a-ząćęłńóśźż0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);}
  document.addEventListener('click',function(e){
    var t=e.target,b;if(!t||!t.closest)return;
    if((b=t.closest('[data-tab]')))return track('zakladka/'+b.dataset.tab);
    if((b=t.closest('#nodes g.node')))return track('wezel/'+b.id.slice(2));
    if(t.closest('.dpmap'))return track('zaleznosci/na-mapie');
    if(t.closest('.dpi'))return track('zaleznosci/przejscie');
    if(t.closest('#more'))return track('wezel/szczegoly');
    if((b=t.closest('#lvl button')))return track('poziom/'+(b.dataset.level==='2'?'wiecej':'podstawy'));
    if(t.closest('#chgb'))return track('okno/zmiany');
    if(t.closest('#mthb,#mthb2'))return track('okno/jak-sprawdzamy');
    if(t.closest('#glsb'))return track('okno/slownik');
    if(t.closest('#privb'))return track('okno/prywatnosc');
    if((b=t.closest('.term')))return track('haslo/'+(b.dataset.t||''));
    if(t.closest('#quizb'))return track('quiz');
    if(t.closest('.hlpg button'))return track('naglowek-dnia/zmiana');
    if((b=t.closest('.fpall')))return track('karuzela/wszystkie/'+slug((b.closest('.fp')||{getAttribute:function(){return '';}}).getAttribute('aria-label')));
    if((b=t.closest('.fpb,.fpb2'))){
      var w=b.closest('.fp'),next=/›|Następny/.test(b.textContent),name=slug(w&&w.getAttribute('aria-label'));
      if(next){track('karuzela/dalej');setTimeout(function(){var c=w&&w.querySelector('.fpc');if(c&&/^(\d+) \/ \1$/.test(c.textContent))track('karuzela/koniec/'+name);},700);}
      return;
    }
    if((b=t.closest('a[href^="http"]'))){
      try{var h=new URL(b.href).hostname;if(h&&h!==location.hostname)track('zrodlo/'+h);}catch(x){}
    }
  },true);
  window.addEventListener('error',function(){track('blad-js');});
})();
