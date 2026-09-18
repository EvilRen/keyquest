function $(id){return document.getElementById(id);}

/* ---------- atlas ---------- */
const ATLAS=new Image();let atlasReady=false;
ATLAS.onload=()=>{atlasReady=true;drawPicker();};
ATLAS.src="assets/atlas.png";
const FW=44,FH=32,SC=3;
const BASE={soldier:{idle:0,walk:1,atk:2,hurt:3,death:4},orc:{idle:5,walk:6,atk:7,hurt:8,death:9}};
const AN={idle:{n:6,fps:8,loop:1},walk:{n:8,fps:10,loop:1},atk:{n:6,fps:13,loop:0},
          hurt:{n:4,fps:13,loop:0},death:{n:4,fps:7,loop:0}};

/* playable fighters — recolours of the two base sprites, different stats */
const FIGHTERS=[
 {id:'cadet', base:'soldier',tint:'none',                                  name:'Cadet',  note:'Standard issue',  lives:3,mult:1,cost:0},
 {id:'ranger',base:'soldier',tint:'hue-rotate(115deg) saturate(1.2)',      name:'Ranger', note:'One extra heart', lives:4,mult:1,cost:150},
 {id:'phantom',base:'soldier',tint:'hue-rotate(250deg) brightness(1.15)',  name:'Phantom',note:'Double coins',    lives:3,mult:2,cost:400},
 {id:'grunt', base:'orc',    tint:'none',                                  name:'Grunt',  note:'Heavy axe',       lives:3,mult:1,cost:100},
 {id:'magma', base:'orc',    tint:'hue-rotate(-65deg) saturate(1.7)',      name:'Magma',  note:'One extra heart', lives:4,mult:1,cost:300},
 {id:'titan', base:'orc',    tint:'hue-rotate(175deg) brightness(.9)',     name:'Titan',  note:'Five hearts',     lives:5,mult:1,cost:700}
];
/* bestiary — unlocks as the missions get harder */
const BESTIARY=[
 {name:'Scout',    base:'orc',    tint:'none'},
 {name:'Runner',   base:'orc',    tint:'hue-rotate(150deg)'},
 {name:'Brute',    base:'orc',    tint:'hue-rotate(-70deg) saturate(1.5)'},
 {name:'Shade',    base:'orc',    tint:'hue-rotate(230deg) brightness(.85)'},
 {name:'Sunspawn', base:'orc',    tint:'hue-rotate(60deg) saturate(1.4)'},
 {name:'Rogue',    base:'soldier',tint:'hue-rotate(110deg)'},
 {name:'Sentry',   base:'soldier',tint:'hue-rotate(200deg) saturate(1.3)'},
 {name:'Warden',   base:'soldier',tint:'hue-rotate(-45deg) saturate(1.4)'},
 {name:'Revenant', base:'soldier',tint:'hue-rotate(285deg) brightness(.85)'},
 {name:'Overlord', base:'orc',    tint:'saturate(.2) brightness(1.35)'}
];
const RANKS=[['Recruit',0],['Cadet',120],['Scout',300],['Sergeant',600],['Knight',1000],
             ['Captain',1600],['Commander',2400],['Champion',3400],['Legend',5000]];

/* ---------- keyboard model ---------- */
const HE = {q:'/',w:"'",e:'ק',r:'ר',t:'א',y:'ט',u:'ו',i:'ן',o:'ם',p:'פ',
a:'ש',s:'ד',d:'ג',f:'כ',g:'ע',h:'י',j:'ח',k:'ל',l:'ך',';':'ף',"'":',',
z:'ז',x:'ס',c:'ב',v:'ה',b:'נ',n:'מ',m:'צ',',':'ת','.':'ץ','/':'.'};
const Z = {'1':1,q:1,a:1,z:1,'2':2,w:2,s:2,x:2,'3':3,e:3,d:3,c:3,'4':4,r:4,f:4,v:4,'5':4,t:4,g:4,b:4,
'6':4,y:4,h:4,n:4,'7':4,u:4,j:4,m:4,'8':3,i:3,k:3,',':3,'9':2,o:2,l:2,'.':2,'0':1,p:1,';':1,'/':1,
'-':1,'=':1,"'":1};
const ROWS = [
 [['`','~'],['1','!'],['2','@'],['3','#'],['4','$'],['5','%'],['6','^'],['7','&'],['8','*'],['9','('],['0',')'],['-','_'],['=','+'],['Backspace',null,'w22']],
 [['Tab',null,'w15'],['q'],['w'],['e'],['r'],['t'],['y'],['u'],['i'],['o'],['p'],['[','{'],[']','}'],['\\','|','w15']],
 [['CapsLock',null,'w18'],['a'],['s'],['d'],['f'],['g'],['h'],['j'],['k'],['l'],[';',':'],["'",'"'],['Enter',null,'w22']],
 [['Shift',null,'w22','ShiftLeft'],['z'],['x'],['c'],['v'],['b'],['n'],['m'],[',','<'],['.','>'],['/','?'],['Shift',null,'w22','ShiftRight']],
 [['Ctrl',null,'w15'],['Alt',null,'w15'],[' ',null,'w60'],['Alt',null,'w15'],['Ctrl',null,'w15']]
];
const SHIFTED = {'!':'1','@':'2','#':'3','$':'4','%':'5','^':'6','&':'7','*':'8','(':'9',')':'0','_':'-','+':'=',
'?':'/','"':"'",':':';','<':',','>':'.','{':'[','}':']','|':'\\','~':'`'};
const NAMES={' ':'space','Enter':'enter','Shift':'shift','CapsLock':'caps lock','Backspace':'backspace','Tab':'tab',
'!':'exclamation mark','?':'question mark','@':'at sign','#':'hash','$':'dollar sign','%':'percent',
'^':'caret','&':'and sign','*':'star','(':'open bracket',')':'close bracket','_':'underscore','-':'dash',
'+':'plus','=':'equals','[':'open square bracket',']':'close square bracket','{':'open curly bracket',
'}':'close curly bracket',';':'semicolon',':':'colon',"'":'apostrophe','"':'quote mark',',':'comma',
'.':'full stop','/':'slash','\\':'backslash','|':'pipe','<':'less than','>':'greater than',
'~':'tilde','`':'back tick'};

/* ---------- missions ---------- */
const LESSONS=[
 {n:'Home base',s:'a s d f',items:['f','d','s','a','f','a','d','s','a','f']},
 {n:'Right hand',s:'j k l',items:['j','k','l','j','l','k','j','k','l','j']},
 {n:'First words',s:'home keys only',items:['dad','sad','ask','fall','lad','flask','all','salad']},
 {n:'Reach up',s:'e r t u i o',items:['e','r','t','u','i','o','t','o','r','i']},
 {n:'Up and down',s:'home + top row',items:['tree','road','fire','list','fold','after','trade','forest']},
 {n:'Low row',s:'z x c v b n m',items:['c','v','b','n','m','z','x','van','cab','mix']},
 {n:'Missing pieces',s:'q w p y g h',items:['happy','queen','group','why','yoga','giant','puppy']},
 {n:'Space bar',s:'two words',items:['big dog','my cat','we can go','red bus','a good day']},
 {n:'Capitals',s:'hold Shift',items:['Apple','Dad','Leni','Sunday','Israel','Ramat Gan']},
 {n:'Number row',s:'1 to 0',items:['1','4','7','0','2026','365','19','800']},
 {n:'Long words',s:'whole alphabet',items:['keyboard','computer','elephant','birthday','dinosaur','football']},
 {n:'Symbols',s:'Shift + numbers',items:['!','?','@','#','$','%','&','*']},
 {n:'Sentences',s:'space + capitals',items:['I can type','I like to play','We go home','Dad is here']},
 {n:'Speed drill',s:'short and fast',items:['cat','dog','run','sun','fun','top','red','big','new','old']},
 {n:'Mixed bag',s:'letters and numbers',items:['level7','room12','bus99','key2026','game4']},
 {n:'Password power',s:'the real thing',items:['Dog123','Star!7','Sky_99','Tiger#4','Blue2026!']}
];

