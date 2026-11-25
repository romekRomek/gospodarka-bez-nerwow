/* Komponent: Zakładka Newsy: koszt emocji i kalkulator */
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
