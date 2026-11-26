/* Komponent: Wspólne: ikony, dane, dziennik zmian (znaczniki), pomocnik SVG, indeks węzłów */
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
var CL=DATA.changelog||[],LAST=CL[0]||null;
/* dziennik zmian: id węzłów zmienionych w ostatniej aktualizacji oraz „poprzednio” dla dużej liczby węzła */
var CHG={};if(LAST)LAST.changes.forEach(function(c){if(c.id)CHG[c.id]=1;});
function prevFor(id){for(var k=0;k<CL.length-1;k++){var c=CL[k].changes.filter(function(x){return x.id===id&&x.m;})[0];if(c)return {c:c,d:CL[k+1].label.slice(0,5)};}return null;}
function prevHtml(id){var p=prevFor(id);if(!p)return '';var same=p.c.from===p.c.to;return '<span class="prev">'+(same?'Bez zmian':'Poprzednio <b>'+p.c.from+'</b>')+' <em>(stan z '+p.d+')</em></span>';}
var ARR={up:'▲',down:'▼',flat:'='},ARRN={up:'wzrost',down:'spadek',flat:'bez zmiany'};
var EMO={derrick:'🛢️',gate:'🚢',pump:'⛽',shop:'🛒',bank:'🏦',worker:'👛',debt:'⛰️',tree:'📈',sun:'☀️',west:'🌦️',ukraine:'🛡️',usa:'🦅',china:'🐉'};
var Q=['Wszystko zaczyna się od baryłki.','Jedne wąskie drzwi i mnóstwo tankowców.','Tu ropa spotyka Twój portfel.','Koszyk zakupowy wie pierwszy.','Bank trzyma rękę na pokrętle.','Pensja goni ceny, na razie z lekką przewagą.','Rachunek państwa to osobna historia.','Giełda żyje własnym życiem.','Cała gospodarka w jednym wskaźniku.','Kiedy sąsiedzi za Odrą kichają, my słuchamy uważnie.','Sąsiad, o którym warto wiedzieć wszystko.','Daleko za oceanem, ale blisko w sprawach bezpieczeństwa.','Daleki wschód, krótka dostawa.'];
var NS='http://www.w3.org/2000/svg';
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
var byId={};STEPS.forEach(function(s,i){byId[s.id]=i;});
/* Zamykanie okna dialogowego dotknięciem poza nim. Nie polegamy na e.target===dialog: iOS Safari bywa niewiarygodny przy kliknięciu w ::backdrop,
   więc sprawdzamy położenie punktu względem prostokąta okna (rozpoczęcie i zakończenie dotknięcia poza oknem, żeby nie zamykać przy przeciąganiu zaznaczenia). */
function closeOnOutside(dlg){
  var down=false;
  function out(e){var r=dlg.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;}
  dlg.addEventListener('pointerdown',function(e){down=out(e);});
  dlg.addEventListener('pointerup',function(e){if(down&&out(e)&&dlg.open)dlg.close();down=false;});
  dlg.addEventListener('click',function(e){if(e.target===dlg&&out(e)&&dlg.open)dlg.close();});
  dlg.setAttribute('closedby','any');
}