/* ---------- state ---------- */
const DEF={coins:0,xp:0,best:{},stars:{},owned:['core','cadet'],buddy:'',voice:1,sfx:1,heb:1,skin:'core',arena:'auto',voiceName:'',voicePick:0,hero:'cadet'};
let S=Object.assign({},DEF);
try{const raw=localStorage.getItem('keyquest');if(raw)S=Object.assign({},DEF,JSON.parse(raw));}catch(e){}
/* migrate older saves */
{const m={reef:'core',sunset:'ember',jungle:'void',soldier:'cadet',orc:'grunt'};
 if(m[S.skin])S.skin=m[S.skin];
 if(m[S.hero])S.hero=m[S.hero];
 S.owned=(S.owned||[]).map(o=>m[o]||o);
 if(!S.owned.includes('core'))S.owned.push('core');
 if(!S.owned.includes('cadet'))S.owned.push('cadet');
 if(!S.xp)S.xp=S.coins||0;
 if(!S.stars)S.stars={};}
function save(){try{localStorage.setItem('keyquest',JSON.stringify(S));}catch(e){}}

const SHOP=[
 {id:'cat',face:'🐱',name:'Cat',cost:60,type:'buddy'},
 {id:'dog',face:'🐶',name:'Dog',cost:60,type:'buddy'},
 {id:'dragon',face:'🐲',name:'Dragon',cost:200,type:'buddy'},
 {id:'robot',face:'🤖',name:'Droid',cost:200,type:'buddy'},
 {id:'ember',face:'🔥',name:'Ember arena',cost:120,type:'skin'},
 {id:'void',face:'🌌',name:'Void arena',cost:120,type:'skin'}
];
function fighter(id){return FIGHTERS.find(f=>f.id===id)||FIGHTERS[0];}

/* ---------- scene ---------- */
const cv=$('scene'),cx=cv.getContext('2d');
cx.imageSmoothingEnabled=false;
/* The scene is drawn to fit its box rather than to a fixed 300x112. A fixed
   resolution can only ever fill one axis, so the arena sat as a letterboxed
   island in a much wider panel. The zoom is chosen so a fighter is always
   about the same share of the height, and the width then buys environment. */
let CW=300,CH=112,GROUND=104,HORIZON=80;
let HERO_HOME=50,FOE_HOME=148,DRAW_Y=GROUND-FH*SC+2;
let SD={};let sceneBiome=null;
function curBiome(){return sceneBiome||BIOME(S.skin);}
/* A mission walks to the next place rather than replaying the same one. */
function pickBiome(){
  if(S.arena&&S.arena!=='auto'){const b=BIOMES.find(x=>x.id===S.arena);if(b){sceneBiome=b;return;}}
  sceneBiome=lvl>=0?BIOMES[lvl%BIOMES.length]:BIOMES[Math.floor(Math.random()*BIOMES.length)];
}
const PAIR_GAP=98;              /* the distance between the two fighters */
function rnd(seed){let t=seed+0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);
  return ((t^t>>>14)>>>0)/4294967296;}
function layoutScene(){
  const r=cv.getBoundingClientRect();
  const bw=r.width||300,bh=r.height||112;
  /* Zoom is chosen, then BOTH dimensions follow from it, so the canvas always
     carries the box's aspect ratio and nothing letterboxes. Deriving width and
     height from separate rules is the classic layout bug: at some viewport they
     disagree and the scene comes out the wrong shape. */
  const SCENE_MIN_W=PAIR_GAP+FW*SC+10;          /* both fighters must fit */
  const lo=Math.max(bw/1200,bh/420),hi=Math.min(bw/SCENE_MIN_W,bh/100);
  const Z=Math.max(lo,Math.min(hi,bh/140));     /* display pixels per scene pixel */
  CW=Math.round(bw/Z);CH=Math.round(bh/Z);
  if(cv.width!==CW||cv.height!==CH){cv.width=CW;cv.height=CH;}
  cx.imageSmoothingEnabled=false;
  GROUND=Math.round(CH*.929);
  HORIZON=Math.round(CH*.714);
  DRAW_Y=GROUND-FH*SC+2;
  HERO_HOME=Math.round(CW/2-PAIR_GAP/2-FW*SC/2);
  FOE_HOME=HERO_HOME+PAIR_GAP;
  buildSky();
}
let hero={base:'soldier',x:-70,anim:'idle',t0:0,alpha:1,tint:'none'};
let foe ={base:'orc',    x:360,anim:'idle',t0:0,alpha:1,tint:'none'};
let lives=3,maxLives=3,running=false;

/* ---------- environments ----------
   Ten places, not one skyline recoloured. Each owns a palette, a page theme and
   a painter that works from CW/CH/HORIZON, so every one fills whatever shape the
   arena turns out to be. Missions walk through them in order, so getting further
   into the game means going somewhere new. */
function px(c,x,y,w,h){cx.fillStyle=c;cx.fillRect(x,y,w,h);}
function dots(a,c,s){a.forEach(([x,y])=>px(c,x,y,s||1,s||1));}
function disc(x,y,r,c){cx.fillStyle=c;cx.beginPath();cx.arc(x,y,r,0,6.284);cx.fill();}
function tri(x,y,w,h,c){cx.fillStyle=c;cx.beginPath();cx.moveTo(x,y+h);cx.lineTo(x+w/2,y);cx.lineTo(x+w,y+h);cx.closePath();cx.fill();}
function neonGrid(c){
  cx.strokeStyle=c;cx.lineWidth=1;cx.beginPath();
  const span=Math.ceil(CW/44),deep=CH-HORIZON;
  for(let i=-span;i<=span;i++){cx.moveTo(CW/2+i*10,HORIZON+.5);cx.lineTo(CW/2+i*74,CH);}
  [.125,.28,.47,.72,1].forEach(f=>{const y=Math.round(HORIZON+deep*f)-(f===1?1:0);
    cx.moveTo(0,y+.5);cx.lineTo(CW,y+.5);});
  cx.stroke();
}
function bands(cols){
  const deep=CH-HORIZON;
  cols.forEach((c,i)=>{
    const y0=HORIZON+Math.round(deep*(i/cols.length)),y1=HORIZON+Math.round(deep*((i+1)/cols.length));
    px(c,0,y0,CW,y1-y0);
  });
}
function drift(v,span,ts,speed){return ((v+ts*speed)%span+span)%span;}

