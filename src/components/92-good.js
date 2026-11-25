/* Komponent: Zakładka Newsy: dobre wiadomości */
/* dobre wiadomości */
var GOOD=DATA.good;
var gd=document.getElementById('good');
GOOD.forEach(function(g){var d=document.createElement('article');d.className='card gc';d.innerHTML='<span class="dt"></span><b></b><ul></ul><p class="hk"></p><a target="_blank" rel="noopener"></a>';
  d.querySelector('.dt').textContent=g.d;d.querySelector('b').textContent=g.b;g.f.forEach(function(x){var li=document.createElement('li');li.textContent=x;d.querySelector('ul').appendChild(li);});
  d.querySelector('.hk').textContent='Haczyk uczciwości: '+g.h;var a=d.querySelector('a');a.href=g.u;a.textContent='Źródło: '+g.l;gd.appendChild(d);});
