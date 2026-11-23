/* Shared helpers for invite.html and video.html */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PAL=[['#f6b100','#e8590c'],['#8e2de2','#d63384'],['#b0123f','#5e0f2b'],['#1c7c54','#6dbb6d'],['#1971c2','#74c0fc'],['#d6336c','#fcc2d7']];
const EMOJI=[[/haldi/i,'🌼'],[/mehe?ndi/i,'🌿'],[/sangeet/i,'🎶'],[/baraat|pheras|phera|wedding|vivaah/i,'🔥'],[/reception/i,'🥂'],[/pooja|puja|path/i,'🪔'],[/engage|ring/i,'💍'],[/cocktail|party/i,'🍸']];
const emoji=n=>(EMOJI.find(([r])=>r.test(n))||[0,'✨'])[1];
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function petals(theme){
  const w=$('#petals');w.innerHTML='';
  for(let i=0;i<16;i++){const p=document.createElement('div');p.className='petal';p.textContent=theme;
    p.style.left=Math.random()*100+'%';p.style.fontSize=(10+Math.random()*12)+'px';
    p.style.setProperty('--dx',(Math.random()*120-60)+'px');
    p.style.animationDuration=(9+Math.random()*9)+'s';p.style.animationDelay=(-Math.random()*14)+'s';w.appendChild(p);}
}
function fmtDate(iso,t){const [y,m,d]=iso.split('-').map(Number);const dt=new Date(y,m-1,d);return{y,m:MON[m-1],d,dow:DOW[dt.getDay()],dt,t}}
function time12(t){if(!t)return'';const [h,m]=t.split(':').map(Number);return `${(h%12)||12}:${String(m).padStart(2,'0')} ${h<12?'am':'pm'}`}
function tileURL(sk,gold){const g=encodeURIComponent(gold);const wrap=(w,inner)=>`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${w}'>${inner}</svg>")`;
  const dots=wrap(28,`<circle cx='14' cy='14' r='1.5' fill='${g}' fill-opacity='.45'/>`);
  const jaali=wrap(40,`<path d='M20 2 L38 20 L20 38 L2 20Z M20 10 L30 20 L20 30 L10 20Z' fill='none' stroke='${g}' stroke-opacity='.35' stroke-width='1'/>`);
  const floral=wrap(56,`<g fill='${g}' fill-opacity='.3'><circle cx='28' cy='14' r='4'/><circle cx='28' cy='42' r='4'/><circle cx='14' cy='28' r='4'/><circle cx='42' cy='28' r='4'/></g><circle cx='28' cy='28' r='2.5' fill='${g}' fill-opacity='.5'/>`);
  const pais=wrap(70,`<path d='M18 50 C20 28 44 22 50 38 C54 50 40 60 30 56 C22 52 28 42 36 46' fill='none' stroke='${g}' stroke-opacity='.4' stroke-width='1.2'/><circle cx='42' cy='38' r='2' fill='${g}' fill-opacity='.4'/>`);
  return {royal:jaali,toran:dots,mandala:floral,paisley:pais,lotus:'',diya:'',temple:jaali,rangoli:dots,peacock:floral,minimal:''}[sk]||''}
