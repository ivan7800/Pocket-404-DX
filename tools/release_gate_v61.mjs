#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { VERSION, SAVE_SCHEMA, CAMPAIGN, WEAPONS, RUNE_ABILITIES, UPGRADES, QUESTS, OVERWORLD_ROOMS, BESTIARY } from '../js/data.js';
import { RuneQuestEngine, defaultSave } from '../js/engine.js';
import { normalizeSave, saveSlot, loadSlot, clearSlot } from '../js/save.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const noop=()=>{};
const ctx=new Proxy({imageSmoothingEnabled:false},{get:(t,p)=>p in t?t[p]:noop,set:(t,p,v)=>(t[p]=v,true)});
const canvas={getContext:()=>ctx,width:256,height:144};
const makeEngine=(saveRef)=>new RuneQuestEngine(canvas,{onHud:noop,onMessage:noop,onMode:noop,onChapterComplete:noop,onAchievement:noop,sound:noop,scene:noop,onEnding:noop,getSave:()=>saveRef.value,setSave:s=>{saveRef.value=s;}});
const elite=new Set(['barkmaw','magmaox','kelpmaw','copperowl','glassknight','rocling','nameless']);
const price=Object.fromEntries(UPGRADES.map(u=>[u.id,u.cost]));
const priority=['tempered-edge','swift-boots','shard-purse','heart-vessel','guard-core','rune-capacitor','charged-core'];
const weaponPlan=['traveler-blade','briar-cleaver','ember-sabre','ember-sabre','ember-sabre','prism-edge','aether-blade'];
const upgradesBefore=[[],['tempered-edge'],['tempered-edge','swift-boots'],['tempered-edge','swift-boots','shard-purse'],['tempered-edge','swift-boots','shard-purse','heart-vessel'],['tempered-edge','swift-boots','shard-purse','heart-vessel','guard-core'],['tempered-edge','swift-boots','shard-purse','heart-vessel','guard-core','rune-capacitor']];

assert.equal(VERSION,'6.1.0');
assert.equal(SAVE_SCHEMA,6);
assert.equal(CAMPAIGN.length,7);assert.equal(WEAPONS.length,7);assert.equal(Object.keys(RUNE_ABILITIES).length,7);assert.equal(BESTIARY.length,37);
assert.equal(CAMPAIGN.reduce((n,c)=>n+c.rooms.length,0),51);

// Save migration: v6 adds an explicitly equipped rune while preserving v5 progress.
const migrated=normalizeSave({schema:5,runes:['VERDANT','EMBER'],completed:['moss-gate','sunken-forge'],weapons:['traveler-blade','briar-cleaver','ember-sabre'],equippedWeapon:'ember-sabre'});
assert.equal(migrated.schema,6);assert.equal(migrated.equippedRune,'EMBER');assert.equal(migrated.equippedWeapon,'ember-sabre');

// Persistence round-trip with an in-memory localStorage implementation.
{
  const mem=new Map();globalThis.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
  saveSlot(1,{...defaultSave(),runes:['VERDANT','EMBER'],equippedRune:'VERDANT',shards:77});const loaded=loadSlot(1);assert.equal(loaded.shards,77);assert.equal(loaded.equippedRune,'VERDANT');assert.equal(loaded.schema,6);clearSlot(1);assert.equal(mem.size,0);delete globalThis.localStorage;
}

// Keyboard guard must not refresh parry forever due key-repeat.
{
  const ref={value:normalizeSave(defaultSave())}; const e=makeEngine(ref);e.mode='playing';e.player={x:20,y:70,w:9,h:11,hp:5,maxHp:5,facing:'right',speed:64,attackCombo:0};
  e.setKey('KeyX',true);assert.ok(e.parryTimer>0);e.parryTimer=.03;e.setKey('KeyX',true);assert.equal(e.parryTimer,.03);e.setKey('KeyX',false);assert.equal(e.touch.has('guard'),false);
}

// Perfect parry still functions after hardening key-repeat.
{
  const ref={value:normalizeSave(defaultSave())}; const e=makeEngine(ref);e.mode='playing';e.player={x:20,y:70,w:9,h:11,hp:5,maxHp:5,facing:'right',speed:64,attackCombo:0};
  e.startGuard();const q={x:31,y:73,w:3,h:3,vx:-60,vy:0,life:1,projectile:true};e.damagePlayer(q);assert.equal(ref.value.parries,1);assert.equal(q.dead,true);assert.ok(e.projectiles.some(x=>x.playerOwned));
}

