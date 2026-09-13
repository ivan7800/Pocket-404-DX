import { VERSION, DX_GAMES, CAMPAIGN, ACHIEVEMENTS, WORLD_MAP, WORLD_LINKS, LORE, BESTIARY, TOOLS, WEAPONS, RUNE_ABILITIES, UPGRADES, QUESTS } from './data.js';
import { RuneQuestEngine, defaultSave } from './engine.js';
import { PixelAudio } from './audio.js';
import { SETTINGS_KEY, migrateLegacyIfNeeded, loadSlot, saveSlot, clearSlot, getSlotSummary, getActiveSlot, setActiveSlot, normalizeSave, parseSettings, saveSettings } from './save.js';

const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
migrateLegacyIfNeeded();

const state={
  activeSlot:getActiveSlot(),save:null,engine:null,currentView:'hub',
  settings:{scan:true,motion:false,contrast:false,sound:true,music:true,effects:true,musicVolume:.45,fxVolume:.65,...parseSettings()},audio:null
};
state.save=loadSlot(state.activeSlot);state.audio=new PixelAudio(state.settings);

function persist(){state.save.updatedAt=Date.now();state.save=saveSlot(state.activeSlot,state.save);refreshMeta();}
function setSave(s){state.save=normalizeSave(s);persist();}
function getSave(){return state.save;}
function hasProgress(slot=state.activeSlot){return !getSlotSummary(slot).empty;}
function persistSettings(){saveSettings(state.settings);applySettings();state.audio.refresh();}

function applySettings(){
  document.body.classList.toggle('no-scan',!state.settings.scan);document.body.classList.toggle('reduce-motion',!!state.settings.motion);document.body.classList.toggle('high-contrast',!!state.settings.contrast);
  $('#scanToggle').checked=!!state.settings.scan;$('#motionToggle').checked=!!state.settings.motion;$('#contrastToggle').checked=!!state.settings.contrast;$('#soundToggle').checked=!!state.settings.sound;$('#musicToggle').checked=!!state.settings.music;$('#effectsToggle').checked=!!state.settings.effects;
  $('#musicVolumeRange').value=Math.round((state.settings.musicVolume??.45)*100);$('#musicVolumeValue').textContent=`${Math.round((state.settings.musicVolume??.45)*100)}%`;
  $('#fxVolumeRange').value=Math.round((state.settings.fxVolume??.65)*100);$('#fxVolumeValue').textContent=`${Math.round((state.settings.fxVolume??.65)*100)}%`;
}

function showView(name){
  state.currentView=name;for(const id of ['hub','campaign','game','ending'])$(`#${id}View`).classList.toggle('hidden',id!==name);
  document.body.classList.toggle('game-active',name==='game');
  if(name!=='game'&&name!=='ending')state.audio.setScene('home');
  window.scrollTo({top:0,behavior:state.settings.motion?'auto':'smooth'});
}

function renderGameGrid(){
  $('#gameGrid').innerHTML=DX_GAMES.map(g=>{const action=g.status==='PLAYABLE'?`<button class="primary" data-game="${g.id}" type="button">ABRIR AVENTURA</button>`:`<div class="game-status-note" aria-label="${g.status==='NEXT'?'Próximamente':'Planificado'}">${g.status==='NEXT'?'PRÓXIMAMENTE':'PLANIFICADO'}</div>`;return `<article class="game-card ${g.status.toLowerCase()}"><span class="status-pill">${g.status}</span><span class="code">${g.code}</span><h3>${g.title}</h3><span class="tag">${g.tag}</span><p>${g.description}</p>${action}</article>`;}).join('');
  $$('[data-game]').forEach(b=>b.addEventListener('click',openCampaign));
}

