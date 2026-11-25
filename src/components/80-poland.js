/* Komponent: Zakładka Polska: wykresy i karty problemów */
/* z czym zmaga się Polska */
var PL=DATA.problems,plc=null;
function plCharts(){if(plc)return;plc=[];var g=document.getElementById('plch');
  PL.charts.forEach(function(c){var d=document.createElement('div');d.className='ch';d.innerHTML='<h3></h3><div class="sub"></div><div class="cv"><canvas role="img"></canvas></div><div class="nt"></div><details><summary>Pokaż dane</summary></details><div class="nt"><a target="_blank" rel="noopener"></a></div>';
    var q=d.querySelectorAll('.nt');d.querySelector('h3').textContent=c.t;d.querySelector('.sub').textContent=c.sub;q[0].textContent=c.note;
    var a=q[1].querySelector('a');a.href=c.u;a.textContent='Źródło: '+c.src;d.querySelector('details').insertAdjacentHTML('beforeend',chartTable(c));
    d.querySelector('canvas').setAttribute('aria-label',c.t);g.appendChild(d);mdChart(d.querySelector('canvas'),c,'ind',plc);});}
var pls=document.getElementById('pls');
PL.cards.forEach(function(c){var d=document.createElement('article');d.className='card plc';d.innerHTML='<h3></h3><div class="metric"><b></b><span></span></div><ul></ul><p class="src"></p>';
  d.querySelector('h3').textContent=c.t;if(c.m){d.querySelector('.metric b').textContent=c.m;d.querySelector('.metric span').textContent=c.mc;}else d.querySelector('.metric').remove();
  c.f.forEach(function(x){var li=document.createElement('li');li.textContent=x;d.querySelector('ul').appendChild(li);});
  var p=d.querySelector('.src');p.textContent='Źródła: ';c.src.forEach(function(s,i){var a=document.createElement('a');a.href=s.u;a.target='_blank';a.rel='noopener';a.textContent=s.l;if(i)p.appendChild(document.createTextNode(', '));p.appendChild(a);});
  pls.appendChild(d);});
document.getElementById('plint').textContent=PL.interp;
