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
var NODES=[
 {id:'derrick',cat:'oil',ic:'oil',x:770,y:600,lb:'Ropa',lp:'l'},
 {id:'gate',cat:'oil',ic:'gate',x:862,y:556,lb:'Ormuz',lp:'t'},
 {id:'pump',cat:'chain',ic:'pump',x:745,y:75,lb:'Stacja',lp:'r'},
 {id:'shop',cat:'chain',ic:'shop',x:745,y:185,lb:'Sklep',lp:'r'},
 {id:'bank',cat:'chain',ic:'bank',x:640,y:185,lb:'Bank',lp:'b'},
 {id:'worker',cat:'chain',ic:'wallet',x:745,y:295,lb:'Pensje',lp:'r'},
 {id:'debt',cat:'ind',ic:'debt',x:900,y:305,lb:'Dług',lp:'b'},
 {id:'tree',cat:'ind',ic:'chart',x:900,y:205,lb:'Giełda',lp:'b'},
 {id:'sun',cat:'ind',ic:'sun',x:900,y:105,lb:'PKB',lp:'b'},
 {id:'west',cat:'ext',ic:'cloud',x:322,y:352,lb:'Zachód Europy',lp:'b'},
 {id:'ukraine',cat:'ext',ic:'shield',x:566,y:388,lb:'Ukraina',lp:'b'},
 {id:'usa',cat:'ext',ic:'star',x:72,y:132,lb:'USA',lp:'b'},
 {id:'china',cat:'ext',ic:'box',x:946,y:482,lb:'Chiny',lp:'b'}
];
var STEPS=[
 {id:'derrick',cat:'oil',tag:'Energia',t:'Studnia ropy',m:'114 USD',mc:'Brent, 27.10. Ok. 90% więcej niż na początku roku.',
  f:['Brent kosztuje ok. 114 USD za baryłkę, prawie dwa razy tyle co na początku roku.','Powodem jest wojna wokół Iranu oraz ataki na szlaki i instalacje w regionie.'],
  i:'Dzisiejsza cena zawiera premię za ryzyko wokół Iranu, więc porozumienie mogłoby ją szybko obniżyć, a eskalacja podbić.'},
 {id:'gate',cat:'oil',tag:'Energia',t:'Cieśnina Ormuz',m:'ok. 60%',mc:'normalnego ruchu tankowców przez cieśninę.',
  f:['Prawie cała ropa z Zatoki płynie przez jedną wąską cieśninę.','Liczba ataków na statki w okolicy była w październiku najwyższa od początku rejestrów.'],
  i:'Im dłużej ruch jest ograniczony, tym mniejsza szansa na szybki spadek cen paliw w Polsce.'},
 {id:'pump',cat:'chain',tag:'Łańcuch cen',t:'Stacja paliw',m:'+24%',mc:'ceny paliw r/r (sierpień).',
  f:['Paliwa drożeją najszybciej, bo to pierwsze ogniwo łańcucha ropa → ceny.','Rząd ogranicza maksymalne ceny na stacjach do końca roku (program „Ceny Paliwa Niżej”), a diesel kosztuje ok. 8 zł za litr.','Trasa na mapie jest schematyczna. Polska sprowadza ropę m.in. przez Gdańsk.'],
  i:'Limit cen łagodzi skok na stacjach, ale nie usuwa przyczyny. Po wygaśnięciu programu pod koniec roku ceny mogą wyraźniej odczuć wzrost ropy.'},
 {id:'shop',cat:'chain',tag:'Łańcuch cen',t:'Sklep i ceny',m:'4,1%',mc:'inflacja CPI, wrzesień. Cel NBP: 2,5% ±1 pp.',
  f:['Usługi drożeją o 5,6%, towary o 2,5%, a żywność tanieje o 0,9% (sierpień).','Paliwa podbiły wrześniowy odczyt.'],
  i:'Skoro usługi drożeją szybciej niż towary, inflacja może okazać się trwalsza niż sam szok paliwowy, bo ceny usług wolniej spadają. Banki oczekują 4–5% na przełomie roku.'},
 {id:'bank',cat:'chain',tag:'Łańcuch cen',t:'Bank i stopy procentowe',m:'3,75%',mc:'stopa referencyjna NBP. Fed: 3,75–4,00%, EBC: 2,50%.',
  f:['Fed i EBC podnosiły stopy w tym roku, a NBP trzyma 3,75% od marca.','Realna stopa w Polsce wynosi ok. −0,4 pp. Decyzja RPP zapada 3–4 listopada, a część banków spodziewa się podwyżki w IV kwartale.'],
  i:'Ujemna realna stopa daje RPP argument za podwyżką, ale słabnący konsument i spadające zatrudnienie przemawiają za cierpliwością. Dlatego decyzja nie jest oczywista.'},
 {id:'worker',cat:'chain',tag:'Łańcuch cen',t:'Pensje i portfel',m:'+1,6%',mc:'realny wzrost płac (nominalnie +5,9%).',
  f:['Płace rosną o 5,9%, a ceny o 4,1%.','Bezrobocie rejestrowane wynosi 5,8%, a zatrudnienie w firmach spada o 0,8% r/r.'],
  i:'Jeśli zatrudnienie dalej będzie spadać, a płace rosnąć wolniej niż ceny, konsumpcja może hamować. Sprzedaż detaliczna w sierpniu już zwolniła.'},
 {id:'debt',cat:'ind',tag:'Osobny wskaźnik',t:'Dług publiczny',m:'7,1% PKB',mc:'deficyt sektora finansów publicznych (plan 2026 i 2027).',
  f:['Dług rośnie do ok. 67,6% PKB w 2026 r., a według MFW do ok. 82% w 2031 r.','Obsługa długu kosztuje ok. 90 mld zł rocznie, o 19% więcej niż rok wcześniej.','Ta miara opisuje finanse państwa, a nie ceny ani pensje.'],
  i:'Rentowności powyżej 6% i droższa obsługa długu utrudniają ograniczanie deficytu, bo coraz więcej budżetu idzie na odsetki.'},
 {id:'tree',cat:'ind',tag:'Osobny wskaźnik',t:'Giełda',m:'4 267 pkt',mc:'WIG20, rekord z 21.10. WIG: +29,7% od początku roku (stan na 3.09).',
  f:['Rekord ciągną głównie banki i spółki energetyczne.','Małe spółki (sWIG80) zyskały tylko ok. 5%.','W zebranych danych nie ma bezpośredniego związku z pensjami ani cenami w sklepach.'],
  i:'Rekord WIG20 odzwierciedla oczekiwania co do zysków banków i energetyki, a nie nastroje przeciętnego konsumenta. Wyższe stopy mogą pośrednio sprzyjać zyskom banków.'},
 {id:'sun',cat:'ind',tag:'Osobny wskaźnik',t:'Wzrost gospodarczy (PKB)',m:'+3,9%',mc:'PKB Polski w II kwartale, r/r.',
  f:['Inwestycje rosną o 8,4%, a konsumpcja prywatna o 2,8%.','MFW prognozuje 3,4% w 2026 r. i 2,5% w 2027 r.','PKB mierzy produkcję całej gospodarki, więc to inna miara niż ceny i pensje.'],
  i:'Jeśli energia pozostanie droga, wzrost w Polsce może okazać się niższy niż w prognozach, które powstawały przy tańszej ropie.'},
 {id:'west',cat:'ext',tag:'Otoczenie',t:'Zachód Europy',m:'1,1%',mc:'wzrost strefy euro w 2026 (MFW). Niemcy 1,3%, Francja 0,4%.',
  f:['Inflacja w strefie euro wynosi 3,8% (wrzesień).','EBC podniósł stopy w czerwcu i we wrześniu. Kolejna decyzja zapada 29.10.'],
  i:'Słabszy wzrost strefy euro może ograniczać popyt na polski eksport. To ryzyko dla przemysłu, który ma PMI poniżej 50.'},
 {id:'ukraine',cat:'ext',tag:'Wojna za wschodnią granicą',t:'Ukraina',m:'4,8% PKB',mc:'wydatki obronne Polski w 2026 r. (201 mld zł).',
  f:['Wojna trwa piąty rok. Rozmowy USA–Ukraina–Rosja są planowane na początek listopada w Abu Dhabi.','Pożyczka SAFE z UE wynosi 43,7 mld euro, a rząd szacuje, że ok. 89% zamówień trafi do polskiego przemysłu.','Uchodźcy z Ukrainy wytworzyli w 2025 r. 2,4% polskiego PKB (94 mld zł).','Eksport do Ukrainy wyniósł w 2025 r. ok. 56,9 mld zł.'],
  i:'Zbrojenia i SAFE wspierają inwestycje w 2026 r., ale w 2027 r. impuls będzie słabszy, a deficyt pozostaje wysoki. Uchodźcy łagodzą braki pracowników. To, czy polskie firmy zyskają na odbudowie Ukrainy, jest otwarte.'},
 {id:'usa',cat:'ext',tag:'Otoczenie i wpływy zewnętrzne',t:'USA',m:'10%',mc:'nowe cło USA na towary z UE od 24.07 (bez stali, aluminium i aut).',
  f:['Wyrok Sądu Najwyższego USA z 20.02 unieważnił dotychczasowe cła, a od lipca obowiązuje nowa struktura ceł.','Według PIE ok. 49% polskich eksporterów do USA nie odczuło skutków ceł, a 24% odczuło je bezpośrednio lub pośrednio.','W Polsce stacjonuje ok. 10 tys. żołnierzy USA, a Polska zabiega o stałą bazę.'],
  i:'Bezpośrednio USA kupują niewielką część polskiego eksportu, więc cła uderzają głównie pośrednio, przez Niemcy i podzespoły, zwłaszcza w motoryzacji. Dla Polski ważniejsza jest rola USA w bezpieczeństwie niż w handlu. Wysokie rentowności USA i silny dolar zwiększają presję na złotego i obligacje.'},
 {id:'china',cat:'ext',tag:'Otoczenie i wpływy zewnętrzne',t:'Chiny',m:'nr 1',mc:'dostawca towarów do Polski w lipcu. W ujęciu 12-miesięcznym Niemcy wciąż prowadzą.',
  f:['Import z Chin i Wietnamu to 67 mld euro w 12 miesiącach, z Niemiec 71,4 mld euro.','Import aut z Chin wzrósł z 40 mln euro w 2019 r. do 1,74 mld euro rocznie, czyli ok. 40% wartości aut z Niemiec.','Deficyt obrotów bieżących ma sięgnąć ok. 2% PKB na koniec roku.'],
  i:'Tani import może hamować ceny towarów, ale jest konkurencją dla polskiego przemysłu. Rosnący deficyt handlowy zwiększa zależność od zagranicznego finansowania. Słaby popyt w Chinach może też uderzać pośrednio w niemieckich odbiorców polskich podzespołów.'}
];
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
var CH={
 derrick:[{t:'Ropa Brent w ostatnich latach',sub:'USD za baryłkę. 2021–2024: średnie roczne, ostatni słupek to cena z jednego dnia.',type:'bar',dec:1,labels:['2021','2022','2023','2024','27.10.2026'],ds:[{n:'Brent',d:[70.9,100.9,82.5,80.5,113.9],c:1}],note:'W 2022 r. średnia przekroczyła 100 USD po napaści Rosji na Ukrainę. Roku 2025 nie pokazuję, bo nie sprawdziłem jego średniej w źródle.',src:'Macrotrends/EIA (2021–2024), Reuters i inne (27.10.2026)'}],
 gate:[{t:'Brent w 2026 roku',sub:'USD za baryłkę, punkty z wybranych dni.',type:'xline',dec:1,ymin:50,ymax:130,pts:[[44,67.6,'13.02'],[51,71.8,'20.02'],[68,88.4,'9.03'],[86,112.6,'27.03'],[120,110.5,'30.04'],[193,76.6,'12.07 (ok.)'],[222,86.4,'10.08'],[237,89,'25.08'],[245,95.6,'2.09'],[280,100.2,'7.10'],[296,116.7,'23.10'],[300,113.9,'27.10']],ds:[{n:'Brent',c:1}],note:'W kwietniu cena na krótko przekroczyła 126 USD w trakcie sesji. Najniższe zamknięcie października to 100,2 USD.',src:'Reuters, Trading Economics, Oil & Gas Middle East'}],
 pump:[{t:'Z czego bierze się inflacja',sub:'Sierpień 2026, CPI r/r według grup.',type:'bar',dec:1,unit:'%',sign:true,labels:['Paliwa','Usługi','CPI ogółem','Towary','Żywność'],ds:[{n:'r/r',d:[24.2,5.6,3.4,2.5,-0.9],c:1}],note:'Paliwa to jedyna grupa, która drożeje w tempie dwucyfrowym.',src:'GUS'}],
 shop:[{t:'Inflacja w Polsce, średnio w roku',sub:'CPI. 2026: prognoza MFW z października.',type:'bar',dec:1,unit:'%',labels:['2021','2022','2023','2024','2025','2026 (prog.)'],ds:[{n:'CPI',d:[5.1,14.4,11.4,3.6,3.6,3.2],c:1}],note:'Rok 2022 był rekordowy od 1997 r.',src:'GUS, MFW'},
        {t:'Inflacja a stopa NBP w ostatnim roku',sub:'Miesięcznie, wrzesień 2025 do wrzesień 2026.',type:'line',dec:2,unit:'%',ymin:1,ymax:5,labels:['IX 25','X','XI','XII','I 26','II','III','IV','V','VI','VII','VIII','IX'],ds:[{n:'CPI r/r',d:[2.9,2.8,2.5,2.4,2.1,2.1,3.0,3.2,3.1,2.5,3.0,3.4,4.1],c:1},{n:'Stopa referencyjna',d:[4.75,4.5,4.25,4.0,4.0,4.0,3.75,3.75,3.75,3.75,3.75,3.75,3.75],c:2,step:true}],note:'We wrześniu inflacja po raz pierwszy od dawna przekroczyła stopę NBP.',src:'GUS, NBP'}],
 bank:[{t:'Stopa referencyjna NBP, koniec roku',sub:'Do 28.10.2026.',type:'line',step:true,dec:2,unit:'%',ymin:0,labels:['2020','2021','2022','2023','2024','2025','28.10.26'],ds:[{n:'Stopa',d:[0.10,1.75,6.75,5.75,5.75,4.00,3.75],c:1}],note:'Podwyżki zaczęły się w październiku 2021 r., szczyt 6,75% trwał od września 2022 r., a obniżki w 2025 r. zeszły do 4,00%.',src:'NBP'}],
 worker:[{t:'Płace w firmach a inflacja',sub:'Średnioroczny wzrost przeciętnego wynagrodzenia w sektorze przedsiębiorstw i CPI.',type:'bar',dec:1,unit:'%',labels:['2021','2022','2023','2024','2025'],ds:[{n:'Płace (nominalnie)',d:[8.8,13.0,11.9,11.0,8.1],c:1},{n:'Inflacja CPI',d:[5.1,14.4,11.4,3.6,3.6],c:2}],note:'W 2022 r. ceny rosły szybciej niż pensje, więc realnie pensje spadły. Wzrost za 2024 i 2025 wyliczyłem z podanych przez GUS kwot (8 266 zł i 8 935 zł).',src:'GUS'}],
 debt:[{t:'Dług sektora finansów publicznych',sub:'% PKB (metodologia UE). 2026: notyfikacja EDP.',type:'bar',dec:1,unit:'%',ymin:0,labels:['2022','2023','2024','2025','2026'],ds:[{n:'Dług',d:[48.8,49.5,54.8,59.7,67.6],c:1}],note:'Od 2023 r. Polska notuje jeden z najszybszych wzrostów zadłużenia w UE.',src:'GUS, Eurostat, MF'},
        {t:'Deficyt sektora finansów publicznych',sub:'% PKB. 2026: plan rządu.',type:'bar',dec:1,unit:'%',ymin:0,labels:['2022','2023','2024','2025','2026 (plan)'],ds:[{n:'Deficyt',d:[3.4,5.2,6.4,7.3,7.1],c:2}],note:'Deficyt ponad dwukrotnie wzrósł w ciągu trzech lat.',src:'GUS, MF'}],
 tree:[{t:'WIG20 na koniec roku',sub:'Punkty indeksu. Ostatni słupek: rekord z 21.10.2026.',type:'bar',dec:0,labels:['2020','2021','2022','2023','2024','2025','21.10.26'],ds:[{n:'WIG20',d:[1984,2267,1792,2343,2192,3184,4267],c:1}],note:'Zmiany roczne: 2021 +14,3%, 2022 −21,0%, 2023 +30,8%, 2024 −6,4%, 2025 +45,3%.',src:'GPW, PAP'}],
 sun:[{t:'Wzrost PKB w Polsce',sub:'Realnie, średnio w roku. 2026: prognoza MFW.',type:'bar',dec:1,unit:'%',sign:true,labels:['2021','2022','2023','2024','2025','2026 (prog.)'],ds:[{n:'PKB',d:[6.9,5.3,0.1,3.2,3.8,3.4],c:1}],note:'Rok 2023 był niemal zerowy, bo inflacja ścięła popyt. PKB 2024 i 2025 po rewizji GUS.',src:'GUS, MFW'}],
 west:[{t:'Strefa euro: PKB kwartalnie',sub:'Zmiana k/k.',type:'bar',dec:1,unit:'%',sign:true,labels:['I 25','II 25','III 25','IV 25','I 26','II 26'],ds:[{n:'PKB k/k',d:[0.6,0.1,0.2,0.2,0.0,0.4],c:1}],note:'Odczyt za III kwartał 2026 pojawi się 30.10.',src:'Eurostat'}],
 ukraine:[{t:'Wydatki obronne Polski',sub:'% PKB wg NATO. 2026: plan.',type:'bar',dec:1,unit:'%',ymin:0,labels:['2021','2022','2023','2024','2025','2026 (plan)'],ds:[{n:'Obrona',d:[2.2,2.2,3.3,3.8,4.3,4.8],c:1}],note:'Skok zaczął się po napaści Rosji na Ukrainę w 2022 r. Dziś Polska wydaje najwięcej w NATO w relacji do PKB.',src:'NATO, defence24'}],
 usa:[{t:'Stopy banków centralnych',sub:'Fed (górna granica), NBP (referencyjna) i EBC (depozytowa), koniec kwartału.',type:'line',step:true,dec:2,unit:'%',ymin:1.5,ymax:4.5,labels:['XII 2025','III 2026','VI 2026','IX 2026'],ds:[{n:'Fed',d:[3.75,3.75,3.75,4.00],c:1},{n:'NBP',d:[4.00,3.75,3.75,3.75],c:2},{n:'EBC',d:[2.00,2.00,2.25,2.50],c:3}],note:'Fed podniósł stopy 16.09 po raz pierwszy od lipca 2023.',src:'Fed, EBC, NBP'}],
 china:[{t:'Import towarów z Chin do Polski',sub:'Mld euro.',type:'bar',dec:1,ymin:0,labels:['2024','2025'],ds:[{n:'Import z Chin',d:[51.1,57.9],c:1}],note:'Wzrost o 13,3%, najszybszy spośród dziesięciu największych partnerów.',src:'GUS'},
        {t:'Auta z Chin',sub:'Mld euro. Drugi słupek: 12 miesięcy do maja 2026.',type:'bar',dec:2,ymin:0,labels:['2019','VI 2025–V 2026'],ds:[{n:'Import aut',d:[0.04,1.74],c:1}],note:'Ponad 40 razy więcej niż w 2019 r., choć wciąż ok. 40% wartości aut z Niemiec.',src:'xyz.pl na podstawie GUS'},
        {t:'Chiny: PKB kwartalnie',sub:'Wzrost r/r.',type:'bar',dec:1,unit:'%',ymin:0,labels:['I 25','II 25','III 25','IV 25','I 26','II 26','III 26'],ds:[{n:'PKB',d:[5.4,5.2,4.8,4.5,5.0,4.3,4.5],c:1}],note:'Wzrost napędza eksport, a popyt krajowy jest słaby.',src:'NBS Chin'}]
};
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
function mdChart(cv,s,cat){
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
  charts.push(new Chart(cv,{type:isLine?'line':'bar',data:{labels:x?undefined:s.labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,animation:false,layout:{padding:{top:20,right:12}},
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
  document.getElementById('mct').textContent=(i+1)+' z '+STEPS.length;
  if(!md.open)md.showModal();
  b.scrollTop=0;show(i);
}
function mdNav(d){openModal((mi+d+STEPS.length)%STEPS.length);}
document.getElementById('mx').addEventListener('click',function(){md.close();});
document.getElementById('mprev').addEventListener('click',function(){mdNav(-1);});
document.getElementById('mnext').addEventListener('click',function(){mdNav(1);});
md.addEventListener('click',function(e){if(e.target===md)md.close();});
md.addEventListener('close',function(){charts.forEach(function(c){c.destroy();});charts=[];});
md.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='ArrowRight'){mdNav(1);}else if(e.key==='ArrowLeft'){mdNav(-1);}});
document.getElementById('more').addEventListener('click',function(){openModal(cur<0?0:cur);});


/* zakładki */
var tbs={map:document.getElementById('tb-map'),emo:document.getElementById('tb-emo')};
var lead=document.querySelector('.lead'),leadMap=lead.textContent;
function tab(n){
  document.getElementById('tab-map').hidden=n!=='map';document.getElementById('tab-emo').hidden=n!=='emo';
  for(var k in tbs){tbs[k].setAttribute('aria-selected',k===n?'true':'false');}
  lead.textContent=n==='map'?leadMap:'Nagłówki potrafią sterować tym, co czujesz, zanim zdążysz pomyśleć. Tu zobaczysz, jak to działa, i nauczysz się to widzieć.';
  if(md.open)md.close();
}
tbs.map.addEventListener('click',function(){tab('map');});tbs.emo.addEventListener('click',function(){tab('emo');});
document.querySelector('.tabs').addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var n=document.activeElement===tbs.map?'emo':'map';tab(n);tbs[n].focus();e.stopPropagation();}});
/* tłumacz nagłówków */
var CMP=[
 {h:'SZOK! Ceny paliw eksplodują. Zobacz, ile zapłacisz!',t:['Hiperbola','Luka ciekawości'],e:'Strach',
  f:['Paliwa drożały o 24,2% r/r w sierpniu (GUS), a diesel kosztuje ok. 8 zł za litr.','Rząd ogranicza ceny maksymalne na stacjach do końca roku.'],
  i:'„Eksplodują” opisuje obawę, nie stan obecny. Po wygaśnięciu limitu ceny mogą wzrosnąć, ale nagłówek nie podaje ani kwoty, ani terminu.',
  calm:'Paliwa są droższe o 24,2% r/r, a limit cen obowiązuje do końca roku.',q:'Ile dokładnie i do kiedy?',
  abs:'SZOK!!! Ceny paliw eksplodują, a dystrybutory same chodzą po stacji! Zobacz, ile zapłacisz, zanim ktoś Ci to powie w ostatnim akapicie!',lol:'Eksplozji nie zgłoszono. Stacja stoi tam, gdzie stała, a portfel nadal się zamyka.'},
 {h:'Rekord na giełdzie! Wszyscy zarabiają, a Ty?',t:['Porównanie społeczne','Uogólnienie'],e:'Zazdrość, FOMO',
  f:['WIG20 pobił rekord 21.10 (4 267 pkt), ale ciągną go głównie banki i spółki energetyczne.','Małe spółki (sWIG80) zyskały od początku roku tylko ok. 5%.'],
  i:'„Wszyscy” nie jest prawdą. Rekord jednego indeksu nie mówi, czy zarabia przeciętny inwestor, a tym bardziej czy rosną Twoje pensje.',
  calm:'Indeks WIG20 pobił rekord, głównie dzięki bankom i energetyce. Małe spółki zyskały mniej.',q:'Który indeks i w jakim okresie?',
  abs:'WSZYSCY zarabiają! Nawet Twój kot ma już konto maklerskie, a Ty wciąż czytasz nagłówki!',lol:'Kot nie zgłosił zysków. Indeks rośnie, ale kot zostaje przy karmie.'},
 {h:'Polska tonie w długach. Dzieci będą spłacać to do końca życia',t:['Katastrofizacja','Metafora'],e:'Lęk, poczucie winy',
  f:['Dług sektora finansów publicznych wynosił 59,7% PKB w 2025 r., wobec 54,8% rok wcześniej (GUS). Planowane jest ok. 67,6% w 2026 r.','Średnia UE to ok. 82% PKB. Polska jest poniżej niej, ale zadłuża się szybciej niż większość krajów.'],
  i:'Poziom długu nie jest rekordowy na tle UE, a tempo wzrostu i deficyt (7,3% PKB w 2025) są realnym problemem. „Tonie” i „do końca życia” to obrazy, nie dane.',
  calm:'Dług rośnie szybko (59,7% PKB w 2025 r.), ale wciąż jest poniżej średniej UE. Problemem jest wysoki deficyt.',q:'Jaki poziom i jak szybko rośnie?',
  abs:'Polska tonie w długach, a dzieci Twoich dzieci spłacą je na Marsie, w ratach, z odsetkami od odsetek!',lol:'Na Marsie nie ma jeszcze oddziału banku. Na razie warto pilnować deficytu, a nie kupować skafander.'},
 {h:'Inflacja znów w górę! Twoje oszczędności topnieją',t:['Zwrot do „Ciebie”','Alarmistyczny czasownik'],e:'Strach o pieniądze',
  f:['Inflacja CPI wyniosła 4,1% we wrześniu, wobec 2,1% w lutym.','Towary drożeją o 2,5%, usługi o 5,6%, a żywność tanieje o 0,9% (sierpień).'],
  i:'Oszczędności tracą realnie tylko wtedy, gdy ich oprocentowanie jest niższe niż inflacja. Stopa NBP wynosi 3,75%, więc realnie jest lekko ujemna (ok. −0,4 pp). To zależy od Twojej lokaty, nie od samej inflacji.',
  calm:'Inflacja wynosi 4,1%. Sprawdź, ile procent daje Twoja lokata.',q:'A ile Ty dostajesz na koncie?',
  abs:'Twoje oszczędności topnieją! Skarbonka ma już kałużę pod sobą, a świnka płacze w rogu!',lol:'Skarbonki nie topnieją. Sprawdź oprocentowanie, a świnkę możesz pocieszyć.'},
 {h:'Chińskie towary zalewają Polskę. Co z naszymi miejscami pracy?',t:['Metafora żywiołu','Pytanie retoryczne'],e:'Strach, wrogość',
  f:['Import z Chin wyniósł 57,9 mld euro w 2025 r. (+13,3%), czyli ok. 15,5% polskiego importu. Z Niemiec to ok. 19,1%.','Rośnie też import aut z Chin: z 40 mln euro w 2019 r. do 1,74 mld euro rocznie.'],
  i:'Import rzeczywiście szybko rośnie i to konkurencja dla części przemysłu. Nagłówek nie podaje jednak żadnych danych o miejscach pracy i sugeruje zagrożenie, którego nie mierzy.',
  calm:'Import z Chin rośnie najszybciej spośród największych partnerów, ale Niemcy wciąż mają większy udział.',q:'Jakie dane o zatrudnieniu?',
  abs:'Chińskie towary zalewają Polskę! Fala paczek dotarła już do trzeciego piętra, a listonosz prosi o kapok!',lol:'Statystyki nie zgłaszają powodzi. Zgłaszają wzrost importu o 13%.'},
 {h:'Kto zarabia na wojnie? Odpowiedź Cię zaskoczy',t:['Luka ciekawości','Obietnica sekretu'],e:'Ciekawość, oburzenie',
  f:['Polska planuje na 2026 r. wydatki obronne rzędu 4,8% PKB (201 mld zł).','Z pożyczki SAFE (43,7 mld euro) rząd szacuje, że ok. 89% zamówień trafi do polskiego przemysłu.'],
  i:'Odpowiedź to zwykle przemysł zbrojeniowy i budżet państwa, czyli nic tajemniczego. Nagłówek obiecuje sekret, żeby wymusić kliknięcie.',
  calm:'Wydatki obronne to 4,8% PKB, a większość zamówień z pożyczki SAFE ma trafić do polskich firm (szacunek rządu).',q:'Jaką konkretną odpowiedź obiecuje?',
  abs:'Kto zarabia na tym nagłówku? Odpowiedź Cię zaskoczy: ten, kto go napisał!',lol:'Tajemnica rozwiązana: reklamodawca. Wojna jest zbyt poważna na żarty, więc śmiejemy się z nagłówka.'},
 {h:'Eksperci biją na alarm: stopy w górę!',t:['Anonimowi eksperci','Alarm'],e:'Pilność, niepokój',
  f:['Stopa referencyjna NBP wynosi 3,75% od marca. Decyzja RPP zapada 3–4 listopada.','Część banków spodziewa się podwyżki w IV kwartale, ale nie wszystkie.'],
  i:'„Eksperci” to tu „część analityków”. Podwyżka jest jednym ze scenariuszy, a nie przesądzonym faktem. Hamująca konsumpcja przemawia za cierpliwością.',
  calm:'Stopy bez zmian od marca (3,75%). Decyzja RPP 3–4 listopada, część banków widzi podwyżkę.',q:'Ilu ekspertów i kim są?',
  abs:'Trzej eksperci, jeden stażysta i pan z kiosku biją na alarm! Alarm wyłączono po trzech sekundach, bo przeszkadzał kotu!',lol:'Alarm nie zadzwonił, ale nagłówek tak. Warto policzyć, ilu tych ekspertów.'},
 {h:'Polska rośnie trzy razy szybciej niż strefa euro!',t:['Prawdziwy, ale wybrany fakt','Pozytywny wykrzyknik'],e:'Duma, euforia',
  f:['MFW prognozuje dla Polski 3,4% wzrostu w 2026 r., a dla strefy euro 1,1%.','Deficyt sektora finansów publicznych to ok. 7,1% PKB, a realne pensje rosną o ok. 1,6%.'],
  i:'Liczba jest prawdziwa, ale PKB nie jest tym samym co Twoje zarobki. Nagłówek pomija koszty (deficyt, dług), więc wywołuje dumę bez pełnego obrazu. Manipulacja działa też „na plus”.',
  calm:'Prognozowany wzrost to 3,4% wobec 1,1% w strefie euro. Deficyt jest jednak wysoki (7,1% PKB).',q:'Czego nagłówek nie mówi?',
  abs:'Polska rośnie trzy razy szybciej! Ekonomiści mierzą już linijką, a PKB wyrósł z domu i nie odbiera telefonu!',lol:'Mierzyć warto też to, czego nagłówek nie mierzy: dług i realne pensje.'}
];
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
var COST=[
 {b:'Nastrój po 14 minutach',v:'więcej lęku i smutku',p:'Grupa oglądająca negatywny serwis po 14 minutach była bardziej niespokojna i smutna, a własne zmartwienia widziała jako większe niż grupy oglądające serwis pozytywny lub neutralny.',c:'Eksperyment z trzema grupami z 1997 r., telewizja, nie nagłówki.',u:'https://pubmed.ncbi.nlm.nih.gov/9061893/',l:'Johnston i Davey 1997'},
 {b:'Stres po wielu godzinach newsów',v:'9 razy częściej',p:'Po zamachu w Bostonie osoby, które oglądały relacje po 6 lub więcej godzin dziennie, 9 razy częściej niż oglądające poniżej godziny zgłaszały wysoki ostry stres.',c:'Zależność, nie dowód przyczyny. Zdarzenie ekstremalne, nie clickbait.',u:'https://www.pnas.org/doi/10.1073/pnas.1316265110',l:'Holman i in., PNAS 2014'},
 {b:'Koszt uwagi',v:'dziesiątki minut',p:'Powrót do przerwanego zadania zajmował średnio ok. 23 minut (w badaniu opublikowanym 25 min). Przerywani zgłaszali większy stres, frustrację i wysiłek.',c:'Mała próbka z pracy biurowej. Czas obejmuje też inne zadania, więc to rząd wielkości, nie stała.',u:'https://news.gallup.com/businessjournal/23146/Too-Many-Interruptions-Work.aspx',l:'Gloria Mark, wywiad dla Gallupa'},
 {b:'Doomscrolling',v:'związek, nie dowód',p:'Przeglądy badań łączą kompulsywne czytanie negatywnych treści z lękiem, stresem i objawami depresji.',c:'Dane głównie przekrojowe i z ankiet. Nie wiadomo, co jest przyczyną, a co skutkiem.',u:'https://www.emerald.com/mhdt/article/doi/10.1108/MHDT-10-2025-0068/1338079/The-influence-of-doomscrolling-on-mental-health-a',l:'Przegląd badań (Emerald)'}
];
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
var GOOD=[
 {d:'5 października 2026',b:'Nobel z medycyny za optogenetykę',f:['Nagrodę otrzymali Karl Deisseroth, Peter Hegemann i Georg Nagel za odkrycia dotyczące kanałów jonowych sterowanych światłem i optogenetyki.'],h:'Nagrody Nobla honorują odkrycia sprzed lat. To nie jest nowy lek dostępny od jutra.',u:'https://nobelprize.org/prizes/medicine/2026/summary',l:'nobelprize.org'},
 {d:'2026, dane za 2025 r.',b:'Kolejny rekord odnawialnych źródeł energii',f:['IEA: 2025 był 23. z rzędu rokiem rekordów w przyroście mocy odnawialnych. Słońce dało ponad trzy czwarte nowych mocy.','UE dodała w 2025 r. rekordowe ok. 85 GW, a wiatr na świecie ok. 160 GW. IRENA podaje rekordowe 692 GW odnawialnych mocy na świecie.'],h:'Rekordy nie oznaczają, że to wystarczy. IRENA zaznacza, że potrzebne jest jeszcze szybsze tempo.',u:'https://iea.org/reports/global-energy-review-2026/technology-solar-pv-and-wind',l:'IEA Global Energy Review 2026'},
 {d:'kwiecień i maj 2026',b:'Coraz więcej krajów bez malarii',f:['WHO: 47 krajów ma certyfikat wolnych od malarii, a 37 krajów zgłosiło poniżej 1000 przypadków w 2024 r.','Timor Wschodni odebrał certyfikat 19 maja 2026 r.'],h:'Zgonów z malarii wciąż było 610 tys. w 2024 r., nieco więcej niż rok wcześniej.',u:'https://www.who.int/campaigns/world-malaria-day/2026',l:'WHO'},
 {d:'5 czerwca 2026',b:'Polska gospodarka wytrzymała szok naftowy',f:['Według PIE Komisja Europejska nie obniżyła prognozy dla Polski (3,5%) i była to jedna z trzech takich gospodarek w UE.','Niemcy straciły w tej prognozie 0,6 pkt proc.'],h:'To prognoza z wiosny. Analizy wskazują też presję na finanse publiczne.',u:'https://www.rmf24.pl/fakty/ekonomia/news-dobre-wiesci-ws-polskiej-gospodarki-w-tle-kryzys-na-bliskim-,nId,8089250',l:'RMF24/PAP'},
 {d:'wrzesień i sierpień 2026',b:'Pensje wyprzedzają ceny, a żywność tanieje',f:['Realny wzrost płac wynosi ok. 1,6%, PKB w II kwartale wzrósł o 3,9% r/r.','Ceny żywności spadają o 0,9% r/r (sierpień).'],h:'Inflacja wynosi 4,1%, a zatrudnienie w firmach spada o 0,8% r/r.',u:'https://finwire.pl/artykuly/przecietne-wynagrodzenie-wrzesien-2026-sektor-przedsiebiorstw-gus',l:'finwire, dane GUS'},
 {d:'23 października 2026',b:'Zaplanowane rozmowy USA, Ukrainy i Rosji',f:['Rozmowy pokojowe mają się odbyć na początku listopada w Abu Dhabi. Zgłoszono też lokalne zawieszenie broni.'],h:'Plan rozmów to nie porozumienie. Wynik jest niepewny.',u:'https://www.africanews.com/2026/10/23/russia-ukraine-and-the-us-set-for-november-peace-talks/',l:'Africanews'}
];
var gd=document.getElementById('good');
GOOD.forEach(function(g){var d=document.createElement('article');d.className='card gc';d.innerHTML='<span class="dt"></span><b></b><ul></ul><p class="hk"></p><a target="_blank" rel="noopener"></a>';
  d.querySelector('.dt').textContent=g.d;d.querySelector('b').textContent=g.b;g.f.forEach(function(x){var li=document.createElement('li');li.textContent=x;d.querySelector('ul').appendChild(li);});
  d.querySelector('.hk').textContent='Haczyk uczciwości: '+g.h;var a=d.querySelector('a');a.href=g.u;a.textContent='Źródło: '+g.l;gd.appendChild(d);});
