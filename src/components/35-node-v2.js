/* Komponent: Panel węzła v2: poziomy Podstawy/Więcej, dolny panel na telefonie (L4) */
var pLocal=false;
function syncPanelLevel(){
  var on=LEVEL===2||pLocal;
  ['pv2','pv3'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.toggle('lv2-on',on);});
  document.querySelectorAll('#panel .lv2src').forEach(function(e){e.hidden=!on;});
}
function sheet(on){document.getElementById('side').classList.toggle('open',on);document.body.classList.toggle('sheet-open',on);}
function nodeOpen(i){selectNode(i);}
function renderPanelV2(i){
  var s=STEPS[i],top=document.getElementById('pv2'),bot=document.getElementById('pv3');
  closeTerm(false);pLocal=false;top.innerHTML='';bot.innerHTML='';
  var more=h('button','btn lv1only','Pokaż więcej',{type:'button','aria-label':'Pokaż więcej o tym kroku'});
  more.addEventListener('click',function(){pLocal=true;syncPanelLevel();});
  [deltaEl(s.id),s.plain?h('p','plain',s.plain):null,whoEl(s),watchEl(s),depsEl(s),confEl(s.id),more].forEach(function(e){if(e)top.appendChild(e);});
  [soonEl(s),limitsEl(s),alsoEl(s)].forEach(function(e){if(e)bot.appendChild(e);});
  syncPanelLevel();termify(document.getElementById('panel'));
}
document.getElementById('pclose').addEventListener('click',function(){sheet(false);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isPhone()&&document.getElementById('side').classList.contains('open')&&!md.open&&!document.getElementById('cg').open)sheet(false);});
