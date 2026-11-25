/* Komponent: Kalendarz „Najbliższe 30 dni” (CalendarList). Wydarzenia z soon.events (steps.json) z konkretną datą, w kolejności dat,
   z opisem „na co może wpłynąć” (affects) i źródłami terminu oraz mechanizmu (DATA.evsrc). Wydarzenia bez konkretnej daty osobno,
   w czterech rodzajach. Termin czytamy z tego samego pola `when` co w węzłach. */
(function(){
  var root=document.getElementById('tab-cal');if(!root)return;
  var YEAR=LAST&&LAST.label?parseInt(LAST.label.slice(-4),10):new Date().getFullYear(),WIN=30;
  var DOW=['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'];
  var MON=['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  /* rodzaje wydarzeń bez konkretnej daty: [początek pola `when`, tytuł, wyjaśnienie] */
  var KINDS=[['połowa','Wkrótce, termin orientacyjny','Wiemy mniej więcej kiedy, ale nie który dzień.'],['grudzień','Wkrótce, termin orientacyjny','Wiemy mniej więcej kiedy, ale nie który dzień.'],
    ['do ','Trwa teraz, do określonego terminu','Coś obowiązuje albo trwa i ma zapowiedziany koniec.'],
    ['co ','Wraca cyklicznie','Powtarza się co tydzień, miesiąc albo kwartał.'],
    ['bez terminu','Bez terminu','Rozmowy i wydarzenia, o których nie wiemy, kiedy się rozstrzygną.']];
  function kindOf(w){for(var i=0;i<KINDS.length;i++)if(w.indexOf(KINDS[i][0])===0)return KINDS[i];return KINDS[KINDS.length-1];}
  function day(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
  function parseWhen(w){var m=/^(\d{1,2})(?:[–-](\d{1,2}))?\.(\d{1,2})(?:\.(\d{4}))?$/.exec(w);if(!m)return null;
    var y=m[4]?+m[4]:YEAR,mo=+m[3]-1;return{start:new Date(y,mo,+m[1]),end:new Date(y,mo,+(m[2]||m[1]))};}
  function norm(t){return t.toLowerCase().replace(/[^a-ząćęłńóśźż0-9]+/g,' ').trim();}
  function collect(){
    var dated={},und={};
    STEPS.forEach(function(s){((s.soon&&s.soon.events)||[]).forEach(function(e){
      var p=parseWhen(e.when),box=p?dated:und,k=e.when+'|'+(p&&e.src&&e.src[0]?e.src[0]:norm(e.text)),it=box[k];
      if(!it)it=box[k]={when:e.when,text:e.text,src:e.src||[],nodes:[],start:p&&p.start,end:p&&p.end};
      if(!it.affects&&e.affects){it.affects=e.affects;it.affSrc=e.affects_src||[];}
      if(it.nodes.indexOf(s.t)<0)it.nodes.push(s.t);
    });});
    return{dated:Object.keys(dated).map(function(k){return dated[k];}),und:Object.keys(und).map(function(k){return und[k];})};
  }
  function label(it){
    var a=it.start,b=it.end,same=a.getTime()===b.getTime();
    if(same)return DOW[a.getDay()]+', '+a.getDate()+' '+MON[a.getMonth()];
    if(a.getMonth()===b.getMonth())return DOW[a.getDay()]+'–'+DOW[b.getDay()]+', '+a.getDate()+'–'+b.getDate()+' '+MON[a.getMonth()];
    return a.getDate()+' '+MON[a.getMonth()]+' – '+b.getDate()+' '+MON[b.getMonth()];
  }
  function rel(it,today){
    var n=Math.round((it.start-today)/86400000),m=Math.round((it.end-today)/86400000);
    if(n<=0&&m>=0)return n===0?'dziś':'trwa';
    return n===1?'jutro':'za '+n+' dni';
  }
  function srcLink(prefix,id){var s=(DATA.evsrc||{})[id];if(!s)return null;
    return h('span',null,[prefix+': ',h('a',null,s.name,{href:s.url,target:'_blank',rel:'noopener'}),' ('+(s.tier===1?'źródło pierwotne':'źródło wtórne')+')']);}
  function join(list){return list.filter(Boolean).map(function(m,i){return i?[' · ',m]:m;}).reduce(function(a,b){return a.concat(b);},[]);}
  function eventEl(it){
    var meta=[];
    if(it.nodes.length)meta.push(h('span',null,'Dotyczy: '+it.nodes.join(', ')));
    it.src.forEach(function(id){meta.push(srcLink('Termin',id));});
    if(!it.src.length)meta.push(h('span',null,'Termin bez źródła w rejestrze'));
    (it.affSrc||[]).forEach(function(id){meta.push(srcLink('Mechanizm',id));});
    return h('div','calev',[h('p',null,it.text),
      it.affects?h('p','calaff',[h('b',null,'Na co może wpłynąć: '),it.affects]):null,
      h('div','calmeta',join(meta))]);
  }
  function undEl(it){
    return h('li','calu',[h('span','calw',it.when),h('span','calt',it.text),h('span','calmeta','Dotyczy: '+it.nodes.join(', '))]);
  }
  function render(when){
    var today=day(when instanceof Date?when:(when?new Date(when+'T00:00:00'):(window.GBN_TODAY?new Date(window.GBN_TODAY+'T00:00:00'):new Date())));
    var to=new Date(today.getFullYear(),today.getMonth(),today.getDate()+WIN);
    var c=collect(),inWin=c.dated.filter(function(it){return it.end>=today&&it.start<=to;}).sort(function(a,b){return a.start-b.start||a.end-b.end;});
    var groups=[],gi={};
    inWin.forEach(function(it){var k=it.start.getTime()+'-'+it.end.getTime();if(!gi[k]){gi[k]={first:it,items:[]};groups.push(gi[k]);}gi[k].items.push(it);});
    var kids=[h('div','hello',[h('h2',null,'Najbliższe 30 dni'),h('p',null,'Wydarzenia z datą, które mogą wpłynąć na liczby na tej stronie. Przy każdym piszemy, na co może wpłynąć i skąd to wiemy. Nie przewidujemy, co się wydarzy.')])];
    if(groups.length){
      kids.push(h('div','cal',groups.map(function(g){
        return h('article','card calday',[h('div','calh',[h('h3',null,label(g.first)),h('span','rel',rel(g.first,today))])].concat(g.items.map(eventEl)));})));
    }else{
      kids.push(h('p','card calempty','W naszych danych nie ma wydarzeń z konkretną datą w najbliższych '+WIN+' dniach. Kalendarz uzupełniamy przy każdej aktualizacji danych (ostatnia: '+(LAST?LAST.label:'brak')+').'));
    }
    if(c.und.length){
      var by={},order=[];
      c.und.forEach(function(it){var k=kindOf(it.when);if(!by[k[1]]){by[k[1]]={k:k,items:[]};order.push(k[1]);}by[k[1]].items.push(it);});
      var secs=order.map(function(t){var g=by[t];return h('div','calk',[h('h4',null,g.k[1]),h('p','cgs',g.k[2]),h('ul','calul',g.items.map(undEl))]);});
      kids.push(h('section','card calund',[h('h3','cgh','Bez konkretnej daty'),h('p','cgs','Rzeczy, które trwają, wracają cyklicznie albo nie mają ustalonego terminu. Przy każdej widać, czego dotyczy.')].concat(secs)));
    }
    root.innerHTML='';var body=h('div','scr-body',kids);root.appendChild(body);termify(body);
  }
  window.calRender=render;
  render();
})();
