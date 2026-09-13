import { CAMPAIGN, SAVE_SCHEMA, WEAPONS } from './data.js';
import { defaultSave } from './engine.js';

export const SETTINGS_KEY='pocket404dx.settings.v4';
export const ACTIVE_SLOT_KEY='pocket404dx.runequest.activeSlot';
export const LEGACY_SAVE_KEY='pocket404dx.runequest.v3';
const SLOT_PREFIX='pocket404dx.runequest.v4.slot';

const safeParse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
export const storageGet=key=>{try{return localStorage.getItem(key)}catch{return null}};
export const storageSet=(key,value)=>{try{localStorage.setItem(key,value);return true}catch{return false}};
export const storageRemove=key=>{try{localStorage.removeItem(key);return true}catch{return false}};
export const slotKey=n=>`${SLOT_PREFIX}${n}`;

export function normalizeSave(raw){
  const s={...defaultSave(),...(raw||{})};
  const arrays=['completed','runes','tools','weapons','relics','keys','openedChests','openedGates','secrets','discoveredWorld','puzzleFlags','upgrades','achievements','bestBossNoHit'];
  for(const key of arrays)if(!Array.isArray(s[key]))s[key]=[];
  if(!s.quests||typeof s.quests!=='object'||Array.isArray(s.quests))s.quests={};
  if(!s.enemyKills||typeof s.enemyKills!=='object'||Array.isArray(s.enemyKills))s.enemyKills={};
  s.schema=SAVE_SCHEMA;
  s.unlocked=Math.max(1,Math.min(CAMPAIGN.length,Number(s.unlocked)||1));
  s.currentChapter=Math.max(0,Math.min(CAMPAIGN.length-1,Number(s.currentChapter)||0));
  const maxRoom=Math.max(0,(CAMPAIGN[s.currentChapter]?.rooms.length||1)-1);
  s.currentRoom=Math.max(0,Math.min(maxRoom,Number(s.currentRoom)||0));
  s.currentMode=s.currentMode==='dungeon'?'dungeon':'world';
  s.currentWorld=s.currentWorld||'lantern-house';
  s.heartFragments=Math.max(0,Number(s.heartFragments)||0);s.shards=Math.max(0,Number(s.shards)||0);s.kills=Math.max(0,Number(s.kills)||0);
  s.newGamePlus=Math.max(0,Number(s.newGamePlus)||0);s.parries=Math.max(0,Number(s.parries)||0);if(!s.equippedRune||!s.runes.includes(s.equippedRune))s.equippedRune=s.runes[s.runes.length-1]||null;if(!s.weapons.includes('traveler-blade'))s.weapons.unshift('traveler-blade');for(const w of WEAPONS){if(w.unlockAfter&&s.completed.includes(w.unlockAfter)&&!s.weapons.includes(w.id))s.weapons.push(w.id);}if(!s.equippedWeapon||!s.weapons.includes(s.equippedWeapon))s.equippedWeapon=s.weapons[s.weapons.length-1]||'traveler-blade';
  if(!s.discoveredWorld.includes('lantern-house'))s.discoveredWorld.unshift('lantern-house');
  return s;
}

export function migrateLegacyIfNeeded(){
  const anySlot=[1,2,3].some(n=>storageGet(slotKey(n)));
  if(anySlot)return;
  const legacy=safeParse(storageGet(LEGACY_SAVE_KEY),null);
  if(!legacy)return;
  const migrated=normalizeSave({...legacy,currentMode:'world',currentWorld:'lantern-house',schema:SAVE_SCHEMA});
  storageSet(slotKey(1),JSON.stringify(migrated));
}

export function loadSlot(n){return normalizeSave(safeParse(storageGet(slotKey(n)),null));}
export function saveSlot(n,save){const normalized=normalizeSave(save);normalized.updatedAt=Date.now();storageSet(slotKey(n),JSON.stringify(normalized));return normalized;}
export function clearSlot(n){storageRemove(slotKey(n));}
export function getSlotSummary(n){
  const raw=safeParse(storageGet(slotKey(n)),null);if(!raw)return {slot:n,empty:true};const s=normalizeSave(raw);
  return {slot:n,empty:false,completed:s.completed.length,total:CAMPAIGN.length,runes:s.runes.length,tools:s.tools.length,shards:s.shards,ng:s.newGamePlus||0,updatedAt:s.updatedAt||0,campaignComplete:!!s.campaignComplete};
}
export function getActiveSlot(){const n=Number(storageGet(ACTIVE_SLOT_KEY))||1;return Math.min(3,Math.max(1,n));}
export function setActiveSlot(n){const slot=Math.min(3,Math.max(1,Number(n)||1));storageSet(ACTIVE_SLOT_KEY,String(slot));return slot;}
export const parseSettings=()=>safeParse(storageGet(SETTINGS_KEY),{});
export const saveSettings=s=>storageSet(SETTINGS_KEY,JSON.stringify(s));