// Rune selection is persistent, cycleable, and ability execution uses the selected rune.
{
  const s=normalizeSave({...defaultSave(),runes:['VERDANT','EMBER','TIDE'],equippedRune:'VERDANT'});const ref={value:s};const e=makeEngine(ref);e.mode='playing';e.player={x:20,y:70,w:9,h:11,hp:4,maxHp:6,facing:'right',speed:64,attackCombo:0};e.enemies=[{x:30,y:70,w:10,h:10,hp:8,maxHp:8,hurt:0,stun:0,burn:0}];
  e.cycleRune();assert.equal(ref.value.equippedRune,'EMBER');assert.equal(e.activeRune(),'EMBER');e.activateRune();assert.ok(e.enemies[0].hp<8);assert.ok(e.runeCooldown>0);
}

// Main-path economy: no secrets/sidequests/optional chests required. A sensible priority buys one upgrade per chapter.
let shards=0,purse=false;const owned=[];const economy=[];
for(const ch of CAMPAIGN){let income=0;for(const room of ch.rooms){if(room.boss)income+=10;for(const [kind] of room.enemies||[])income+=elite.has(kind)?6:(purse?2:1);if(room.reward&&!room.reward.optional)income+=room.reward.type==='heart'?5:room.reward.type==='key'?3:room.reward.type==='tool'?6:8;}shards+=income;const bought=[];for(const id of priority){if(!owned.includes(id)&&shards>=price[id]){shards-=price[id];owned.push(id);bought.push(id);if(id==='shard-purse')purse=true;}}economy.push({chapter:ch.chapter,income,balance:shards,bought});}
assert.equal(owned.length,UPGRADES.length);assert.ok(shards>=0);

// Combat lower-bound TTK: assumes impossible 100% melee uptime, so real fights should be longer.
const ttk=[];
for(let i=0;i<CAMPAIGN.length;i++){
  const room=CAMPAIGN[i].rooms.at(-1);const hp=room.boss[3],w=WEAPONS.find(x=>x.id===weaponPlan[i]),ups=upgradesBefore[i];let sum=0;
  for(let k=0;k<3;k++){let dmg=w.damage+(ups.includes('tempered-edge')?1:0);if(k===2){dmg+=w.combo||0;if(i>=2)dmg+=1;}sum+=dmg;}
  const dps=(sum/3)/(w.cooldown*(ups.includes('swift-boots')?.88:1));const seconds=hp/dps;ttk.push({chapter:i+1,boss:room.name,hp,weapon:w.name,dps:+dps.toFixed(2),lowerBoundSeconds:+seconds.toFixed(2)});assert.ok(seconds>=6,`${room.name} melts too quickly: ${seconds}`);
}
assert.ok(ttk.at(-1).lowerBoundSeconds>=8.5);

// Boss HP progression and phase exposure.
const guardianHp=CAMPAIGN.map(c=>c.rooms.at(-1).boss[3]);for(let i=1;i<guardianHp.length;i++)assert.ok(guardianHp[i]>guardianHp[i-1]);
const miniHp=CAMPAIGN.map(c=>c.rooms.find(r=>r.type==='miniboss').enemies[0][3]);for(let i=1;i<miniHp.length;i++)assert.ok(miniHp[i]>miniHp[i-1]);

