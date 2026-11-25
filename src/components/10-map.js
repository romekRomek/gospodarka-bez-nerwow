/* Komponent: Mapa: węzły na mapie świata i podpis Polski */
/* węzły na mapie */
var host=document.getElementById('nodes');
NODES.forEach(function(n){
  var g=el('g',{'class':'node '+n.cat,id:'n-'+n.id,tabindex:'0',role:'button','aria-label':STEPS[byId[n.id]].t+', krok '+(byId[n.id]+1),transform:'translate('+n.x+' '+n.y+')'},host);
  el('rect',{'class':'ring',x:-36,y:-36,width:72,height:72,rx:24},g);
  var pp=el('g',{'class':'pop'},g);
  var tl=el('rect',{'class':'tile',x:-32,y:-32,width:64,height:64,rx:22},pp);tl.setAttribute('fill','url(#g-'+n.cat+')');
  var us=el('use',{x:-27,y:-27,width:54,height:54},pp);us.setAttribute('href','#i-'+n.id);
  if(CHG[n.id]){el('circle',{'class':'chm',cx:-24,cy:-24,r:7},g);}
  el('circle',{'class':'bn',cx:24,cy:-24,r:11},g);var bt=el('text',{'class':'bt',x:24,y:-19.5},g);bt.textContent=byId[n.id]+1;
  var w=n.lb.length*8+24,lx,ly,tx;
  if(n.lp==='r'){lx=38;ly=-14;}else if(n.lp==='l'){lx=-38-w;ly=-14;}else if(n.lp==='t'){lx=-w/2;ly=-62;}else{lx=-w/2;ly=36;}
  var lb=el('g',{'class':'lb',transform:'translate('+lx+' '+ly+')'},g);
  el('rect',{'class':'lbbg',x:0,y:0,width:w,height:26,rx:13},lb);var t=el('text',{'class':'lbt',x:11,y:19},lb);t.textContent=n.lb;
});
/* podpis Polski */
(function(){var g=el('g',{'class':'node',style:'pointer-events:none'},document.getElementById('sv'));})();
