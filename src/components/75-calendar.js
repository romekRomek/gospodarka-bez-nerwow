/* Komponent: Kalendarz „Najbliższe 30 dni” (CalendarList). Wydarzenia z soon.events (steps.json) z konkretną datą, w kolejności dat;
   pozostałe („połowa grudnia”, „co miesiąc”, „bez terminu”) osobno. Termin czytamy z tego samego pola `when` co w węzłach, źródło z `src` (DATA.evsrc). */
(function(){
  var root=document.getElementById('tab-cal');if(!root)return;
  var YEAR=LAST&&LAST.label?parseInt(LAST.label.slice(-4),10):new Date().getFullYear(),WIN=30;
  var DOW=['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'];
  var MON=['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  var ORDER=['połowa','grudzień','do końca roku','do 2','co tydzień','co miesiąc','co kwartał','bez terminu'];
  function day(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
  function parseWhen(w){var m=/^(\d{1,2})(?:[–-](\d{1,2}))?\.(\d{1,2})(?:\.(\d{4}))?$/.exec(w);if(!m)return null;
    var y=m[4]?+m[4]:YEAR,mo=+m[3]-1;return{start:new Date(y,mo,+m[1]),end:new Date(y,mo,+(m[2]||m[1]))};}
  function collect(){
    var dated={},und=[],seen={};
    STEPS.forEach(function(s){((s.soon&&s.soon.events)||[]).forEach(function(e){
      var p=parseWhen(e.when);
      if(p){var k=e.when+'|'+((e.src&&e.src[0])||e.text),it=dated[k];
        if(!it)it=dated[k]={when:e.when,start:p.start,end:p.end,text:e.text,src:e.src||[],nodes:[]};
        if(it.nodes.indexOf(s.t)<0)it.nodes.push(s.t);
      }else{var u=e.when+'|'+e.text.toLowerCase().replace(/[^a-ząćęłńóśźż0-9]+/g,' ').slice(0,22);if(!seen[u]){seen[u]=1;und.push({when:e.when,text:e.text});}}
    });});
    return{dated:Object.keys(dated).map(function(k){return dated[k];}),und:und};
  }
  function rank(w){for(var i=0;i<ORDER.length;i++)if(w.indexOf(ORDER[i])===0)return i;return ORDER.length;}
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
  function eventEl(it){
    var meta=[];
    if(it.nodes.length)meta.push(h('span',null,'Dotyczy: '+it.nodes.join(', ')));
    it.src.forEach(function(id){var s=(DATA.evsrc||{})[id];if(!s)return;
      meta.push(h('span',null,['Termin: ',h('a',null,s.name,{href:s.url,target:'_blank',rel:'noopener'}),' ('+(s.tier===1?'źródło pierwotne':'źródło wtórne')+')']));});
    if(!it.src.length)meta.push(h('span',null,'Termin bez źródła w rejestrze'));
    return h('div','calev',[h('p',null,it.text),h('div','calmeta',meta.map(function(m,i){return i?[' · ',m]:m;}).reduce(function(a,b){return a.concat(b);},[]))]);
  }
  function render(when){
    var today=day(when instanceof Date?when:(when?new Date(when+'T00:00:00'):(window.GBN_TODAY?new Date(window.GBN_TODAY+'T00:00:00'):new Date())));
    var to=new Date(today.getFullYear(),today.getMonth(),today.getDate()+WIN);
    var c=collect(),inWin=c.dated.filter(function(it){return it.end>=today&&it.start<=to;}).sort(function(a,b){return a.start-b.start||a.end-b.end;});
    var groups=[],gi={};
    inWin.forEach(function(it){var k=it.start.getTime()+'-'+it.end.getTime();if(!gi[k]){gi[k]={first:it,items:[]};groups.push(gi[k]);}gi[k].items.push(it);});
    var kids=[h('div','hello',[h('h2',null,'Najbliższe 30 dni'),h('p',null,'Wydarzenia z datą, które mogą wpłynąć na liczby na tej stronie. Nie przewidujemy, co się wydarzy, pokazujemy tylko kiedy coś się dzieje.')])];
    if(groups.length){
      kids.push(h('div','cal',groups.map(function(g){
        return h('article','card calday',[h('div','calh',[h('h3',null,label(g.first)),h('span','rel',rel(g.first,today))])].concat(g.items.map(eventEl)));})));
    }else{
      kids.push(h('p','card calempty','W naszych danych nie ma wydarzeń z konkretną datą w najbliższych '+WIN+' dniach. Kalendarz uzupełniamy przy każdej aktualizacji danych (ostatnia: '+(LAST?LAST.label:'brak')+').'));
    }
    if(c.und.length){
      c.und.sort(function(a,b){return rank(a.when)-rank(b.when);});
      var dl=h('dl',null,c.und.map(function(u){return[h('dt',null,u.when),h('dd',null,u.text)];}).reduce(function(a,b){return a.concat(b);},[]));
      kids.push(h('section','card calund',[h('h3','cgh','Bez konkretnej daty'),h('p','cgs','Terminy podane z grubsza albo cykliczne. Nie wiemy, który dzień dokładnie.'),dl]));
    }
    root.innerHTML='';var body=h('div','scr-body',kids);root.appendChild(body);termify(body);
  }
  window.calRender=render;
  render();
})();
