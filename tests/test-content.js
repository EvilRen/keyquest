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
  '\n;globalThis.__T={LESSONS,keyEls,NAMES,VTOKENS,SHOP,BIOMES,FIGHTERS,BESTIARY,BASE,DEF,LW,RANKS,SHIFTED,ROWS,HE,Z};';

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

console.log('sprites and shop');
ok('every fighter points at a sprite row that exists',
   T.FIGHTERS.every(f=>T.BASE[f.base]),
   'bad: '+JSON.stringify(T.FIGHTERS.filter(f=>!T.BASE[f.base]).map(f=>f.id)));
ok('every enemy points at a sprite row that exists',
   T.BESTIARY.every(f=>T.BASE[f.base]));
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