const HA=(st,inner,cls='')=>`<div class="hart ${cls}" style="${st}">${inner}</div>`;
function heroArt(sk){
  const R=[];
  switch(sk){
  case 'royal':R.push(HA('inset:2% 4% 2% 4%;opacity:.95',jharokha()),HA('left:6%;bottom:3%;width:52px',diya()),HA('right:6%;bottom:3%;width:52px',diya()));break;
  case 'toran':R.push(HA('left:0;right:0;top:0;opacity:.98',garland()),HA('left:4%;bottom:3%;width:52px',diya()),HA('right:4%;bottom:3%;width:52px',diya()));break;
  case 'mandala':R.push(HA('left:50%;top:44%;width:min(150vw,820px);margin:calc(min(150vw,820px)/-2) 0 0 calc(min(150vw,820px)/-2);opacity:.38',MANDALA_BIG()));break;
  case 'paisley':R.push(HA('left:-4px;top:-4px;width:min(48vw,210px);opacity:.95',paisleyCorner()),HA('right:-4px;top:-4px;width:min(48vw,210px);transform:scaleX(-1)',paisleyCorner()),HA('left:-4px;bottom:-4px;width:min(48vw,210px);transform:scaleY(-1)',paisleyCorner()),HA('right:-4px;bottom:-4px;width:min(48vw,210px);transform:scale(-1,-1)',paisleyCorner()));break;
  case 'lotus':R.push(HA('left:-10px;bottom:-4px;width:130px',lotus()),HA('left:90px;bottom:-14px;width:96px;opacity:.85',lotus()),HA('right:-10px;bottom:-4px;width:130px;transform:scaleX(-1)',lotus()),HA('right:90px;bottom:-14px;width:96px;opacity:.85',lotus()),HA('right:-60px;top:-60px;width:220px;opacity:.35',MANDALA_SM()),HA('left:-60px;top:-60px;width:220px;opacity:.35',MANDALA_SM()));break;
  case 'diya':R.push(stars(34),HA('left:6%;bottom:5%;width:54px',diya()),HA('left:calc(50% - 36px);bottom:2%;width:72px',diya()),HA('right:6%;bottom:5%;width:54px',diya()),HA('left:50%;top:40%;width:min(130vw,700px);margin:calc(min(130vw,700px)/-2) 0 0 calc(min(130vw,700px)/-2);opacity:.18',MANDALA_BIG()));break;
  case 'temple':R.push(HA('left:50%;bottom:0;width:min(86vw,400px);margin-left:calc(min(86vw,400px)/-2);opacity:.55',gopuram()),HA('left:-30px;top:6%;width:40%;opacity:.25',MANDALA_SM()),HA('right:-30px;top:6%;width:40%;opacity:.25',MANDALA_SM()));break;
  case 'rangoli':R.push(HA('left:50%;bottom:-36vw;width:min(110vw,600px);margin-left:calc(min(110vw,600px)/-2);opacity:.45',mandala([[28,190,18,1],[20,150,24,1],[14,110,26],[10,70,22]],'var(--accent)')),HA('right:-70px;top:-70px;width:230px;opacity:.4',MANDALA_SM()));break;
  case 'peacock':R.push(HA('left:-14px;top:12%;width:92px;transform:rotate(14deg)',peacock()),HA('right:-14px;top:12%;width:92px;transform:scaleX(-1) rotate(14deg)',peacock()),HA('left:-6px;bottom:4%;width:78px;transform:rotate(-8deg)',peacock()),HA('right:-6px;bottom:4%;width:78px;transform:scaleX(-1) rotate(-8deg)',peacock()));break;
  default:R.push(HA('inset:14px;border:1.5px solid var(--gold)',''),HA('inset:22px;border:.8px solid var(--gold);opacity:.7',''),['top:8px;left:8px','top:8px;right:8px','bottom:8px;left:8px','bottom:8px;right:8px'].map(p=>HA(p+';font-size:22px;line-height:1','❖')).join(''))}
  return R.join('')}
function coverHTML(d){const tr=trad(d);return `<div class="cmand">${MANDALA_BIG()}</div><div class="book"><div class="bm">${MANDALA_SM()}</div><div class="sh">${tr.head}</div><div class="gan">${tr.motif()}</div><div class="t">${tr.title}</div><div class="s">A WEDDING INVITATION</div><div class="shine"></div></div><div class="tap">TAP THE BOOK TO OPEN</div>`}


