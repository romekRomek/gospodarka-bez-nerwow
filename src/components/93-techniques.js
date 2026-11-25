/* Komponent: Zakładka Newsy: techniki manipulacji */
var TE=DATA.techniques;
var tx=document.getElementById('techs');TE.forEach(function(x){var d=document.createElement('div');d.className='card tc';d.innerHTML='<b></b><p></p><span class="sg"></span>';d.querySelector('b').textContent=x[0];d.querySelector('p').textContent=x[1];d.querySelector('.sg').textContent=x[2];tx.appendChild(d);});
