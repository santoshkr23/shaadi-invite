/* 100 Indian wedding invite templates = 20 palettes x 5 styles. Shared by builder + invite page. */
const GANESHA_SVG=`<svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="Ganesha">
<path d="M33 27 L37 11 L44 21 L50 7 L56 21 L63 11 L67 27 Z" fill="currentColor" fill-opacity=".18"/><circle cx="50" cy="18" r="2" fill="currentColor"/>
<ellipse cx="25" cy="48" rx="13" ry="19" fill="currentColor" fill-opacity=".12"/><ellipse cx="75" cy="48" rx="13" ry="19" fill="currentColor" fill-opacity=".12"/>
<ellipse cx="50" cy="47" rx="17" ry="20" fill="currentColor" fill-opacity=".1"/>
<path d="M50 31 L50 40 M46 36 Q50 33 54 36" /><circle cx="43" cy="45" r="1.6" fill="currentColor"/><circle cx="57" cy="45" r="1.6" fill="currentColor"/>
<path d="M50 50 C50 66 51 80 44 85 C37 89 33 80 39 77" stroke-width="6" opacity=".9"/><path d="M58 62 L65 72" stroke-width="3"/>
<path d="M33 66 Q50 98 67 66" opacity=".5"/><path d="M40 92 L60 92" opacity=".5"/></svg>`;
const OM_SVG='<span style="font-size:1em;line-height:1">ॐ</span>';
const LOTUS_SVG='<span style="font-size:1em;line-height:1">🪷</span>';
const PALETTES=[
 ["Gulabi Rose","#fbeef1","#f6dbe3","#5a2236","#8a5a6a","#8c1d40","#c9a24b","#fffafb","#9b1b47","#5e0f2b",0],
 ["Royal Maroon","#f7efe0","#ecd9b2","#4a1020","#7a4a45","#7a0f2a","#b8892b","#fffaf0","#7a0f2a","#3d0614",0],
 ["Midnight Navy","#10183a","#1b2554","#f3e7c4","#c9bd98","#e4c370","#e4c370","#18214b","#243070","#0b1130",1],
 ["Sage Green","#f1f3ea","#dfe6d2","#2f4234","#5f7565","#4d6b52","#b59a5b","#fbfcf7","#5f7d63","#2f4a35",0],
 ["Saffron Marigold","#fff4e0","#ffdca8","#5c2a05","#8a5a2a","#d9660d","#c98a1b","#fffaf0","#e8730f","#9a3d00",0],
 ["Peacock Teal","#e6f4f3","#c3e3e0","#0d3b3f","#3f6d70","#0f6b73","#c2a14a","#f8fdfc","#11787f","#07383d",0],
 ["Ivory & Gold","#fffdf6","#f4ecd2","#3b3220","#7a6d4f","#a8841f","#c9a24b","#ffffff","#b8923a","#6b5313",0],
 ["Lavender Mist","#f4effa","#e1d5f1","#3a2a55","#74648f","#6b46a8","#c4a45a","#fcfaff","#7b57b8","#3e2570",0],
 ["Emerald Regal","#e9f5ee","#c5e3d1","#0d3523","#40695a","#0e6b45","#c9a24b","#f8fdfa","#117a4e","#063b25",0],
 ["Coral Sunset","#fff0ec","#ffd3c7","#5a1f16","#8f5a50","#d6452f","#c9954b","#fffaf8","#e5583f","#9c2b19",0],
 ["Mint Pastel","#eefaf5","#d1efe3","#1f4a3c","#5d8a79","#2e8a6b","#bfa35a","#fbfffd","#46a383","#1f5a45",0],
 ["Burgundy Wine","#f6e9ea","#e6c8cb","#3f0f1c","#7a4750","#6d1226","#c09a47","#fff8f8","#751630","#35070f",0],
 ["Aqua Blue","#eaf6fb","#c9e6f3","#12384f","#4d7a91","#1a79a8","#c4a45a","#fafdff","#2088b8","#0d3d57",0],
 ["Rani Pink","#fff0f7","#ffd0e6","#5a1038","#94557a","#c2185b","#d4a548","#fffafc","#d81b6b","#7a0a3a",0],
 ["Sky Blue","#f0f6ff","#d5e6fb","#1a2f55","#566f9a","#2b62b8","#c4a45a","#fbfdff","#3b74cc","#16336b",0],
 ["Terracotta","#faeee6","#efd0bd","#4a2012","#855d4b","#b5502b","#c4964a","#fffaf6","#c25a30","#6e2a10",0],
 ["Champagne","#faf4ea","#eadcc3","#44382a","#85755f","#9a7b3f","#c9a96a","#fffdf8","#b09050","#6a5428",0],
 ["Plum Purple","#2a1238","#431d57","#f4e3c2","#cdb98f","#e7c36f","#e7c36f","#361746","#5a2a7a","#1d0a28",1],
 ["Forest Olive","#f1f2e4","#dcdfba","#2f3318","#68703f","#5a6a1f","#b79b4a","#fbfcf0","#6b7c27","#323c0e",0],
 ["Black & Gold","#16130d","#262015","#f1e2b8","#bfae80","#d9b44a","#d9b44a","#1f1b12","#2c2617","#0c0a06",1]];
const STYLES=[
 {n:"Floral Arch",glyph:"🌸",shape:"arch",motif:"ganesha"},
 {n:"Om Mandir",glyph:"🪔",shape:"round",motif:"om"},
 {n:"Marigold Bloom",glyph:"🌼",shape:"oval",motif:"ganesha"},
 {n:"Shagun Frame",glyph:"✨",shape:"frame",motif:"ganesha"},
 {n:"Kamal Lotus",glyph:"🪷",shape:"jharokha",motif:"lotus"}];
const TEMPLATES=[];
PALETTES.forEach((p,pi)=>STYLES.forEach((s,si)=>TEMPLATES.push({
 id:"t"+(pi*5+si+1),name:p[0]+" · "+s.n,palette:p[0],style:s.n,glyph:s.glyph,shape:s.shape,motif:s.motif,dark:!!p[10],
 v:{"--bg":p[1],"--bg2":p[2],"--ink":p[3],"--soft":p[4],"--accent":p[5],"--gold":p[6],"--card":p[7],"--c1":p[8],"--c2":p[9]}})));
function getTemplate(id){return TEMPLATES.find(t=>t.id===id)||TEMPLATES[0]}
function motifHTML(t){return t.motif==="ganesha"?GANESHA_SVG:t.motif==="om"?OM_SVG:LOTUS_SVG}
function applyTemplate(t){
 const r=document.documentElement.style;Object.entries(t.v).forEach(([k,v])=>r.setProperty(k,v));
 document.body.classList.toggle("dark",t.dark);
 ["arch","round","oval","frame","jharokha"].forEach(c=>document.body.classList.remove("shape-"+c));
 document.body.classList.add("shape-"+t.shape);
}