const BIOMES=[
{id:'core',name:'Neon city',theme:'core',
 pal:{sky:'#060D18',ink:'#6FE3DC',glow:'#35E0D0',floor:'#08131F',grid:'#17414C',solid:'#0C1B2B',lit:'#35E0D0'},
 paint(p,D){
   px(p.sky,0,0,CW,HORIZON);dots(D.stars,p.ink);
   D.towers.forEach(([x,y,w])=>{px(p.solid,x,y,w,HORIZON-y);
     for(let wy=y+4;wy<HORIZON-4;wy+=7)px(p.lit,x+4,wy,2,2);});
   px(p.floor,0,HORIZON,CW,CH-HORIZON);neonGrid(p.grid);
   px(p.glow,0,HORIZON-1,CW,1);
 }},

{id:'forest',name:'Moonlit wood',theme:'forest',
 pal:{sky:'#081A15',ink:'#CDEFD6',glow:'#57D98B',floor:'#0B2018',grid:'#1E4A33',solid:'#061109',lit:'#9BE8B4'},
 paint(p,D,ts){
   px(p.sky,0,0,CW,HORIZON);dots(D.stars,p.ink);
   const mx=Math.round(CW*.8),my=Math.round(HORIZON*.24),r=Math.max(4,Math.round(HORIZON*.1));
   disc(mx,my,r,'#E6F7EA');disc(mx-r*.45,my-r*.3,r*.85,p.sky);
   D.trees.forEach(([x,h,w,near])=>{
     const c=near?'#0D2A1C':p.solid,top=HORIZON-h;
     px(c,x+((w/2)|0)-1,top+((h*.6)|0),3,(h*.4)|0);
     for(let k=0;k<3;k++){
       const ww=Math.max(4,Math.round(w*(.44+k*.28))),yy=top+Math.round(h*.18*k);
       px(c,x+Math.round((w-ww)/2),yy,ww,Math.max(3,Math.round(h*.3)));
     }
   });
   bands([p.floor,'#0D2619','#102D1E']);
   dots(D.tufts,p.grid,2);
   D.flies.forEach(([x,y],i)=>px(p.lit,x,HORIZON-4-Math.round(drift(y,26,ts,.004+i%3*.001)),1,1));
   px(p.glow,0,HORIZON-1,CW,1);
 }},

{id:'cave',name:'Crystal cave',theme:'cave',
 pal:{sky:'#0A0A12',ink:'#7C6BB5',glow:'#8E7BFF',floor:'#141020',grid:'#2C2440',solid:'#191428',lit:'#B49BFF'},
 paint(p,D){
   px(p.sky,0,0,CW,HORIZON);
   D.spikes.forEach(([x,w,h])=>{ /* stalactites */
     cx.fillStyle=p.solid;cx.beginPath();cx.moveTo(x,0);cx.lineTo(x+w,0);cx.lineTo(x+w/2,h);cx.closePath();cx.fill();
   });
   D.gems.forEach(([x,y,h],i)=>{
     const w=3+(i%3),base=y-Math.round(h*(i%2?.35:1));
     tri(x,base-h,w,h,i%2?p.glow:p.lit);px(p.ink,x+((w/2)|0),base-Math.round(h*.4),1,Math.round(h*.4));
   });
   bands([p.floor,'#181327','#1E1830']);
   D.rocks.forEach(([x,w,h],i)=>{const t=Math.round(h*2.2),c=i%2?'#241C38':p.solid;
     cx.fillStyle=c;cx.beginPath();
     cx.moveTo(x,HORIZON+Math.round(h*.6));cx.lineTo(x+w/2,HORIZON-t);cx.lineTo(x+w,HORIZON+Math.round(h*.6));
     cx.closePath();cx.fill();});
   px(p.glow,0,HORIZON-1,CW,1);
 }},

{id:'desert',name:'Sun dunes',theme:'desert',
 pal:{sky:'#2A1830',ink:'#FFD9A8',glow:'#FF9E4A',floor:'#3A2318',grid:'#6B4224',solid:'#1E1020',lit:'#FFC163'},
 paint(p,D){
   px(p.sky,0,0,CW,HORIZON);
   px('#3C1E34',0,Math.round(HORIZON*.45),CW,Math.round(HORIZON*.55));
   const sx=Math.round(CW*.5),sy=Math.round(HORIZON*.62),r=Math.max(6,Math.round(HORIZON*.2));
   disc(sx,sy,r,'#FFB35C');disc(sx,sy,r*.72,'#FFD98E');
   D.dunes.forEach(([x,w,h])=>tri(x,HORIZON-h,w,h,p.solid));
   bands([p.floor,'#43281B','#4C2E1E']);
   D.ripples.forEach(([x,y,w])=>px(p.grid,x,y,w,1));
   px(p.glow,0,HORIZON-1,CW,1);
 }},

{id:'snow',name:'Frost peaks',theme:'snow',
 pal:{sky:'#101E30',ink:'#E8F4FF',glow:'#8FD2FF',floor:'#1B2E44',grid:'#37567A',solid:'#16283C',lit:'#FFFFFF'},
 paint(p,D,ts){
   px(p.sky,0,0,CW,HORIZON);dots(D.stars,p.ink);
   D.peaks.forEach(([x,w,h])=>{
     tri(x,HORIZON-h,w,h,p.solid);
     tri(x+w*.32,HORIZON-h,w*.36,h*.34,'#CFE6FA');
   });
   bands([p.floor,'#20374F','#26405A']);
   D.cracks.forEach(([x,y,w])=>px(p.grid,x,y,w,1));
   D.flakes.forEach(([x,y],i)=>px(p.lit,(x+Math.round(Math.sin((ts/900)+i)*3))%CW,
     Math.round(drift(y,CH,ts,.012+i%4*.003)),1,1));
   px(p.glow,0,HORIZON-1,CW,1);
 }},

{id:'space',name:'Orbit deck',theme:'space',
 pal:{sky:'#05060F',ink:'#CFE0FF',glow:'#5AA9FF',floor:'#0C1220',grid:'#27436B',solid:'#101A2E',lit:'#8FC0FF'},
 paint(p,D){
   px(p.sky,0,0,CW,HORIZON);dots(D.stars,p.ink);
   const px0=Math.round(CW*.24),py=Math.round(HORIZON*.38),r=Math.max(6,Math.round(HORIZON*.22));
   disc(px0,py,r,'#3B5C9E');disc(px0-r*.3,py-r*.3,r*.55,'#5C82C9');
   cx.strokeStyle='#7FA6E8';cx.lineWidth=1;cx.beginPath();
   cx.ellipse(px0,py,r*1.7,r*.36,-0.3,0,6.284);cx.stroke();
   px(p.floor,0,HORIZON,CW,CH-HORIZON);
   D.panels.forEach(([x,y,w,h])=>{px(p.solid,x,y,w,h);px(p.grid,x,y,w,1);});
   neonGrid(p.grid);
   px(p.glow,0,HORIZON-1,CW,1);
 }},

{id:'volcano',name:'Ashfall',theme:'volcano',
 pal:{sky:'#1A0A0A',ink:'#FF9A6B',glow:'#FF5A2B',floor:'#1E1112',grid:'#5E2416',solid:'#120809',lit:'#FFB347'},
 paint(p,D,ts){
   px(p.sky,0,0,CW,HORIZON);
   px('#2A0E0C',0,Math.round(HORIZON*.5),CW,Math.round(HORIZON*.5));
   D.cones.forEach(([x,w,h])=>{
     tri(x,HORIZON-h,w,h,p.solid);
     px(p.glow,Math.round(x+w*.42),Math.round(HORIZON-h),Math.max(3,Math.round(w*.16)),3);
   });
   bands([p.floor,'#241416','#2A181A']);
   D.cracks.forEach(([x,y,w])=>px(p.glow,x,y,w,1));
   D.embers.forEach(([x,y],i)=>px(p.lit,x,HORIZON-Math.round(drift(y,HORIZON,ts,.02+i%3*.006)),1,1));
   px(p.glow,0,HORIZON-1,CW,1);
 }},

{id:'castle',name:'Keep hall',theme:'castle',
 pal:{sky:'#1A1622',ink:'#D9C79A',glow:'#E0B457',floor:'#241E2C',grid:'#3C3348',solid:'#2A2434',lit:'#FFD98A'},
 paint(p,D){
   px(p.sky,0,0,CW,HORIZON);
   for(let y=0;y<HORIZON;y+=7)for(let x=(y/7)%2?0:-9;x<CW;x+=18)px(p.solid,x,y,17,6);
   D.arches.forEach(([x,w])=>{
     const h=Math.round(HORIZON*.5),y=Math.round(HORIZON*.22);
     px('#0E0B14',x,y,w,h);disc(x+w/2,y,w/2,'#0E0B14');
     px(p.lit,x+2,y+2,w-4,2);
   });
   D.banners.forEach(([x,w,h])=>{px(p.glow,x,Math.round(HORIZON*.14),w,h);
     px('#8E6A22',x,Math.round(HORIZON*.14),w,2);});
   bands([p.floor,'#2A2334','#312941']);
   D.tiles.forEach(([x,y,w])=>px(p.grid,x,y,w,1));
   px(p.glow,0,HORIZON-1,CW,1);
 }},

{id:'ember',name:'Ember city',theme:'ember',
 pal:{sky:'#150810',ink:'#FFC58A',glow:'#FF7A45',floor:'#1A0A10',grid:'#5A2A1E',solid:'#24101A',lit:'#FF9A3C'},
 paint(p,D){BIOMES[0].paint(p,D);}},

{id:'void',name:'Void city',theme:'void',
 pal:{sky:'#0A0618',ink:'#C9A6FF',glow:'#A97BFF',floor:'#120B22',grid:'#3A2660',solid:'#180F2E',lit:'#C08CFF'},
 paint(p,D){BIOMES[0].paint(p,D);}}
];
const BIOME=id=>BIOMES.find(b=>b.id===id)||BIOMES[0];
/* Every environment's scatter is generated from the arena's real size, so a wide
   arena gets a full skyline rather than six towers at fixed coordinates. */
