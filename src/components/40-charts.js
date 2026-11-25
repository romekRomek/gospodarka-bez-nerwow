/* Komponent: Wykresy (Chart.js): wtyczka etykiet, mdChart, tabela danych wykresu */
/* wykresy w oknie szczegółów; ds[i].c: 1 = kolor kategorii, 2 = złoty */
var MS=[1,32,60,91,121,152,182,213,244,274,305,335],MN=['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
var CH=DATA.charts;
var charts=[];
function cvr(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();}
function fm(v,s){return v==null?'':v.toLocaleString('pl-PL',{minimumFractionDigits:s.dec,maximumFractionDigits:s.dec});}
var VL={id:'vl',afterDatasetsDraw:function(ch){
  var s=ch.options.plugins.vl&&ch.options.plugins.vl.spec;if(!s)return;var ctx=ch.ctx,bar=ch.config.type==='bar',multi=ch.data.datasets.length>1;
  ctx.save();ctx.font='600 11px Geist, system-ui, sans-serif';ctx.fillStyle=cvr('--ink');
  ch.data.datasets.forEach(function(ds,i){var m=ch.getDatasetMeta(i);if(m.hidden)return;
    if(bar){m.data.forEach(function(el,j){var v=ds.data[j];if(v==null)return;ctx.textAlign='center';ctx.textBaseline=v>=0?'bottom':'top';ctx.fillText(fm(v,s)+(s.unit&&!multi?s.unit:''),el.x,el.y+(v>=0?-4:4));});}
    else if(!multi){var k=ds.data.length-1,el=m.data[k],v=typeof ds.data[k]==='object'?ds.data[k].y:ds.data[k];ctx.textAlign='right';ctx.textBaseline='bottom';ctx.fillText(fm(v,s)+(s.unit||''),el.x-2,el.y-6);}
  });ctx.restore();}};
function mdChart(cv,s,cat,into){
  var ink=cvr('--ink'),mut=cvr('--mut'),line=cvr('--line');
  Chart.defaults.font.family='Geist, system-ui, sans-serif';Chart.defaults.font.size=11.5;Chart.defaults.color=mut;
  var cols=[cvr('--'+cat),cvr('--s2'),cvr('--ext')];
  var isLine=s.type==='line'||s.type==='xline',x=s.type==='xline';
  var ds=s.ds.map(function(d,i){var c=cols[d.c-1],o={label:d.n,data:x?s.pts.map(function(p){return {x:p[0],y:p[1],l:p[2]};}):d.d};
    if(isLine){o.borderColor=c;o.backgroundColor=c;o.borderWidth=2.5;o.tension=0;o.stepped=(d.step||s.step)?'before':false;o.pointRadius=4;o.pointBackgroundColor=c;o.pointBorderColor=cvr('--surface');o.pointBorderWidth=2;}
    else{o.backgroundColor=s.sign&&s.ds.length===1?function(q){return q.raw!=null&&q.raw<0?cvr('--s2'):c;}:c;o.borderRadius=6;o.borderSkipped=false;o.maxBarThickness=46;}
    return o;});
  var y={grid:{color:line},border:{display:false},ticks:{color:mut,callback:function(v){return v.toLocaleString('pl-PL')+(s.unit||'');}}};if(s.ymin!=null)y.min=s.ymin;if(s.ymax!=null)y.max=s.ymax;
  var xa={grid:{display:false},border:{color:line},ticks:{color:mut,maxRotation:0,autoSkip:true}};
  if(x)xa={type:'linear',min:1,max:335,grid:{display:false},border:{color:line},ticks:{color:mut,callback:function(v){var i=MS.indexOf(v);return i>=0?MN[i]:'';}},afterBuildTicks:function(a){a.ticks=MS.map(function(v){return {value:v};});}};
  (into||charts).push(new Chart(cv,{type:isLine?'line':'bar',data:{labels:x?undefined:s.labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,animation:false,layout:{padding:{top:20,right:12}},
    interaction:{mode:x?'nearest':'index',intersect:false},
    plugins:{legend:{display:s.ds.length>1,position:'top',align:'start',labels:{color:ink,usePointStyle:true,pointStyle:'rectRounded',boxWidth:9,boxHeight:9}},
      tooltip:{callbacks:{title:function(it){var r=it[0].raw;return r&&r.l?r.l:it[0].label;},label:function(c){var v=c.raw&&typeof c.raw==='object'?c.raw.y:c.raw;return ' '+c.dataset.label+': '+fm(v,s)+(s.unit||'');}}},vl:{spec:s}},
    scales:{x:xa,y:y}},plugins:[VL]}));
}
function chartTable(s){var h='<table><tr><th></th>'+s.ds.map(function(d){return '<th>'+d.n+'</th>';}).join('')+'</tr>';
  (s.type==='xline'?s.pts.map(function(p){return p[2];}):s.labels).forEach(function(l,i){h+='<tr><td>'+l+'</td>'+s.ds.map(function(d){var v=s.type==='xline'?s.pts[i][1]:d.d[i];return '<td>'+fm(v,s)+(s.unit||'')+'</td>';}).join('')+'</tr>';});return h+'</table>';}
