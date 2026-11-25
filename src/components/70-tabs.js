/* Komponent: Nawigacja Start · Mapa · Newsy · Polska (dolny pasek na telefonie, górny na komputerze; próg 760 px kontenera) */
var NAV=[['start','Start','<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>'],
  ['map','Mapa','<path d="M9 5 3.5 7v12L9 17l6 2 5.5-2V5L15 7zM9 5v12M15 7v12"/>'],
  ['cal','Kalendarz','<path d="M5 6h14v13H5zM5 10h14M9 4v3M15 4v3"/>'],
  ['emo','Newsy','<path d="M5 5h11v14H7a2 2 0 0 1-2-2zM16 9h3v8a2 2 0 0 1-2 2M8 9h5M8 12h5M8 15h3"/>'],
  ['pl','Polska','<path d="M4 20V5M4 5h13l-2.5 4L17 13H4"/>']];
var TO=NAV.map(function(n){return n[0];});
['tnav','bnav'].forEach(function(id){var nv=document.getElementById(id);NAV.forEach(function(n){
  var b=h('button','ni',[h('span','navic'),h('span',null,n[1])],{type:'button','data-tab':n[0]});
  b.firstChild.outerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+n[2]+'</svg>';
  b.addEventListener('click',function(){tab(n[0]);});nv.appendChild(b);});});
function tab(n){
  TO.forEach(function(k){document.getElementById('tab-'+k).hidden=k!==n;});
  document.querySelectorAll('[data-tab]').forEach(function(b){var on=b.dataset.tab===n;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  if(n==='pl')plCharts();
  if(md.open)md.close();
  closeTerm(false);sheet(false);
}
document.querySelectorAll('#lvl button').forEach(function(b){b.addEventListener('click',function(){setLevel(+b.dataset.level);});});
