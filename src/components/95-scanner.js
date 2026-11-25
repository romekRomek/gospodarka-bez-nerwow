/* Komponent: Zakładka Newsy: skaner nagłówków */
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
