/* Komponent: Dziennik zmian: przycisk „Co się zmieniło” i okno */
/* dziennik zmian: przycisk w nagłówku i okno z listą aktualizacji (najnowsza rozwinięta, starsze zwinięte) */
(function(){
  if(!LAST)return;
  var cg=document.getElementById('cg'),body=document.getElementById('cgbody');
  document.getElementById('asof').textContent=LAST.label;
  if(cur<0)document.getElementById('mn').textContent=LAST.label.slice(0,5);
  document.getElementById('chgn').textContent=LAST.changes.length||'';
  if(!LAST.changes.length)document.getElementById('chgn').style.display='none';
  function list(u){
    var ul=document.createElement('ul');ul.className='cgl';
    u.changes.forEach(function(c){
      var li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className='cgi';
      var s=c.id!=null?STEPS[byId[c.id]]:null;
      b.innerHTML='<span class="ar" aria-hidden="true">'+(ARR[c.dir]||'')+'</span><span class="nm"></span><span class="ft"></span><span class="nt"></span>';
      b.querySelector('.nm').textContent=c.t+(s?' · '+s.t:'');
      b.querySelector('.ft').innerHTML='<s></s> → <span></span>';
      b.querySelector('.ft s').textContent=c.from;b.querySelector('.ft span').textContent=c.to;
      b.querySelector('.ft').setAttribute('aria-label',c.from+' → '+c.to+', '+(ARRN[c.dir]||''));
      b.querySelector('.nt').textContent=c.note||'';
      if(s)b.addEventListener('click',function(){cg.close();stop();show(byId[c.id],true);});
      li.appendChild(b);ul.appendChild(li);
    });
    return ul;
  }
  function fill(){
    body.innerHTML='';
    CL.forEach(function(u,k){
      var box;
      if(k===0){box=document.createElement('section');box.style.cssText='display:flex;flex-direction:column;gap:10px';box.innerHTML='<h3 class="cgh"></h3><p class="cgs"></p>';box.querySelector('h3').textContent='Ostatnia aktualizacja: '+u.label;}
      else{box=document.createElement('details');box.className='cgo';box.innerHTML='<summary></summary><p class="cgs" style="margin-top:8px"></p>';box.querySelector('summary').textContent='Aktualizacja z '+u.label+(u.changes.length?' ('+u.changes.length+' zmian)':'');}
      box.querySelector('.cgs').textContent=u.summary||'';
      if(u.changes.length)box.appendChild(list(u));
      body.appendChild(box);
    });
  }
  fill();
  document.getElementById('chgb').addEventListener('click',function(){cg.showModal();body.scrollTop=0;});
  document.getElementById('cgx').addEventListener('click',function(){cg.close();});
  closeOnOutside(cg);
  cg.addEventListener('keydown',function(e){e.stopPropagation();});
})();