function buildSky(){
  const n=k=>Math.max(3,Math.round(CW*k)),sky=HORIZON;
  const pts=(count,seed,hi)=>{const a=[];for(let i=0;i<count;i++)
    a.push([Math.round(rnd(i*7+seed)*(CW-2)),Math.round(rnd(i*13+seed+5)*(hi-4))+2]);return a;};
  SD={
    stars:pts(Math.round(CW*sky/2800)+4,1,sky),
    towers:(()=>{const a=[],step=18;for(let i=0;i<Math.floor(CW/step);i++)
      a.push([i*step+2,sky-Math.round((.28+rnd(i*31+3)*.34)*sky),14]);return a;})(),
    trees:(()=>{const a=[],step=22;for(let i=0;i<Math.floor(CW/step)+1;i++)
      a.push([i*step-4,Math.round((.42+rnd(i*17+9)*.42)*sky),Math.round(14+rnd(i*23)*10),i%2===0]);return a;})(),
    tufts:pts(n(.05),21,CH-HORIZON).map(([x,y])=>[x,HORIZON+y%Math.max(1,CH-HORIZON-2)]),
    flies:pts(n(.02)+3,33,sky),
    spikes:(()=>{const a=[],step=16;for(let i=0;i<Math.floor(CW/step);i++)
      a.push([i*step,12+Math.round(rnd(i*41)*8),Math.round((.18+rnd(i*11)*.3)*sky)]);return a;})(),
    gems:(()=>{const a=[],step=34;for(let i=0;i<Math.floor(CW/step);i++)
      a.push([i*step+8,sky,Math.round(5+rnd(i*53)*9)]);return a;})(),
    rocks:(()=>{const a=[],step=40;for(let i=0;i<Math.floor(CW/step);i++)
      a.push([i*step+6,Math.round(12+rnd(i*61)*14),Math.round(4+rnd(i*67)*7)]);return a;})(),
    dunes:(()=>{const a=[],step=46;for(let i=0;i<Math.floor(CW/step)+1;i++)
      a.push([i*step-10,Math.round(40+rnd(i*71)*34),Math.round((.16+rnd(i*73)*.2)*sky)]);return a;})(),
    ripples:(()=>{const a=[],d=CH-HORIZON;for(let i=0;i<Math.round(CW*.06);i++)
      a.push([Math.round(rnd(i*79)*CW),HORIZON+2+Math.round(rnd(i*83)*(d-3)),Math.round(4+rnd(i*89)*9)]);return a;})(),
    peaks:(()=>{const a=[],step=52;for(let i=0;i<Math.floor(CW/step)+1;i++)
      a.push([i*step-12,Math.round(52+rnd(i*97)*30),Math.round((.3+rnd(i*101)*.28)*sky)]);return a;})(),
    cracks:(()=>{const a=[],d=CH-HORIZON;for(let i=0;i<Math.round(CW*.05);i++)
      a.push([Math.round(rnd(i*103)*CW),HORIZON+2+Math.round(rnd(i*107)*(d-3)),Math.round(5+rnd(i*109)*11)]);return a;})(),
    flakes:pts(n(.06)+6,41,CH),
    panels:(()=>{const a=[],step=26,d=CH-HORIZON;for(let i=0;i<Math.floor(CW/step);i++)
      a.push([i*step,HORIZON+Math.round(d*.35),24,Math.max(2,Math.round(d*.18))]);return a;})(),
    cones:(()=>{const a=[],step=58;for(let i=0;i<Math.floor(CW/step)+1;i++)
      a.push([i*step-14,Math.round(50+rnd(i*113)*34),Math.round((.28+rnd(i*127)*.26)*sky)]);return a;})(),
    embers:pts(n(.04)+4,51,sky),
    arches:(()=>{const a=[],step=44;for(let i=0;i<Math.floor(CW/step);i++)a.push([i*step+10,16]);return a;})(),
    banners:(()=>{const a=[],step=44;for(let i=0;i<Math.floor(CW/step);i++)
      a.push([i*step+20,6,Math.round(sky*.3)]);return a;})(),
    tiles:(()=>{const a=[],d=CH-HORIZON;for(let i=0;i<Math.round(CW*.07);i++)
      a.push([Math.round(rnd(i*131)*CW),HORIZON+2+Math.round(rnd(i*137)*(d-3)),Math.round(6+rnd(i*139)*12)]);return a;})()
  };
}
function drawArena(ts){
  const b=curBiome(),p=b.pal;
  b.paint(p,SD,ts||0);
}
const HEART=[".11.11.","1111111","1111111",".11111.","..111..","...1..."];
function drawHearts(){
  const x0=Math.round(hero.x)+34,y0=12,s=2;
  for(let i=0;i<maxLives;i++){
    const on=i<lives;
    for(let r=0;r<HEART.length;r++)
      for(let c=0;c<HEART[r].length;c++)
        if(HEART[r][c]==='1')px(on?'#FF4D6D':'#3C2A35',x0+i*17+c*s,y0+r*s,s,s);
  }
}
function drawFoeBar(){
  if(foe.alpha<=0||foe.anim==='death')return;
  const w=44,h=5,x=Math.round(foe.x)+40,y=16;
  px('#05080D',x-2,y-2,w+4,h+4);
  px('#3A1520',x,y,w,h);
  px('#FF4D6D',x,y,Math.max(0,Math.round(w*hp/hpMax)),h);
}
function setAnim(o,name){o.anim=name;o.t0=performance.now();}
function frameOf(a,t){const d=1000/a.fps;const f=Math.floor(t/d);return a.loop?f%a.n:Math.min(f,a.n-1);}
function animDone(a,t){return !a.loop&&t>=(1000/a.fps)*a.n;}
function blit(actor,ts,flip){
  if(!atlasReady)return;
  const a=AN[actor.anim],t=ts-actor.t0,row=BASE[actor.base][actor.anim];
  let x=Math.round(actor.x);
  cx.save();
  cx.globalAlpha=actor.alpha;
  if(actor.tint&&actor.tint!=='none')cx.filter=actor.tint;
  if(flip){cx.translate(x+FW*SC,0);cx.scale(-1,1);x=0;}
  cx.drawImage(ATLAS,frameOf(a,t)*FW,row*FH,FW,FH,x,DRAW_Y,FW*SC,FH*SC);
  cx.restore();
}
function step(actor,ts,home,dir){
  const a=AN[actor.anim],t=ts-actor.t0;
  if(actor.anim==='walk'){
    actor.x=dir>0?Math.min(home,actor.x+2.6):Math.max(home,actor.x-2.4);
    if((dir>0&&actor.x>=home)||(dir<0&&actor.x<=home)){actor.x=home;setAnim(actor,'idle');}
  }else if((actor.anim==='atk'||actor.anim==='hurt')&&animDone(a,t)){setAnim(actor,'idle');}
  else if(actor.anim==='death'&&animDone(a,t)){actor.alpha=Math.max(0,actor.alpha-0.05);}
}
function loop(ts){
  if(!running)return;
  cx.clearRect(0,0,CW,CH);
  drawArena(ts);
  step(foe,ts,FOE_HOME,-1);
  step(hero,ts,HERO_HOME,1);
  blit(foe,ts,true);
  blit(hero,ts,false);
  drawFoeBar();drawHearts();
  requestAnimationFrame(loop);
}
function startLoop(){if(!running){running=true;requestAnimationFrame(loop);}}
/* Registered once at startup, not from whatever happens to run next. */
window.addEventListener('resize',()=>{if(!$('viewPlay').classList.contains('hidden'))layoutScene();});
function stopLoop(){running=false;}

