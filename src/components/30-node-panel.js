/* Komponent: Panel węzła na stronie: show(), nawigacja, odtwarzanie */
/* panel */
var cur=-1;
function show(i,scroll){
  cur=i;var s=STEPS[i];
  var tg=document.getElementById('tag');tg.textContent=s.tag;tg.className='tag '+s.cat;
  document.getElementById('bt').textContent=s.t;document.getElementById('qp').textContent=Q[i];
  document.getElementById('mn').textContent=s.m;document.getElementById('mc').textContent=s.mc;
  var mtp=document.querySelector('#mt .prev');if(mtp)mtp.remove();document.getElementById('mt').insertAdjacentHTML('beforeend',prevHtml(s.id));
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
