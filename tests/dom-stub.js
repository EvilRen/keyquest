/* A DOM small enough to load src/app.js in node, and no smaller.
   The tests run the real shipped file rather than a copy of its tables — a
   copy is a second list, and two lists maintained by hand always drift. */
'use strict';

function el(tag){
  const e={
    tagName:(tag||'div').toUpperCase(),
    children:[],dataset:{},style:{},className:'',id:'',
    innerHTML:'',textContent:'',value:'',checked:false,disabled:false,
    width:0,height:0,
    classList:{
      _s:new Set(),
      add(...c){c.forEach(x=>this._s.add(x));},
      remove(...c){c.forEach(x=>this._s.delete(x));},
      toggle(c,on){on===undefined?(this._s.has(c)?this._s.delete(c):this._s.add(c)):(on?this._s.add(c):this._s.delete(c));},
      contains(c){return this._s.has(c);}
    },
    appendChild(c){this.children.push(c);return c;},
    removeChild(c){this.children=this.children.filter(x=>x!==c);return c;},
    remove(){},
    addEventListener(){},removeEventListener(){},
    getContext(){return ctx2d();},
    getBoundingClientRect(){return {top:0,left:0,width:0,height:0,bottom:0,right:0};},
    querySelector(){return null;},querySelectorAll(){return [];},
    focus(){},blur(){},click(){},
    setAttribute(k,v){this[k]=v;},getAttribute(k){return this[k];},
    appendTo(){}
  };
  return e;
}
function ctx2d(){
  const noop=()=>{};
  return new Proxy({imageSmoothingEnabled:false,fillStyle:'',strokeStyle:'',globalAlpha:1,filter:'',lineWidth:1,font:''},{
    get(t,k){ if(k in t) return t[k]; return noop; },
    set(t,k,v){ t[k]=v; return true; }
  });
}

function install(){
  const byId={};
  const document={
    documentElement:el('html'),
    body:el('body'),
    createElement:tag=>el(tag),
    createElementNS:(ns,tag)=>el(tag),
    getElementById(id){ return byId[id] || (byId[id]=el('div')); },
    querySelector(){return null;},
    querySelectorAll(){return [];},
    addEventListener(){},removeEventListener(){},
    hidden:false
  };
  const storage=()=>{const m=new Map();return{
    getItem:k=>m.has(k)?m.get(k):null,
    setItem:(k,v)=>m.set(k,String(v)),
    removeItem:k=>m.delete(k),clear:()=>m.clear()};};

  const win={
    document,
    localStorage:storage(),sessionStorage:storage(),
    navigator:{userAgent:'node',mediaDevices:null,language:'en'},
    location:{hostname:'localhost',href:'http://localhost/',search:''},
    Image:function(){ return {set src(v){}, get src(){return '';}, addEventListener(){}, onload:null}; },
    Audio:function(){ return {play(){return Promise.resolve();},pause(){}}; },
    indexedDB:{open(){const r={};setTimeout(()=>{},0);return r;}},
    speechSynthesis:{speak(){},cancel(){},getVoices(){return [];},addEventListener(){}},
    SpeechSynthesisUtterance:function(){return {};},
    AudioContext:function(){return {currentTime:0,state:'running',sampleRate:44100,
      createOscillator:()=>({frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}}),
      createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}),
      createBiquadFilter:()=>({frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},Q:{},type:'',connect(){}}),
      createBufferSource:()=>({buffer:null,loop:false,connect(){},start(){},stop(){}}),
      createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)}),
      resume(){return Promise.resolve();},destination:{}};},
    MediaRecorder:null,
    requestAnimationFrame(){return 0;},cancelAnimationFrame(){},
    performance:{now:()=>0},
    setTimeout,clearTimeout,setInterval,clearInterval,
    matchMedia:()=>({matches:false,addEventListener(){},addListener(){}}),
    devicePixelRatio:1,
    addEventListener(){},removeEventListener(){},dispatchEvent(){return true;}
  };
  win.window=win;
  win.webkitAudioContext=win.AudioContext;
  win.globalThis=win;
  return win;
}
module.exports={install};