/* ---------- roster ---------- */
function drawPicker(){
  const box=$('picker');box.innerHTML='';
  FIGHTERS.forEach(f=>{
    const owned=S.owned.includes(f.id)||f.cost===0;
    const b=document.createElement('button');
    b.className='pick'+(S.hero===f.id?' sel':'')+(owned?'':' locked');
    const c=document.createElement('canvas');c.width=FW;c.height=FH;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    if(atlasReady){
      if(f.tint!=='none')g.filter=f.tint;
      g.drawImage(ATLAS,0,BASE[f.base].idle*FH,FW,FH,0,0,FW,FH);
    }
    b.appendChild(c);
    const n=document.createElement('b');n.textContent=f.name;b.appendChild(n);
    const s=document.createElement('small');s.textContent=f.note;b.appendChild(s);
    const cst=document.createElement('span');cst.className='cost';
    cst.textContent=owned?(S.hero===f.id?'Selected':'Tap to use'):f.cost+' coins';
    b.appendChild(cst);
    b.addEventListener('click',()=>{
      if(!owned){
        if(S.coins<f.cost){cst.textContent='Need '+(f.cost-S.coins)+' more';return;}
        S.coins-=f.cost;S.owned.push(f.id);$('coinN').textContent=S.coins;
      }
      S.hero=f.id;save();drawPicker();
    });
    box.appendChild(b);
  });
}
function rankInfo(){
  let i=0;for(let k=0;k<RANKS.length;k++)if(S.xp>=RANKS[k][1])i=k;
  const cur=RANKS[i],nxt=RANKS[i+1];
  return {name:cur[0],from:cur[1],to:nxt?nxt[1]:cur[1],next:nxt?nxt[0]:null};
}
function drawRank(){
  const r=rankInfo();
  $('rankName').textContent=r.name;
  const pct=r.next?Math.min(100,Math.round((S.xp-r.from)/(r.to-r.from)*100)):100;
  $('rankFill').style.width=pct+'%';
  const cleared=Object.keys(S.stars).length;
  $('rankNext').textContent=r.next
    ? (r.to-S.xp)+' XP to '+r.next+' · '+cleared+'/'+LESSONS.length+' missions'
    : 'Max rank · '+cleared+'/'+LESSONS.length+' missions';
}

/* ---------- voice ---------- */
/* The natural voices are worth hunting for: the legacy ones read a single
   letter flat and run two phrases together. */
const GOOD_VOICE=/natural|online|google|samantha|aria|jenny|guy|eric|emma|ava|siri/i;
const POOR_VOICE=/zira|david|mark|hazel|george|susan|linda|richard|sam\b/i;
let voices=[];
function loadVoices(){
  if(!window.speechSynthesis)return;
  voices=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));
  const sel=$('voiceSel');sel.innerHTML='';
  if(!voices.length){sel.classList.add('hidden');return;}
  sel.classList.remove('hidden');
  voices.sort((a,b)=>(GOOD_VOICE.test(b.name)?1:0)-(GOOD_VOICE.test(a.name)?1:0));
  voices.forEach(v=>{
    const o=document.createElement('option');o.value=v.name;
    o.textContent=(GOOD_VOICE.test(v.name)?'★ ':'')+
      v.name.replace(/(Microsoft|Google|Apple)\s*/,'').replace(/\s*Online\s*\(Natural\)/i,'').slice(0,22);
    sel.appendChild(o);
  });
  /* A voice saved before this list existed wins forever otherwise: the old code
     only consulted the preference when nothing was stored, so a first visit that
     landed on a robotic legacy voice kept it for good. Re-pick unless the choice
     was made by hand. */
  const best=voices.find(v=>GOOD_VOICE.test(v.name));
  const saved=voices.find(v=>v.name===S.voiceName);
  const keep=saved&&(S.voicePick||!POOR_VOICE.test(saved.name)||!best);
  const prefer=keep?saved.name:(best||voices[0]).name;
  sel.value=prefer;S.voiceName=sel.value;save();
}
if(window.speechSynthesis){speechSynthesis.onvoiceschanged=loadVoices;setTimeout(loadVoices,80);}
function utter(t,rate){
  const u=new SpeechSynthesisUtterance(t);
  u.rate=rate||.8;u.pitch=1.05;u.lang='en-US';
  const v=voices.find(x=>x.name===S.voiceName);if(v)u.voice=v;
  return u;
}
/* Phrases are spoken one at a time with a gap between them. Putting them in a
   single utterance ran them together — "F. F for fish." came out as "ff". */