var qb=document.getElementById('quizb');
qb.addEventListener('click',function(){var on=!cm.classList.contains('quiz');cm.classList.toggle('quiz',on);qb.setAttribute('aria-pressed',on?'true':'false');qb.textContent=on?'Pokaż wszystko':'Tryb zgadywania';if(!on)cm.querySelectorAll('.cmp').forEach(function(x){x.classList.remove('open');});});
var TE=[['Luka ciekawości','Nagłówek zostawia pytanie bez odpowiedzi, żebyś kliknął.','„Zobacz”, „odpowiedź Cię zaskoczy”, „ten jeden trik”.'],
 ['Hiperbola','Zwykłe zjawisko opisane jak katastrofa albo cud.','„Eksploduje”, „szok”, „sensacja”.'],
 ['Strach i katastrofizacja','Najgorszy scenariusz podany jak stan obecny.','„Tonie”, „krach”, „koniec”.'],
 ['Oburzenie i „my kontra oni”','Wskazanie winnych wzmacnia emocje i udostępnienia.','„Oni nam to robią”, „kto na tym zarabia”.'],
 ['Pilność i FOMO','Wrażenie, że coś Cię omija albo trzeba działać teraz.','„Wszyscy już wiedzą”, „zanim będzie za późno”.'],
 ['Anonimowe autorytety','Powołanie się na kogoś, kogo nie da się sprawdzić.','„Eksperci biją na alarm”, „naukowcy ostrzegają”.'],
 ['Zwrot do „Ciebie”','Osobisty ton sprawia, że wiadomość wydaje się o Tobie.','„Ile zapłacisz”, „Twoje oszczędności”.'],
 ['Prawdziwy, ale wybrany fakt','Liczba się zgadza, ale pominięto to, co psuje obraz.','„Rośnie 3 razy szybciej”, bez słowa o kosztach.']];
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
