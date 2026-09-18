/* Content integrity: every pair of lists that must agree, compared.
   Run: node tests/test-content.js

   The rule these all follow is one rule: two lists maintained by hand will
   drift, and the drift is silent. The Symbols mission shipped with no spoken
   name and no voice tile for any of its eight symbols, because LESSONS and
   NAMES were written months apart and nothing compared them. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const {install}=require('./dom-stub.js');

const SRC=path.join(__dirname,'..','src','app.js');
const code=fs.readFileSync(SRC,'utf8')+
  '\n;globalThis.__T={LESSONS,keyEls,NAMES,VTOKENS,SHOP,BIOMES,DAILIES,ACH,VGROUPS,vGroupOf,WHATS_NEW,APP_VERSION,minorOf,FIGHTERS,BESTIARY,BASE,DEF,LW,RANKS,SHIFTED,ROWS,HE,Z};';

const sandbox=install();
vm.createContext(sandbox);
try{ vm.runInContext(code,sandbox,{filename:'src/app.js'}); }
catch(e){ console.error('app.js threw while loading:\n'+e.stack); process.exit(1); }
const T=sandbox.__T;
if(!T){ console.error('app.js loaded but exported nothing'); process.exit(1); }

let pass=0,fail=0;
function ok(name,cond,detail){
  if(cond){pass++;console.log('  ok   '+name);}
  else{fail++;console.log('  FAIL '+name+(detail?'\n         '+detail:''));}
}
/* Every character any lesson can ask for, plus what it takes to type it. */
const asked=new Set();
T.LESSONS.forEach(L=>L.items.forEach(it=>[...it].forEach(c=>asked.add(c))));

console.log('content');

const unreachable=[...asked].filter(ch=>{
  if(ch===' ')return !T.keyEls[' '];
  const shift=/[A-Z]/.test(ch)||!!T.SHIFTED[ch];
  const base=shift?(T.SHIFTED[ch]||ch.toLowerCase()):ch;
  return !T.keyEls[base];
});
ok('every lesson character has a key on the keyboard',unreachable.length===0,
   'unreachable: '+JSON.stringify(unreachable));

const mute=[...asked].filter(ch=>{
  const c=ch.toLowerCase();
  if(c===' ')return !T.NAMES[' '];
  if(/[a-z]/.test(c))return !T.LW[c];
  if(/[0-9]/.test(c))return false;
  return !T.NAMES[c];
});
ok('every lesson character has something to say',mute.length===0,
   'silent: '+JSON.stringify(mute));

const notile=[...asked].map(c=>c.toLowerCase())
  .filter(c=>c!==' '&&!/[a-z0-9]/.test(c))
  .filter(c=>!T.VTOKENS.includes(c));
ok('every lesson symbol has a voice-pack tile',notile.length===0,
   'no tile: '+JSON.stringify([...new Set(notile)]));

ok('every letter a-z has a word for the fallback voice',
   [...'abcdefghijklmnopqrstuvwxyz'].every(c=>T.LW[c]));

/* The voice pack renders one tab at a time, so a token no group claims is a
   tile that exists in VTOKENS and can never be reached to record. */
ok('every voice token lands in exactly one group',(()=>{
  return T.VTOKENS.every(tok=>T.VGROUPS.filter(g=>g.has(tok)).length===1);
})(),'miscounted: '+JSON.stringify(T.VTOKENS.filter(t=>T.VGROUPS.filter(g=>g.has(t)).length!==1)));
ok('every voice group has a name and holds something',
   T.VGROUPS.every(g=>g.id&&g.t&&typeof g.has==='function'));
ok('the groups together cover the whole voice pack',
   T.VTOKENS.every(t=>T.VGROUPS.some(g=>g.id===T.vGroupOf(t))));

console.log('sprites and shop');
ok('every fighter points at a sprite row that exists',
   T.FIGHTERS.every(f=>T.BASE[f.base]),
   'bad: '+JSON.stringify(T.FIGHTERS.filter(f=>!T.BASE[f.base]).map(f=>f.id)));
ok('every enemy points at a sprite row that exists',
   T.BESTIARY.every(f=>T.BASE[f.base]));
