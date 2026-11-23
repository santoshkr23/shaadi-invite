/* Procedural SVG art for the invitations. Everything uses CSS variables so palettes recolour it. */
let _uid=0;const uid=p=>p+(++_uid);
const GOLDGRAD=id=>`<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3bd"/><stop offset=".45" stop-color="#e5b64c"/><stop offset="1" stop-color="#a9741a"/></linearGradient>`;

function petal(R,w){return `M0 0 C ${w} ${-R*.35} ${w} ${-R*.78} 0 ${-R} C ${-w} ${-R*.78} ${-w} ${-R*.35} 0 0 Z`}
/* layers: [count, radius, width, dotsRing?] */
function mandala(layers,col='var(--gold)',cls='spin'){
  let s=`<svg class="${cls}" viewBox="-200 -200 400 400" fill="none" stroke="${col}" stroke-width="1.3" xmlns="http://www.w3.org/2000/svg">`;
  layers.forEach(([n,R,w,dots])=>{
    for(let i=0;i<n;i++)s+=`<path d="${petal(R,w)}" transform="rotate(${i*360/n})" fill="${col}" fill-opacity=".07"/>`;
    if(dots)for(let i=0;i<n;i++){const a=(i+.5)*2*Math.PI/n;s+=`<circle cx="${(R*.97*Math.sin(a)).toFixed(1)}" cy="${(-R*.97*Math.cos(a)).toFixed(1)}" r="2.2" fill="${col}"/>`}
  });
  s+=`<circle r="196" stroke-dasharray="2 6" opacity=".7"/><circle r="188" opacity=".5"/><circle r="10" fill="${col}" fill-opacity=".5"/></svg>`;return s}
const MANDALA_BIG=()=>mandala([[24,190,22,1],[16,150,30],[24,118,16,1],[12,86,26],[8,52,22]]);
const MANDALA_SM=()=>mandala([[16,190,28,1],[12,140,32],[8,90,26]]);

function ganesha(){
  const g=uid('gd'),g2=uid('gd'),tk=uid('tk');
  return `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" stroke="#4a2a08" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">
<defs>${GOLDGRAD(g)}<radialGradient id="${g2}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#ffe9a6"/><stop offset="1" stop-color="#d9a238"/></radialGradient>
<linearGradient id="${tk}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf2"/><stop offset="1" stop-color="#e6dcc0"/></linearGradient></defs>
<!-- body -->
<path d="M34 230 C30 188 56 162 100 166 C144 162 170 188 166 230 Z" fill="url(#${g})"/>
<path d="M64 172 Q100 206 136 172" fill="none" stroke="var(--accent)" stroke-width="3"/><path d="M70 180 Q100 214 130 180" fill="none" stroke="#fff6c8" stroke-width="1.6" stroke-dasharray="1 5"/>
<circle cx="100" cy="196" r="7" fill="var(--accent)" stroke="#fff6c8"/><circle cx="100" cy="196" r="2.6" fill="#fff6c8" stroke="none"/>
<!-- ears -->
<g id="${g}e"><path d="M70 66 C26 34 -2 98 30 150 C44 172 62 156 72 128 C66 108 68 84 70 66 Z" fill="url(#${g2})"/>
<path d="M62 78 C38 62 20 100 38 138 C48 150 58 140 64 124" fill="none" stroke="var(--accent)" stroke-width="2.4" opacity=".85"/>
<path d="M58 92 C46 86 38 106 46 124" fill="none" stroke="#fff6c8" stroke-width="1.4" opacity=".9"/></g>
<use href="#${g}e" transform="translate(200 0) scale(-1 1)"/>
<!-- head -->
<path d="M100 48 C58 48 50 96 64 128 C74 150 90 160 100 160 C110 160 126 150 136 128 C150 96 142 48 100 48 Z" fill="url(#${g2})"/>
<!-- crown -->
<path d="M66 62 C64 46 78 36 90 28 L100 6 L110 28 C122 36 136 46 134 62 C118 54 82 54 66 62 Z" fill="url(#${g})"/>
<path d="M70 58 C86 50 114 50 130 58" fill="none" stroke="var(--accent)" stroke-width="3"/>
<circle cx="100" cy="40" r="6" fill="var(--accent)" stroke="#fff6c8"/><circle cx="100" cy="40" r="2" fill="#fff6c8" stroke="none"/>
<circle cx="100" cy="8" r="3.4" fill="var(--accent)" stroke="#fff6c8"/><circle cx="80" cy="38" r="2.6" fill="#fff6c8"/><circle cx="120" cy="38" r="2.6" fill="#fff6c8"/>
<!-- tilak -->
<path d="M88 70 Q100 86 112 70" fill="none" stroke="#c4281c" stroke-width="3.2"/><circle cx="100" cy="78" r="2.6" fill="#c4281c" stroke="none"/>
<!-- eyes -->
<path d="M76 98 Q84 90 93 98 Q84 104 76 98 Z" fill="#fff" /><path d="M107 98 Q116 90 124 98 Q116 104 107 98 Z" fill="#fff"/>
<circle cx="85" cy="97.5" r="2.7" fill="#2a1604" stroke="none"/><circle cx="115" cy="97.5" r="2.7" fill="#2a1604" stroke="none"/>
<path d="M74 90 Q84 83 95 90 M105 90 Q116 83 126 90" fill="none" stroke-width="1.8"/>
<!-- tusk + trunk -->
<path d="M82 126 C70 136 64 154 72 166 C80 158 86 146 92 134 Z" fill="url(#${tk})"/>
<path d="M92 100 C90 130 90 152 96 172 C102 194 130 198 136 176 C140 162 128 156 123 164 C121 170 126 174 128 172 C120 186 108 176 110 158 C112 138 112 118 110 100 Z" fill="url(#${g2})"/>
<path d="M97 112 C96 136 97 152 101 166 M104 116 C104 140 104 154 108 164" fill="none" stroke-width=".9" opacity=".5"/>
<path d="M118 126 C128 136 134 152 128 164 C122 154 116 146 112 136 Z" fill="url(#${tk})"/>
<!-- modak -->
<ellipse cx="140" cy="206" rx="15" ry="6" fill="var(--accent)"/><path d="M140 186 C132 196 130 202 132 204 L148 204 C150 202 148 196 140 186 Z" fill="#fff0b0"/>
</svg>`}

