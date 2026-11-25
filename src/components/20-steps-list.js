/* Komponent: Lista kroków pod mapą */
/* lista kroków */
var steps=document.getElementById('steps');
var groups=[['Energia','oil'],['Łańcuch cen','chain'],['Osobne wskaźniki','ind'],['Otoczenie','ext']];
groups.forEach(function(gr){
  var h=document.createElement('h3');h.textContent=gr[0];steps.appendChild(h);
  var ol=document.createElement('ol');
  STEPS.forEach(function(s,i){if(s.cat!==gr[1])return;var li=document.createElement('li');var b=document.createElement('button');b.type='button';b.className='step '+s.cat;b.id='st-'+s.id;b.innerHTML='<b>'+(i+1)+'</b>'+s.t+(CHG[s.id]?'<i class="chd" title="Zmienione w ostatniej aktualizacji"></i>':'');b.addEventListener('click',function(){stop();show(i);if(isPhone())sheet(true);});li.appendChild(b);ol.appendChild(li);});
  steps.appendChild(ol);
});
