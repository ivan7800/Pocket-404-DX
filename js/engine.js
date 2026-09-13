import { CAMPAIGN, ACHIEVEMENTS, OVERWORLD_ROOMS, QUESTS, TOOLS, WEAPONS, RUNE_ABILITIES } from './data.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const hit=(a,b)=>a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const center=e=>({x:e.x+e.w/2,y:e.y+e.h/2});

export function defaultSave(){
  return {
    schema:6, unlocked:1, completed:[], runes:[], equippedRune:null, tools:[], weapons:['traveler-blade'], equippedWeapon:'traveler-blade', relics:[], keys:[], openedChests:[], openedGates:[], secrets:[], discoveredWorld:['lantern-house'], puzzleFlags:[], upgrades:[], heartFragments:0,
    quests:{}, enemyKills:{}, currentMode:'world', currentWorld:'lantern-house', currentChapter:0, currentRoom:0, shards:0, kills:0, parries:0, achievements:[], campaignComplete:false,
    trueEnding:false, creditsSeen:false, lastPlayed:null, bestBossNoHit:[], newGamePlus:0, updatedAt:Date.now()
  };
}

  export class RuneQuestEngine{
  constructor(canvas,{onHud,onMessage,onMode,onChapterComplete,onAchievement,sound,scene,getSave,setSave,onEnding}){
    this.canvas=canvas; this.ctx=canvas.getContext('2d',{alpha:false}); this.ctx.imageSmoothingEnabled=false;
    this.cb={onHud,onMessage,onMode,onChapterComplete,onAchievement,sound,scene,getSave,setSave,onEnding};
    this.keys=new Set(); this.touch=new Set();
    this.mode='idle'; this.pausedFrom='playing'; this.last=performance.now(); this.acc=0; this.running=false; this.raf=0;
    this.chapterIndex=0; this.roomIndex=0; this.room=null; this.player=null; this.enemies=[]; this.projectiles=[]; this.particles=[];
    this.attackTimer=0; this.attackCd=0; this.attackHeld=false; this.attackHold=0; this.chargedReady=false; this.chargeFxShown=false; this.parryTimer=0; this.damageCd=0; this.invulnTimer=0; this.focusTimer=0; this.runeCooldown=0; this.runeFxTimer=0; this.prismBarrierTimer=0; this.echoSlowTimer=0; this.roomHits=0; this.roomClear=false; this.transitionTimer=0;
    this.messages=[]; this.pendingAction=null; this.roomTitleTimer=0; this.fps=60; this.fpsAcc=0;this.fpsFrames=0;this.fpsLast=performance.now();
    this.obstacles=[]; this.switches=[]; this.toolTargets=[]; this.npc=null; this.npcs=[]; this.chest=null; this.pickups=[]; this.worldRoom=null; this.areaMode='dungeon'; this.nullReviveUsed=false; this.verdantHealed=false; this.frameCount=0;
    this.loop=this.loop.bind(this);
  }

  start(){ if(this.running)return; this.running=true; this.last=performance.now(); this.raf=requestAnimationFrame(this.loop); }
  stop(){ this.running=false; cancelAnimationFrame(this.raf); }
  destroy(){ this.stop(); this.keys.clear(); this.touch.clear(); }

  setKey(code,down){
    const movement=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'];
    if(movement.includes(code)){down?this.keys.add(code):this.keys.delete(code);return true;}
    if(code==='KeyZ'){down?this.pressAttack():this.releaseAttack();return true;}
    if(code==='KeyX'){if(down){if(!this.touch.has('guard'))this.startGuard();}else this.stopGuard();return true;}
    if(!down)return false;
    if(code==='KeyC'||code==='KeyE'||code==='Enter'){this.interact();return true;}
    if(code==='KeyQ'){this.cycleWeapon();return true;}
    if(code==='KeyR'){this.activateRune();return true;}
    if(code==='KeyT'){this.cycleRune();return true;}
    if(code==='Escape'){this.togglePause();return true;}
    if(code==='Space'&&this.mode==='dialogue'){this.advanceMessage();return true;}
    return false;
  }
  releaseKey(code){if(code==='KeyX')this.stopGuard();if(code==='KeyZ')this.releaseAttack();}
  setControl(control,down){
    if(['up','down','left','right'].includes(control)){down?this.touch.add(control):this.touch.delete(control);return;}
    if(control==='guard'){down?this.startGuard():this.stopGuard();return;}
    if(control==='attack'){down?this.pressAttack():this.releaseAttack();return;}
    if(control==='interact'&&down){this.interact();return;}
    if(control==='weapon'&&down){this.cycleWeapon();return;}
    if(control==='rune'&&down){this.activateRune();return;}
    if(control==='runeCycle'&&down){this.cycleRune();return;}
  }

  startGuard(){if(this.mode!=='playing'||this.touch.has('guard'))return;this.touch.add('guard');this.parryTimer=.16+(this.hasUpgrade('guard-core')?.08:0)+(this.currentWeapon()?.id==='prism-edge'?.05:0);this.cb.sound?.('block');}
  stopGuard(){this.touch.delete('guard');}
  pressAttack(){if(this.mode==='dialogue'){this.advanceMessage();return;}if(this.mode!=='playing'||this.attackHeld)return;this.attackHeld=true;this.attackHold=0;this.chargedReady=false;this.chargeFxShown=false;this.attack(false);}
  releaseAttack(){if(!this.attackHeld)return;const charged=this.chargedReady;this.attackHeld=false;this.attackHold=0;this.chargedReady=false;this.chargeFxShown=false;if(charged&&this.mode==='playing')this.attack(true);}

    startAdventure(){
    const save=this.cb.getSave();
    save.currentMode='world';save.currentWorld='lantern-house';save.currentChapter=0;save.currentRoom=0;save.lastPlayed='lantern-house';
    if(!save.discoveredWorld.includes('lantern-house'))save.discoveredWorld.push('lantern-house');
    this.cb.setSave(save);this.loadWorldRoom('lantern-house',null,true);
    this.queueMessages([
      'VE Y R A · THE UNWRITTEN WORLD',
      'Los caminos están perdiendo sus nombres. Edda, la última archivista, te entrega una hoja sin inscripción.',
      'EDDA · «No quiero que reconstruyas el viejo Archivo. Quiero que descubras por qué tuvo que caer».',
      'Explora Bellwether y encuentra Moss Gate. C / E / ENTER sirve para hablar, usar herramientas y entrar en santuarios.'
    ],null);
  }

  resumeAdventure(){
    const save=this.cb.getSave();
    if(save.currentMode==='dungeon'&&CAMPAIGN[save.currentChapter]){
      this.chapterIndex=clamp(save.currentChapter||0,0,CAMPAIGN.length-1);this.loadRoom(clamp(save.currentRoom||0,0,CAMPAIGN[this.chapterIndex].rooms.length-1),true);
      this.queueMessages([`RETURN · ${CAMPAIGN[this.chapterIndex].name.toUpperCase()}`,this.objectiveText()],null);
      return;
    }
    this.loadWorldRoom(save.currentWorld||'lantern-house',null,true);
    this.queueMessages([`RETURN · ${(this.worldRoom?.name||'VEYRA').toUpperCase()}`,this.objectiveText()],null);
  }

  loadWorldRoom(id,entryDir=null,fullHeal=false){
    const room=OVERWORLD_ROOMS[id]||OVERWORLD_ROOMS['lantern-house'];const save=this.cb.getSave();
    this.areaMode='world';this.worldRoom=room;this.room=room;this.roomIndex=-1;this.chapterIndex=Math.max(0,Math.min(CAMPAIGN.length-1,save.currentChapter||0));
    const maxHp=this.maxHp(save),hp=fullHeal||!this.player?maxHp:Math.max(1,this.player.hp);
    let x=28,y=78;if(entryDir==='left')x=228;if(entryDir==='right')x=18;if(entryDir==='up')y=120;if(entryDir==='down')y=24;
    this.player={x,y,w:9,h:11,hp,maxHp,facing:entryDir==='left'?'left':entryDir==='right'?'right':entryDir==='up'?'up':entryDir==='down'?'down':'right',speed:this.hasUpgrade('swift-boots')?74:64,attackCombo:0};
    this.enemies=[];this.projectiles=[];this.particles=[];this.pickups=[];this.roomHits=0;this.roomClear=false;this.transitionTimer=0;this.attackCd=0;this.attackHeld=false;this.attackHold=0;this.chargedReady=false;this.parryTimer=0;this.damageCd=0;this.invulnTimer=0;this.prismBarrierTimer=0;this.echoSlowTimer=0;this.nullReviveUsed=false;this.verdantHealed=false;
    this.obstacles=this.makeObstacles(room.layout);this.switches=[];this.toolTargets=[];this.chest=null;this.npc=null;this.npcs=(room.npcs||[]).map(n=>({...n,w:9,h:12}));
    for(const [kind,ex,ey,hpEnemy] of (room.enemies||[]))this.enemies.push(this.makeEnemy(kind,ex,ey,hpEnemy));
    save.currentMode='world';save.currentWorld=id;save.lastPlayed=id;if(!save.discoveredWorld.includes(id))save.discoveredWorld.push(id);if(save.discoveredWorld.length>=15)this.unlockAchievement('worldwalker',save);this.cb.setSave(save);
    this.mode='playing';this.roomTitleTimer=1.35;this.cb.onMode?.(this.mode);this.cb.scene?.(this.worldScene(room));this.hud();this.cb.sound?.('room');
  }

  worldScene(room){return ['forest','forge','tide','clock','mirror','star','null'][room?.theme??0]||'world';}

  enterDungeon(chapterIndex){
    const save=this.cb.getSave();const idx=clamp(chapterIndex,0,CAMPAIGN.length-1);const ch=CAMPAIGN[idx];
    if(ch.final&&save.completed.length<idx){this.cb.sound?.('error');this.queueMessages(['NULL ARCHIVE · SEALED','Las seis runas exteriores deben responder antes de que esta puerta exista.'],null);return;}
    if(idx>0&&!save.completed.includes(CAMPAIGN[idx-1].id)){this.cb.sound?.('error');this.queueMessages([`${ch.name.toUpperCase()} · DORMANT`,`El camino todavía no reconoce tus runas.`],null);return;}
    this.newCampaign(idx);
  }

  worldNeighbor(dir){const n=this.worldRoom?.neighbors?.[dir];return typeof n==='string'?{id:n}:n||null;}
  tryWorldTransition(dir){
    if(this.areaMode!=='world')return false;const n=this.worldNeighbor(dir);if(!n)return false;
    const save=this.cb.getSave();if(n.require&&!save.tools.includes(n.require)){this.cb.sound?.('error');this.queueMessages([n.blocked||`Necesitas ${TOOLS.find(t=>t.id===n.require)?.name||n.require}.`],null);return true;}
    const opposite={left:'right',right:'left',up:'down',down:'up'}[dir];this.cb.sound?.('door');this.loadWorldRoom(n.id,opposite,false);if(this.worldRoom?.enter?.length)this.queueMessages(this.worldRoom.enter,null);return true;
  }

  interact(){
    if(this.mode==='dialogue'){this.advanceMessage();return;}
    if(this.mode!=='playing')return;
    const p=center(this.player);
    if(this.areaMode==='world'){
      const nearNpc=this.npcs.find(n=>dist(p,center(n))<24);if(nearNpc){this.interactNpc(nearNpc);return;}
      const portal=this.worldRoom?.portal;if(portal&&Math.hypot(p.x-portal.x,p.y-portal.y)<30){this.cb.sound?.('tool');this.enterDungeon(portal.chapter);return;}
      const secret=(this.worldRoom?.secrets||[]).find(s=>!this.cb.getSave().secrets.includes(s.id)&&Math.hypot(p.x-s.x,p.y-s.y)<24);if(secret){this.collectSecret(secret);return;}
      this.cb.sound?.('tick');return;
    }
    if(this.npc&&dist(p,center(this.npc))<24){this.queueMessages([`${this.npc.name} · ${this.npc.kind==='archive'?'«Recuerda por elección, no por obligación».':'«La sala escucha cuando utilizas lo que has aprendido». '}`],null);this.cb.sound?.('talk');return;}
    const target=this.toolTargets.find(t=>!t.active&&Math.hypot(p.x-(t.x+5),p.y-(t.y+5))<24);if(target){
      if(!this.hasTool(target.require)){this.cb.sound?.('error');this.queueMessages([`${target.label||'MECHANISM'} · LOCKED`,`Necesitas ${TOOLS.find(t=>t.id===target.require)?.name||target.require}.`],null);return;}
      target.active=true;const save=this.cb.getSave();const flag=this.targetFlag(target.index);if(!save.puzzleFlags.includes(flag))save.puzzleFlags.push(flag);this.cb.setSave(save);this.spawnBurst(target.x+5,target.y+5,CAMPAIGN[this.chapterIndex].accent,10);this.cb.sound?.('tool');this.hud();return;
    }
    this.cb.sound?.('tick');
  }

  npcDialogue(npc,save=this.cb.getSave()){
    let lines=[...(npc.dialogue||[])];const done=(save.completed||[]).length;for(const beat of (npc.progressDialogue||[])){if(done>=beat.after)lines=[...(beat.lines||lines)];}return lines;
  }

  interactNpc(npc){
    const save=this.cb.getSave(),spoken=this.npcDialogue(npc,save);if(!npc.quest){this.queueMessages(spoken.length?spoken:[`${npc.name} no tiene nada más que decir.`],null);this.cb.sound?.('talk');return;}
    const q=QUESTS.find(x=>x.id===npc.quest);if(!q){this.queueMessages(npc.dialogue||[],null);return;}
    const status=save.quests[q.id]||'inactive';
    if(status==='inactive'){save.quests[q.id]='active';this.cb.setSave(save);this.queueMessages([...spoken,...q.start],null);this.cb.sound?.('talk');return;}
    if(status==='active'&&this.questConditionMet(q,save)){save.quests[q.id]='complete';this.applyQuestReward(q.reward,save);this.unlockAchievement('quest-one',save);this.cb.setSave(save);this.queueMessages(q.complete,null);this.cb.sound?.('achievement');return;}
    this.queueMessages(status==='complete'?[...spoken,`${q.name.toUpperCase()} · COMPLETED`]:[...spoken,...q.reminder],null);this.cb.sound?.('talk');
  }

  questConditionMet(q,save){const c=q.condition||{};if(c.type==='secret')return save.secrets.includes(c.id);if(c.type==='secretPrefix')return save.secrets.filter(x=>x.startsWith(c.prefix)).length>=c.count;if(c.type==='killsKinds')return c.kinds.reduce((n,k)=>n+(save.enemyKills[k]||0),0)>=c.count;if(c.type==='relics')return save.relics.length>=c.count;return false;}
  applyQuestReward(r,save){if(!r)return;if(r.type==='shards')save.shards+=r.amount||0;if(r.type==='heart')save.heartFragments+=(r.amount||1);if(r.type==='upgrade'&&!save.upgrades.includes(r.id))save.upgrades.push(r.id);this.player.maxHp=this.maxHp(save);this.player.hp=this.player.maxHp;}

  collectSecret(secret){
    const save=this.cb.getSave();if(secret.require&&!save.tools.includes(secret.require)){this.cb.sound?.('error');this.queueMessages([secret.hint||'Algo aquí todavía no responde.',`Necesitas ${TOOLS.find(t=>t.id===secret.require)?.name||secret.require}.`],null);return;}
    if(save.secrets.includes(secret.id))return;save.secrets.push(secret.id);const r=secret.reward||{};if(r.type==='shards')save.shards+=r.amount||0;if(r.type==='heart')save.heartFragments++;if(r.type==='relic'&&!save.relics.includes(r.label))save.relics.push(r.label);if(save.secrets.length>=3)this.unlockAchievement('secret-three',save);this.cb.setSave(save);this.spawnBurst(secret.x,secret.y,'#ffe783',14);this.cb.sound?.('secret');this.hud();this.queueMessages([`${r.label||'SECRET'} · FOUND`,secret.hint||'Veyra recuerda algo que casi había perdido.'],null);
  }

  hasTool(id){return (this.cb.getSave().tools||[]).includes(id);}
  targetFlag(index){return `tool:${this.chapterIndex}:${this.roomIndex}:${index}`;}
  newCampaign(chapterIndex=0){
    const save=this.cb.getSave();
    this.chapterIndex=clamp(chapterIndex,0,CAMPAIGN.length-1); this.roomIndex=0;
    save.currentMode='dungeon';save.currentChapter=this.chapterIndex;save.currentRoom=0;save.lastPlayed=CAMPAIGN[this.chapterIndex].id;this.cb.setSave(save);
    this.loadRoom(0,true);
    const chapter=CAMPAIGN[this.chapterIndex];
    this.queueMessages([...chapter.intro,`CHAPTER ${this.chapterIndex+1} · ${chapter.name.toUpperCase()}`,...(this.room.enter||[])],null);
  }

  resumeCampaign(){
    const save=this.cb.getSave();
    const ci=clamp(save.currentChapter||0,0,CAMPAIGN.length-1);const maxRoom=Math.max(0,CAMPAIGN[ci].rooms.length-1);const ri=clamp(save.currentRoom||0,0,maxRoom);
    this.chapterIndex=ci;this.loadRoom(ri,true);this.queueMessages([`RETURN · ${CAMPAIGN[ci].name.toUpperCase()}`,...(this.room.enter||[]),this.objectiveText()],null);
  }

  loadRoom(index,fullHeal=false){
    this.roomIndex=index; this.room=CAMPAIGN[this.chapterIndex].rooms[index];
    const save=this.cb.getSave();
    const maxHp=this.maxHp(save);
    const hp=fullHeal||!this.player?maxHp:Math.max(1,this.player.hp);
    this.areaMode='dungeon';this.worldRoom=null;
    this.player={x:24,y:78,w:9,h:11,hp,maxHp,facing:'right',speed:this.hasUpgrade('swift-boots')?74:64,attackCombo:0};
    this.enemies=[];this.projectiles=[];this.particles=[];this.pickups=[];this.roomHits=0;this.roomClear=false;this.transitionTimer=0;this.attackCd=0;this.attackHeld=false;this.attackHold=0;this.chargedReady=false;this.parryTimer=0;this.damageCd=0;this.invulnTimer=0;this.prismBarrierTimer=0;this.echoSlowTimer=0;this.nullReviveUsed=false;this.verdantHealed=false;this.obstacles=this.makeObstacles(this.room.layout);
    this.switches=(this.room.switches||[]).map(([x,y],i)=>({x,y,w:10,h:10,active:(save.puzzleFlags||[]).includes(`sw:${this.chapterIndex}:${this.roomIndex}:${i}`),index:i}));
    this.toolTargets=(this.room.toolTargets||[]).map((t,i)=>({...t,w:10,h:10,index:i,active:(save.puzzleFlags||[]).includes(`tool:${this.chapterIndex}:${this.roomIndex}:${i}`)}));
    this.npc=this.room.npc?{...this.room.npc,w:9,h:12}:null;this.npcs=[];
    const opened=save.openedChests||[];
    this.chest=this.room.reward&&!opened.includes(this.room.reward.id)?{x:207,y:76,w:12,h:10,visible:false,collected:false,reward:this.room.reward}:null;
    if(this.room.type==='boss'){
      const [kind,x,y,hpBoss]=this.room.boss;this.enemies.push(this.makeEnemy(kind,x,y,hpBoss,true));
    }else{
      for(const [kind,x,y,hpEnemy] of (this.room.enemies||[]))this.enemies.push(this.makeEnemy(kind,x,y,hpEnemy));
    }
    save.currentMode='dungeon';save.currentChapter=this.chapterIndex;save.currentRoom=this.roomIndex;save.lastPlayed=CAMPAIGN[this.chapterIndex].id;this.cb.setSave(save);
    this.mode='playing';this.roomTitleTimer=1.7;this.cb.onMode?.(this.mode);this.cb.scene?.(this.room.type==='boss'?'boss':this.worldScene({theme:CAMPAIGN[this.chapterIndex].theme}));this.hud();this.cb.sound?.('room');
  }

  makeEnemy(kind,x,y,hpOverride=null,boss=false){
    const base={
      mossling:{hp:2,speed:24,size:9,behavior:'pack'},thornbat:{hp:2,speed:18,size:10,behavior:'diver'},rootguard:{hp:4,speed:14,size:12,behavior:'tank'},
      emberling:{hp:2,speed:28,size:9,behavior:'charger'},cinderwisp:{hp:3,speed:14,size:10,behavior:'shooter'},forgeguard:{hp:5,speed:13,size:12,behavior:'tank'},
      gearling:{hp:3,speed:24,size:10,behavior:'ricochet'},tickwisp:{hp:3,speed:15,size:10,behavior:'shooter'},clockguard:{hp:5,speed:15,size:12,behavior:'tank'},
      brinecrawler:{hp:3,speed:25,size:10,behavior:'ambush'},lanternjelly:{hp:3,speed:15,size:11,behavior:'shooter'},tideguard:{hp:6,speed:13,size:12,behavior:'tank'},
      shardling:{hp:3,speed:25,size:10,behavior:'mimic'},mirrorshade:{hp:4,speed:16,size:11,behavior:'teleporter'},obsidianguard:{hp:6,speed:14,size:12,behavior:'tank'},
      screeimp:{hp:4,speed:29,size:10,behavior:'hopper'},galeeye:{hp:4,speed:17,size:11,behavior:'wind'},peakguard:{hp:7,speed:15,size:13,behavior:'tank'},
      nullmote:{hp:4,speed:30,size:10,behavior:'swarm'},voidwisp:{hp:4,speed:17,size:11,behavior:'shooter'},nullguard:{hp:7,speed:15,size:13,behavior:'tank'},
      archiveecho:{hp:5,speed:23,size:11,behavior:'echo'},inkmote:{hp:5,speed:16,size:10,behavior:'mines'},
      barkmaw:{hp:16,speed:12,size:18,behavior:'boss',boss:true,elite:true},magmaox:{hp:24,speed:14,size:19,behavior:'boss',boss:true,elite:true},kelpmaw:{hp:32,speed:13,size:19,behavior:'boss',boss:true,elite:true},
      copperowl:{hp:40,speed:15,size:18,behavior:'boss',boss:true,elite:true},glassknight:{hp:48,speed:16,size:19,behavior:'boss',boss:true,elite:true},rocling:{hp:56,speed:18,size:19,behavior:'boss',boss:true,elite:true},nameless:{hp:66,speed:17,size:19,behavior:'boss',boss:true,elite:true},
      bramble:{hp:36,speed:11,size:21,behavior:'boss',boss:true},forge:{hp:54,speed:12,size:21,behavior:'boss',boss:true},abyssray:{hp:78,speed:14,size:21,behavior:'boss',boss:true},stag:{hp:92,speed:14,size:20,behavior:'boss',boss:true},warden:{hp:108,speed:13,size:21,behavior:'boss',boss:true},astralram:{hp:124,speed:15,size:22,behavior:'boss',boss:true},regent:{hp:156,speed:15,size:22,behavior:'boss',boss:true}
    }[kind]||{hp:2,speed:18,size:10,behavior:'melee'};
    const ng=Math.max(0,this.cb.getSave().newGamePlus||0),scale=1+ng*.22;const rawHp=hpOverride??base.hp;const finalHp=Math.max(1,Math.round(rawHp*scale));
    const ang=Math.random()*Math.PI*2;
    return {kind,x,y,w:base.size,h:base.size,hp:finalHp,maxHp:finalHp,speed:base.speed*(1+ng*.04),behavior:base.behavior,boss:boss||!!base.boss,elite:!!base.elite,shot:.65+Math.random(),hurt:0,stun:0,burn:0,burnTick:.45,phase:0,seed:Math.random()*10,aiTimer:.4+Math.random(),dashTime:0,vx:Math.cos(ang)*base.speed,vy:Math.sin(ang)*base.speed};
  }

    makeObstacles(layout){
    const sets={
      home:[{x:92,y:46,w:20,h:18},{x:144,y:94,w:22,h:16}],village:[{x:78,y:36,w:30,h:20},{x:148,y:92,w:28,h:22}],meadow:[{x:98,y:52,w:16,h:12},{x:144,y:102,w:20,h:12}],cave:[{x:84,y:46,w:20,h:20},{x:136,y:94,w:28,h:16}],
      grove:[{x:82,y:48,w:18,h:18},{x:116,y:98,w:24,h:12}],ruins:[{x:82,y:42,w:14,h:34},{x:124,y:92,w:25,h:13}],thorns:[{x:84,y:50,w:15,h:22},{x:126,y:96,w:18,h:20}],shrine:[{x:82,y:43,w:12,h:26},{x:122,y:92,w:12,h:26}],
      canals:[{x:86,y:52,w:12,h:66},{x:132,y:30,w:10,h:52}],foundry:[{x:78,y:44,w:31,h:12},{x:122,y:96,w:31,h:12}],furnace:[{x:88,y:48,w:18,h:18},{x:128,y:94,w:18,h:18}],forge:[{x:78,y:46,w:28,h:12},{x:118,y:96,w:32,h:12}],
      shore:[{x:84,y:44,w:20,h:18},{x:132,y:92,w:26,h:16}],tide:[{x:82,y:50,w:16,h:26},{x:132,y:94,w:18,h:22}],deep:[{x:90,y:42,w:14,h:30},{x:130,y:96,w:24,h:14}],
      clock:[{x:88,y:56,w:20,h:20},{x:128,y:88,w:20,h:20}],gears:[{x:78,y:52,w:18,h:18},{x:118,y:40,w:16,h:16},{x:126,y:100,w:20,h:20}],belltower:[{x:82,y:44,w:12,h:30},{x:126,y:92,w:12,h:30}],pillars:[{x:84,y:40,w:12,h:34},{x:132,y:90,w:12,h:34}],mountain:[{x:86,y:48,w:20,h:18},{x:130,y:96,w:24,h:18}],bridge:[{x:104,y:42,w:14,h:24},{x:104,y:102,w:14,h:22}],
      keep:[{x:82,y:38,w:14,h:38},{x:126,y:86,w:14,h:38}],mirror:[{x:86,y:46,w:12,h:22},{x:86,y:100,w:12,h:22},{x:132,y:70,w:12,h:28}],gallery:[{x:82,y:50,w:16,h:18},{x:128,y:94,w:16,h:18}],vault:[{x:78,y:42,w:16,h:30},{x:126,y:92,w:16,h:30}],chapel:[{x:90,y:38,w:14,h:32},{x:134,y:96,w:22,h:16}],
      peak:[{x:84,y:48,w:20,h:20},{x:130,y:90,w:22,h:20}],sanctum:[{x:82,y:42,w:16,h:26},{x:130,y:96,w:18,h:20}],
      null:[{x:78,y:68,w:22,h:10},{x:118,y:48,w:24,h:10},{x:118,y:104,w:24,h:10}],archive:[{x:82,y:40,w:14,h:34},{x:132,y:92,w:18,h:30}],causeway:[{x:86,y:40,w:10,h:32},{x:86,y:98,w:10,h:32},{x:132,y:68,w:12,h:24}],void:[{x:82,y:48,w:18,h:18},{x:126,y:94,w:18,h:18}],
      boss:[{x:74,y:46,w:8,h:24},{x:74,y:106,w:8,h:24}]
    };
    return (sets[layout]||[]).map(o=>({...o}));
  }

  maxHp(save=this.cb.getSave()){ return 5+(save.runes.includes('VERDANT')?1:0)+Math.floor((save.heartFragments||0)/2)+((save.upgrades||[]).includes('heart-vessel')?1:0)+((save.upgrades||[]).includes('archivist-heart')?1:0); }
  hasRune(name){return (this.cb.getSave().runes||[]).includes(name);}
  hasUpgrade(name){return (this.cb.getSave().upgrades||[]).includes(name);}
  currentWeapon(){const save=this.cb.getSave();return WEAPONS.find(w=>w.id===save.equippedWeapon&&save.weapons?.includes(w.id))||WEAPONS[0];}
  activeRune(){const save=this.cb.getSave(),runes=save.runes||[];if(!runes.length)return null;return save.equippedRune&&runes.includes(save.equippedRune)?save.equippedRune:runes[runes.length-1];}
  cycleRune(){if(this.mode!=='playing'&&this.mode!=='paused')return;const save=this.cb.getSave(),owned=save.runes||[];if(!owned.length){this.cb.sound?.('error');return;}const current=this.activeRune(),i=Math.max(0,owned.indexOf(current));save.equippedRune=owned[(i+1)%owned.length];this.cb.setSave(save);this.cb.sound?.('tool');this.hud();}
  cycleWeapon(){if(this.mode!=='playing'&&this.mode!=='paused')return;const save=this.cb.getSave(),owned=WEAPONS.filter(w=>(save.weapons||[]).includes(w.id));if(owned.length<2){this.cb.sound?.('error');return;}const i=Math.max(0,owned.findIndex(w=>w.id===save.equippedWeapon));save.equippedWeapon=owned[(i+1)%owned.length].id;this.cb.setSave(save);this.cb.sound?.('tool');this.hud();}
  activateRune(){
    if(this.mode!=='playing'||this.runeCooldown>0)return;const rune=this.activeRune(),meta=RUNE_ABILITIES[rune];if(!rune||!meta){this.cb.sound?.('error');return;}
    const p=this.player,c=center(p),near=this.enemies.filter(e=>e.hp>0&&Math.hypot(center(e).x-c.x,center(e).y-c.y)<58);
    if(rune==='VERDANT'){p.hp=Math.min(p.maxHp,p.hp+1);for(const e of near)e.stun=Math.max(e.stun,1.4);this.spawnBurst(c.x,c.y,'#8fe57d',18);}
    if(rune==='EMBER'){for(const e of near){e.hp-=2;e.hurt=.2;e.burn=Math.max(e.burn,1.6);}this.spawnBurst(c.x,c.y,'#ff914d',22);}
    if(rune==='TIDE'){const v=this.facingVector();this.invulnTimer=.65;this.dashPlayer(v,32);this.spawnBurst(c.x,c.y,'#79ddeb',16);}
    if(rune==='ECHO'){this.echoSlowTimer=3.2;this.spawnBurst(c.x,c.y,'#e7d86e',20);}
    if(rune==='PRISM'){this.prismBarrierTimer=4;this.spawnBurst(c.x,c.y,'#c3a1ed',20);}
    if(rune==='AETHER'){const base=Math.atan2(this.facingVector().y,this.facingVector().x);for(const off of [-.3,0,.3])this.projectiles.push({x:c.x,y:c.y,w:5,h:3,vx:Math.cos(base+off)*118,vy:Math.sin(base+off)*118,life:1.2,playerOwned:true,projectile:true,damage:2,color:'#a8ccff'});this.spawnBurst(c.x,c.y,'#a8ccff',16);}
    if(rune==='NULL'){p.hp=Math.min(p.maxHp,p.hp+2);this.invulnTimer=1.1;for(const e of near){e.hp-=2;e.hurt=.25;}this.spawnBurst(c.x,c.y,'#f17b9d',26);}
    this.runeFxTimer=.7;this.runeCooldown=meta.cooldown*(this.hasUpgrade('rune-capacitor')?.75:1);this.unlockAchievement('rune-burst');this.cb.sound?.('achievement');this.hud();
  }
  facingVector(){return this.player?.facing==='left'?{x:-1,y:0}:this.player?.facing==='up'?{x:0,y:-1}:this.player?.facing==='down'?{x:0,y:1}:{x:1,y:0};}
  dashPlayer(v,distance){const steps=Math.ceil(distance/4),d=distance/steps;for(let i=0;i<steps;i++)this.moveEntity(this.player,v.x*d,v.y*d);}

  objectiveText(){
    const save=this.cb.getSave(),alive=this.enemies.filter(e=>e.hp>0).length;
    if(this.areaMode==='world'){
      const portal=this.worldRoom?.portal;if(portal){const ch=CAMPAIGN[portal.chapter],done=save.completed.includes(ch.id);return done?`${ch.name} superado · explora Veyra o vuelve a entrar.`:`Santuario cercano · usa C/E junto a la puerta para entrar en ${ch.name}.`;}
      const activeQuest=QUESTS.find(q=>save.quests[q.id]==='active');if(activeQuest)return `Side quest · ${activeQuest.name}. Explora, habla y vuelve con ${activeQuest.npc.toUpperCase()}.`;
      return alive?`Explora ${this.worldRoom?.name||'Veyra'} · ${alive} amenazas cercanas · C/E para interactuar.`:`Explora libremente · C/E interactúa · MAPA muestra rutas descubiertas.`;
    }
    const inactiveTools=this.toolTargets.filter(t=>!t.active).length;
    if(this.room?.type==='boss')return `Derrota a ${this.room.name}.`;
    if(this.room?.type==='miniboss'&&!this.roomClear)return `Vence a ${this.room.name} y recupera la llave.`;
    if(inactiveTools)return `${this.room.puzzleLabel||'TOOL PUZZLE'} · ${this.toolTargets.length-inactiveTools}/${this.toolTargets.length} mecanismos · usa C/E cerca del objetivo.`;
    if(this.room?.type==='puzzle'&&!this.roomClear){const active=this.switches.filter(s=>s.active).length;return `${this.room.puzzleLabel||'PUZZLE'} · ${active}/${this.switches.length} activos · ${alive} enemigos.`;}
    if(this.roomClear&&this.chest?.visible&&!this.chest.collected)return this.chest.reward.optional?`Tesoro opcional · ${this.chest.reward.label} · o cruza la salida →`:`Abre el cofre · ${this.chest.reward.label}.`;
    if(this.roomClear)return 'La salida está abierta. Cruza el portal →';
    return `Explora ${this.room?.name||'la sala'} · ${alive} enemigos restantes.`;
  }

  queueMessages(messages,pendingAction=null){
    this.messages=messages.filter(Boolean);this.pendingAction=pendingAction;this.mode='dialogue';this.cb.onMode?.(this.mode);this.cb.onMessage?.(this.messages[0]||'');
  }
  advanceMessage(){
    if(this.mode!=='dialogue')return;
    this.messages.shift();
    if(this.messages.length){this.cb.onMessage?.(this.messages[0]);this.cb.sound?.('tick');return;}
    this.cb.onMessage?.('');
    const action=this.pendingAction;this.pendingAction=null;
    if(action==='finishChapter'){this.finishChapter();return;}
    if(action==='retryRoom'){this.retryRoom();return;}
    if(action==='returnWorld'){this.loadWorldRoom(CAMPAIGN[this.chapterIndex].worldRoom,null,true);return;}
    if(action==='ending'){this.mode='paused';this.cb.scene?.('ending');this.cb.onEnding?.(this.cb.getSave());return;}
    if(action==='returnCampaign'){this.mode='paused';this.cb.onMode?.('campaignReturn');return;}
    this.mode='playing';this.cb.onMode?.(this.mode);
  }

  togglePause(){
    if(this.mode==='dead')return;
    if(this.mode==='paused'){
      this.mode=this.pausedFrom||'playing';this.cb.onMode?.(this.mode);this.cb.sound?.('resume');return;
    }
    if(this.mode==='playing'||this.mode==='dialogue'){
      this.pausedFrom=this.mode;this.mode='paused';this.cb.onMode?.(this.mode);this.cb.sound?.('pause');
    }
  }

  attack(charged=false){
    if(this.mode!=='playing'||this.attackCd>0)return;const w=this.currentWeapon(),p=this.player;this.attackTimer=charged?.24:.15;this.attackCd=w.cooldown*(this.hasUpgrade('swift-boots')?.88:1)*(charged?1.25:1);p.attackCombo=(p.attackCombo+1)%3;this.cb.sound?.('slash');
    const reach=w.reach+(charged?5:0),wide=w.width+(charged?(w.id==='briar-cleaver'?10:4):0);let box={x:p.x,y:p.y,w:p.w,h:p.h};
    if(p.facing==='right')box={x:p.x+p.w,y:p.y+(p.h-wide)/2,w:reach,h:wide};if(p.facing==='left')box={x:p.x-reach,y:p.y+(p.h-wide)/2,w:reach,h:wide};if(p.facing==='up')box={x:p.x+(p.w-wide)/2,y:p.y-reach,w:wide,h:reach};if(p.facing==='down')box={x:p.x+(p.w-wide)/2,y:p.y+p.h,w:wide,h:reach};
    let dmg=w.damage+(this.hasUpgrade('tempered-edge')?1:0)+(this.focusTimer>0?1:0);if(p.attackCombo===0)dmg+=w.combo||0;if(this.hasRune('EMBER')&&p.attackCombo===0)dmg++;if(charged)dmg=Math.ceil(dmg*w.charged)+(this.hasUpgrade('charged-core')?1:0);
    let hitAny=false;for(const e of this.enemies){if(e.hp>0&&e.hurt<=0&&hit(box,e)){hitAny=true;e.hp-=dmg;e.hurt=.2;if(w.id==='ember-sabre'||(this.hasRune('EMBER')&&p.attackCombo===0))e.burn=Math.max(e.burn,1.5);this.knockbackEnemy(e,w.knockback+(charged?6:0));this.spawnBurst(e.x+e.w/2,e.y+e.h/2,w.color,charged?10:5);this.cb.sound?.('hit');}}
    if(charged){this.unlockAchievement('charged');if(w.id==='aether-blade'){const c=center(p),v=this.facingVector();this.projectiles.push({x:c.x,y:c.y,w:6,h:3,vx:v.x*128,vy:v.y*128,life:1.4,playerOwned:true,projectile:true,damage:Math.max(2,Math.ceil(dmg*.6)),color:w.color});}if(w.id==='nullbrand'&&hitAny){const save=this.cb.getSave();save.shards+=1;this.cb.setSave(save);}}
  }
  knockbackEnemy(e,power=4){if(!power)return;const pc=center(this.player),ec=center(e),dx=ec.x-pc.x,dy=ec.y-pc.y,l=Math.hypot(dx,dy)||1;this.moveEnemy(e,dx/l*power,dy/l*power);}
  isGuarding(){return this.touch.has('guard')||this.keys.has('KeyX')||this.prismBarrierTimer>0;}
  guardBlocks(source){
    if(this.prismBarrierTimer>0)return true;if(!this.isGuarding())return false;const p=center(this.player),s=center(source);const dx=s.x-p.x,dy=s.y-p.y;if(Math.abs(dx)>Math.abs(dy))return (dx>0&&this.player.facing==='right')||(dx<0&&this.player.facing==='left');return (dy>0&&this.player.facing==='down')||(dy<0&&this.player.facing==='up');
  }
  perfectParry(source){
    const save=this.cb.getSave();save.parries=(save.parries||0)+1;if(save.parries>=10)this.unlockAchievement('parry-ten',save);this.cb.setSave(save);this.damageCd=.12;this.parryTimer=0;this.spawnBurst(this.player.x+5,this.player.y+5,'#fff6ae',10);this.cb.sound?.('achievement');
    if(source.projectile){source.dead=true;const c=center(this.player),sc=center(source),dx=sc.x-c.x,dy=sc.y-c.y,len=Math.hypot(dx,dy)||1;this.projectiles.push({x:c.x,y:c.y,w:4,h:4,vx:dx/len*118,vy:dy/len*118,life:1.35,playerOwned:true,projectile:true,damage:this.currentWeapon().id==='prism-edge'?3:2,color:'#fff6ae'});}else{source.stun=Math.max(source.stun||0,.85);source.hp-=1;source.hurt=.2;}
  }

    damagePlayer(source){
    if(this.invulnTimer>0||this.damageCd>0||this.mode!=='playing')return;
    const blocked=this.guardBlocks(source);if(blocked){if(this.parryTimer>0||this.prismBarrierTimer>0){this.perfectParry(source);return;}this.damageCd=this.hasUpgrade('guard-core')?.14:.18;this.spawnBurst(this.player.x+5,this.player.y+5,'#60e7ff',4);this.cb.sound?.('block');if(source.projectile&&this.hasRune('PRISM')){source.dead=true;const c=center(this.player),sc=center(source),dx=sc.x-c.x,dy=sc.y-c.y,len=Math.hypot(dx,dy)||1;this.projectiles.push({x:c.x,y:c.y,w:3,h:3,vx:dx/len*96,vy:dy/len*96,life:1.3,playerOwned:true,projectile:true,damage:2,color:'#b88aff'});}return;}
    this.player.hp--;this.roomHits++;this.damageCd=.85;this.spawnBurst(this.player.x+5,this.player.y+5,'#ff6f91',7);this.cb.sound?.('hurt');this.hud();
    if(this.player.hp<=0&&this.hasRune('NULL')&&!this.nullReviveUsed){this.nullReviveUsed=true;this.player.hp=2;this.damageCd=1.2;this.spawnBurst(this.player.x+5,this.player.y+5,'#ff6f91',18);this.hud();this.queueMessages(['RUNE NULL · SECOND NAME','El Null rechaza tu caída una vez por sala.'],null);return;}
    if(this.player.hp<=0){this.mode='dead';this.cb.onMode?.(this.mode);this.queueMessages(['YOU FELL',`Regresando a un punto seguro de ${this.room.name}…`],'retryRoom');this.pendingAction='retryRoom';}
  }

    retryRoom(){if(this.areaMode==='world'){this.loadWorldRoom(this.cb.getSave().currentWorld||'lantern-house',null,true);return;}this.loadRoom(this.roomIndex,true);if(this.room.enter?.length)this.queueMessages(this.room.enter,null);}

  collectChest(){
    if(!this.chest||this.chest.collected)return;
    const save=this.cb.getSave(),r=this.chest.reward;this.chest.collected=true;
    save.openedChests=save.openedChests||[];if(!save.openedChests.includes(r.id))save.openedChests.push(r.id);
    if(r.type==='heart'){save.heartFragments=(save.heartFragments||0)+1;this.player.maxHp=this.maxHp(save);this.player.hp=this.player.maxHp;}
    if(r.type==='key'){save.keys=save.keys||[];if(!save.keys.includes(r.label))save.keys.push(r.label);}
    if(r.type==='tool'){save.tools=save.tools||[];if(!save.tools.includes(r.tool))save.tools.push(r.tool);this.unlockAchievement('tool-one',save);if(save.tools.length>=6)this.unlockAchievement('all-tools',save);}
    if(r.type==='relic'){save.relics=save.relics||[];if(!save.relics.includes(r.label))save.relics.push(r.label);this.unlockAchievement('relic-one',save);if(save.relics.length>=6)this.unlockAchievement('six-relics',save);}
    save.shards=(save.shards||0)+(r.type==='heart'?5:r.type==='key'?3:r.type==='tool'?6:8);this.cb.setSave(save);this.spawnBurst(this.chest.x+6,this.chest.y+5,'#ffd166',12);this.cb.sound?.('achievement');this.hud();
    this.queueMessages([`${r.label} · ACQUIRED`,r.type==='heart'?'Dos fragmentos aumentan tu vida máxima.':r.type==='key'?'La puerta interior de la región ya reconoce tu runa.':r.type==='tool'?'Nueva herramienta: úsala con C / E / INTERACT cerca de mecanismos y en el overworld.':'Una reliquia de Veyra ha sido añadida al Archivo de bolsillo.'],null);
  }

  finishChapter(){
    const save=this.cb.getSave(),chapter=CAMPAIGN[this.chapterIndex];
    if(!save.completed.includes(chapter.id))save.completed.push(chapter.id);
    if(!save.runes.includes(chapter.rune))save.runes.push(chapter.rune);save.equippedRune=chapter.rune;
    const weapon=WEAPONS.find(w=>w.unlockAfter===chapter.id);let weaponMsg=null;if(weapon&&!save.weapons.includes(weapon.id)){save.weapons.push(weapon.id);save.equippedWeapon=weapon.id;weaponMsg=`${weapon.name} · UNLOCKED`;if(save.weapons.length>=6)this.unlockAchievement('arsenal',save);}
    save.unlocked=Math.max(save.unlocked,Math.min(CAMPAIGN.length,this.chapterIndex+2));
    save.currentChapter=Math.min(CAMPAIGN.length-1,this.chapterIndex+1);save.currentRoom=0;
    if(this.roomHits===0&&!save.bestBossNoHit.includes(chapter.id)){save.bestBossNoHit.push(chapter.id);this.unlockAchievement('boss-clean',save);}
    this.unlockAchievement('rune-one',save);if(save.runes.length>=7)this.unlockAchievement('all-runes',save);
    if(chapter.final){
      save.campaignComplete=true;save.creditsSeen=true;const completedQuests=Object.values(save.quests||{}).filter(v=>v==='complete').length;save.trueEnding=(save.relics||[]).length>=6&&completedQuests>=QUESTS.length;
      this.unlockAchievement('campaign',save);if(save.trueEnding)this.unlockAchievement('archive',save);save.currentMode='world';save.currentWorld='lantern-house';this.cb.setSave(save);this.hud();this.cb.onChapterComplete?.(this.chapterIndex,true);
      this.queueMessages([save.trueEnding?'TRUE ENDING · THE VOLUNTARY ARCHIVE':'ENDING · THE NAME RETURNS',weaponMsg,save.trueEnding?'Veyra crea un Archivo al que cada persona puede entrar y salir por voluntad propia. Oran entrega su nombre y Edda cierra la última puerta antigua.':'El viejo Archivo cae. Veyra vuelve a recordar de forma imperfecta, humana y libre. Las historias opcionales aún esperan fuera.','CREDITS · POCKET 404 · VEYRA WILL REMEMBER WHAT YOU CHOOSE TO TELL'],'ending');return;
    }
    save.currentMode='world';save.currentWorld=chapter.worldRoom;save.updatedAt=Date.now();this.cb.setSave(save);this.hud();this.cb.onChapterComplete?.(this.chapterIndex,false);this.queueMessages([`RUNE ${chapter.rune} · RESTORED`,weaponMsg,'La herramienta recuperada ha abierto nuevas rutas en Veyra. Vuelve al overworld y busca caminos que antes estaban bloqueados.'],'returnWorld');
  }

  unlockAchievement(id,save=this.cb.getSave()){
    if(save.achievements.includes(id))return;
    save.achievements.push(id);this.cb.setSave(save);const meta=ACHIEVEMENTS.find(a=>a.id===id);this.cb.onAchievement?.(meta);this.cb.sound?.('achievement');
  }

  enemyKilled(e){
    const save=this.cb.getSave();save.kills++;save.enemyKills=save.enemyKills||{};save.enemyKills[e.kind]=(save.enemyKills[e.kind]||0)+1;save.shards+=(e.boss?(e.elite?6:10):(this.hasUpgrade('shard-purse')?2:1));this.unlockAchievement('first-blood',save);if(save.kills>=25)this.unlockAchievement('hunter',save);if(save.kills>=75)this.unlockAchievement('hunter-75',save);this.cb.setSave(save);this.spawnDrop(e);this.cb.sound?.(e.boss?'bossDown':'enemyDown');this.hud();
  }

    loop(now){
    if(!this.running)return;
    let dt=Math.min(.033,(now-this.last)/1000);this.last=now;
    this.acc+=dt;const step=1/60;while(this.acc>=step){this.update(step);this.acc-=step;}
    this.render();this.frameCount++;this.fpsFrames++;this.fpsAcc+=dt;
    if(now-this.fpsLast>500){this.fps=Math.round(this.fpsFrames/((now-this.fpsLast)/1000));this.fpsFrames=0;this.fpsLast=now;this.cb.onHud?.({fps:this.fps});}
    this.raf=requestAnimationFrame(this.loop);
  }

  update(dt){
    if(this.mode!=='playing')return;
    this.attackTimer=Math.max(0,this.attackTimer-dt);this.attackCd=Math.max(0,this.attackCd-dt);this.damageCd=Math.max(0,this.damageCd-dt);this.invulnTimer=Math.max(0,this.invulnTimer-dt);this.parryTimer=Math.max(0,this.parryTimer-dt);this.runeCooldown=Math.max(0,this.runeCooldown-dt);this.runeFxTimer=Math.max(0,this.runeFxTimer-dt);this.prismBarrierTimer=Math.max(0,this.prismBarrierTimer-dt);this.echoSlowTimer=Math.max(0,this.echoSlowTimer-dt);this.focusTimer=Math.max(0,this.focusTimer-dt);this.roomTitleTimer=Math.max(0,this.roomTitleTimer-dt);if(this.attackHeld){this.attackHold+=dt;const need=this.hasUpgrade('charged-core')?.42:.58;if(this.attackHold>=need&&!this.chargedReady){this.chargedReady=true;this.spawnBurst(this.player.x+5,this.player.y+5,this.currentWeapon().color,8);}}
    this.updatePlayer(dt);this.updateSwitches();this.updateEnemies(dt);this.updateProjectiles(dt);this.updatePickups(dt);this.updateParticles(dt);
    const dead=this.enemies.filter(e=>e.hp<=0&&!e.counted);for(const e of dead){e.counted=true;this.enemyKilled(e);this.spawnBurst(e.x+e.w/2,e.y+e.h/2,e.boss?'#ff6f91':'#9dff7a',e.boss?16:7);}
    this.enemies=this.enemies.filter(e=>e.hp>0||e.hurt>0);
    if(this.areaMode==='world'){if(this.frameCount%15===0)this.hud();return;}
    const toolsDone=this.toolTargets.every(t=>t.active);
    if(!this.roomClear&&this.enemies.every(e=>e.hp<=0)&&this.switches.every(sw=>sw.active)&&toolsDone){
      this.roomClear=true;if(this.chest)this.chest.visible=true;if(this.hasRune('VERDANT')&&!this.verdantHealed){this.verdantHealed=true;this.player.hp=Math.min(this.player.maxHp,this.player.hp+1);}this.cb.sound?.('clear');this.hud();
      if(this.room.type==='boss'){
        const chapter=CAMPAIGN[this.chapterIndex];
        this.queueMessages([`${this.room.name.toUpperCase()} · DEFEATED`,`RUNE ${chapter.rune} RECOVERED`,...(chapter.epilogue||[]),chapter.final?'El Null Archive deja de escribir por ti.':'El overworld ha cambiado: busca nuevas rutas y secretos.'],'finishChapter');
      }
    }
    if(this.roomClear&&this.chest?.visible&&!this.chest.collected&&hit(this.player,this.chest))this.collectChest();
    const treasureDone=!this.chest||this.chest.collected||this.chest.reward.optional;
    if(this.roomClear&&treasureDone&&this.room.type!=='boss'&&this.player.x>235&&this.player.y>58&&this.player.y<102){if(this.transitionTimer<=0){this.transitionTimer=.4;this.cb.sound?.('door');}}
    if(this.transitionTimer>0){this.transitionTimer-=dt;if(this.transitionTimer<=0){const next=this.roomIndex+1;if(next<CAMPAIGN[this.chapterIndex].rooms.length){this.loadRoom(next,false);if(this.room.enter?.length)this.queueMessages(this.room.enter,null);}}}
    if(this.frameCount%15===0)this.hud();
  }

  updatePlayer(dt){
    const p=this.player;let dx=0,dy=0;
    if(this.keys.has('ArrowLeft')||this.keys.has('KeyA')||this.touch.has('left'))dx--;
    if(this.keys.has('ArrowRight')||this.keys.has('KeyD')||this.touch.has('right'))dx++;
    if(this.keys.has('ArrowUp')||this.keys.has('KeyW')||this.touch.has('up'))dy--;
    if(this.keys.has('ArrowDown')||this.keys.has('KeyS')||this.touch.has('down'))dy++;
    if(dx||dy){const n=Math.hypot(dx,dy);dx/=n;dy/=n;if(Math.abs(dx)>Math.abs(dy))p.facing=dx>0?'right':'left';else p.facing=dy>0?'down':'up';}
    const speed=p.speed*(this.isGuarding()?.56:1);this.moveEntity(p,dx*speed*dt,dy*speed*dt);
    if(this.areaMode==='world'){
      if(p.x<4&&this.tryWorldTransition('left'))return;if(p.x>243&&this.tryWorldTransition('right'))return;if(p.y<17&&this.tryWorldTransition('up'))return;if(p.y>132&&this.tryWorldTransition('down'))return;
      p.x=clamp(p.x,4,243);p.y=clamp(p.y,17,132);return;
    }
    p.x=clamp(p.x,8,239);p.y=clamp(p.y,20,128);
  }

  moveEntity(ent,dx,dy){
    ent.x+=dx;if(this.collidesObstacle(ent))ent.x-=dx;
    ent.y+=dy;if(this.collidesObstacle(ent))ent.y-=dy;
  }
  collidesObstacle(ent){return this.obstacles.some(o=>hit(ent,o));}

  updateSwitches(){
    if(!this.switches.length||this.areaMode==='world')return;
    for(const sw of this.switches){if(!sw.active&&hit(this.player,sw)){sw.active=true;const save=this.cb.getSave(),flag=`sw:${this.chapterIndex}:${this.roomIndex}:${sw.index}`;if(!save.puzzleFlags.includes(flag))save.puzzleFlags.push(flag);this.cb.setSave(save);this.spawnBurst(sw.x+5,sw.y+5,CAMPAIGN[this.chapterIndex].accent,8);this.cb.sound?.('tick');this.hud();}}
  }

  updateEnemies(dt){
    const p=this.player,pc=center(p),now=performance.now(),slow=this.echoSlowTimer>0?.48:1;
    for(const e of this.enemies){
      e.hurt=Math.max(0,e.hurt-dt);e.shot-=dt;e.stun=Math.max(0,(e.stun||0)-dt);e.aiTimer-=dt;
      if(e.burn>0){e.burn-=dt;e.burnTick-=dt;if(e.burnTick<=0){e.burnTick=.55;e.hp--;e.hurt=.12;this.spawnBurst(e.x+e.w/2,e.y+e.h/2,'#ff8b45',3);}}
      if(e.hp<=0)continue;if(e.stun>0)continue;const ec=center(e),dx=pc.x-ec.x,dy=pc.y-ec.y,len=Math.hypot(dx,dy)||1,step=slow*dt;
      if(e.behavior==='melee'||e.behavior==='tank'){const factor=e.behavior==='tank'&&len<34?.62:1;this.moveEnemy(e,dx/len*e.speed*factor*step,dy/len*e.speed*factor*step);}
      else if(e.behavior==='pack'){const orbit=Math.sin(now/420+e.seed)*.45;this.moveEnemy(e,(dx/len-dy/len*orbit)*e.speed*step,(dy/len+dx/len*orbit)*e.speed*step);}
      else if(e.behavior==='swarm'){const zig=Math.sin(now/130+e.seed)*.8;this.moveEnemy(e,(dx/len-dy/len*zig)*e.speed*step,(dy/len+dx/len*zig)*e.speed*step);}
      else if(e.behavior==='charger'||e.behavior==='ambush'||e.behavior==='diver'){
        if(e.dashTime>0){e.dashTime-=dt;this.moveEnemy(e,e.vx*step,e.vy*step);}else if(e.aiTimer<=0&&(e.behavior!=='ambush'||len<72)){e.aiTimer=e.behavior==='diver'?1.7:1.35;e.dashTime=e.behavior==='ambush'?.38:.5;e.vx=dx/len*e.speed*(e.behavior==='ambush'?3.4:2.7);e.vy=dy/len*e.speed*(e.behavior==='ambush'?3.4:2.7);}else{const orbit=e.behavior==='diver'?.65:.15;this.moveEnemy(e,(dx/len*.35-dy/len*orbit)*e.speed*step,(dy/len*.35+dx/len*orbit)*e.speed*step);}
      }
      else if(e.behavior==='ricochet'){if(e.aiTimer<=0){e.aiTimer=1.2;const a=Math.atan2(dy,dx)+(Math.random()-.5)*1.4;e.vx=Math.cos(a)*e.speed*1.7;e.vy=Math.sin(a)*e.speed*1.7;}this.moveEnemy(e,e.vx*step,e.vy*step);}
      else if(e.behavior==='hopper'){if(e.aiTimer<=0){e.aiTimer=.72;e.dashTime=.22;e.vx=dx/len*e.speed*2.5;e.vy=dy/len*e.speed*2.5;}if(e.dashTime>0){e.dashTime-=dt;this.moveEnemy(e,e.vx*step,e.vy*step);}}
      else if(e.behavior==='mimic'){const v=this.facingVector();this.moveEnemy(e,(dx/len*.45+v.x*.55)*e.speed*step,(dy/len*.45+v.y*.55)*e.speed*step);}
      else if(e.behavior==='echo'){const v=this.facingVector(),tx=pc.x+v.x*22,ty=pc.y+v.y*22,ddx=tx-ec.x,ddy=ty-ec.y,ll=Math.hypot(ddx,ddy)||1;this.moveEnemy(e,ddx/ll*e.speed*step,ddy/ll*e.speed*step);}
      else if(e.behavior==='teleporter'){if(e.shot<=0){const a=Math.random()*Math.PI*2,r=38+Math.random()*24;e.x=clamp(pc.x+Math.cos(a)*r,90,232);e.y=clamp(pc.y+Math.sin(a)*r,24,124);this.fireAtPlayer(e,66);e.shot=2.05;this.spawnBurst(e.x,e.y,'#b88aff',7);}else this.moveEnemy(e,-dy/len*e.speed*.35*step,dx/len*e.speed*.35*step);}
      else if(e.behavior==='wind'){const sway=Math.sin(now/380+e.seed);this.moveEnemy(e,(-dy/len*sway)*e.speed*.6*step,(dx/len*sway)*e.speed*.6*step);if(e.shot<=0){this.fireAtPlayer(e,65);this.fireAtPlayerOffset(e,58,.35);this.fireAtPlayerOffset(e,58,-.35);e.shot=1.9;}}
      else if(e.behavior==='mines'){const sway=Math.sin(now/500+e.seed);this.moveEnemy(e,(-dy/len*sway)*e.speed*.45*step,(dx/len*sway)*e.speed*.45*step);if(e.shot<=0){this.projectiles.push({x:ec.x,y:ec.y,w:6,h:6,vx:0,vy:0,life:3.4,projectile:true,mine:true,color:'#bd5f77'});if(len>45)this.fireAtPlayer(e,54);e.shot=2.2;}}
      else if(e.behavior==='shooter'){const sway=Math.sin(now/480+e.seed),keep=len<48?-0.42:len>82?.45:0;this.moveEnemy(e,(dx/len*keep-dy/len*sway*.72)*e.speed*step,(dy/len*keep+dx/len*sway*.72)*e.speed*step);if(e.shot<=0){this.fireAtPlayer(e,e.kind==='voidwisp'?66:56);e.shot=(this.echoSlowTimer>0?2.35:1.55)+(e.kind==='tickwisp'?.25:0);}}
      else if(e.behavior==='boss'){const ratio=e.hp/e.maxHp;e.phase=e.kind==='regent'?(ratio<.33?2:ratio<.66?1:0):(ratio<.5?1:0);const sway=Math.sin(now/620+e.seed),aggression=e.elite?.62:.45;this.moveEnemy(e,(dx/len*e.speed*aggression+(-dy/len)*sway*e.speed*.58)*step,(dy/len*e.speed*aggression+(dx/len)*sway*e.speed*.58)*step);if(e.shot<=0){this.bossFire(e);e.shot=(e.phase?(e.elite?.92:.72):(e.elite?1.3:1.08))*(this.echoSlowTimer>0?1.45:1);}}
      if(hit(p,e))this.damagePlayer(e);
    }
  }

    moveEnemy(e,dx,dy){
    e.x+=dx;if(this.collidesObstacle(e))e.x-=dx;e.y+=dy;if(this.collidesObstacle(e))e.y-=dy;
    e.x=clamp(e.x,this.areaMode==='world'?8:84,238);e.y=clamp(e.y,22,127);
  }

  fireAtPlayer(e,speed=60){const a=center(e),p=center(this.player),dx=p.x-a.x,dy=p.y-a.y,l=Math.hypot(dx,dy)||1;this.projectiles.push({x:a.x,y:a.y,w:3,h:3,vx:dx/l*speed,vy:dy/l*speed,life:3,projectile:true,color:'#ffcf6b'});this.cb.sound?.('shot');}
  bossFire(e){
    const a=center(e);let count=4,offset=0,speed=48;
    if(e.kind==='barkmaw'){count=e.phase?6:4;speed=44;}
    if(e.kind==='magmaox'){count=4;offset=Math.PI/4;speed=62;if(e.phase)this.fireAtPlayer(e,72);}
    if(e.kind==='copperowl'){this.fireAtPlayer(e,68);this.fireAtPlayerOffset(e,68,.28);this.fireAtPlayerOffset(e,68,-.28);return;}
    if(e.kind==='kelpmaw'){count=e.phase?7:5;speed=50;offset=Math.sin(this.frameCount/20)*.2;}
    if(e.kind==='glassknight'){count=e.phase?8:6;speed=58;offset=(this.frameCount%2)*Math.PI/8;}
    if(e.kind==='nameless'){count=e.phase?10:6;speed=61;this.fireAtPlayer(e,74);}
    if(e.kind==='forge'){count=4;offset=Math.PI/4;speed=58;}
    if(e.kind==='abyssray'){count=e.phase?8:5;speed=e.phase?62:54;offset=Math.PI/10;}
    if(e.kind==='stag'){this.fireAtPlayer(e,66);this.fireAtPlayerOffset(e,66,.22);this.fireAtPlayerOffset(e,66,-.22);return;}
    if(e.kind==='warden'){count=e.phase?8:6;speed=54;offset=(this.frameCount%2)*Math.PI/8;}
    if(e.kind==='rocling'){this.fireAtPlayer(e,70);this.fireAtPlayerOffset(e,66,.36);this.fireAtPlayerOffset(e,66,-.36);return;}
    if(e.kind==='astralram'){count=e.phase?9:6;speed=e.phase?66:56;offset=(this.frameCount%3)*Math.PI/12;}
    if(e.kind==='regent'){count=e.phase===2?14:e.phase===1?10:8;speed=e.phase===2?68:60;this.fireAtPlayer(e,e.phase===2?82:72);if(e.phase===2){this.fireAtPlayerOffset(e,76,.24);this.fireAtPlayerOffset(e,76,-.24);}}
    if(e.kind==='bramble'){count=e.phase?6:4;speed=48;}
    for(let i=0;i<count;i++){const ang=offset+i*Math.PI*2/count;this.projectiles.push({x:a.x,y:a.y,w:3,h:3,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,life:3,projectile:true,color:e.phase?'#ff6f91':'#ffd166'});}this.cb.sound?.('bossShot');
  }
  fireAtPlayerOffset(e,speed,off){const a=center(e),p=center(this.player),base=Math.atan2(p.y-a.y,p.x-a.x)+off;this.projectiles.push({x:a.x,y:a.y,w:3,h:3,vx:Math.cos(base)*speed,vy:Math.sin(base)*speed,life:3,projectile:true,color:'#ffd166'});}

  updateProjectiles(dt){
    const echo=(this.hasRune('ECHO')?.88:1)*(this.echoSlowTimer>0?.5:1);
    for(const q of this.projectiles){if(q.dead)continue;q.x+=q.vx*dt*(q.playerOwned?1:echo);q.y+=q.vy*dt*(q.playerOwned?1:echo);q.life-=dt;
      if(q.playerOwned){for(const e of this.enemies){if(e.hp>0&&hit(q,e)){e.hp-=q.damage||1;e.hurt=.15;q.dead=true;this.spawnBurst(q.x,q.y,q.color||'#b88aff',4);break;}}}
      else if(hit(q,this.player)){this.damagePlayer(q);q.dead=true;}
      if(q.x<5||q.x>251||q.y<18||q.y>140)q.dead=true;
    }
    this.projectiles=this.projectiles.filter(q=>!q.dead&&q.life>0);
  }

  spawnDrop(e){
    const r=Math.random(),p=center(e);let type=null;if(e.boss)type=this.player.hp<this.player.maxHp?'heart':'focus';else if(this.player.hp<this.player.maxHp&&r<.13)type='heart';else if(r<.31)type='shard';else if(r<.39)type='focus';if(type)this.pickups.push({x:p.x-3,y:p.y-3,w:6,h:6,type,life:8});
  }
  updatePickups(dt){for(const p of this.pickups){p.life-=dt;if(hit(this.player,p)){const save=this.cb.getSave();if(p.type==='heart')this.player.hp=Math.min(this.player.maxHp,this.player.hp+1);if(p.type==='shard')save.shards+=3;if(p.type==='focus')this.focusTimer=Math.max(this.focusTimer,7);p.dead=true;this.cb.setSave(save);this.cb.sound?.('tick');this.spawnBurst(p.x+3,p.y+3,p.type==='heart'?'#ff6f91':p.type==='focus'?'#fff08a':'#e5b852',6);this.hud();}}this.pickups=this.pickups.filter(p=>!p.dead&&p.life>0);}
  drawPickup(p){const c=this.ctx,x=Math.round(p.x),y=Math.round(p.y);c.globalAlpha=Math.min(1,p.life);c.fillStyle=p.type==='heart'?'#ff6f91':p.type==='focus'?'#fff08a':'#e5b852';c.fillRect(x,y,6,6);c.fillStyle='#fff8dc';c.fillRect(x+2,y+1,2,2);c.globalAlpha=1;}

    spawnBurst(x,y,color,count){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=12+Math.random()*34;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+Math.random()*.3,color});}}
  updateParticles(dt){for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);}

  hud(){
    const save=this.cb.getSave(),weapon=this.currentWeapon(),rune=this.activeRune();this.cb.onHud?.({hp:this.player?.hp||this.maxHp(save),maxHp:this.player?.maxHp||this.maxHp(save),shards:save.shards,kills:save.kills,parries:save.parries||0,runes:save.runes,tools:save.tools,relics:save.relics,weapons:save.weapons||[],weapon,activeRune:rune,runeCooldown:this.runeCooldown,focus:this.focusTimer>0,objective:this.objectiveText(),chapter:this.areaMode==='dungeon'?this.chapterIndex:undefined,room:this.areaMode==='dungeon'?this.roomIndex:undefined,areaMode:this.areaMode,world:this.areaMode==='world'?(save.currentWorld||'lantern-house'):undefined,worldName:this.areaMode==='world'?this.worldRoom?.name:undefined,fps:this.fps});
  }

    render(){
    const c=this.ctx,W=256,H=144,chapter=this.areaMode==='world'?{name:this.worldRoom?.name||'Veyra',accent:this.themeAccent(this.worldRoom?.theme??0),theme:this.worldRoom?.theme??0}:CAMPAIGN[this.chapterIndex]||CAMPAIGN[0];
    c.fillStyle='#071015';c.fillRect(0,0,W,H);this.drawTiles(chapter);this.drawAmbientFX(chapter);this.drawSwitches(chapter);this.drawToolTargets(chapter);this.drawObstacles(chapter);
    if(this.areaMode==='world'){for(const npc of this.npcs)this.drawNpc(npc,chapter);this.drawWorldMarkers(chapter);}else if(this.npc)this.drawNpc(this.npc,chapter);
    if(this.areaMode==='dungeon'&&this.roomClear&&this.room?.type!=='boss'&&(!this.chest||this.chest.collected||this.chest.reward.optional))this.drawExit();
    if(this.chest?.visible&&!this.chest.collected)this.drawChest(this.chest);
    for(const p of this.pickups)this.drawPickup(p);
    for(const q of this.projectiles)this.drawProjectile(q);for(const e of this.enemies)if(e.hp>0)this.drawEnemy(e);if(this.player)this.drawPlayer(this.player);
    for(const p of this.particles){c.globalAlpha=clamp(p.life*2,0,1);c.fillStyle=p.color;c.fillRect(Math.round(p.x),Math.round(p.y),2,2);c.globalAlpha=1;}
    this.drawCanvasHud(chapter);if(this.roomTitleTimer>0)this.drawRoomTitle();if(this.mode==='paused')this.drawOverlay('PAUSED','ESC / PAUSA PARA VOLVER');if(this.mode==='dead')this.drawOverlay('YOU FELL','');
  }

  themeAccent(i){return ['#7fd37f','#f1a85b','#5fc6d6','#e3d26f','#b88aff','#8fb7ff','#df718a'][i]||'#8fc6c9';}

  drawTiles(chapter){
    const c=this.ctx;
    const palettes=[
      {base:'#172920',tile:'#213a2c',edge:'#36513a',detail:'#78915b',dark:'#0b1512'},
      {base:'#2b211c',tile:'#3b2b22',edge:'#5b3d2b',detail:'#d28745',dark:'#160f0c'},
      {base:'#14282e',tile:'#1d3840',edge:'#2f5962',detail:'#69bdc9',dark:'#09151a'},
      {base:'#292a1d',tile:'#3b3b25',edge:'#5d5932',detail:'#c6ae50',dark:'#15150e'},
      {base:'#1f1b2a',tile:'#2c253b',edge:'#44365e',detail:'#8e75b0',dark:'#100d17'},
      {base:'#1b2430',tile:'#263447',edge:'#3d5471',detail:'#82a8de',dark:'#0c121b'},
      {base:'#271720',tile:'#381d28',edge:'#562638',detail:'#be5e5e',dark:'#130a0e'}
    ];
    const themeIndex=this.areaMode==='world'?(this.worldRoom?.theme??0):(chapter.theme??this.chapterIndex);const p=palettes[themeIndex]||palettes[0];
    c.fillStyle=p.dark;c.fillRect(0,16,256,128);
    c.fillStyle=p.base;c.fillRect(6,20,244,120);
    for(let y=20;y<140;y+=12){
      for(let x=6;x<250;x+=12){
        c.fillStyle=((x/12+y/12)|0)%2?p.tile:p.base;c.fillRect(x,y,12,12);
        c.fillStyle=p.edge;c.fillRect(x,y,12,1);c.fillRect(x,y,1,12);
        c.globalAlpha=.32;c.fillStyle=p.dark;c.fillRect(x+8,y+8,4,4);c.globalAlpha=1;
        if(((x+y+this.chapterIndex*5)%36)===0){c.fillStyle=p.detail;c.fillRect(x+3,y+3,3,2);c.fillStyle=p.edge;c.fillRect(x+4,y+5,2,1);}
        if(((x*3+y+themeIndex*11)%60)===0){c.fillStyle=p.detail;c.globalAlpha=.48;c.fillRect(x+8,y+2,2,1);c.fillRect(x+9,y+3,1,2);c.globalAlpha=1;}
      }
    }
    c.fillStyle='#070b0c';c.fillRect(0,16,6,128);c.fillRect(250,16,6,128);c.fillRect(0,16,256,4);c.fillRect(0,140,256,4);
    this.drawScenery(p,themeIndex);
  }

  drawScenery(p,themeIndex=this.chapterIndex){
    const c=this.ctx;
    if(themeIndex===0){
      c.fillStyle='#0d1a16';c.fillRect(12,24,42,7);c.fillRect(202,25,38,7);c.fillStyle='#526750';for(const x of [15,46,206,232])c.fillRect(x,25,6,22);c.fillStyle='#78915b';for(let x=10;x<248;x+=27){c.fillRect(x,134-(x%3),5,3);c.fillRect(x+3,131-(x%4),2,6);}
    }else if(themeIndex===1){
      c.fillStyle='#16100c';c.fillRect(10,24,54,10);c.fillRect(192,24,54,10);c.fillStyle='#69432d';for(const x of [14,28,42,56,196,210,224,238]){c.fillRect(x,25,8,18);c.fillStyle='#d28745';c.fillRect(x+2,31,4,4);c.fillStyle='#69432d';}c.fillStyle='#ffd27a';c.fillRect(13,72,2,6);c.fillRect(240,72,2,6);
    }else if(themeIndex===2){
      c.fillStyle='#0b1d23';c.fillRect(8,118,240,20);c.fillStyle='#1f5360';for(let x=10;x<248;x+=18)c.fillRect(x,124+(x%3),12,2);c.fillStyle='#6fcad4';for(const [x,y] of [[20,34],[230,42],[44,112],[206,118]]){c.fillRect(x,y,2,5);c.fillRect(x-2,y+2,6,1);}c.fillStyle='#315c55';for(let x=14;x<244;x+=34)c.fillRect(x,132,3,7);
    }else if(themeIndex===3){
      c.fillStyle='#17170f';c.fillRect(11,24,44,7);c.fillRect(202,24,43,7);c.strokeStyle='#8d7b3e';c.lineWidth=2;for(const [x,y,r] of [[24,38,9],[224,38,9]]){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.fillStyle='#c6ae50';c.fillRect(x-2,y-2,4,4);}c.fillStyle='#59603d';for(let x=18;x<244;x+=31){c.fillRect(x,135,10,3);c.fillRect(x+4,131,2,7);}
    }else if(themeIndex===4){
      c.fillStyle='#0c0b11';c.fillRect(11,23,45,26);c.fillRect(200,23,45,26);c.fillStyle='#54446f';c.fillRect(16,27,35,17);c.fillRect(205,27,35,17);c.fillStyle='#17141f';c.fillRect(20,30,27,11);c.fillRect(209,30,27,11);c.fillStyle='#8e75b0';for(let i=0;i<8;i++)c.fillRect(9+i*31,137-(i%2)*2,12,2);
    }else if(themeIndex===5){
      c.fillStyle='#101724';c.fillRect(8,22,46,12);c.fillRect(202,22,46,12);c.fillStyle='#4a6586';for(const x of [16,32,208,226]){c.fillRect(x,27,8,19);c.fillStyle='#9dc1ef';c.fillRect(x+2,25,4,4);c.fillStyle='#4a6586';}c.fillStyle='#d9e7ff';for(const [x,y] of [[70,30],[154,26],[228,76],[34,92]])c.fillRect(x,y,2,2);
    }else{
      c.fillStyle='#10080d';c.fillRect(11,23,50,23);c.fillRect(195,23,50,23);c.fillStyle='#5e2637';c.fillRect(15,27,42,15);c.fillRect(199,27,42,15);c.fillStyle='#1c0c13';c.fillRect(20,30,32,9);c.fillRect(204,30,32,9);c.fillStyle='#be5e5e';for(let x=15;x<246;x+=38){c.fillRect(x,136,2,4);c.fillRect(x+4,134,2,6);}
    }
  }

  drawAmbientFX(chapter){
    const c=this.ctx,t=this.frameCount,theme=this.areaMode==='world'?(this.worldRoom?.theme??0):(chapter.theme??this.chapterIndex);
    c.save();
    if(theme===0){ // drifting leaves / fireflies
      for(let i=0;i<7;i++){const x=(17+i*37+(t>>2))%244+6,y=28+((i*23+(t>>3))%101);c.fillStyle=i%2?'#91b965':'#d0d783';c.globalAlpha=.35+(i%3)*.12;c.fillRect(x,y,1+(i%2),1);}
    }else if(theme===1){ // ember sparks
      for(let i=0;i<8;i++){const x=18+i*29,y=132-((t+i*19)%74);c.fillStyle=i%2?'#ffb24b':'#f36f3d';c.globalAlpha=.28+(i%4)*.1;c.fillRect(x,y,1,2);}
    }else if(theme===2){ // water sheen / bubbles
      c.globalAlpha=.28;c.fillStyle='#9ce8e8';for(let i=0;i<5;i++){const x=20+i*47+((t>>4)%8),y=122+(i%3)*4;c.fillRect(x,y,9,1);}for(let i=0;i<5;i++){const x=34+i*41,y=120-((t+i*17)%38);c.fillRect(x,y,1,1);}
    }else if(theme===3){ // clock motes
      c.globalAlpha=.25;c.fillStyle='#f3df7a';for(let i=0;i<6;i++){const a=(t/40)+i,x=128+Math.cos(a)*95,y=79+Math.sin(a*.7)*48;c.fillRect(x|0,y|0,1,1);}
    }else if(theme===4){ // mirror glints
      c.globalAlpha=.25;c.fillStyle='#e5d6ff';
      for(let i=0;i<5;i++){const x=24+i*49,y=26+((i*29+(t>>2))%92);c.fillRect(x,y,1,3);c.fillRect(x-1,y+1,3,1);}
    }else if(theme===5){ // snow / starlight
      c.fillStyle='#e7f2ff';for(let i=0;i<8;i++){const x=(10+i*33+(t>>3))%246,y=22+((i*19+(t>>2))%112);c.globalAlpha=.25+(i%4)*.12;c.fillRect(x,y,1,1);}
    }else{ // null scanlines / memory fragments
      c.globalAlpha=.12;c.fillStyle='#ff90ab';for(let y=24+(t%12);y<140;y+=24)c.fillRect(8,y,240,1);for(let i=0;i<5;i++){const x=24+i*47,y=30+((i*33+(t>>2))%92);c.fillRect(x,y,2,1);}
    }
    c.restore();
  }

  drawSwitches(chapter){
    const c=this.ctx;for(const sw of this.switches){const x=Math.round(sw.x),y=Math.round(sw.y);c.fillStyle='#0a0d0e';c.fillRect(x-1,y-1,12,12);c.fillStyle=sw.active?chapter.accent:'#3d4748';c.fillRect(x,y,10,10);c.fillStyle=sw.active?'#fff0b4':'#727f80';c.fillRect(x+3,y+3,4,4);if(sw.active){c.fillStyle=chapter.accent;c.globalAlpha=.28;c.fillRect(x-3,y-3,16,16);c.globalAlpha=1;}}
  }

  drawToolTargets(chapter){
    const c=this.ctx;for(const t of this.toolTargets){const x=Math.round(t.x),y=Math.round(t.y);c.fillStyle='#07090a';c.fillRect(x-2,y-2,14,14);c.fillStyle=t.active?chapter.accent:'#344247';c.fillRect(x,y,10,10);c.fillStyle=t.active?'#fff0b4':'#9aa7a8';c.font='bold 7px monospace';c.textAlign='center';c.fillText(t.active?'✓':'C',x+5,y+2);c.textAlign='left';if(!t.active){c.globalAlpha=.35;c.fillStyle=chapter.accent;c.fillRect(x-4,y-4,18,18);c.globalAlpha=1;}}
  }

  drawWorldMarkers(chapter){
    const c=this.ctx,save=this.cb.getSave(),p=this.worldRoom?.portal;
    if(p){const ch=CAMPAIGN[p.chapter],done=save.completed.includes(ch.id);c.fillStyle='#07090a';c.fillRect(p.x-9,p.y-15,18,30);c.fillStyle=done?'#536a55':chapter.accent;c.fillRect(p.x-6,p.y-12,12,24);c.fillStyle='#111719';c.fillRect(p.x-3,p.y-8,6,16);c.fillStyle='#f7e6a2';c.fillRect(p.x-1,p.y-2,2,4);c.font='bold 6px monospace';c.textAlign='center';c.fillStyle='#f1ead3';c.fillText(done?'REPLAY':'ENTER',p.x,p.y+19);c.textAlign='left';}
    for(const sec of (this.worldRoom?.secrets||[])){if(save.secrets.includes(sec.id))continue;const reqOk=!sec.require||save.tools.includes(sec.require);c.globalAlpha=reqOk?1:.35;c.fillStyle=reqOk?'#f4d56a':'#748086';c.fillRect(sec.x-1,sec.y-1,3,3);if((this.frameCount>>4)%2===0)c.fillRect(sec.x,sec.y-5,1,2);c.globalAlpha=1;}
    const dirs=[['left',3,78,'◀'],['right',247,78,'▶'],['up',128,20,'▲'],['down',128,136,'▼']];c.font='8px monospace';for(const [d,x,y,g] of dirs){const n=this.worldNeighbor(d);if(!n)continue;const locked=n.require&&!save.tools.includes(n.require);c.fillStyle=locked?'#7b5860':'#d7cfad';c.fillText(locked?'×':g,x,y);}
  }

  drawNpc(npc,chapter){
    const c=this.ctx,x=Math.round(npc.x),y=Math.round(npc.y);c.fillStyle='rgba(0,0,0,.38)';c.fillRect(x+1,y+11,8,2);c.globalAlpha=.78;c.fillStyle=chapter.accent;c.fillRect(x+1,y+4,7,7);c.fillStyle='#d9d3bd';c.fillRect(x+2,y+1,5,4);c.fillStyle='#1a2022';c.fillRect(x+3,y+2,1,1);c.fillRect(x+6,y+2,1,1);if(npc.kind==='smith'){c.fillStyle='#7c4b34';c.fillRect(x,y+6,2,5);}if(npc.kind==='archive'){c.fillStyle='#c8b6e2';c.fillRect(x+8,y+3,2,8);}if(npc.kind==='scribe'){c.fillStyle='#d9c76c';c.fillRect(x-1,y+2,2,8);}c.globalAlpha=1;
  }

  drawObstacles(chapter){
    const c=this.ctx;
    for(const o of this.obstacles){
      c.fillStyle='rgba(0,0,0,.45)';c.fillRect(o.x+3,o.y+o.h-1,o.w+2,4);
      c.fillStyle='#0a0d0e';c.fillRect(o.x-2,o.y-2,o.w+4,o.h+4);
      c.fillStyle='#4b5450';c.fillRect(o.x,o.y,o.w,o.h);
      c.fillStyle='#69736b';c.fillRect(o.x+2,o.y+2,o.w-4,3);
      c.fillStyle='#303735';c.fillRect(o.x+3,o.y+6,Math.max(2,o.w-6),Math.max(2,o.h-9));
      c.fillStyle=chapter.accent;c.globalAlpha=.65;c.fillRect(o.x+1,o.y+1,2,Math.max(2,o.h-2));c.globalAlpha=1;
      const ti=this.areaMode==='world'?(this.worldRoom?.theme??0):(CAMPAIGN[this.chapterIndex]?.theme??this.chapterIndex);if(ti===0){c.fillStyle='#678258';c.fillRect(o.x+4,o.y-2,Math.max(3,o.w-8),3);}
    }
  }

  drawExit(){
    const c=this.ctx;c.fillStyle='#050708';c.fillRect(236,53,18,54);c.fillStyle='#6a765f';c.fillRect(239,56,12,48);c.fillStyle='#111b17';c.fillRect(242,61,7,39);c.fillStyle='#a8c879';c.fillRect(243,62,2,37);c.fillStyle='#f2d36c';c.fillRect(247,80,2,2);
  }

  drawChest(ch){
    const c=this.ctx,x=Math.round(ch.x),y=Math.round(ch.y);c.fillStyle='rgba(0,0,0,.45)';c.fillRect(x+1,y+9,12,3);c.fillStyle='#422716';c.fillRect(x,y+3,12,7);c.fillStyle='#8b5526';c.fillRect(x,y,12,5);c.fillStyle='#e3ad43';c.fillRect(x+5,y+4,3,4);c.fillRect(x+1,y+1,10,1);if((this.frameCount>>4)%2===0){c.fillStyle='#fff0a6';c.fillRect(x+6,y-3,1,2);c.fillRect(x+2,y-1,1,1);c.fillRect(x+10,y-1,1,1);}
  }

  drawPlayer(p){
    const c=this.ctx,x=Math.round(p.x),y=Math.round(p.y),moving=!!(this.keys?.size);const step=moving?((this.frameCount>>3)&1):0;const bob=moving&&((this.frameCount>>3)&1)?-1:0;
    const flash=this.damageCd>0&&Math.floor(this.damageCd*18)%2===0;if(flash)c.globalAlpha=.35;
    // soft 16-bit shadow
    c.fillStyle='rgba(0,0,0,.20)';c.fillRect(x,y+11,10,2);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x+2,y+12,6,1);
    // outline + boots/body
    c.fillStyle='#0b1712';c.fillRect(x+1,y+2+bob,8,9);c.fillRect(x+2,y+1+bob,6,2);
    c.fillStyle='#6f3c2c';c.fillRect(x+1,y+9+bob,3,2+step);c.fillRect(x+6,y+9+bob,3,2+(1-step));
    c.fillStyle='#173624';c.fillRect(x+1,y+6+bob,8,4);c.fillStyle='#2f6840';c.fillRect(x+2,y+5+bob,6,4);c.fillStyle='#4d8854';c.fillRect(x+2,y+5+bob,2,3);
    // head / hood / hair
    c.fillStyle='#224b31';c.fillRect(x+1,y+1+bob,8,5);c.fillStyle='#3d7c49';c.fillRect(x,y+2+bob,9,3);c.fillStyle='#75a45c';c.fillRect(x+1,y+1+bob,4,1);
    c.fillStyle='#8f5c3a';c.fillRect(x+2,y+3+bob,1,3);c.fillStyle='#f1c28c';c.fillRect(x+3,y+3+bob,5,3);c.fillStyle='#6e402e';c.fillRect(x+3,y+3+bob,1,1);
    c.fillStyle='#18211f';c.fillRect(x+7,y+4+bob,1,1);
    // belt + buckle
    c.fillStyle='#39291f';c.fillRect(x+2,y+8+bob,6,1);c.fillStyle='#e7c663';c.fillRect(x+5,y+8+bob,1,1);
    // equipped weapon hilt + charge tell
    const weapon=this.currentWeapon();c.fillStyle=weapon.color;c.fillRect(x+8,y+5+bob,2,5);c.fillStyle='#d8a942';c.fillRect(x+8,y+4+bob,2,2);if(this.chargedReady){c.globalAlpha=.45;c.fillStyle=weapon.color;c.fillRect(x-2,y-2,14,15);c.globalAlpha=flash?.35:1;}
    if(this.isGuarding()){
      c.fillStyle='#19363b';if(p.facing==='right')c.fillRect(x+9,y+2,4,9);if(p.facing==='left')c.fillRect(x-4,y+2,4,9);if(p.facing==='up')c.fillRect(x+1,y-4,8,4);if(p.facing==='down')c.fillRect(x+1,y+11,8,4);
      c.fillStyle='#71cbd4';if(p.facing==='right')c.fillRect(x+10,y+3,2,7);if(p.facing==='left')c.fillRect(x-3,y+3,2,7);if(p.facing==='up')c.fillRect(x+2,y-3,6,2);if(p.facing==='down')c.fillRect(x+2,y+12,6,2);
      c.fillStyle='#dff8f5';if(p.facing==='right')c.fillRect(x+11,y+4,1,3);if(p.facing==='left')c.fillRect(x-2,y+4,1,3);
    }
    if(this.attackTimer>0){
      c.fillStyle=weapon.color||'#fff9dd';if(p.facing==='right'){c.fillRect(x+9,y+4,14,2);c.fillRect(x+20,y+3,3,4);}if(p.facing==='left'){c.fillRect(x-14,y+4,14,2);c.fillRect(x-14,y+3,3,4);}if(p.facing==='up'){c.fillRect(x+4,y-14,2,14);c.fillRect(x+3,y-14,4,3);}if(p.facing==='down'){c.fillRect(x+4,y+11,2,14);c.fillRect(x+3,y+22,4,3);}c.fillStyle='#8ed7e4';c.globalAlpha=.5;if(p.facing==='right')c.fillRect(x+12,y+2,8,1);if(p.facing==='left')c.fillRect(x-11,y+2,8,1);c.globalAlpha=flash?.35:1;
    }
    c.globalAlpha=1;
  }

  drawEnemy(e){
    const c=this.ctx,x=Math.round(e.x),y=Math.round(e.y);if(e.hurt>0)c.globalAlpha=.45;
    c.fillStyle='rgba(0,0,0,.42)';c.fillRect(x+1,y+e.h-1,Math.max(5,e.w-2),3);
    if(e.boss){this.drawBossEnemy(e,x,y);c.globalAlpha=1;return;}
    if(e.kind==='mossling'){c.fillStyle='#315033';c.fillRect(x+2,y,5,2);c.fillStyle='#8db866';c.fillRect(x,y+2,9,6);c.fillStyle='#19241a';c.fillRect(x+2,y+4,2,2);c.fillRect(x+6,y+4,2,2);c.fillStyle='#b5d783';c.fillRect(x+4,y,2,2);}
    else if(e.kind==='thornbat'){c.fillStyle='#273d2b';c.fillRect(x,y+3,4,4);c.fillRect(x+6,y+3,4,4);c.fillStyle='#8fb15e';c.fillRect(x+3,y+2,4,7);c.fillStyle='#ffd36c';c.fillRect(x+4,y+4,1,1);c.fillRect(x+6,y+4,1,1);}
    else if(e.kind==='rootguard'){c.fillStyle='#6f7a55';c.fillRect(x+2,y+1,8,10);c.fillStyle='#3c4935';c.fillRect(x,y+4,4,7);c.fillStyle='#d1b56d';c.fillRect(x+4,y+3,2,2);c.fillRect(x+8,y+3,2,2);}
    else if(e.kind==='emberling'){c.fillStyle='#7b2e21';c.fillRect(x+1,y+4,8,5);c.fillStyle='#e56f3b';c.fillRect(x+2,y+1,6,6);c.fillStyle='#ffd166';c.fillRect(x+4,y,2,4);c.fillStyle='#29110d';c.fillRect(x+3,y+5,1,1);c.fillRect(x+6,y+5,1,1);}
    else if(e.kind==='cinderwisp'){c.fillStyle='#d7653c';c.fillRect(x+3,y,4,10);c.fillRect(x,y+3,10,4);c.fillStyle='#fff0a6';c.fillRect(x+4,y+3,2,2);c.fillStyle='#71291f';c.fillRect(x+3,y+8,4,2);}
    else if(e.kind==='forgeguard'){c.fillStyle='#4d433b';c.fillRect(x+1,y+3,10,9);c.fillStyle='#b5653c';c.fillRect(x+2,y,8,5);c.fillStyle='#f0b85b';c.fillRect(x+3,y+4,2,2);c.fillRect(x+8,y+4,2,2);c.fillStyle='#24201d';c.fillRect(x,y+7,3,5);}
    else if(e.kind==='gearling'){c.fillStyle='#8d7b3e';c.fillRect(x+2,y,6,10);c.fillRect(x,y+2,10,6);c.fillStyle='#cdb85e';c.fillRect(x+3,y+3,4,4);c.fillStyle='#3c3a24';c.fillRect(x+4,y+4,2,2);}
    else if(e.kind==='tickwisp'){c.fillStyle='#bda64e';c.fillRect(x+1,y+1,8,8);c.fillStyle='#2e3024';c.fillRect(x+3,y+3,4,4);c.fillStyle='#efe49a';c.fillRect(x+5,y+3,1,3);c.fillRect(x+5,y+5,2,1);}
    else if(e.kind==='clockguard'){c.fillStyle='#5b5938';c.fillRect(x+1,y+1,10,11);c.fillStyle='#bca957';c.fillRect(x+3,y+2,6,5);c.fillStyle='#22231a';c.fillRect(x+4,y+4,1,1);c.fillRect(x+7,y+4,1,1);c.fillStyle='#77704a';c.fillRect(x,y+6,3,6);}
    else if(e.kind==='shardling'){c.fillStyle='#765a9b';c.beginPath();c.moveTo(x+5,y);c.lineTo(x+10,y+9);c.lineTo(x,y+9);c.fill();c.fillStyle='#c6a9e8';c.fillRect(x+4,y+3,2,3);}
    else if(e.kind==='mirrorshade'){c.fillStyle='#7f6a9d';c.fillRect(x+2,y+1,7,8);c.fillRect(x,y+4,11,4);c.fillStyle='#d6c7ed';c.fillRect(x+3,y+3,2,2);c.fillRect(x+7,y+3,2,2);c.fillStyle='#372a47';c.fillRect(x+2,y+8,2,3);c.fillRect(x+7,y+8,2,3);}
    else if(e.kind==='obsidianguard'){c.fillStyle='#292432';c.fillRect(x+1,y+1,11,12);c.fillStyle='#8068a1';c.fillRect(x+3,y+2,7,5);c.fillStyle='#e1c96f';c.fillRect(x+4,y+4,1,1);c.fillRect(x+8,y+4,1,1);c.fillStyle='#111016';c.fillRect(x,y+6,3,7);}
    else if(e.kind==='brinecrawler'){c.fillStyle='#245462';c.fillRect(x+1,y+4,8,5);c.fillStyle='#63b9c8';c.fillRect(x+2,y+2,6,5);c.fillStyle='#d4f6ef';c.fillRect(x+3,y+3,1,1);c.fillRect(x+6,y+3,1,1);c.fillStyle='#17323a';c.fillRect(x-2,y+7,3,2);c.fillRect(x+9,y+7,3,2);}
    else if(e.kind==='lanternjelly'){c.fillStyle='#75d5dc';c.fillRect(x+2,y+1,7,5);c.fillStyle='#bdf4ef';c.fillRect(x+4,y,3,2);c.fillStyle='#24535e';c.fillRect(x+2,y+6,1,4);c.fillRect(x+5,y+6,1,5);c.fillRect(x+8,y+6,1,4);c.fillStyle='#fff0a6';c.fillRect(x+5,y+3,1,1);}
    else if(e.kind==='tideguard'){c.fillStyle='#244953';c.fillRect(x+1,y+2,11,11);c.fillStyle='#5faeaf';c.fillRect(x+3,y,7,5);c.fillStyle='#ccead8';c.fillRect(x+4,y+3,1,1);c.fillRect(x+8,y+3,1,1);c.fillStyle='#173039';c.fillRect(x,y+7,3,6);}
    else if(e.kind==='screeimp'){c.fillStyle='#465a72';c.fillRect(x+1,y+4,8,5);c.fillStyle='#8db5e1';c.fillRect(x+2,y+1,6,5);c.fillStyle='#eef5ff';c.fillRect(x+3,y+4,1,1);c.fillRect(x+6,y+4,1,1);c.fillStyle='#253344';c.fillRect(x,y+8,3,2);c.fillRect(x+7,y+8,3,2);}
    else if(e.kind==='galeeye'){c.fillStyle='#668db8';c.fillRect(x+1,y+1,9,9);c.fillStyle='#d9e9ff';c.fillRect(x+3,y+3,5,5);c.fillStyle='#20304a';c.fillRect(x+5,y+4,2,3);c.fillStyle='#9cc8f4';c.fillRect(x-2,y+4,3,2);c.fillRect(x+10,y+4,3,2);}
    else if(e.kind==='peakguard'){c.fillStyle='#293b52';c.fillRect(x+1,y+1,11,12);c.fillStyle='#7194bb';c.fillRect(x+3,y+2,7,5);c.fillStyle='#f0e9ba';c.fillRect(x+4,y+4,1,1);c.fillRect(x+8,y+4,1,1);c.fillStyle='#162231';c.fillRect(x,y+6,3,7);}
    else if(e.kind==='archiveecho'){c.globalAlpha*=.78;c.fillStyle='#9a6f86';c.fillRect(x+1,y+1,9,10);c.fillStyle='#e8c8d5';c.fillRect(x+3,y+2,5,4);c.fillStyle='#3b1c2b';c.fillRect(x+2,y+7,7,4);c.fillStyle='#ffabc0';c.fillRect(x+5,y,1,11);}
    else if(e.kind==='inkmote'){c.fillStyle='#301622';c.fillRect(x+1,y+1,8,8);c.fillStyle='#b44f70';c.fillRect(x+3,y+3,4,4);c.fillStyle='#f0a0b5';c.fillRect(x+4,y+4,1,1);c.fillRect(x+1,y+9,2,2);c.fillRect(x+7,y+9,2,2);}
    else if(e.kind==='nullmote'){c.fillStyle='#8e3f58';c.fillRect(x,y+2,9,7);c.fillStyle='#e0718c';c.fillRect(x+2,y,5,3);c.fillStyle='#13090e';c.fillRect(x+2,y+4,2,2);c.fillRect(x+6,y+4,2,2);c.fillStyle='#ff9db1';c.fillRect(x-2,y+1,2,2);c.fillRect(x+9,y+7,2,2);}
    else if(e.kind==='voidwisp'){c.fillStyle='#6f3349';c.fillRect(x+1,y+1,9,9);c.fillStyle='#130a10';c.fillRect(x+3,y+3,5,5);c.fillStyle='#ff8ca5';c.fillRect(x+5,y+4,1,2);c.fillStyle='#bd5f77';c.fillRect(x+3,y+9,5,2);}
    else if(e.kind==='nullguard'){c.fillStyle='#2a151e';c.fillRect(x+1,y+1,11,12);c.fillStyle='#9b435e';c.fillRect(x+2,y+1,9,5);c.fillStyle='#f19bae';c.fillRect(x+4,y+3,1,1);c.fillRect(x+8,y+3,1,1);c.fillStyle='#13090e';c.fillRect(x,y+6,3,7);}
    c.globalAlpha=1;
  }

  drawBossEnemy(e,x,y){
    const c=this.ctx;const colors={barkmaw:'#6f9b59',magmaox:'#db6d3f',kelpmaw:'#5fb9b9',copperowl:'#cdb85e',glassknight:'#9c82ba',rocling:'#7fa6d5',nameless:'#b84e68',bramble:'#6f9b59',forge:'#d66b43',abyssray:'#63c2d0',stag:'#cdb85e',warden:'#9c82ba',astralram:'#89b4ef',regent:'#cf6463'};const col=colors[e.kind]||'#fff';
    const pulse=((this.frameCount>>3)&1);c.fillStyle='rgba(0,0,0,.48)';c.fillRect(x-3,y+e.h-1,e.w+6,4);c.fillStyle='#080a0b';c.fillRect(x-2,y-2,e.w+4,e.h+4);c.fillStyle=col;c.fillRect(x+1,y+1,e.w-2,e.h-2);c.fillStyle='#202327';c.fillRect(x+4,y+5,e.w-8,e.h-8);c.globalAlpha=.45;c.fillStyle='#fff4cf';c.fillRect(x+3,y+2,e.w-6,1);c.globalAlpha=1;if(e.phase||pulse){c.globalAlpha=.18;c.fillStyle=col;c.fillRect(x-4,y-4,e.w+8,e.h+8);c.globalAlpha=1;}
    if(e.kind==='barkmaw'||e.kind==='bramble'){c.fillStyle='#31492e';c.fillRect(x-3,y+4,5,3);c.fillRect(x+e.w-2,y+7,5,3);c.fillStyle='#d7e18a';c.fillRect(x+5,y+5,3,3);c.fillRect(x+e.w-8,y+5,3,3);}
    else if(e.kind==='magmaox'||e.kind==='forge'){c.fillStyle='#ffd166';c.fillRect(x+4,y+5,3,3);c.fillRect(x+e.w-7,y+5,3,3);c.fillStyle='#5b2d20';c.fillRect(x-3,y+2,5,3);c.fillRect(x+e.w-2,y+2,5,3);}
    else if(e.kind==='kelpmaw'||e.kind==='abyssray'){c.fillStyle='#d6ffff';c.fillRect(x+4,y+5,3,3);c.fillRect(x+e.w-7,y+5,3,3);c.fillStyle='#245866';c.fillRect(x-2,y+4,4,4);c.fillRect(x+e.w-2,y+7,4,4);} 
    else if(e.kind==='copperowl'||e.kind==='stag'){c.fillStyle='#efe49a';c.fillRect(x+4,y+5,3,3);c.fillRect(x+e.w-7,y+5,3,3);c.fillStyle='#756830';c.fillRect(x-2,y-3,3,6);c.fillRect(x+e.w-1,y-3,3,6);}
    else if(e.kind==='rocling'||e.kind==='astralram'){c.fillStyle='#eef6ff';c.fillRect(x+4,y+5,3,3);c.fillRect(x+e.w-7,y+5,3,3);c.fillStyle='#435e83';c.fillRect(x-3,y+3,5,3);c.fillRect(x+e.w-2,y+3,5,3);} 
    else if(e.kind==='glassknight'||e.kind==='warden'){c.fillStyle='#e4d6f5';c.fillRect(x+4,y+5,3,3);c.fillRect(x+e.w-7,y+5,3,3);c.fillStyle='#6f568f';c.fillRect(x-2,y+5,3,10);}
    else {c.fillStyle='#ffd2db';c.fillRect(x+4,y+5,3,3);c.fillRect(x+e.w-7,y+5,3,3);c.fillStyle='#5e2336';c.fillRect(x+4,y-4,e.w-8,5);c.fillRect(x+7,y-7,e.w-14,4);}
    c.fillStyle='#101314';c.fillRect(x+6,y+e.h-5,e.w-12,3);this.drawBossBar(e);
  }

  drawBossBar(e){const c=this.ctx;c.fillStyle='#050708';c.fillRect(151,19,95,8);c.fillStyle='#3d2528';c.fillRect(154,22,89,3);c.fillStyle='#d96661';c.fillRect(154,22,89*(e.hp/e.maxHp),3);c.fillStyle='#e9dfbd';c.fillRect(151,19,2,8);}
  drawProjectile(q){const c=this.ctx,x=Math.round(q.x),y=Math.round(q.y),col=q.color||'#e5b852';c.globalAlpha=.22;c.fillStyle=col;c.fillRect(x-2,y-2,q.w+4,q.h+4);c.globalAlpha=1;c.fillStyle=col;c.fillRect(x,y,q.w,q.h);c.fillStyle='#fff8dc';c.fillRect(x+1,y+1,1,1);if(!q.playerOwned){c.globalAlpha=.55;c.fillStyle='#fff4cd';c.fillRect(x-1,y+1,1,1);c.globalAlpha=1;}}
  drawCanvasHud(chapter){const c=this.ctx,save=this.cb.getSave();c.fillStyle='#071014';c.fillRect(0,0,256,16);c.fillStyle='#243238';c.fillRect(0,14,256,2);c.fillStyle='#56676d';c.fillRect(0,0,256,1);c.fillStyle=chapter.accent;c.font='bold 7px monospace';c.textBaseline='top';const label=this.areaMode==='world'?`VEYRA · ${chapter.name.toUpperCase()}`:`D${this.chapterIndex+1} · ${chapter.name.toUpperCase()}`;c.fillText(label.slice(0,27),5,4);const hp=this.player?.hp||0,max=this.player?.maxHp||hp;for(let i=0;i<Math.min(9,max);i++){const hx=166+i*5;c.fillStyle=i<hp?'#d85f59':'#4b3133';c.fillRect(hx,5,4,4);c.fillStyle=i<hp?'#ff9a7d':'#6a4447';c.fillRect(hx+1,4,2,1);}c.fillStyle='#e8c661';c.fillText(`◆${String(save.shards||0).padStart(3,'0')}`,216,4);}
  drawRoomTitle(){const c=this.ctx;c.globalAlpha=clamp(this.roomTitleTimer,0,.92);c.fillStyle='#0b1012';c.fillRect(47,56,162,34);c.fillStyle='#d8cfb5';c.fillRect(50,59,156,28);c.fillStyle='#151b1e';c.fillRect(52,61,152,24);c.fillStyle='#f2ead1';c.font='bold 8px monospace';c.textAlign='center';c.fillText(this.room?.name.toUpperCase()||'',128,66);c.font='6px monospace';c.fillStyle='#8fc6c9';const type=this.areaMode==='world'?'OVERWORLD':this.room?.type==='boss'?'GUARDIAN':this.room?.type==='miniboss'?'MINIBOSS':this.room?.type==='tool'?'ITEM PUZZLE':this.room?.type==='puzzle'?'PUZZLE':'DUNGEON';c.fillText(type,128,78);c.textAlign='left';c.globalAlpha=1;}
  drawOverlay(title,sub){const c=this.ctx;c.fillStyle='rgba(6,9,10,.86)';c.fillRect(0,16,256,128);c.fillStyle='#d8cfb5';c.fillRect(54,53,148,44);c.fillStyle='#111719';c.fillRect(58,57,140,36);c.fillStyle='#fff1ce';c.font='bold 15px monospace';c.textAlign='center';c.fillText(title,128,64);c.font='7px monospace';c.fillStyle='#8fc6c9';c.fillText(sub,128,84);c.textAlign='left';}

}