function speakParts(parts,gap){
  if(!S.voice||!window.speechSynthesis)return;
  try{
    speechSynthesis.cancel();
    let i=0;
    const next=()=>{
      if(i>=parts.length)return;
      const p=parts[i++];
      const u=utter(p.t,p.rate);
      u.onend=()=>setTimeout(next,p.gap||gap||240);
      u.onerror=()=>setTimeout(next,60);
      speechSynthesis.speak(u);
    };
    next();
  }catch(e){}
}
function speak(t){speakParts([{t:t}]);}
const LW={a:'apple',b:'ball',c:'cat',d:'dog',e:'egg',f:'fish',g:'goat',h:'hat',i:'igloo',j:'jam',
k:'kite',l:'lion',m:'moon',n:'nest',o:'orange',p:'pen',q:'queen',r:'rain',s:'sun',t:'tree',
u:'umbrella',v:'van',w:'water',x:'box',y:'yoyo',z:'zebra'};
function sayTarget(w){
  if(w.length===1){
    const c=w.toLowerCase();
    if(playClip(c))return;
    if(/[a-z]/.test(c))speakParts([
      {t:c.toUpperCase()+'.',rate:.65,gap:420},
      {t:c.toUpperCase()+' for '+LW[c]+'.',rate:.8}]);
    else if(/[0-9]/.test(c))speak('number '+c);
    else speak(NAMES[c]||c);
  }else{
    if(playClip(w.toLowerCase()))return;
    speak(w);
  }
}

