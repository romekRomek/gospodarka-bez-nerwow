/* Komponent: „Jak to sprawdzamy”: okno z opisem metody i dziennikiem korekt (ten sam wzorzec okna co dziennik zmian). Treść z method.json */
(function(){
  var M=DATA.method;if(!M)return;
  var dlg=document.getElementById('mth'),body=document.getElementById('mthbody');
  function section(s){
    var items=s.items.map(function(x){return h('li',null,[h('b',null,x.t),h('span',null,x.d)]);});
    return h('section','mths',[h('h3','cgh',s.t),s.lead?h('p','cgs',s.lead):null,h('ul','mthl',items)]);
  }
  function correction(c){
    var link=h('a',null,c.l,{href:c.u,target:'_blank',rel:'noopener'});
    return h('li','mthc',[
      h('span','mthd',c.date+' · '+c.where),
      h('span','mthw',[h('s',null,c.was),h('span',null,' → '),h('b',null,c.is)]),
      h('span','mthy',c.why),
      h('span','mths-src',['Źródło: ',link])]);
  }
  body.appendChild(h('p','cgs',M.intro));
  M.sections.forEach(function(s){body.appendChild(section(s));});
  body.appendChild(h('section','mths',[h('h3','cgh','Dziennik korekt'),h('p','cgs',M.corrections_intro),
    h('ul','mthl mthcl',M.corrections.map(correction))]));
  termify(body);
  document.getElementById('mthb').addEventListener('click',function(){dlg.showModal();body.scrollTop=0;});
  document.getElementById('mthx').addEventListener('click',function(){dlg.close();});
  dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close();});
  dlg.addEventListener('keydown',function(e){e.stopPropagation();});
})();