function marigold(cx,cy,r,c1,c2){cx=+cx;cy=+cy;let s='';for(let i=0;i<10;i++){const a=i*Math.PI/5;s+=`<circle cx="${(cx+Math.cos(a)*r*.62).toFixed(1)}" cy="${(cy+Math.sin(a)*r*.62).toFixed(1)}" r="${(r*.5).toFixed(1)}" fill="${c1}"/>`}
  return s+`<circle cx="${cx}" cy="${cy}" r="${(r*.5).toFixed(1)}" fill="${c2}"/><circle cx="${cx}" cy="${cy}" r="${(r*.2).toFixed(1)}" fill="#7a3b00"/>`}
function garland(W=400,sag=34,strands=5){
  let s=`<svg viewBox="0 0 ${W} 210" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg" class="sway">`;
  const y=t=>8+sag*Math.sin(Math.PI*t);
  for(let i=0;i<=34;i++){const t=i/34;const x=t*W;
    s+=`<path d="M${x-9} ${y(t)+4} q9 22 18 0 q-9 -4 -18 0" fill="#2f8a3e" opacity=".85"/>`;}
  for(let i=0;i<=26;i++){const t=i/26;s+=marigold((t*W).toFixed(1),y(t).toFixed(1),9,i%2?'#ff9d1c':'#ffc21a','#ffd54a')}
  for(let k=1;k<=strands;k++){const t=k/(strands+1),x=t*W,y0=y(t),L=40+((k*37)%60);
    s+=`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0+L}" stroke="#a8741c" stroke-width="1.2"/>`;
    for(let j=0;j<L/13;j++)s+=marigold(x.toFixed(1),(y0+10+j*13).toFixed(1),6.2,j%2?'#ff8f1a':'#ffc21a','#ffd54a');
    s+=`<circle cx="${x}" cy="${y0+L+7}" r="5" fill="var(--accent)" stroke="var(--gold)"/>`}
  return s+'</svg>'}
