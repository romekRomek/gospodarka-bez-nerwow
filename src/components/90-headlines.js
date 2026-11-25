/* Komponent: Zakładka Newsy: tłumacz nagłówków i quiz */
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
var qb=document.getElementById('quizb');
qb.addEventListener('click',function(){var on=!cm.classList.contains('quiz');cm.classList.toggle('quiz',on);qb.setAttribute('aria-pressed',on?'true':'false');qb.textContent=on?'Pokaż wszystko':'Tryb zgadywania';if(!on)cm.querySelectorAll('.cmp').forEach(function(x){x.classList.remove('open');});});
