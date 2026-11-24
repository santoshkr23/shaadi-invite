/* Procedural cartoon couple avatars (no external assets). coupleAvatar({skinG,skinB,gOutfit,bOutfit,turban,pose}) -> SVG string */
(function(){
const SKIN={fair:['#fbd9bd','#e8b48f'],wheat:['#f0c19a','#d49a70'],tan:['#d9a47a','#b97f55'],brown:['#b87d57','#8f5a3a'],deep:['#8d5a3c','#63391f']};
const OUT={maroon:['#a3173d','#5e0a22'],red:['#d42a3c','#7d1020'],gold:['#e7b24a','#a77714'],green:['#1f8a62','#0c4a35'],navy:['#27407f','#121f45'],pink:['#e8509c','#9a1c66'],ivory:['#f7ecd6','#d8c294'],purple:['#7b3aa6','#41195f'],orange:['#f08a24','#b24d0a'],teal:['#17909a','#0a4f57']};
let n=0;
function groom(cx,sk,ou,turban,u){const[s1,s2]=sk,[o1,o2]=ou;return `
<g transform="translate(${cx-135},0)">
<path d="M82 505 L88 292 Q135 256 182 292 L188 505Z" fill="url(#o${u})"/>
<path d="M135 276 L135 505" stroke="#ffd877" stroke-width="3" opacity=".9"/>
${[318,350,382,414].map(y=>`<circle cx="135" cy="${y}" r="5" fill="#ffd877" stroke="#a77714"/>`).join('')}
<path d="M100 300 Q135 330 170 300 L178 316 Q135 350 92 316Z" fill="#ffd877" opacity=".95"/>
<path d="M100 300 Q135 330 170 300" fill="none" stroke="#a77714" stroke-width="1.5"/>
<path d="M88 292 Q135 262 182 292 L170 276 Q135 262 100 276Z" fill="#ffd877"/>
<rect x="123" y="236" width="24" height="34" rx="10" fill="${s2}"/>
<ellipse cx="80" cy="198" rx="9" ry="14" fill="${s2}"/><ellipse cx="190" cy="198" rx="9" ry="14" fill="${s2}"/>
<ellipse cx="135" cy="196" rx="57" ry="62" fill="url(#s${u})"/>
${turban?`<path d="M74 176 Q78 112 135 106 Q192 112 196 176 Q168 150 135 150 Q102 150 74 176Z" fill="url(#o${u})"/>
<path d="M82 168 Q135 128 188 168" fill="none" stroke="#ffd877" stroke-width="5"/>
<path d="M78 150 Q135 100 192 150" fill="none" stroke="#00000030" stroke-width="3"/>
<path d="M120 112 Q135 70 150 112Z" fill="#ffd877"/><circle cx="135" cy="122" r="9" fill="#e0245e" stroke="#ffd877" stroke-width="3"/>`:
`<path d="M76 184 Q70 112 135 110 Q200 112 194 184 Q186 140 135 138 Q84 140 76 184Z" fill="#1b1210"/>`}
<path d="M95 176 Q108 166 122 174" stroke="#1b1210" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M148 174 Q162 166 175 176" stroke="#1b1210" stroke-width="5" fill="none" stroke-linecap="round"/>
<ellipse cx="108" cy="194" rx="11" ry="13" fill="#fff"/><ellipse cx="162" cy="194" rx="11" ry="13" fill="#fff"/>
<circle cx="110" cy="196" r="8" fill="#3a2214"/><circle cx="164" cy="196" r="8" fill="#3a2214"/>
<circle cx="110" cy="196" r="4" fill="#0d0706"/><circle cx="164" cy="196" r="4" fill="#0d0706"/>
<circle cx="113" cy="192" r="3" fill="#fff"/><circle cx="167" cy="192" r="3" fill="#fff"/>
<circle cx="88" cy="214" r="10" fill="#ff7a7a" opacity=".28"/><circle cx="182" cy="214" r="10" fill="#ff7a7a" opacity=".28"/>
<path d="M130 206 Q135 216 140 206" stroke="${s2}" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M104 222 Q135 220 166 222 Q150 232 135 229 Q120 232 104 222Z" fill="#1b1210"/>
<path d="M114 236 Q135 252 156 236 Q135 244 114 236Z" fill="#a8323a" stroke="#7a1d25" stroke-width="1.5"/>
<path d="M132 170 L135 184 L138 170Z" fill="#e0245e"/>
</g>`}
function bride(cx,sk,ou,u){const[s1,s2]=sk,[o1,o2]=ou;return `
<g transform="translate(${cx-265},0)">
<path d="M222 330 L308 330 L362 508 L168 508Z" fill="url(#o${u})"/>
<path d="M190 480 Q265 458 340 480" stroke="#ffd877" stroke-width="6" fill="none"/><path d="M180 508 Q265 488 350 508" stroke="#ffd877" stroke-width="8" fill="none"/>
${[0,1,2,3,4].map(i=>`<path d="M${240+i*10} 360 L${232+i*16} 480" stroke="#ffd877" stroke-width="1.5" opacity=".5"/>`).join('')}
<path d="M215 290 Q265 262 315 290 L308 335 Q265 346 222 335Z" fill="url(#o${u})"/>
<path d="M215 290 Q265 262 315 290" stroke="#ffd877" stroke-width="5" fill="none"/><path d="M222 335 Q265 346 308 335" stroke="#ffd877" stroke-width="4" fill="none"/>
<rect x="253" y="240" width="24" height="40" rx="10" fill="${s2}"/>
<path d="M232 276 Q265 312 298 276" fill="none" stroke="#ffd877" stroke-width="7"/><path d="M238 280 Q265 322 292 280" fill="none" stroke="#ffd877" stroke-width="4"/>
<circle cx="265" cy="316" r="6" fill="#e0245e" stroke="#ffd877" stroke-width="2"/>
<path d="M200 190 Q205 110 265 106 Q325 110 330 190 L330 300 Q315 250 265 246 Q215 250 200 300Z" fill="#150e0d"/>
<circle cx="265" cy="102" r="18" fill="#150e0d"/>
<ellipse cx="208" cy="204" rx="8" ry="13" fill="${s2}"/><ellipse cx="322" cy="204" rx="8" ry="13" fill="${s2}"/>
<path d="M208 216 L208 232" stroke="#ffd877" stroke-width="2"/><path d="M200 232 Q208 250 216 232Z" fill="#ffd877"/><path d="M314 232 Q322 250 330 232Z" fill="#ffd877"/><path d="M322 216 L322 232" stroke="#ffd877" stroke-width="2"/>
<ellipse cx="265" cy="198" rx="56" ry="62" fill="url(#s${u})"/>
<path d="M210 186 Q212 138 265 132 Q318 138 320 186 Q300 154 265 152 Q230 154 210 186Z" fill="#150e0d"/>
<path d="M265 134 L265 152" stroke="#e0245e" stroke-width="4"/>
<path d="M218 160 Q265 142 312 160" fill="none" stroke="#ffd877" stroke-width="3"/><path d="M265 152 L265 170" stroke="#ffd877" stroke-width="2"/><circle cx="265" cy="173" r="6" fill="#e0245e" stroke="#ffd877" stroke-width="2"/>
<path d="M226 178 Q240 170 254 176" stroke="#150e0d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<path d="M276 176 Q290 170 304 178" stroke="#150e0d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<ellipse cx="240" cy="198" rx="12" ry="14" fill="#fff"/><ellipse cx="290" cy="198" rx="12" ry="14" fill="#fff"/>
<circle cx="241" cy="200" r="9" fill="#3a2214"/><circle cx="291" cy="200" r="9" fill="#3a2214"/>
<circle cx="241" cy="200" r="4.5" fill="#0d0706"/><circle cx="291" cy="200" r="4.5" fill="#0d0706"/>
<circle cx="245" cy="195" r="3.2" fill="#fff"/><circle cx="295" cy="195" r="3.2" fill="#fff"/>
<path d="M226 190 Q238 182 254 190" stroke="#150e0d" stroke-width="3" fill="none"/><path d="M276 190 Q292 182 304 190" stroke="#150e0d" stroke-width="3" fill="none"/>
<circle cx="224" cy="218" r="10" fill="#ff6f8c" opacity=".35"/><circle cx="306" cy="218" r="10" fill="#ff6f8c" opacity=".35"/>
<path d="M261 210 Q265 220 269 210" stroke="${s2}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="257" cy="216" r="2.5" fill="#ffd877"/>
<path d="M245 232 Q265 252 285 232 Q265 238 245 232Z" fill="#d6204a" stroke="#9c1034" stroke-width="1.5"/>
<path d="M196 168 Q200 100 265 96 Q330 100 334 168 L340 330 Q335 240 320 180 Q300 130 265 128 Q230 130 210 180 Q195 240 190 330Z" fill="url(#o${u})" opacity=".92"/>
<path d="M196 168 Q200 100 265 96 Q330 100 334 168" fill="none" stroke="#ffd877" stroke-width="5"/>
</g>`}
function flowers(cx,y,w,col){let s='';for(let i=0;i<=10;i++){const t=i/10,x=cx-w/2+t*w,yy=y+Math.sin(t*Math.PI)*34;s+=`<circle cx="${x}" cy="${yy}" r="9" fill="${col}" stroke="#00000022"/><circle cx="${x}" cy="${yy}" r="3" fill="#fff6c0"/>`}return s}
window.coupleAvatar=function(o){o=o||{};n++;const u='a'+n;
 const sk=SKIN[o.skin]||SKIN.wheat,sk2=SKIN[o.skinB||o.skin]||sk,go=OUT[o.gOutfit]||OUT.ivory,bo=OUT[o.bOutfit]||OUT.maroon;
 const defs=`<defs><linearGradient id="o${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${go[0]}"/><stop offset="1" stop-color="${go[1]}"/></linearGradient>
 <radialGradient id="s${u}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${sk[0]}"/><stop offset="1" stop-color="${sk[1]}"/></radialGradient>
 <radialGradient id="g${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd877" stop-opacity=".55"/><stop offset="1" stop-color="#ffd877" stop-opacity="0"/></radialGradient></defs>`;
 // bride needs own gradients (outfit/skin) -> separate ids
 const bdefs=`<linearGradient id="o${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bo[0]}"/><stop offset="1" stop-color="${bo[1]}"/></linearGradient><radialGradient id="s${u}b" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${sk2[0]}"/><stop offset="1" stop-color="${sk2[1]}"/></radialGradient>`;
 const B=bride(265,sk2,bo,u+'b');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" class="avatar">${defs.replace('</defs>',bdefs+'</defs>')}
 <ellipse cx="200" cy="260" rx="190" ry="250" fill="url(#g${u})"/>
 ${groom(135,sk,go,o.turban!==false,u)}${B}
 <g>${flowers(135,288,110,'#ff9a1f')}</g><g>${flowers(265,300,100,'#ffb3c7')}</g>
 </svg>`};
window.AVATAR_OPTS={skin:Object.keys(SKIN),outfit:Object.keys(OUT)};
})();