function diya(){const g=uid('dg');
  return `<svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="${g}"><stop offset="0" stop-color="#ffd25a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient></defs>
<circle class="glow" cx="35" cy="28" r="30" fill="url(#${g})"/>
<path class="flame" d="M35 36 C25 26 32 17 35 4 C38 17 45 26 35 36Z" fill="#ffae00"/><path class="flame" d="M35 35 C30 29 33 24 35 17 C37 24 40 29 35 35Z" fill="#fff6bf"/>
<path d="M8 38 Q35 70 62 38 Z" fill="#b5502b" stroke="#6e2a10"/><path d="M12 42 H58" stroke="#e59a5a" stroke-width="2"/><circle cx="35" cy="52" r="3" fill="#e59a5a"/></svg>`}
function lotus(){const g=uid('lg');
  const P=(a,fill,sc=1)=>`<path d="M60 64 C ${60+18*sc} 48 ${60+18*sc} 22 60 4 C ${60-18*sc} 22 ${60-18*sc} 48 60 64Z" transform="rotate(${a} 60 64)" fill="${fill}" stroke="#fff" stroke-opacity=".6" stroke-width="1"/>`;
  return `<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9ec4"/><stop offset="1" stop-color="#fff0f6"/></linearGradient></defs>
${P(-72,`url(#${g})`,.9)}${P(72,`url(#${g})`,.9)}${P(-46,`url(#${g})`)}${P(46,`url(#${g})`)}${P(-22,`url(#${g})`)}${P(22,`url(#${g})`)}${P(0,`url(#${g})`,1.05)}<ellipse cx="60" cy="66" rx="14" ry="4" fill="#f7c948"/></svg>`}
function paisley(col='var(--gold)'){return `<path d="M0 0 C14 -30 54 -34 62 -2 C70 30 34 52 10 38 C-6 28 6 8 22 14 C34 19 30 34 20 32" fill="${col}" fill-opacity=".13" stroke="${col}" stroke-width="1.6"/><circle cx="40" cy="6" r="4" fill="${col}" fill-opacity=".5"/><path d="M14 -4 C26 -18 44 -14 46 -2" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="2 3"/>`}
function paisleyCorner(){let s='<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" fill="none" style="overflow:visible">';
  s+=`<g transform="translate(18 18) rotate(40) scale(1.5)">${paisley()}</g><g transform="translate(96 16) rotate(80) scale(.95)">${paisley()}</g><g transform="translate(16 96) rotate(5) scale(.95)">${paisley()}</g>`;
  s+=`<path d="M0 120 C40 120 120 40 120 0" stroke="var(--gold)" stroke-width="1.5"/><path d="M0 140 C50 140 140 50 140 0" stroke="var(--gold)" stroke-width="1" stroke-dasharray="3 5"/>`;
  for(let i=0;i<7;i++){const t=i/6;s+=`<circle cx="${(t*120).toFixed(0)}" cy="${(120-t*120).toFixed(0)}" r="2.3" fill="var(--gold)"/>`}
  return s+'</svg>'}
function gopuram(){let s='<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" fill="var(--accent)" fill-opacity=".9" stroke="var(--gold)" stroke-width="1.2">';
  const tiers=[[200,22],[168,20],[138,18],[110,17],[84,16],[60,15]];let y=150;
  tiers.forEach(([w,h],i)=>{y-=h;s+=`<path d="M${110-w/2} ${y+h} L${110-w/2+6} ${y} L${110+w/2-6} ${y} L${110+w/2} ${y+h} Z"/>`;
    for(let k=0;k<Math.floor(w/28);k++){const x=110-w/2+16+k*((w-32)/Math.max(1,Math.floor(w/28)-1||1));s+=`<rect x="${x-3}" y="${y+h-13}" width="6" height="9" rx="3" fill="var(--gold)" stroke="none" opacity=".75"/>`}});
  return s+`<ellipse cx="110" cy="${y-6}" rx="9" ry="6"/><path d="M110 ${y-12} V${y-28}" stroke-width="2"/><circle cx="110" cy="${y-30}" r="3" fill="var(--gold)"/></svg>`}
function peacock(){let s='<svg viewBox="0 0 90 220" xmlns="http://www.w3.org/2000/svg" fill="none">';
  s+='<path d="M45 220 C48 160 40 110 45 60" stroke="#2b7a4b" stroke-width="2.2"/>';
  for(let i=-9;i<=9;i++){const a=i*7*Math.PI/180;s+=`<path d="M45 ${70} L${45+Math.sin(a)*46} ${70-Math.cos(a)*50}" stroke="#2f9e5f" stroke-width="1" opacity=".7"/>`}
  s+='<ellipse cx="45" cy="52" rx="24" ry="34" fill="#1a8f7a" fill-opacity=".35" stroke="#1a8f7a"/><ellipse cx="45" cy="52" rx="16" ry="23" fill="#2c6bd1" fill-opacity=".75"/><ellipse cx="45" cy="52" rx="9" ry="13" fill="#1a8f7a"/><ellipse cx="45" cy="52" rx="4.5" ry="7" fill="#f2c94c"/>';
  return s+'</svg>'}
function jharokha(){return `<svg viewBox="0 0 340 560" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--gold)">
<path d="M8 556 V196 C8 128 58 98 98 76 C128 60 150 36 170 8 C190 36 212 60 242 76 C282 98 332 128 332 196 V556" stroke-width="2.6"/>
<path d="M22 556 V200 C22 138 66 110 104 88 C134 72 156 50 170 28 C184 50 206 72 236 88 C274 110 318 138 318 200 V556" stroke-width="1" stroke-dasharray="2 5"/>
<circle cx="170" cy="8" r="6" fill="var(--gold)"/><circle cx="8" cy="196" r="4" fill="var(--gold)"/><circle cx="332" cy="196" r="4" fill="var(--gold)"/></svg>`}
function divider(){return `<svg viewBox="0 0 240 24" width="200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--gold)" stroke-width="1.2"><path d="M4 12 H96 M144 12 H236"/><circle cx="100" cy="12" r="2" fill="var(--gold)"/><circle cx="140" cy="12" r="2" fill="var(--gold)"/><path d="M120 3 L129 12 L120 21 L111 12 Z" fill="var(--gold)" fill-opacity=".35"/><circle cx="120" cy="12" r="2.4" fill="var(--gold)"/></svg>`}
function stars(n=26){let s='';for(let i=0;i<n;i++)s+=`<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${(Math.random()*4).toFixed(1)}s;font-size:${6+Math.random()*9|0}px">✦</i>`;return `<div class="stars">${s}</div>`}
