/* Komponent: Słownik pojęć (GlossaryDialog): okno ze wszystkimi hasłami z terms.json, wyszukiwarka, status potwierdzenia definicji.
   Wejście: stopka strony. Ten sam wzorzec okna co „Jak to sprawdzamy”. */
(function(){
  var dlg=document.getElementById('gls'),body=document.getElementById('glsbody');if(!dlg||!body)return;
  var list=TERMS.slice().sort(function(a,b){return a.name.localeCompare(b.name,'pl');});
  var ok=list.filter(function(t){return t.verified;}).length;
  var inp=h('input','gsearch',null,{type:'search',placeholder:'Szukaj pojęcia lub skrótu','aria-label':'Szukaj pojęcia lub skrótu',autocomplete:'off'});
  var cnt=h('p','cgs','');var empty=h('p','cgs','Nic nie pasuje. Spróbuj skrótu albo części nazwy.');empty.hidden=true;
  var items=list.map(function(t){
    var meta=[];
    (t.src||[]).forEach(function(s){var r=TSRC[s];if(r)meta.push(h('span',null,['Źródło: ',h('a',null,r.name,{href:r.url,target:'_blank',rel:'noopener'})]));});
    meta.push(h('span',null,t.verified&&t.evidence?'Definicja potwierdzona w źródle ('+t.evidence.checked.split('-').reverse().join('.')+')':'Definicja robocza, jeszcze niepotwierdzona w źródle'));
    var li=h('li','gt',[h('b',null,t.name),h('span','gforms',t.forms.join(', ')),h('span',null,t.def),h('span','glsm',meta.map(function(m,i){return i?[' · ',m]:m;}).reduce(function(a,b){return a.concat(b);},[]))]);
    li.dataset.q=(t.name+' '+t.forms.join(' ')+' '+t.def).toLowerCase();return li;});
  var ul=h('ul','mthl',items);
  function filter(){var q=inp.value.trim().toLowerCase(),n=0;items.forEach(function(li){var show=!q||li.dataset.q.indexOf(q)>=0;li.hidden=!show;if(show)n++;});
    cnt.textContent=q?n+' z '+list.length+' pojęć':list.length+' pojęć, z czego '+ok+' z definicją potwierdzoną w źródle.';empty.hidden=n>0;}
  inp.addEventListener('input',filter);filter();
  body.appendChild(inp);body.appendChild(cnt);body.appendChild(ul);body.appendChild(empty);
  function open(){dlg.showModal();body.scrollTop=0;}
  document.getElementById('glsb').addEventListener('click',open);
  document.getElementById('glsx').addEventListener('click',function(){dlg.close();});
  closeOnOutside(dlg);
  dlg.addEventListener('keydown',function(e){e.stopPropagation();});
  var mb=document.getElementById('mthb2');if(mb)mb.addEventListener('click',function(){document.getElementById('mthb').click();});
})();
