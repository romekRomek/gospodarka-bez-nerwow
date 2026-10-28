import fs from 'fs';
import {geoConicConformal,geoMercator,geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
const topo=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));const topo110=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json'));const fc110=feature(topo110,topo110.objects.countries);
const fc=feature(topo,topo.objects.countries);
const W=1000,H=900;
const corners={type:'MultiPoint',coordinates:[[-12,10],[62,10],[62,62],[-12,62]]};
const proj=geoConicConformal().parallels([25,55]).rotate([-24,0]).fitExtent([[0,0],[W,H]],corners);
proj.clipExtent([[-5,-5],[W+5,H+5]]);
const path=geoPath(proj).digits(1);
const ME=['Saudi Arabia','Iran','Iraq','Kuwait','Qatar','United Arab Emirates','Oman','Yemen','Bahrain','Jordan','Syria','Israel','Egypt','Lebanon','Palestine','Turkey','Sudan','Eritrea','Djibouti','Ethiopia','Somalia'];
const WEST=['Germany','France','Netherlands','Belgium','Luxembourg','Spain','Portugal','Italy','Switzerland','Austria','Denmark','United Kingdom','Ireland'];
const out={W,H,main:[],cities:{}};
for(const f of fc110.features){
  const n=f.properties.name; const d=path(f); if(!d) continue;
  let c='oth'; if(n==='Poland')c='pl'; else if(WEST.includes(n))c='west'; else if(ME.includes(n))c='me';
  out.main.push({n,c,d});
}
const pts={ukraine:[31.2,49.3],west:[6.2,49.6],ras:[50.1,26.6],hormuz:[56.4,26.55],gdansk:[18.7,54.4],warsaw:[21,52.2],paris:[2.3,48.8],berlin:[13.4,52.5],poland:[19.4,52.1],
 suez:[32.5,30.0],bab:[43.4,12.6],gib:[-5.6,36.0]};
for(const k in pts){const p=proj(pts[k]);out.cities[k]=[+p[0].toFixed(1),+p[1].toFixed(1)];}
// route
const wp=[[50.2,27.0],[52.8,26.9],[56.3,26.6],[58.2,24.9],[60.0,22.6],[58.8,19.5],[55,17.2],[50,14.5],[45,12.4],[43.2,12.8],[41.8,15.2],[39.5,19.5],[36.5,24.5],[34.5,27.5],[32.8,29.6],[32.4,31.4],[29,33.2],[22,34.4],[14,36.2],[10.5,37.6],[5,38.0],[-1,36.9],[-5.6,36.0],[-9.8,36.6],[-10.8,40.5],[-10.2,43.8],[-6,46],[-5,48.6],[-1.5,49.9],[1.8,51.2],[3.4,52.6],[4.6,55.6],[8.2,57.2],[10.7,57.9],[11.6,56.2],[11,55.1],[13,54.9],[15.5,55.0],[17.5,55.0],[18.9,54.7]];
out.route=wp.map(p=>{const q=proj(p);return [+q[0].toFixed(1),+q[1].toFixed(1)];});
out.routeGeo=wp;
// inset: Poland zoom
const R=200; // radius of inset circle in svg px
const ip=geoMercator().center([19.4,52.0]).scale(1900).translate([0,0]);
const ipath=geoPath(ip).digits(1);
const NB=['Germany','Czechia','Slovakia','Ukraine','Belarus','Lithuania','Russia','Latvia','Hungary','Austria','Denmark','Sweden','Romania'];
out.inset=[];
// clip rectangle around
const ipc=geoMercator().center([19.4,52.0]).scale(1900).translate([0,0]).clipExtent([[-215,-215],[215,215]]);
const ipathc=geoPath(ipc).digits(1);
for(const f of fc.features){const n=f.properties.name;const d=ipathc(f);if(!d)continue;out.inset.push({n,c:n==='Poland'?'pl':'oth',d});}
out.insetPts={};
const cit={gdansk:[18.65,54.35],warsaw:[21.0,52.23],lodz:[19.45,51.75],krakow:[19.94,50.06],katowice:[19.0,50.26],wroclaw:[17.04,51.1],poznan:[16.93,52.41],szczecin:[14.55,53.43],lublin:[22.57,51.25],bialystok:[23.17,53.13],rzeszow:[21.99,50.04]};
for(const k in cit){const p=ip(cit[k]);out.insetPts[k]=[+p[0].toFixed(1),+p[1].toFixed(1)];}
out.polandMain=proj([19.4,52.1]).map(v=>+v.toFixed(1));
fs.writeFileSync('geo.json',JSON.stringify(out));
console.log(JSON.stringify(out).length, out.main.length, out.inset.length, out.cities, out.insetPts);