/* The album keys on id and shows name; deriving one from the other would put
   the two out of step the first time an enemy is renamed. */
ok('every enemy has a stable id and a name',
   T.BESTIARY.every(e=>e.id&&e.name),
   'incomplete: '+JSON.stringify(T.BESTIARY.filter(e=>!(e.id&&e.name)).map(e=>e.name||e.id)));
ok('no two enemies share an id',new Set(T.BESTIARY.map(e=>e.id)).size===T.BESTIARY.length);
ok('no two enemies share a name',new Set(T.BESTIARY.map(e=>e.name)).size===T.BESTIARY.length);
/* Missions widen the pool by index; an enemy past the last mission's reach
   could never be met, and its album slot would stay a shadow forever. */
ok('every enemy is reachable by some mission',(()=>{
  const widest=Math.max(3,Math.min(T.BESTIARY.length,(T.LESSONS.length-1)+3));
  return widest>=T.BESTIARY.length;
})(),'the pool only ever reaches '+Math.max(3,Math.min(T.BESTIARY.length,(T.LESSONS.length-1)+3))+
   ' of '+T.BESTIARY.length+' enemies');
const biome=id=>T.BIOMES.find(b=>b.id===id);
ok('every shop arena skin is a real environment',
   T.SHOP.filter(s=>s.type==='skin').every(s=>biome(s.id)),
   'missing: '+JSON.stringify(T.SHOP.filter(s=>s.type==='skin'&&!biome(s.id)).map(s=>s.id)));
ok('every environment has a name, a theme, a palette and a painter',
   T.BIOMES.every(b=>b.id&&b.name&&b.theme&&b.pal&&typeof b.paint==='function'),
   'bad: '+JSON.stringify(T.BIOMES.filter(b=>!(b.id&&b.name&&b.theme&&b.pal&&typeof b.paint==='function')).map(b=>b.id)));
ok('every environment palette defines every colour a painter reads',
   T.BIOMES.every(b=>['sky','ink','glow','floor','grid','solid','lit'].every(k=>b.pal[k])),
   'incomplete: '+JSON.stringify(T.BIOMES.filter(b=>!['sky','ink','glow','floor','grid','solid','lit'].every(k=>b.pal[k])).map(b=>b.id)));
ok('no two environments share an id',new Set(T.BIOMES.map(b=>b.id)).size===T.BIOMES.length);
/* The page chrome is themed in CSS and the arena is painted in JS; the two are
   separate lists and drift silently — a biome naming a theme nobody styled
   simply keeps the previous screen's colours. */
const css=fs.readFileSync(path.join(__dirname,'..','src','styles.css'),'utf8');
const themed=[...new Set(T.BIOMES.map(b=>b.theme))];
const unstyled=themed.filter(t=>!css.includes(':root[data-skin="'+t+'"]')&&t!=='core');
ok('every environment theme has a rule in the stylesheet',unstyled.length===0,
   'unstyled: '+JSON.stringify(unstyled));
ok('every shop item has a handled type',
   T.SHOP.every(s=>s.type==='skin'||s.type==='buddy'),
   'types: '+JSON.stringify([...new Set(T.SHOP.map(s=>s.type))]));
ok('every shop item costs something',T.SHOP.every(s=>s.cost>0));
ok('everything owned by default actually exists',
   T.DEF.owned.every(o=>biome(o)||T.FIGHTERS.some(f=>f.id===o)||T.SHOP.some(s=>s.id===o)),
   'dangling: '+JSON.stringify(T.DEF.owned.filter(o=>!biome(o)&&!T.FIGHTERS.some(f=>f.id===o)&&!T.SHOP.some(s=>s.id===o))));
ok('the default arena setting is a real choice',
   T.DEF.arena==='auto'||!!biome(T.DEF.arena));
ok('the default fighter and skin are owned by default',
   T.DEF.owned.includes(T.DEF.hero)&&T.DEF.owned.includes(T.DEF.skin));

console.log('progression');
ok('ranks are in ascending XP order',
   T.RANKS.every((r,i)=>i===0||r[1]>T.RANKS[i-1][1]));