function roman(n){return ['I','II','III','IV','V','VI','VII'][n]||String(n+1);}
function mapNodeKnown(n){const s=state.save;if(n.id==='lantern-house')return true;if((s.discoveredWorld||[]).includes(n.id))return true;if(n.chapter!==undefined&&s.completed.includes(CAMPAIGN[n.chapter]?.id))return true;return false;}
function worldMapMarkup(compact=false){
  const known=WORLD_MAP.filter(mapNodeKnown),ids=new Set(known.map(n=>n.id)),byId=Object.fromEntries(WORLD_MAP.map(n=>[n.id,n]));
  const lines=WORLD_LINKS.filter(([a,b])=>ids.has(a)&&ids.has(b)).map(([a,b])=>{const A=byId[a],B=byId[b];return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" />`;}).join('');
  const nodes=known.map(n=>{const done=n.chapter!==undefined&&state.save.completed.includes(CAMPAIGN[n.chapter]?.id),current=n.id===state.save.currentWorld&&state.save.currentMode==='world';return `<div class="map-node map-${n.id} unlocked ${done?'done':''} ${current?'current':''}" aria-label="${n.name}: ${n.desc}"><span>${n.type==='home'?'⌂':done?'◆':n.type==='secret'?'◇':'●'}</span><b>${n.name}</b><small>${n.desc}</small></div>`;}).join('');
  return `<div class="world-map-inner"><svg class="map-paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg><div class="map-mountains" aria-hidden="true"></div><div class="map-water" aria-hidden="true"></div>${nodes}</div>`;
}
function renderWorldMap(){if($('#worldMap'))$('#worldMap').innerHTML=worldMapMarkup(false);}
function renderMapDialog(){if($('#mapDialogMap'))$('#mapDialogMap').innerHTML=worldMapMarkup(true);}

function questText(){
  const s=state.save;if(s.campaignComplete)return s.trueEnding?'Veyra conserva recuerdos por elección. El Archivo Voluntario está abierto.':'Oran ha caído. Veyra es libre, pero quedan reliquias y side quests para descubrir el final verdadero.';
  const next=Math.min(s.completed.length,CAMPAIGN.length-1),c=CAMPAIGN[next];return `${c.region} · Encuentra la entrada de ${c.name} en el overworld y recupera la Runa ${c.rune}. ${c.subtitle}.`;
}
function renderLore(){
  const unlocked=state.save.completed.length;$('#questLog').innerHTML=`<b>${state.save.campaignComplete?'EPÍLOGO':'MISIÓN PRINCIPAL'}</b><p>${questText()}</p><div class="inventory-line"><span>RUNAS ${state.save.runes.length}/7</span><span>TOOLS ${state.save.tools.length}/6</span><span>RELIQUIAS ${state.save.relics.length}</span><span>SECRETOS ${state.save.secrets.length}</span></div>`;
  $('#sideQuestGrid').innerHTML=QUESTS.map(q=>{const st=state.save.quests[q.id]||'inactive';return `<article class="sidequest-card ${st}"><span>${st==='complete'?'✓ COMPLETA':st==='active'?'EN CURSO':'NO INICIADA'}</span><h3>${q.name}</h3><p>${st==='inactive'?`Habla con ${q.npc.toUpperCase()} para iniciar esta historia.`:st==='complete'?'La historia ha quedado resuelta.':'Vuelve a hablar con el NPC cuando cumplas su condición.'}</p></article>`;}).join('');
  $('#loreGrid').innerHTML=LORE.map(l=>{const open=unlocked>=l.unlock;return `<article class="lore-card ${open?'unlocked':'locked'}"><span>${open?'ARCHIVE ENTRY':'LOCKED'}</span><h3>${open?l.title:'???'}</h3><p>${open?l.text:'Completa más dungeons para recuperar esta entrada.'}</p></article>`;}).join('');
}

function renderInventory(){
  const s=state.save;$('#toolGrid').innerHTML=TOOLS.map(t=>`<div class="inventory-card ${s.tools.includes(t.id)?'owned':'locked'}"><b>${s.tools.includes(t.id)?t.glyph:'?'}</b><span>${s.tools.includes(t.id)?t.name:'UNKNOWN TOOL'}</span><small>${s.tools.includes(t.id)?t.desc:'Se obtiene dentro de un dungeon.'}</small></div>`).join('');
  $('#runeInventory').innerHTML=CAMPAIGN.map(c=>{const owned=s.runes.includes(c.rune),eq=s.equippedRune===c.rune,a=RUNE_ABILITIES[c.rune];return `<button type="button" class="inventory-card inventory-equip ${owned?'owned':'locked'} ${eq?'equipped':''}" ${owned?`data-equip-rune="${c.rune}"`:'disabled'}><b>${owned?'◆':'◇'}</b><span>${owned?c.rune:'???'}</span><small>${owned?`${eq?'EQUIPPED · ':''}${a?.name||''} · ${a?.desc||c.region}`:c.region}</small></button>`;}).join('');
  $('#weaponInventory').innerHTML=WEAPONS.map(w=>{const owned=(s.weapons||[]).includes(w.id),eq=s.equippedWeapon===w.id;return `<button type="button" class="inventory-card inventory-equip ${owned?'owned':'locked'} ${eq?'equipped':''}" ${owned?`data-equip-weapon="${w.id}"`:'disabled'}><b>${owned?w.glyph:'?'}</b><span>${owned?w.name:'UNKNOWN WEAPON'}</span><small>${owned?`${eq?'EQUIPPED · ':''}${w.desc}`:'Se desbloquea avanzando en la campaña.'}</small></button>`;}).join('');
  const relics=[...new Set(s.relics)];$('#relicInventory').innerHTML=relics.length?relics.map(r=>`<div class="inventory-card owned"><b>◆</b><span>${r}</span><small>Reliquia opcional recuperada.</small></div>`).join(''):'<div class="inventory-card locked"><b>◇</b><span>SIN RELIQUIAS</span><small>Explora salas opcionales y secretos.</small></div>';
  $$('[data-equip-weapon]').forEach(b=>b.addEventListener('click',()=>{state.save.equippedWeapon=b.dataset.equipWeapon;persist();renderInventory();toast(`${WEAPONS.find(w=>w.id===state.save.equippedWeapon)?.name||'ARMA'} · EQUIPADA`);}));
  $$('[data-equip-rune]').forEach(b=>b.addEventListener('click',()=>{state.save.equippedRune=b.dataset.equipRune;persist();renderInventory();toast(`RUNA ${state.save.equippedRune} · EQUIPADA`);}));
}

function renderBestiary(){
  const done=new Set(state.save.completed);$('#bestiaryGrid').innerHTML=BESTIARY.map(e=>{const idx=CAMPAIGN.findIndex(c=>c.region===e.region),open=idx<0||idx===0||done.has(CAMPAIGN[idx]?.id)||state.save.currentChapter>=idx;return `<article class="beast-card ${open?'unlocked':'locked'}"><span class="beast-glyph">${open?e.glyph:'?'}</span><div><small>${open?`${e.region} · ${e.rank}`:'UNKNOWN'}</small><h3>${open?e.name:'???'}</h3><p>${open?e.desc:'Explora esta región para registrar la criatura.'}</p></div></article>`;}).join('');$('#bestiaryCount').textContent=`${BESTIARY.filter(e=>{const i=CAMPAIGN.findIndex(c=>c.region===e.region);return i<=state.save.completed.length;}).length}/${BESTIARY.length}`;
}

function renderShop(){
  const s=state.save;$('#shopShards').textContent=String(s.shards||0).padStart(3,'0');$('#shopGrid').innerHTML=UPGRADES.map(u=>{const owned=s.upgrades.includes(u.id),can=(s.shards||0)>=u.cost;return `<article class="shop-card ${owned?'owned':''}"><span>${owned?'OWNED':`${u.cost} ◆`}</span><h3>${u.name}</h3><p>${u.desc}</p><button class="${owned?'ghost':'secondary'}" data-upgrade="${u.id}" ${owned||!can?'disabled':''}>${owned?'INSTALADO':can?'COMPRAR':'FALTAN SHARDS'}</button></article>`;}).join('');$$('[data-upgrade]').forEach(b=>b.addEventListener('click',()=>buyUpgrade(b.dataset.upgrade)));
}
function buyUpgrade(id){const u=UPGRADES.find(x=>x.id===id);if(!u||state.save.upgrades.includes(id)||state.save.shards<u.cost)return;state.save.shards-=u.cost;state.save.upgrades.push(id);persist();renderShop();toast(`${u.name} · INSTALADO`);}

function renderSlots(){
  $('#slotGrid').innerHTML=[1,2,3].map(n=>{const x=getSlotSummary(n);return `<button class="slot-card ${n===state.activeSlot?'active':''}" data-slot="${n}" type="button"><b>SLOT ${n}</b><span>${x.empty?'VACÍO':x.campaignComplete?'CRÉDITOS ALCANZADOS':`${x.completed}/${x.total} DUNGEONS`}</span><small>${x.empty?'Nueva aventura':`RUNAS ${x.runes} · TOOLS ${x.tools} · ◆${x.shards}${x.ng?` · NG+${x.ng}`:''}`}</small></button>`;}).join('');
  $$('[data-slot]').forEach(b=>b.addEventListener('click',()=>switchSlot(Number(b.dataset.slot))));
  const a=getSlotSummary(state.activeSlot);$('#slotStatus').textContent=`Slot ${state.activeSlot} · ${a.empty?'vacío':a.campaignComplete?'postgame disponible':`${a.completed}/${a.total} dungeons completados`}`;
}
function switchSlot(n){cleanupEngine();state.activeSlot=setActiveSlot(n);state.save=loadSlot(n);renderCampaign();refreshMeta();toast(`SLOT ${n} ACTIVO`);}

function renderCampaign(){
  const s=state.save;renderSlots();renderWorldMap();renderInventory();renderLore();renderBestiary();renderShop();
  $('#chapterGrid').innerHTML=CAMPAIGN.map((c,i)=>{const done=s.completed.includes(c.id),available=i===0||s.completed.includes(CAMPAIGN[i-1]?.id),tool=c.tool?TOOLS.find(t=>t.id===c.tool)?.name:'FINAL';return `<article class="chapter-card c${i} ${available?'':'locked'} ${done?'completed':''}"><span class="chapter-num">${roman(i)}</span><div class="chapter-region">${c.region}</div><h3>${c.name}</h3><p>${c.subtitle}</p><div class="chapter-meta"><span>${c.rooms.length} ROOMS</span><span>${done?'◆ COMPLETE':'◇ PENDING'}</span></div><span class="rune">${c.final?'FINAL DUNGEON':`ITEM · ${tool} · RUNE ${c.rune}`}</span><small class="route-note">${done?'Superado. Puede rejugarse entrando de nuevo desde el mundo.':available?'Busca su entrada caminando por Veyra.':'La ruta todavía no está abierta.'}</small></article>`;}).join('');
  $('#achievementGrid').innerHTML=ACHIEVEMENTS.map(a=>`<div class="achievement ${s.achievements.includes(a.id)?'unlocked':''}"><b>${s.achievements.includes(a.id)?'✓ ':''}${a.name}</b><span>${a.desc}</span></div>`).join('');
}

function refreshMeta(){
  const s=state.save,pct=Math.round(s.completed.length/CAMPAIGN.length*100);$('#progressPct').textContent=`${pct}%`;$('#runesCount').textContent=`${s.runes.length}/7`;$('#toolsCount').textContent=`${s.tools.length}/6`;$('#secretsCount').textContent=String(s.secrets.length);$('#achCount').textContent=`${s.achievements.length}/${ACHIEVEMENTS.length}`;
  $('#continueBtn').textContent=s.campaignComplete?'POSTGAME · VEYRA':hasProgress()?'CONTINUAR AVENTURA':'EMPEZAR AVENTURA';if(state.currentView==='campaign')renderCampaign();
}

function openCampaign(){cleanupEngine();renderCampaign();showView('campaign');}
function makeEngine(){
  const canvas=$('#gameCanvas');state.engine=new RuneQuestEngine(canvas,{onHud:updateHud,onMessage:showMessage,onMode:handleEngineMode,onChapterComplete:(i,complete)=>{toast(complete?'CAMPAÑA · CRÉDITOS DESBLOQUEADOS':`DUNGEON ${roman(i)} COMPLETADO`);refreshMeta();},onAchievement:a=>toast(`LOGRO · ${a?.name||'UNLOCKED'}`),sound:t=>state.audio.play(t),scene:s=>state.audio.setScene(s),getSave,setSave,onEnding:showEnding});return canvas;
}
function launchAdventure(newAdventure=false){cleanupEngine();showView('game');const canvas=makeEngine();state.engine.start();if(newAdventure)state.engine.startAdventure();else state.engine.resumeAdventure();canvas.focus({preventScroll:true});updateInventoryHud();}
function startNewActiveSlot(){state.save=defaultSave();persist();renderCampaign();launchAdventure(true);}
function cleanupEngine(){if(state.engine){state.engine.destroy();state.engine=null;}showMessage('');}
function returnCamp(){cleanupEngine();renderCampaign();showView('campaign');refreshMeta();}

function updateInventoryHud(){
  const s=state.save;if($('#toolHud'))$('#toolHud').innerHTML=s.tools.length?s.tools.map(id=>`<span class="item-chip">${TOOLS.find(t=>t.id===id)?.glyph||'◆'} ${TOOLS.find(t=>t.id===id)?.name||id}</span>`).join(''):'<span class="empty-item">NINGUNA</span>';
  if($('#relicHud'))$('#relicHud').innerHTML=s.relics.length?s.relics.slice(-4).map(r=>`<span class="item-chip relic">◆ ${r}</span>`).join(''):'<span class="empty-item">NINGUNA</span>';
  if($('#keyHud'))$('#keyHud').innerHTML=s.keys.length?s.keys.slice(-3).map(k=>`<span class="item-chip">▣ ${k}</span>`).join(''):'<span class="empty-item">NINGUNA</span>';
  const w=WEAPONS.find(x=>x.id===s.equippedWeapon)||WEAPONS[0];if($('#weaponBtnLabel'))$('#weaponBtnLabel').textContent=`${w.glyph} ${w.name}`;if($('#weaponCount'))$('#weaponCount').textContent=`${(s.weapons||[]).length}/${WEAPONS.length}`;
}
function updateHud(data){
  if(data.hp!==undefined)$('#heartHud').innerHTML=Array.from({length:data.maxHp},(_,i)=>`<span class="heart ${i<data.hp?'full':''}">♥</span>`).join('');if(data.shards!==undefined)$('#shardsHud').textContent=String(data.shards).padStart(3,'0');if(data.kills!==undefined)$('#killsHud').textContent=String(data.kills).padStart(3,'0');
  if(data.runes)$('#runeHud').innerHTML=CAMPAIGN.map((c,i)=>`<span class="rune-chip c${i} ${data.runes.includes(c.rune)?'owned':''}" title="${c.rune}">${c.rune[0]}</span>`).join('');if(data.objective)$('#objectiveHud').textContent=data.objective;if($('#runeBtnLabel')){$('#runeBtnLabel').textContent=data.activeRune?(data.runeCooldown>0?`${data.activeRune} ${data.runeCooldown.toFixed(1)}s`:`${data.activeRune} · READY`):'SIN RUNA';$('#runeBtn')?.classList.toggle('cooling',(data.runeCooldown||0)>0);}if($('#focusStatus'))$('#focusStatus').textContent=data.focus?'FOCUS +DMG':'';
  if(data.areaMode==='world'){$('#areaLabel').textContent='VEYRA · OVERWORLD';$('#chapterLabel').textContent='OVERWORLD';$('#gameTitle').textContent=data.worldName||'Veyra';$('#roomLabel').textContent=(data.worldName||'VEYRA').toUpperCase();}
  if(data.areaMode==='dungeon'&&data.chapter!==undefined){$('#areaLabel').textContent=`DUNGEON ${roman(data.chapter)} · ${CAMPAIGN[data.chapter].region.toUpperCase()}`;$('#chapterLabel').textContent=`DUNGEON ${roman(data.chapter)}`;$('#gameTitle').textContent=CAMPAIGN[data.chapter].name;if(data.room!==undefined)$('#roomLabel').textContent=CAMPAIGN[data.chapter].rooms[data.room].name.toUpperCase();}
  if(data.fps)$('#fpsLabel').textContent=`${data.fps} FPS`;updateInventoryHud();
}
function showMessage(text){const el=$('#messageOverlay');el.textContent=text||'';el.classList.toggle('hidden',!text);}
function handleEngineMode(mode){const btn=$('#pauseBtn'),status=$('#pauseBtnStatus');if(status)status.textContent=mode==='paused'?'REANUDAR':'PAUSA';if(btn){btn.classList.toggle('is-paused',mode==='paused');btn.setAttribute('aria-label',mode==='paused'?'Reanudar':'Pausar');}}

function showEnding(save){cleanupEngine();$('#endingTitle').textContent=save.trueEnding?'The Voluntary Archive':'The Name Returns';$('#endingText').textContent=save.trueEnding?'Has cerrado el Archivo antiguo sin construir otra prisión. Veyra recuerda solo lo que sus habitantes eligen compartir.':'El Null Archive ha caído. Veyra vuelve a recordar de forma imperfecta y libre. Aún quedan historias opcionales por cerrar.';const quests=Object.values(save.quests||{}).filter(v=>v==='complete').length;$('#endingStats').innerHTML=`<div><b>${save.runes.length}/7</b><span>RUNAS</span></div><div><b>${save.tools.length}/6</b><span>TOOLS</span></div><div><b>${save.relics.length}</b><span>RELIQUIAS</span></div><div><b>${quests}/${QUESTS.length}</b><span>SIDE QUESTS</span></div><div><b>${save.secrets.length}</b><span>SECRETOS</span></div><div><b>${save.kills}</b><span>KILLS</span></div>`;showView('ending');state.audio.setScene('ending');state.audio.play('credits');}
function startNewGamePlus(){const old=state.save,next=defaultSave();next.newGamePlus=(old.newGamePlus||0)+1;next.upgrades=[...old.upgrades];next.weapons=[...new Set(['traveler-blade',...(old.weapons||[])])];next.equippedWeapon=old.equippedWeapon||'traveler-blade';next.equippedRune=old.equippedRune&&old.runes?.includes(old.equippedRune)?old.equippedRune:null;next.achievements=[...new Set([...old.achievements,'ngplus'])];state.save=next;persist();launchAdventure(true);toast(`NEW GAME+ ${next.newGamePlus}`);}

function toast(text){let el=$('.toast');if(!el){el=document.createElement('div');el.className='toast';el.setAttribute('role','status');document.body.append(el);}el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600);}

function bind(){
  $('#homeLink').addEventListener('click',e=>{e.preventDefault();cleanupEngine();showView('hub');refreshMeta();});$('#settingsBtn').addEventListener('click',()=>$('#settingsDialog').showModal());$('#helpBtn').addEventListener('click',()=>$('#helpDialog').showModal());
  $('#campaignBackBtn').addEventListener('click',()=>{cleanupEngine();showView('hub');refreshMeta();});$('#leaveGameBtn').addEventListener('click',returnCamp);$('#pauseBtn').addEventListener('click',()=>state.engine?.togglePause());$('#mapBtn').addEventListener('click',()=>{renderMapDialog();$('#mapDialog').showModal();state.audio.play('map');});$('#fullscreenBtn')?.addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('#gameShell')?.requestFullscreen?.();else await document.exitFullscreen?.();}catch(err){console.warn('Fullscreen unavailable',err);}});document.addEventListener('fullscreenchange',()=>{const b=$('#fullscreenBtn');if(b)b.textContent=document.fullscreenElement?'⤡ EXIT':'⛶ FULL';});
  $('#continueBtn').addEventListener('click',()=>hasProgress()?launchAdventure(false):startNewActiveSlot());$('#newGameBtn').addEventListener('click',()=>{openCampaign();if(hasProgress())$('#confirmDialog').showModal();else startNewActiveSlot();});$('#exploreWorldBtn').addEventListener('click',()=>hasProgress()?launchAdventure(false):startNewActiveSlot());$('#newSlotGameBtn').addEventListener('click',()=>hasProgress()?$('#confirmDialog').showModal():startNewActiveSlot());
  $('#resetCampaignBtn').addEventListener('click',()=>$('#confirmDialog').showModal());$('#confirmResetBtn').addEventListener('click',()=>{clearSlot(state.activeSlot);state.save=defaultSave();renderCampaign();refreshMeta();toast(`SLOT ${state.activeSlot} BORRADO`);});
  $('#postgameBtn').addEventListener('click',()=>{state.save.currentMode='world';state.save.currentWorld='lantern-house';persist();launchAdventure(false);});$('#newGamePlusBtn').addEventListener('click',startNewGamePlus);
  const toggles=[['scanToggle','scan'],['motionToggle','motion'],['contrastToggle','contrast'],['soundToggle','sound'],['musicToggle','music'],['effectsToggle','effects']];for(const [id,key] of toggles)$('#'+id).addEventListener('change',e=>{state.settings[key]=e.target.checked;persistSettings();});
  $('#musicVolumeRange').addEventListener('input',e=>{state.settings.musicVolume=Number(e.target.value)/100;persistSettings();});$('#fxVolumeRange').addEventListener('input',e=>{state.settings.fxVolume=Number(e.target.value)/100;persistSettings();});
  window.addEventListener('keydown',e=>{if(state.currentView!=='game'||!state.engine)return;const used=state.engine.setKey(e.code,true);if(used||['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();});window.addEventListener('keyup',e=>{if(state.currentView==='game'&&state.engine){state.engine.setKey(e.code,false);state.engine.releaseKey(e.code);}});
  $$('[data-control]').forEach(btn=>{const c=btn.dataset.control;const down=e=>{e.preventDefault();btn.setPointerCapture?.(e.pointerId);state.engine?.setControl(c,true);};const up=e=>{e.preventDefault();state.engine?.setControl(c,false);};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('contextmenu',e=>e.preventDefault());});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.currentView==='game'&&state.engine?.mode==='playing')state.engine.togglePause();});
}

async function registerSW(){if(location.protocol==='file:'||!('serviceWorker'in navigator))return;try{const registrations=await navigator.serviceWorker.getRegistrations();await Promise.all(registrations.filter(r=>r.scope.includes('/classic/')).map(r=>r.unregister()));const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await reg.update();let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;location.reload();});}catch(err){console.warn('SW unavailable',err);}}
function init(){applySettings();renderGameGrid();renderCampaign();refreshMeta();bind();registerSW();}
init();