/* ---------- recorded voice clips ---------- */
const clips=new Map();
let recTok=null,recorder=null,micStream=null;
function idb(){return new Promise((res,rej)=>{
  const r=indexedDB.open('keyquest-voice',1);
  r.onupgradeneeded=()=>{r.result.createObjectStore('clips');};
  r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function loadClips(){
  try{
    const db=await idb();
    const st=db.transaction('clips').objectStore('clips');
    const ks=await new Promise(r=>{const q=st.getAllKeys();q.onsuccess=()=>r(q.result);q.onerror=()=>r([]);});
    const vs=await new Promise(r=>{const q=st.getAll();q.onsuccess=()=>r(q.result);q.onerror=()=>r([]);});
    ks.forEach((k,i)=>{if(vs[i])clips.set(k,URL.createObjectURL(vs[i]));});
  }catch(e){}
  drawVoicePack();
}
async function saveClip(tok,blob){
  clips.set(tok,URL.createObjectURL(blob));
  try{const db=await idb();db.transaction('clips','readwrite').objectStore('clips').put(blob,tok);}catch(e){}
  drawVoicePack();
}
async function dropClip(tok){
  clips.delete(tok);
  try{const db=await idb();db.transaction('clips','readwrite').objectStore('clips').delete(tok);}catch(e){}
  drawVoicePack();
}
function playClip(tok){
  const u=clips.get(tok);
  if(!u)return false;
  try{if(window.speechSynthesis)speechSynthesis.cancel();const a=new Audio(u);a.play();return true;}catch(e){return false;}
}
/* Derived, never hand-kept: a symbol a lesson can ask for always gets a tile to record.
   The old hand-written list omitted every symbol, so the Symbols mission had no voice. */
const VTOKENS=(()=>{
  const t=[...'abcdefghijklmnopqrstuvwxyz','0','1','2','3','4','5','6','7','8','9'];
  const seen=new Set(t);
  LESSONS.forEach(L=>L.items.forEach(it=>[...it].forEach(ch=>{
    const c=ch.toLowerCase();
    if(c===' '||/[a-z0-9]/.test(c)||seen.has(c))return;
    seen.add(c);t.push(c);
  })));
  return t.concat(['space','enter','shift','backspace']);
})();
function vlabel(t){return t.length===1?t.toUpperCase():t;}
async function recordInto(tok,tile){
  if(recTok)return;
  try{
    if(!micStream)micStream=await navigator.mediaDevices.getUserMedia({audio:true});
  }catch(e){
    $('micNote').textContent='The microphone is blocked in this frame. Open the app in its own browser tab and try again.';
    return;
  }
  recTok=tok;tile.classList.add('rec');
  const chunks=[];
  recorder=new MediaRecorder(micStream);
  recorder.ondataavailable=ev=>{if(ev.data.size)chunks.push(ev.data);};
  recorder.onstop=()=>{
    recTok=null;
    saveClip(tok,new Blob(chunks,{type:recorder.mimeType||'audio/webm'}));
  };
  recorder.start();
  setTimeout(()=>{if(recorder&&recorder.state==='recording')recorder.stop();},1600);
}
function drawVoicePack(){
  const g=$('vpack');if(!g)return;
  g.innerHTML='';
  VTOKENS.forEach(tok=>{
    const has=clips.has(tok);
    const t=document.createElement('div');
    t.className='vtile'+(has?' has':'');
    t.innerHTML='<b'+(tok.length>1?' class="word"':'')+'>'+vlabel(tok)+'</b>'+
      '<small>'+(has?'yours':'record')+'</small>';
    t.addEventListener('click',()=>{ if(has)playClip(tok); else recordInto(tok,t); });
    if(has){
      const re=document.createElement('button');
      re.className='re';re.textContent='redo';re.title='Record again';
      re.addEventListener('click',ev=>{ev.stopPropagation();dropClip(tok).then(()=>{
        const tile=[...g.children].find(c=>c.querySelector('b').textContent===vlabel(tok));
        if(tile)recordInto(tok,tile);
      });});
      t.appendChild(re);
    }
    g.appendChild(t);
  });
  if(!navigator.mediaDevices||!window.MediaRecorder)
    $('micNote').textContent='This browser cannot record audio, so the computer voice is used.';
}
/* ---------- sound effects ----------
   All synthesised: two layers per sound, a pitched sweep for the body and a
   band-passed noise burst for the grit. One shared AudioContext — making a new
   one per sound leaks them, and browsers cap how many a page may hold. */
let AC=null,NB=null;
function actx(){
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}
  if(AC.state==='suspended')AC.resume().catch(()=>{});
  return AC;
}
function noiseBuf(a){
  if(!NB){const n=(a.sampleRate*.7)|0;NB=a.createBuffer(1,n,a.sampleRate);
    const d=NB.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;}
  return NB;
}
/* one oscillator sweeping f0 -> f1 over dur, fading to silence */
function tone(a,type,f0,f1,dur,vol,delay){
  const t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
  o.type=type;
  o.frequency.setValueAtTime(f0,t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.02);
}
/* a band of noise sweeping f0 -> f1: the swoosh and the crunch */
function hiss(a,f0,f1,dur,vol,delay,q){
  const t=a.currentTime+(delay||0),sr=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();
  sr.buffer=noiseBuf(a);sr.loop=true;
  f.type='bandpass';f.Q.value=q||1.2;
  f.frequency.setValueAtTime(f0,t);
  f.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  sr.connect(f);f.connect(g);g.connect(a.destination);sr.start(t);sr.stop(t+dur+.02);
}
function sfx(kind){
  if(!S.sfx)return;
  const a=actx();if(!a)return;
  try{
    if(kind==='swing'){            /* hero blade: bright whoosh, up then down */
      hiss(a,900,2600,.10,.16,0,.9);
      hiss(a,2600,500,.14,.12,.07,.9);
      tone(a,'triangle',520,180,.12,.05,.02);
    }else if(kind==='foeSwing'){   /* enemy swing: heavier and lower */
      hiss(a,420,1100,.12,.15,0,.8);
      hiss(a,1100,260,.16,.11,.08,.8);
      tone(a,'sawtooth',200,80,.16,.05,.03);
    }else if(kind==='hit'){        /* impact: body thud plus a crunch */
      tone(a,'sine',260,60,.18,.30,0);
      tone(a,'square',150,50,.09,.10,0);
      hiss(a,1800,700,.09,.16,0,.7);
    }else if(kind==='death'){      /* the long fall */
      tone(a,'sawtooth',380,60,.60,.20,0);
      tone(a,'sine',190,40,.70,.14,.02);
      hiss(a,1200,200,.45,.10,.05,.6);
    }
  }catch(e){}
}
function beep(ok){
  if(!S.sfx)return;
  const a=actx();if(!a)return;
  try{tone(a,ok?'square':'sine',ok?880:180,ok?880:180,.16,.07,0);}catch(e){}
}

/* ---------- keyboard build ---------- */
const kb=$('kb'),keyEls={};
ROWS.forEach(r=>{
  const row=document.createElement('div');row.className='krow';
  r.forEach(([base,up,w,side])=>{
    const b=document.createElement('button');
    b.className='key'+(w?' '+w:'');
    const isChar=base.length===1;
    if(isChar&&Z[base])b.dataset.zone=Z[base];
    if(base===' ')b.dataset.zone=0;
    const label=base===' '?'':(base==='Backspace'?'⟵<br>Backspace':base);
    if(isChar&&base!==' '){
      b.innerHTML='<span class="en">'+(/[a-z]/.test(base)?base.toUpperCase():(up?up+' '+base:base))+'</span>'+
        (HE[base]?'<span class="he">'+HE[base]+'</span>':'');
    }else{b.innerHTML='<span class="fn'+(base==='Backspace'?' small':'')+'">'+label+'</span>';}
    b.dataset.k=base;if(side)b.dataset.side=side;
    b.addEventListener('click',()=>tap(base));
    keyEls[side||base]=b;row.appendChild(b);
  });
  kb.appendChild(row);
});
function keyFor(ch){return ch==='Shift'?keyEls['ShiftLeft']:(keyEls[ch]||null);}
function clearKeys(){document.querySelectorAll('.key').forEach(k=>k.classList.remove('live','assist','bad'));}

/* ---------- play ---------- */
let L=null,lvl=-1,items=[],ix=0,ci=0,earned=0,custom=false,hp=0,hpMax=0,busy=false,guard=0,misses=0,mult=1;

function start(lesson,list,isCustom,index){
  L=lesson;lvl=(index===undefined?-1:index);items=list.slice();
  ix=0;ci=0;earned=0;custom=!!isCustom;busy=false;guard=0;misses=0;
  const f=fighter(S.hero);
  maxLives=f.lives;lives=f.lives;mult=f.mult;
  hero.base=f.base;hero.tint=f.tint;hero.alpha=1;
  $('viewMap').classList.add('hidden');$('viewShop').classList.add('hidden');
  $('viewPlay').classList.remove('hidden');$('backBtn').classList.remove('hidden');
  document.body.classList.add('playing');
  $('hebBtn').classList.remove('hidden');
  pickBiome();document.documentElement.dataset.skin=curBiome().theme;
  layoutScene();
  startLoop();newFoe();render();
}
function newFoe(){
  const pool=Math.max(3,Math.min(BESTIARY.length,(lvl<0?BESTIARY.length:lvl+3)));
  const e=BESTIARY[Math.floor(Math.random()*pool)];
  foe.base=e.base;foe.tint=e.tint;
  foe.x=CW+40;foe.alpha=1;setAnim(foe,'walk');
  hero.x=-70;hero.alpha=1;setAnim(hero,'walk');
  hpMax=Math.max(1,(items[ix]||'').replace(/ /g,'').length);hp=hpMax;
}
function swing(){
  setAnim(hero,'atk');
  sfx('swing');
  hp=Math.max(0,hp-1);
  setTimeout(()=>{if(foe.anim!=='death'){setAnim(foe,'hurt');sfx('hit');}},200);
}
function counterSwing(){
  setAnim(foe,'atk');
  sfx('foeSwing');
  setTimeout(()=>{
    const down=lives<=0;
    setAnim(hero,down?'death':'hurt');
    sfx(down?'death':'hit');
  },220);
}
function killFoe(cb){
  busy=true;
  setTimeout(()=>{setAnim(foe,'death');sfx('death');},200);
  setTimeout(()=>{busy=false;cb();},1500);
}
function render(){
  const w=items[ix]||'';
  const box=$('word');box.innerHTML='';
  [...w].forEach((c,i)=>{
    const s=document.createElement('i');
    s.textContent=c===' '?'␣':c;
    if(c===' ')s.classList.add('space');
    if(i<ci)s.classList.add('done');
    if(i===ci)s.classList.add('now');
    box.appendChild(s);
  });
  $('bar').style.width=(ix/items.length*100)+'%';
  clearKeys();
  const ch=w[ci];
  if(ch===undefined)return;
  const needShift=/[A-Z]/.test(ch)||!!SHIFTED[ch];
  const base=needShift?(SHIFTED[ch]||ch.toLowerCase()):ch;
  const k=keyFor(base);if(k)k.classList.add('live');
  if(needShift){keyEls['ShiftLeft'].classList.add('assist');keyEls['ShiftRight'].classList.add('assist');}
  $('hint').textContent=needShift
    ? 'Hold either Shift, then press '+(NAMES[base]||base.toUpperCase())
    : 'Press '+(NAMES[base]||base.toUpperCase());
  if(ci===0)sayTarget(w);
}
function tap(ch){handle(ch,false);}
function handle(ch,real){
  if(busy)return;
  const w=items[ix];if(!w)return;
  const want=w[ci];if(want===undefined)return;
  const needShift=/[A-Z]/.test(want)||!!SHIFTED[want];
  const base=needShift?(SHIFTED[want]||want.toLowerCase()):want;
  const ok=real?(ch===want||(!needShift&&ch.toLowerCase()===want.toLowerCase())):(ch===base);
  if(ok){
    beep(true);coin(1);
    if(want!==' ')swing();
    ci++;
    if(ci>=w.length){
      coin(10);clearKeys();
      if(ix<items.length-1)speak('Got it!');
      killFoe(()=>{
        ix++;ci=0;
        if(ix>=items.length)return finish();
        newFoe();render();
      });
      return;
    }
    render();
  }else{
    beep(false);
    const k=keyFor(real?(SHIFTED[ch]||ch.toLowerCase()):ch);
    if(k){k.classList.add('bad');setTimeout(()=>k.classList.remove('bad'),240);}
    const now=performance.now();
    if(now<guard)return;
    guard=now+900;
    misses++;lives--;
    counterSwing();
    if(lives<=0)gameOver();
  }
}
function coin(n){
  const g=n*mult;
  S.coins+=g;S.xp+=g;earned+=g;$('coinN').textContent=S.coins;save();
  const b=document.createElement('div');b.className='burst';b.textContent='+'+g;
  b.style.left=(window.innerWidth/2-10)+'px';b.style.top='42%';
  document.body.appendChild(b);setTimeout(()=>b.remove(),700);
}
function gameOver(){
  busy=true;clearKeys();
  $('hint').textContent='Out of hearts. Mission failed — have another go.';
  speak('Mission failed. Try again.');
  setTimeout(toMap,2600);
}
function finish(){
  $('bar').style.width='100%';
  foe.alpha=0;hero.x=HERO_HOME;setAnim(hero,'idle');
  const st=misses===0?3:(misses===1?2:1);
  $('word').innerHTML='';
  $('hint').textContent='Mission clear — '+'★'.repeat(st)+' · '+earned+' coins';
  clearKeys();speak(misses===0?'Perfect! Three stars!':'Mission clear. Well done!');
  if(!custom&&lvl>=0){
    S.best[lvl]=Math.max(S.best[lvl]||0,earned);
    S.stars[lvl]=Math.max(S.stars[lvl]||0,st);
    save();
  }
  setTimeout(toMap,2800);
}

window.addEventListener('keydown',e=>{
  if($('viewPlay').classList.contains('hidden'))return;
  if(document.activeElement&&document.activeElement.tagName==='INPUT')return;
  if(e.key==='Shift'){
    const el=keyEls[e.code==='ShiftRight'?'ShiftRight':'ShiftLeft'];
    if(el)el.classList.add('held');
    return;
  }
  if(e.key==='Alt'||e.key==='Control'||e.key==='Meta'||e.key==='Tab')return;
  e.preventDefault();
  handle(e.key,true);
});
window.addEventListener('keyup',e=>{
  if(e.key==='Shift'){keyEls['ShiftLeft'].classList.remove('held');keyEls['ShiftRight'].classList.remove('held');}
});
window.addEventListener('blur',()=>{
  keyEls['ShiftLeft'].classList.remove('held');keyEls['ShiftRight'].classList.remove('held');
});

/* ---------- map + shop ---------- */
function toMap(){
  stopLoop();
  $('viewPlay').classList.add('hidden');$('viewShop').classList.add('hidden');
  $('viewMap').classList.remove('hidden');$('backBtn').classList.add('hidden');
  $('hebBtn').classList.add('hidden');
  document.body.classList.remove('playing');
  sceneBiome=null;applySkin();
  drawPicker();drawMap();drawRank();
}
function drawMap(){
  const g=$('mapGrid');g.innerHTML='';
  LESSONS.forEach((l,i)=>{
    const st=S.stars[i]||0;
    const open=i===0||S.stars[i-1]!==undefined;
    const b=document.createElement('button');
    b.className='card'+(st?' done':'');b.disabled=!open;
    b.innerHTML='<span class="num">MISSION '+String(i+1).padStart(2,'0')+'</span>'+
      '<b>'+l.n+'</b><small>'+l.s+'</small>'+
      '<span class="stars">'+(open?(st?'★'.repeat(st)+'☆'.repeat(3-st):'☆☆☆'):'LOCKED')+'</span>';
    b.addEventListener('click',()=>start(l,l.items,false,i));
    g.appendChild(b);
  });
}
function drawShop(){
  const g=$('shopGrid');g.innerHTML='';
  SHOP.forEach(it=>{
    const owned=S.owned.includes(it.id);
    const active=(it.type==='buddy'&&S.buddy===it.id)||(it.type==='skin'&&S.skin===it.id);
    const b=document.createElement('button');
    b.className='buy'+(owned?' owned':'');
    b.innerHTML='<div class="face">'+it.face+'</div><b>'+it.name+'</b><small>'+
      (owned?(active?'In use':'Tap to use'):it.cost+' coins')+'</small>';
    b.addEventListener('click',()=>{
      if(!owned){
        if(S.coins<it.cost){b.querySelector('small').textContent='Not enough yet';return;}
        S.coins-=it.cost;S.owned.push(it.id);$('coinN').textContent=S.coins;
      }
      if(it.type==='buddy')S.buddy=(S.buddy===it.id?'':it.id);
      else S.skin=(S.skin===it.id?'core':it.id);
      save();applySkin();drawShop();
    });
    g.appendChild(b);
  });
}
function applySkin(){
  document.documentElement.dataset.skin=curBiome().theme;
  const b=$('buddy'),item=SHOP.find(s=>s.id===S.buddy);
  if(item){b.textContent=item.face;b.classList.remove('hidden');}else b.classList.add('hidden');
  document.body.classList.toggle('hide-he',!S.heb);
  $('soundBtn').textContent=S.voice?'Voice on':'Voice off';
  $('sfxBtn').textContent=S.sfx?'Sound on':'Sound off';
  $('hebBtn').textContent=S.heb?'א Hebrew keys on':'א Hebrew keys off';
  $('coinN').textContent=S.coins;
}
$('soundBtn').onclick=()=>{S.voice=S.voice?0:1;save();applySkin();};
$('sfxBtn').onclick=()=>{S.sfx=S.sfx?0:1;save();applySkin();if(S.sfx)sfx('swing');};
$('hebBtn').onclick=()=>{S.heb=S.heb?0:1;save();applySkin();};
$('voiceSel').onchange=e=>{S.voiceName=e.target.value;S.voicePick=1;save();speak('Hello, ready to play?');};
$('backBtn').onclick=toMap;
$('coinBtn').onclick=()=>{
  if($('viewShop').classList.contains('hidden')){
    stopLoop();
    $('viewMap').classList.add('hidden');$('viewPlay').classList.add('hidden');
    $('viewShop').classList.remove('hidden');$('backBtn').classList.remove('hidden');
    $('hebBtn').classList.add('hidden');
    document.body.classList.remove('playing');drawShop();
  }else toMap();
};
$('sayBtn').onclick=()=>sayTarget(items[ix]||'');
$('skipBtn').onclick=()=>{ix++;ci=0;if(ix>=items.length)finish();else{newFoe();render();}};
$('customGo').onclick=()=>{
  const v=$('customIn').value.trim();if(!v)return;
  start({n:'Your word',s:v},[v],true);
};
$('customIn').addEventListener('keydown',e=>{if(e.key==='Enter')$('customGo').click();});

applySkin();drawPicker();drawMap();drawRank();loadClips();