ok('the first rank starts at zero XP',T.RANKS[0][1]===0);
ok('every fighter a mission can unlock is reachable',
   T.FIGHTERS.every(f=>typeof f.cost==='number'&&f.cost>=0));
ok('no two fighters share an id',
   new Set(T.FIGHTERS.map(f=>f.id)).size===T.FIGHTERS.length);
ok('no two shop items share an id',
   new Set(T.SHOP.map(s=>s.id)).size===T.SHOP.length);
ok('every lesson has at least one item',T.LESSONS.every(L=>L.items.length>0));
ok('every lesson has a name and a subtitle',T.LESSONS.every(L=>L.n&&L.s));

console.log('release');
/* Release notes go stale silently: they sat on one version for fifty releases
   in the sibling project, still announcing things that were long since old.
   Memory does not fix that; a gate does. */
ok('the release notes describe this release',
   T.minorOf(T.WHATS_NEW.for)===T.minorOf(T.APP_VERSION),
   'notes are for '+T.WHATS_NEW.for+' but this is '+T.APP_VERSION+
   ' — rewrite WHATS_NEW.items and set .for before shipping a feature release');
ok('the notes are not empty',T.WHATS_NEW.items.length>0);
ok('every note has a heading and a description',
   T.WHATS_NEW.items.every(i=>Array.isArray(i)&&i.length===2&&i[0]&&i[1]));
/* A suffix would break the comparison above and show the banner forever. */
ok('the version is plain numbers',/^\d+\.\d+\.\d+$/.test(T.APP_VERSION),
   'APP_VERSION is '+T.APP_VERSION);

console.log('dailies and achievements');
ok('every daily is complete and rewarding',
   T.DAILIES.every(m=>m.id&&m.t&&m.goal>0&&m.coins>0&&typeof m.get==='function'),
   'bad: '+JSON.stringify(T.DAILIES.filter(m=>!(m.id&&m.t&&m.goal>0&&m.coins>0&&typeof m.get==='function')).map(m=>m.id)));
ok('no two dailies share an id',new Set(T.DAILIES.map(m=>m.id)).size===T.DAILIES.length);
ok('there are at least three dailies to choose from',T.DAILIES.length>=3);
/* A daily reading a counter nobody increments can never be finished, and the
   day object and the getters are two lists. */
ok('every daily reads a counter the day object actually has',(()=>{
  const day={n:0,missions:0,hits:0,perfect:0,drills:0,coins:0,arenas:[],done:{}};
  return T.DAILIES.every(m=>{const v=m.get(day);return typeof v==='number'&&!isNaN(v);});
})());
ok('every achievement is a pure test with an id and a name',
   T.ACH.every(a=>a.id&&a.t&&typeof a.ok==='function'));
ok('no two achievements share an id',new Set(T.ACH.map(a=>a.id)).size===T.ACH.length);
ok('no achievement is already earned on a fresh save',(()=>{
  const blank={hits:0,miss:0,mastered:0,acc:0,avg:0,cleared:0,stars:0};
  return T.ACH.every(a=>{try{return !a.ok(blank);}catch(e){return false;}});
})(),'earned at zero: '+JSON.stringify(T.ACH.filter(a=>{try{return a.ok({hits:0,miss:0,mastered:0,acc:0,avg:0,cleared:0,stars:0});}catch(e){return true;}}).map(a=>a.id)));

console.log('keyboard');
ok('every key with a Hebrew legend is a real key',
   Object.keys(T.HE).every(k=>T.keyEls[k]),
   'orphan legends: '+JSON.stringify(Object.keys(T.HE).filter(k=>!T.keyEls[k])));
ok('every finger-zone entry is a real key',
   Object.keys(T.Z).every(k=>T.keyEls[k]),
   'orphan zones: '+JSON.stringify(Object.keys(T.Z).filter(k=>!T.keyEls[k])));
ok('every shifted symbol maps to a real key',
   Object.values(T.SHIFTED).every(base=>T.keyEls[base]),
   'orphans: '+JSON.stringify(Object.values(T.SHIFTED).filter(b=>!T.keyEls[b])));
ok('both Shift keys exist',!!T.keyEls['ShiftLeft']&&!!T.keyEls['ShiftRight']);

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
