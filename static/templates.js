/* 100 Indian wedding invite templates = 10 palettes x 10 genuinely different art styles. */
const PALETTES=[
["Gulabi Rose","#fbeef1","#f6dbe3","#5a2236","#8a5a6a","#8c1d40","#c9a24b","#fffafb","#9b1b47","#5e0f2b",0],
["Royal Maroon","#f7efe0","#ecd9b2","#4a1020","#7a4a45","#7a0f2a","#b8892b","#fffaf0","#7a0f2a","#3d0614",0],
["Midnight Navy","#10183a","#1b2554","#f3e7c4","#c9bd98","#e4c370","#e4c370","#18214b","#243070","#0b1130",1],
["Peacock Teal","#e6f4f3","#c3e3e0","#0d3b3f","#3f6d70","#0f6b73","#c2a14a","#f8fdfc","#11787f","#07383d",0],
["Saffron Marigold","#fff4e0","#ffdca8","#5c2a05","#8a5a2a","#d9660d","#c98a1b","#fffaf0","#e8730f","#9a3d00",0],
["Emerald Regal","#e9f5ee","#c5e3d1","#0d3523","#40695a","#0e6b45","#c9a24b","#f8fdfa","#117a4e","#063b25",0],
["Plum Purple","#2a1238","#431d57","#f4e3c2","#cdb98f","#e7c36f","#e7c36f","#361746","#5a2a7a","#1d0a28",1],
["Black & Gold","#16130d","#262015","#f1e2b8","#bfae80","#d9b44a","#d9b44a","#1f1b12","#2c2617","#0c0a06",1],
["Ivory & Gold","#fffdf6","#f4ecd2","#3b3220","#7a6d4f","#a8841f","#c9a24b","#ffffff","#b8923a","#6b5313",0],
["Rani Pink","#fff0f7","#ffd0e6","#5a1038","#94557a","#c2185b","#d4a548","#fffafc","#d81b6b","#7a0a3a",0]
];
const STYLES=[
 {k:"royal",n:"Royal Mahal",glyph:"✨"},{k:"toran",n:"Marigold Toran",glyph:"🌼"},{k:"mandala",n:"Mandala Bloom",glyph:"🌸"},
 {k:"paisley",n:"Paisley Palace",glyph:"🍃"},{k:"lotus",n:"Lotus Pond",glyph:"🪷"},{k:"diya",n:"Diya Night",glyph:"✨"},
 {k:"temple",n:"Temple Gopuram",glyph:"🌺"},{k:"rangoli",n:"Rangoli Utsav",glyph:"🌸"},{k:"peacock",n:"Peacock Plume",glyph:"🪶"},{k:"minimal",n:"Gold Minimal",glyph:"✨"}];
const TEMPLATES=[];
PALETTES.forEach((p,pi)=>STYLES.forEach((s,si)=>TEMPLATES.push({
 id:"t"+(pi*10+si+1),name:p[0]+" · "+s.n,palette:p[0],style:s.n,sk:s.k,glyph:s.glyph,dark:!!p[10],
 v:{"--bg":p[1],"--bg2":p[2],"--ink":p[3],"--soft":p[4],"--accent":p[5],"--gold":p[6],"--card":p[7],"--c1":p[8],"--c2":p[9]}})));
function getTemplate(id){return TEMPLATES.find(t=>t.id===id)||TEMPLATES[0]}
function applyTemplate(t){
 const r=document.documentElement.style;Object.entries(t.v).forEach(([k,v])=>r.setProperty(k,v));
 document.body.classList.toggle("dark",t.dark);
 STYLES.forEach(s=>document.body.classList.remove("st-"+s.k));document.body.classList.add("st-"+t.sk);
}