function crescent(){const g=uid('cg');let pts='';for(let i=0;i<10;i++){const r=i%2?9:22,a=-Math.PI/2+i*Math.PI/5;pts+=`${(152+r*Math.cos(a)).toFixed(1)},${(112+r*Math.sin(a)).toFixed(1)} `}
 return `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" stroke="#4a2a08" stroke-width="1.3" stroke-linejoin="round"><defs>${GOLDGRAD(g)}</defs>
<path d="M128 30 A86 86 0 1 0 128 202 A68 68 0 1 1 128 30 Z" fill="url(#${g})"/><polygon points="${pts}" fill="url(#${g})"/>
<path d="M20 230 V196 Q20 168 46 168 Q72 168 72 196 V230 Z M128 230 V190 Q128 160 160 160 Q192 160 192 190 V230 Z" fill="var(--accent)" stroke="#fff6c8" opacity=".95"/>
<path d="M46 150 V168 M160 140 V160" stroke="#fff6c8" stroke-width="2"/><circle cx="46" cy="146" r="4" fill="#fff6c8"/><circle cx="160" cy="136" r="4" fill="#fff6c8"/></svg>`}
function khanda(){const g=uid('kg');
 return `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" stroke="#4a2a08" stroke-width="1.3" stroke-linejoin="round"><defs>${GOLDGRAD(g)}</defs>
<circle cx="100" cy="122" r="50" fill="none" stroke="url(#${g})" stroke-width="9"/><circle cx="100" cy="122" r="38" fill="none" stroke="#fff6c8" stroke-width="1.2" stroke-dasharray="2 4"/>
<path d="M100 14 L113 66 L113 176 L100 206 L87 176 L87 66 Z" fill="url(#${g})"/><path d="M100 24 V196" stroke="#fff6c8" stroke-width="1.4"/>
<g id="${g}k"><path d="M54 200 C14 176 8 100 52 56 C42 104 54 150 78 184 Z" fill="url(#${g})"/></g><use href="#${g}k" transform="translate(200 0) scale(-1 1)"/>
<path d="M70 208 H130" stroke="var(--accent)" stroke-width="4"/></svg>`}
function crossMotif(){const g=uid('xg');let dots='';for(let i=0;i<24;i++){const a=i*Math.PI/12;dots+=`<circle cx="${(100+92*Math.cos(a)).toFixed(1)}" cy="${(116+92*Math.sin(a)).toFixed(1)}" r="1.8" fill="#fff6c8" stroke="none"/>`}
 return `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" stroke="#4a2a08" stroke-width="1.3" stroke-linejoin="round"><defs>${GOLDGRAD(g)}</defs>${dots}
<path d="M86 24 H114 V84 H168 V112 H114 V210 H86 V112 H32 V84 H86 Z" fill="url(#${g})"/><path d="M92 32 V204 M40 98 H160" stroke="#fff6c8" stroke-width="1.2" fill="none"/>
<circle cx="100" cy="98" r="12" fill="var(--accent)" stroke="#fff6c8"/><path d="M30 190 C50 214 80 218 100 214 M170 190 C150 214 120 218 100 214" fill="none" stroke="#2f8a3e" stroke-width="3"/>
<g fill="#2f8a3e" stroke="none"><ellipse cx="44" cy="200" rx="7" ry="3.5" transform="rotate(-30 44 200)"/><ellipse cx="62" cy="210" rx="7" ry="3.5" transform="rotate(-15 62 210)"/><ellipse cx="156" cy="200" rx="7" ry="3.5" transform="rotate(30 156 200)"/><ellipse cx="138" cy="210" rx="7" ry="3.5" transform="rotate(15 138 210)"/></g></svg>`}
const TRAD={
 hindu:{title:'Shubh Vivaah',head:'॥ श्री गणेशाय नमः ॥',motif:()=>ganesha()},
 muslim:{title:'Nikah',head:'بسم الله الرحمن الرحيم',motif:crescent},
 sikh:{title:'Anand Karaj',head:'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ',motif:khanda},
 christian:{title:'Holy Matrimony',head:'✝ With God’s blessings',motif:crossMotif}};
const trad=d=>TRAD[d&&d.tradition]||TRAD.hindu;
