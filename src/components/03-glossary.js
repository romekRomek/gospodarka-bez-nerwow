/* Komponent: Glosariusz: klikalne skróty z terms.json (pierwsze wystąpienie w bloku), okienko z definicją (A5) */
var TERMS=DATA.terms||[],TSRC=DATA.termsrc||{},TMAP={},TFORMS=[];
TERMS.forEach(function(t){t.forms.forEach(function(f){TMAP[f]=t;TFORMS.push(f);});});
TFORMS.sort(function(a,b){return b.length-a.length;});
var TRE=TFORMS.length?new RegExp('(^|[^\\p{L}\\p{N}/])('+TFORMS.map(function(f){return f.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');}).join('|')+')(?![\\p{L}\\p{N}/])','u'):null;
/* pomijane: nagłówki, etykiety, chipy, parodie nagłówków, liczby, linki i przyciski */
var TSKIP='h1,h2,h3,h4,.lbl,.tl,.chip,.tag,button,a,b,dt,.hype,.parody,.fh,.ftone,.delta,.term,.tpop,.cl,.num,.when';
var tOpen=null,tSeq=0;
function termify(root){
  if(!TRE||!root)return;var seen={},w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
  while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(function(n){
    if(!n.parentElement||n.parentElement.closest(TSKIP))return;
    var txt=n.nodeValue,re=new RegExp(TRE.source,'gu'),m,last=0,any=false,frag=document.createDocumentFragment();
    while((m=re.exec(txt))){var form=m[2],st=m.index+m[1].length,t=TMAP[form];if(seen[t.id])continue;seen[t.id]=1;any=true;
      frag.appendChild(document.createTextNode(txt.slice(last,st)));
      frag.appendChild(h('button','term',form,{type:'button','aria-expanded':'false','data-t':t.id}));last=st+form.length;}
    if(any){frag.appendChild(document.createTextNode(txt.slice(last)));n.replaceWith(frag);}
  });
}
function closeTerm(refocus){if(!tOpen)return;var b=tOpen.btn;tOpen.pop.remove();b.setAttribute('aria-expanded','false');b.removeAttribute('aria-controls');tOpen=null;if(refocus)b.focus();}
function openTerm(btn){
  var t=TERMS.filter(function(x){return x.id===btn.dataset.t;})[0];if(!t)return;closeTerm(false);
  var id='tp'+(++tSeq),body=[h('b',null,t.name),h('p',null,t.def)];
  (t.src||[]).forEach(function(s){var r=TSRC[s];if(r)body.push(h('p','ctxl',['Źródło: ',h('a',null,r.name,{href:r.url,target:'_blank',rel:'noopener'})]));});
  body.push(h('p','ctxl',t.verified&&t.evidence?'Definicja potwierdzona w źródle ('+t.evidence.checked.split('-').reverse().join('.')+').':'Definicja robocza, jeszcze niepotwierdzona w źródle.'));
  var x=h('button','x','✕',{type:'button','aria-label':'Zamknij definicję'});
  var pop=h('div','tpop',[x].concat(body),{role:'note',id:id});
  var host=btn.closest('p,li,dd')||btn.parentElement;host.insertAdjacentElement('afterend',pop);
  btn.setAttribute('aria-expanded','true');btn.setAttribute('aria-controls',id);tOpen={btn:btn,pop:pop};
  x.addEventListener('click',function(){closeTerm(true);});
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.term');
  if(b){if(tOpen&&tOpen.btn===b)closeTerm(false);else openTerm(b);return;}
  if(tOpen&&!(e.target.closest&&e.target.closest('.tpop')))closeTerm(false);
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&tOpen){e.stopPropagation();closeTerm(true);}},true);