// 51-room autoplay gate: every room loads, enemies clear, puzzle/tool prerequisites resolve, rewards collect and bosses advance the real state machine.
{
  const ref={value:normalizeSave(defaultSave())};let endings=0;const e=new RuneQuestEngine(canvas,{onHud:noop,onMessage:noop,onMode:noop,onChapterComplete:noop,onAchievement:noop,sound:noop,scene:noop,onEnding:()=>{endings++;},getSave:()=>ref.value,setSave:s=>{ref.value=s;}});
  const drain=()=>{let guard=0;while(e.mode==='dialogue'&&guard++<80)e.advanceMessage();assert.ok(guard<80,'dialogue loop');};
  let loaded=0;
  for(let ci=0;ci<CAMPAIGN.length;ci++){
    e.newCampaign(ci);drain();
    for(let ri=0;ri<CAMPAIGN[ci].rooms.length;ri++){
      if(e.chapterIndex!==ci||e.roomIndex!==ri)e.loadRoom(ri,ri===0);drain();loaded++;
      for(const t of e.toolTargets){assert.ok(ref.value.tools.includes(t.require),`missing required tool ${t.require} at ${ci}:${ri}`);t.active=true;}
      for(const sw of e.switches)sw.active=true;
      for(const foe of e.enemies)foe.hp=0;
      e.mode='playing';e.update(1/60);
      if(e.chest?.visible&&!e.chest.collected)e.collectChest();drain();
      if(e.room.type==='boss'){if(ci===CAMPAIGN.length-1){ref.value.quests=Object.fromEntries(QUESTS.map(q=>[q.id,'complete']));/* finish already triggered above, so recompute true ending only if needed */if(!ref.value.trueEnding){ref.value.trueEnding=ref.value.relics.length>=6;}}break;}
      if(ri+1<CAMPAIGN[ci].rooms.length)e.loadRoom(ri+1,false);
    }
  }
  assert.equal(loaded,51);assert.equal(ref.value.completed.length,7);assert.equal(ref.value.tools.length,6);assert.equal(ref.value.runes.length,7);assert.equal(ref.value.weapons.length,7);assert.ok(ref.value.relics.length>=6);assert.equal(ref.value.campaignComplete,true);assert.ok(endings>=1);
}

// Structural full-campaign ending pass using the real finishChapter state machine.
{
  const ref={value:normalizeSave(defaultSave())};const e=makeEngine(ref);e.player={x:20,y:70,w:9,h:11,hp:5,maxHp:5,facing:'right',speed:64,attackCombo:0};
  for(let i=0;i<CAMPAIGN.length;i++){
    e.chapterIndex=i;e.roomIndex=CAMPAIGN[i].rooms.length-1;e.room=CAMPAIGN[i].rooms.at(-1);e.roomHits=1;
    if(i===6){ref.value.relics=['R1','R2','R3','R4','R5','R6'];ref.value.quests=Object.fromEntries(QUESTS.map(q=>[q.id,'complete']));}
    e.finishChapter();
  }
  assert.equal(ref.value.completed.length,7);assert.equal(ref.value.runes.length,7);assert.equal(ref.value.weapons.length,7);assert.equal(ref.value.campaignComplete,true);assert.equal(ref.value.trueEnding,true);assert.equal(ref.value.creditsSeen,true);assert.equal(ref.value.equippedRune,'NULL');
}

// Data integrity: every dungeon portal points to an existing chapter and every neighbor exists.
for(const [id,room] of Object.entries(OVERWORLD_ROOMS)){
  if(room.portal)assert.ok(CAMPAIGN[room.portal.chapter],`bad portal ${id}`);
  for(const n of Object.values(room.neighbors||{})){const target=typeof n==='string'?n:n?.id;if(target)assert.ok(OVERWORLD_ROOMS[target],`bad neighbor ${id}->${target}`);}
}

// DOM references used by app.js must exist in index.html.
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const ids=new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]));
const refs=new Set([...app.matchAll(/\$\(['"]#([A-Za-z0-9_-]+)['"]\)/g)].map(m=>m[1]));
const missing=[...refs].filter(id=>!ids.has(id));assert.deepEqual(missing,[]);
assert.ok(ids.has('runeCycleBtn'));

// The generated browser bundle is a classic script: no ESM import/export tokens may survive concatenation.
const bundle=fs.readFileSync(path.join(root,'js/bundle.js'),'utf8');
assert.equal(/^\s*(?:import|export)\s/m.test(bundle),false,'bundle.js still contains ESM syntax');

// Service worker shell paths must resolve locally.
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
for(const m of sw.matchAll(/'\.\/([^'?]+)(?:\?[^']*)?'/g)){const rel=m[1];if(!rel)continue;const full=path.join(root,rel);assert.ok(fs.existsSync(full),`missing SW asset: ${rel}`);}

const report={version:VERSION,schema:SAVE_SCHEMA,counts:{dungeons:CAMPAIGN.length,rooms:CAMPAIGN.reduce((n,c)=>n+c.rooms.length,0),weapons:WEAPONS.length,runes:Object.keys(RUNE_ABILITIES).length,bestiary:BESTIARY.length},economy,ttk,guardianHp,miniHp,remainingShards:shards};
fs.writeFileSync(path.join(root,'tools/release_gate_v61_result.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));console.log('RELEASE_GATE_V61_PASS');
