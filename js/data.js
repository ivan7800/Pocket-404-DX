export const VERSION = '6.1.0';
export const SAVE_SCHEMA = 6;

export const DX_GAMES = [
  { id:'rune', title:'Rune Quest 404 DX', code:'RQ-DX', status:'PLAYABLE', tag:'16-BIT WEB ACTION ADVENTURE', description:'Complete Adventure Edition: overworld, 7 dungeons, 7 runas activas, 6 herramientas, 7 armas, 37 enemigos, side quests, secretos, bosses, finales y NG+.' },
  { id:'pipe', title:'Pipe Dash 404 DX', code:'PD-DX', status:'NEXT', tag:'PLATFORM ACTION', description:'Plataformas 8-bit con mundos, rutas y jefes. Próximo remake premium.' },
  { id:'ring', title:'Ring Duel 404 DX', code:'RD-DX', status:'PLANNED', tag:'BOXING CAMPAIGN', description:'Torneo de rivales, patrones, esquiva, KO y cinturones.' },
  { id:'girder', title:'Girder Rescue 404 DX', code:'GR-DX', status:'PLANNED', tag:'ARCADE PLATFORM', description:'Ascenso por estructuras, peligros, rescates y fases encadenadas.' }
];

export const TOOLS = [
  {id:'thorn-shears',name:'THORN SHEARS',glyph:'✂',desc:'Corta zarzas antiguas y activa mecanismos vegetales.'},
  {id:'ember-grapple',name:'EMBER GRAPPLE',glyph:'⌁',desc:'Engancha anillas de hierro y cruza pasos rotos.'},
  {id:'tide-mantle',name:'TIDE MANTLE',glyph:'≈',desc:'Permite atravesar corrientes profundas y compuertas de marea.'},
  {id:'echo-bell',name:'ECHO BELL',glyph:'◌',desc:'Revela caminos, placas y recuerdos que existen a destiempo.'},
  {id:'prism-lens',name:'PRISM LENS',glyph:'◇',desc:'Hace visibles sellos de luz y desactiva barreras prismáticas.'},
  {id:'sky-anchor',name:'SKY ANCHOR',glyph:'⌖',desc:'Fija puentes de viento y permite cruzar grandes vacíos.'}
];


export const WEAPONS = [
  {id:'traveler-blade',name:'TRAVELER BLADE',glyph:'†',damage:1,reach:15,width:9,cooldown:.28,charged:2.0,combo:1,knockback:3,color:'#d7e8e7',desc:'Hoja equilibrada. Combo de tres golpes y carga fiable.'},
  {id:'briar-cleaver',name:'BRIAR CLEAVER',glyph:'╱',damage:2,reach:14,width:13,cooldown:.39,charged:2.2,combo:0,knockback:9,color:'#9fd36e',unlockAfter:'moss-gate',desc:'Pesada y ancha. Golpes lentos, gran retroceso y carga circular.'},
  {id:'ember-sabre',name:'EMBER SABRE',glyph:'ϟ',damage:1,reach:17,width:9,cooldown:.27,charged:1.8,combo:2,knockback:4,color:'#ff9a59',unlockAfter:'sunken-forge',desc:'Rápida. El tercer golpe prende al enemigo y acelera el combo.'},
  {id:'tide-pike',name:'TIDE PIKE',glyph:'↦',damage:2,reach:24,width:6,cooldown:.34,charged:2.0,combo:0,knockback:13,color:'#77dbe5',unlockAfter:'tideglass',desc:'Alcance largo y estrecho. Excelente para mantener distancia.'},
  {id:'prism-edge',name:'PRISM EDGE',glyph:'◇',damage:2,reach:17,width:10,cooldown:.29,charged:2.0,combo:1,knockback:5,color:'#c6a7ef',unlockAfter:'obsidian-keep',desc:'Equilibrada. Amplía la ventana de parry y potencia reflejos.'},
  {id:'aether-blade',name:'AETHER BLADE',glyph:'✦',damage:2,reach:19,width:10,cooldown:.24,charged:2.1,combo:1,knockback:6,color:'#a8ccff',unlockAfter:'starfall',desc:'Hoja ligera. El ataque cargado proyecta una onda de viento.'},
  {id:'nullbrand',name:'NULLBRAND',glyph:'∅',damage:3,reach:18,width:11,cooldown:.27,charged:2.25,combo:1,knockback:8,color:'#f17b9d',unlockAfter:'null-archive',desc:'Arma de postgame. Convierte una parte del daño cargado en shards.'}
];

export const RUNE_ABILITIES = {
  VERDANT:{name:'ROOT PULSE',desc:'Cura 1 corazón y enraíza enemigos cercanos.',cooldown:10},
  EMBER:{name:'CINDER NOVA',desc:'Explosión corta que daña y quema enemigos cercanos.',cooldown:9},
  TIDE:{name:'TIDAL DASH',desc:'Desplazamiento invulnerable en la dirección actual.',cooldown:8},
  ECHO:{name:'STILL SECOND',desc:'Ralentiza enemigos y proyectiles durante unos segundos.',cooldown:10},
  PRISM:{name:'PRISM VEIL',desc:'Ventana defensiva que refleja proyectiles automáticamente.',cooldown:11},
  AETHER:{name:'SKY CUT',desc:'Lanza ondas de energía en abanico.',cooldown:8},
  NULL:{name:'SECOND NAME',desc:'Pulso Null: cura, hiere alrededor y concede invulnerabilidad breve.',cooldown:13}
};

export const UPGRADES = [
  {id:'heart-vessel',name:'POCKET VESSEL',cost:26,desc:'+1 corazón máximo permanente.'},
  {id:'swift-boots',name:'SWIFT THREAD',cost:30,desc:'Movimiento más rápido y recuperación de ataque menor.'},
  {id:'tempered-edge',name:'TEMPERED EDGE',cost:34,desc:'+1 daño base con todas las armas cuerpo a cuerpo.'},
  {id:'shard-purse',name:'ARCHIVE PURSE',cost:32,desc:'Los enemigos normales dejan +1 shard adicional.'},
  {id:'guard-core',name:'PRISM GUARD CORE',cost:38,desc:'Amplía la ventana de parry y reduce el daño de contacto tras bloquear.'},
  {id:'rune-capacitor',name:'RUNE CAPACITOR',cost:44,desc:'Reduce un 25% el enfriamiento de habilidades de runa.'},
  {id:'charged-core',name:'CHARGED EDGE',cost:48,desc:'Los ataques cargados necesitan menos tiempo y hacen +1 daño.'}
]

export const WORLD_MAP = [
  {id:'lantern-house',name:'Lantern House',x:48,y:84,type:'home',desc:'Refugio de Edda y centro de la aventura.'},
  {id:'bellwether',name:'Bellwether',x:34,y:74,type:'town',desc:'Pueblo de campanas bajas y rumores altos.'},
  {id:'moss-gate-world',name:'Moss Gate',x:18,y:65,type:'dungeon',chapter:0,desc:'Bosque Umbral · Verdant'},
  {id:'sunken-forge-world',name:'Sunken Forge',x:20,y:34,type:'dungeon',chapter:1,desc:'Forja Sumergida · Ember'},
  {id:'tideglass-world',name:'Tideglass Grotto',x:42,y:18,type:'dungeon',chapter:2,desc:'Gruta de Cristal · Tide'},
  {id:'clockwood-world',name:'Clockwood',x:62,y:24,type:'dungeon',chapter:3,desc:'Bosque Reloj · Echo'},
  {id:'obsidian-world',name:'Obsidian Keep',x:80,y:42,type:'dungeon',chapter:4,desc:'Fortaleza Espejo · Prism'},
  {id:'starfall-world',name:'Starfall Sanctum',x:76,y:68,type:'dungeon',chapter:5,desc:'Santuario Celeste · Aether'},
  {id:'null-archive-world',name:'Null Archive',x:58,y:87,type:'final',chapter:6,desc:'Último Archivo · Null'},
  {id:'foxglove-cave',name:'Foxglove Cave',x:12,y:82,type:'secret',desc:'Cueva opcional bajo las raíces.'},
  {id:'broken-chapel',name:'Broken Chapel',x:43,y:58,type:'secret',desc:'Capilla borrada de los mapas.'},
  {id:'drowned-vault',name:'Drowned Vault',x:35,y:34,type:'secret',desc:'Tesoro hundido de los herreros.'}
];

export const WORLD_LINKS = [
  ['lantern-house','bellwether'],['bellwether','moss-gate-world'],['moss-gate-world','sunken-forge-world'],
  ['sunken-forge-world','tideglass-world'],['tideglass-world','clockwood-world'],['clockwood-world','obsidian-world'],
  ['obsidian-world','starfall-world'],['starfall-world','null-archive-world'],['bellwether','broken-chapel'],
  ['moss-gate-world','foxglove-cave'],['sunken-forge-world','drowned-vault']
];

export const OVERWORLD_ROOMS = {
  'lantern-house':{name:'Lantern House',theme:0,layout:'home',neighbors:{up:'bellwether',right:'whisper-meadow'},npcs:[{id:'edda',name:'EDDA',kind:'archive',x:118,y:68,dialogue:['EDDA · «Un nombre no es una jaula. Es una puerta que debe poder abrirse desde dentro».'],progressDialogue:[{after:1,lines:['EDDA · «Verdant ha vuelto y Bellwether vuelve a pronunciar nombres que ayer no podía».']},{after:3,lines:['EDDA · «El mar y el reloj confirman lo mismo: el Archivo no falló por olvidar, sino por negarse a hacerlo».']},{after:5,lines:['EDDA · «Ya recuerdas por qué te borré. No fue para salvar el Archivo. Fue para salvarte de él».']},{after:6,lines:['EDDA · «Starfall demuestra que el mundo continúa incluso cuando nadie lo registra. Eso es lo que Oran nunca aceptó».']},{after:7,lines:['EDDA · «Has vuelto con tu nombre intacto. Ahora Veyra decidirá qué merece ser recordado».']}],quest:'homecoming'}],enter:['LANTERN HOUSE · Aquí se guarda lo que Veyra decide recordar.']},
  'bellwether':{name:'Bellwether',theme:0,layout:'village',neighbors:{down:'lantern-house',left:'foxglove-cave',right:'whisper-meadow',up:'broken-chapel'},npcs:[{id:'sile',name:'SILE',kind:'keeper',x:88,y:72,dialogue:['SILE · «Los árboles no olvidan. Solo dejan de hablar cuando nadie escucha».'],progressDialogue:[{after:1,lines:['SILE · «Moss Gate respira otra vez. No lo confundas con obediencia: las raíces simplemente eligieron crecer».']},{after:4,lines:['SILE · «Clockwood suena desde aquí. Un bosque que repite el mismo segundo también termina pudriéndose».']}],quest:'names-in-bark'},{id:'lio',name:'LIO',kind:'villager',x:164,y:82,dialogue:['LIO · «El sendero del este conduce a Moss Gate. No pises las flores negras: marcan recuerdos rotos».'],progressDialogue:[{after:2,lines:['LIO · «Las campanas han cambiado de tono desde que saliste de la Forja. Mi madre dice que es una buena señal».']},{after:5,lines:['LIO · «Ayer recordé una canción que nadie me enseñó. Edda dice que era de antes del Archivo».']},{after:7,lines:['LIO · «Ahora cuando olvido algo no me asusta. Si importa, alguien puede volver a contármelo».']}]}],enter:['BELLWETHER · El pueblo conserva campanas para llamar a quienes olvidan volver.']},
  'whisper-meadow':{name:'Whisper Meadow',theme:0,layout:'meadow',neighbors:{left:'bellwether',right:'moss-gate-world'},enemies:[['mossling',176,52],['thornbat',210,104]],secrets:[{id:'memory-seed-1',x:104,y:38,require:null,reward:{type:'shards',amount:8,label:'MEMORY SEED'},hint:'Una flor dorada tiembla contra el viento.'}]},
  'moss-gate-world':{name:'Moss Gate',theme:0,layout:'grove',neighbors:{left:'whisper-meadow',down:'foxglove-cave',up:{id:'briar-crossing',require:'thorn-shears',blocked:'Las zarzas antiguas solo ceden ante THORN SHEARS.'}},portal:{chapter:0,x:210,y:72},npcs:[{id:'moss-watcher',name:'WATCHER',kind:'keeper',x:90,y:90,dialogue:['WATCHER · «La puerta reconoce a quien no teme perder su nombre».']}],enter:['MOSS GATE · El primer sello del Gran Archivo late bajo las raíces.']},
  'foxglove-cave':{name:'Foxglove Cave',theme:0,layout:'cave',neighbors:{up:'moss-gate-world',right:'bellwether'},secrets:[{id:'fox-heart',x:190,y:92,require:'ember-grapple',reward:{type:'heart',label:'HEART FRAGMENT'},hint:'Una anilla de hierro cuelga al otro lado del foso.'},{id:'memory-seed-2',x:116,y:46,require:null,reward:{type:'shards',amount:8,label:'MEMORY SEED'},hint:'Musgo claro forma un círculo perfecto.'}]},
  'briar-crossing':{name:'Briar Crossing',theme:0,layout:'thorns',neighbors:{down:'moss-gate-world',up:'old-aqueduct'},enemies:[['rootguard',178,54],['thornbat',220,78]],secrets:[{id:'memory-seed-3',x:142,y:112,require:'thorn-shears',reward:{type:'shards',amount:10,label:'MEMORY SEED'},hint:'Tres espinos crecen en una dirección imposible.'}]},
  'old-aqueduct':{name:'Old Aqueduct',theme:1,layout:'canals',neighbors:{down:'briar-crossing',left:'sunken-forge-world',right:{id:'glasswater-shore',require:'ember-grapple',blocked:'Falta un punto de anclaje: EMBER GRAPPLE podría cruzar el derrumbe.'}},npcs:[{id:'orrin',name:'ORRIN',kind:'smith',x:118,y:74,dialogue:['ORRIN · «El hierro recuerda cada golpe. Por eso nunca miente del todo».'],progressDialogue:[{after:2,lines:['ORRIN · «La Forja dejó de fabricar copias. Por primera vez en años, el metal se enfría sin esperar una orden».']},{after:5,lines:['ORRIN · «La Prism Edge no quiere ser perfecta. Esa es precisamente la razón por la que corta mejor».']}],quest:'cold-iron'}],enemies:[['emberling',182,52],['forgeguard',218,98]]},
  'sunken-forge-world':{name:'Sunken Forge',theme:1,layout:'foundry',neighbors:{right:'old-aqueduct'},portal:{chapter:1,x:210,y:72},enter:['SUNKEN FORGE · Bajo el agua, los hornos continúan esperando una orden.']},
  'glasswater-shore':{name:'Glasswater Shore',theme:2,layout:'shore',neighbors:{left:'old-aqueduct',down:'drowned-vault',right:'tideglass-world',up:{id:'deep-channel',require:'tide-mantle',blocked:'La corriente te devuelve a la orilla. Necesitas TIDE MANTLE.'}},npcs:[{id:'neri',name:'NERI',kind:'tide',x:92,y:74,dialogue:['NERI · «Cuando el agua devuelve una luz, no siempre es tu reflejo».'],progressDialogue:[{after:3,lines:['NERI · «La marea ya no devuelve siempre la misma cara. Algunas noches no devuelve ninguna, y eso también está bien».']},{after:6,lines:['NERI · «Desde Starfall cae una luz nueva. No está archivada. Nadie sabe cómo llamarla todavía».']}],quest:'lantern-fish'}],enemies:[['brinecrawler',182,98],['lanternjelly',218,56]]},
  'drowned-vault':{name:'Drowned Vault',theme:2,layout:'vault',neighbors:{up:'glasswater-shore'},secrets:[{id:'pearl-cache',x:190,y:74,require:'prism-lens',reward:{type:'relic',label:'TIDE PEARL'},hint:'Un muro de agua refleja una cerradura que no existe.'}]},
  'tideglass-world':{name:'Tideglass Grotto',theme:2,layout:'tide',neighbors:{left:'glasswater-shore'},portal:{chapter:2,x:210,y:72},enter:['TIDEGLASS GROTTO · Las paredes respiran con la marea.']},
  'deep-channel':{name:'Deep Channel',theme:2,layout:'deep',neighbors:{down:'glasswater-shore',up:'winding-pass'},enemies:[['tideguard',188,54],['lanternjelly',218,100]],secrets:[{id:'echo-shrine-1',x:114,y:44,require:'echo-bell',reward:{type:'shards',amount:12,label:'ECHO SHRINE'},hint:'Una campana inaudible vibra bajo el agua.'}]},
  'winding-pass':{name:'Winding Pass',theme:3,layout:'mountain',neighbors:{down:'deep-channel',right:'clockwood-world'},enemies:[['gearling',176,54],['tickwisp',218,96]],secrets:[{id:'echo-shrine-2',x:146,y:112,require:'echo-bell',reward:{type:'shards',amount:12,label:'ECHO SHRINE'},hint:'Las piedras repiten tu último paso.'}]},
  'clockwood-world':{name:'Clockwood',theme:3,layout:'clock',neighbors:{left:'winding-pass',right:{id:'echo-bridge',require:'echo-bell',blocked:'El puente aparece solo cuando suena ECHO BELL.'}},portal:{chapter:3,x:210,y:72},npcs:[{id:'mira',name:'MIRA',kind:'scribe',x:92,y:86,dialogue:['MIRA · «Una copia perfecta también puede ser una mentira perfecta».'],progressDialogue:[{after:4,lines:['MIRA · «El día volvió a avanzar. Solo un segundo, pero fue un segundo que nadie había escrito de antemano».']},{after:5,lines:['MIRA · «Los espejos de Obsidian ya no imitan con exactitud. Están aprendiendo a equivocarse».']}],quest:'second-bell'}]},
  'echo-bridge':{name:'Echo Bridge',theme:3,layout:'bridge',neighbors:{left:'clockwood-world',right:'obsidian-road'},secrets:[{id:'echo-shrine-3',x:132,y:40,require:'echo-bell',reward:{type:'heart',label:'HEART FRAGMENT'},hint:'Un arco sin campana proyecta una sombra circular.'}]},
  'obsidian-road':{name:'Obsidian Road',theme:4,layout:'keep',neighbors:{left:'echo-bridge',right:'obsidian-world',down:'broken-chapel'},enemies:[['shardling',180,54],['mirrorshade',218,96]]},
  'broken-chapel':{name:'Broken Chapel',theme:4,layout:'chapel',neighbors:{down:'bellwether',up:'obsidian-road'},secrets:[{id:'chapel-relic',x:184,y:52,require:'echo-bell',reward:{type:'relic',label:'BELLWETHER VOW'},hint:'Un altar vacío responde a una nota que nadie toca.'}]},
  'obsidian-world':{name:'Obsidian Keep',theme:4,layout:'mirror',neighbors:{left:'obsidian-road',right:{id:'mirror-step',require:'prism-lens',blocked:'La barrera no tiene cerradura visible. PRISM LENS puede revelar su sello.'}},portal:{chapter:4,x:210,y:72}},
  'mirror-step':{name:'Mirror Step',theme:4,layout:'gallery',neighbors:{left:'obsidian-world',right:'starfall-foothills'},enemies:[['obsidianguard',184,52],['mirrorshade',218,104]],secrets:[{id:'sky-glyph-1',x:112,y:110,require:'prism-lens',reward:{type:'shards',amount:14,label:'SKY GLYPH'},hint:'Un fragmento de cielo aparece dentro de un espejo roto.'}]},
  'starfall-foothills':{name:'Starfall Foothills',theme:5,layout:'peak',neighbors:{left:'mirror-step',right:'starfall-world'},npcs:[{id:'tamas',name:'TAMAS',kind:'climber',x:92,y:72,dialogue:['TAMAS · «Las estrellas no caen. Veyra sube hasta ellas por un instante».'],progressDialogue:[{after:6,lines:['TAMAS · «El cielo está abierto. No porque hayamos encontrado una salida, sino porque dejamos de pedir permiso para mirar arriba».']},{after:7,lines:['TAMAS · «Null Archive se apagó y, aun así, las estrellas siguen aquí. Creo que esa era toda la respuesta».']}],quest:'sky-letters'}],enemies:[['screeimp',184,54],['galeeye',218,96]],secrets:[{id:'sky-glyph-2',x:144,y:42,require:'prism-lens',reward:{type:'shards',amount:14,label:'SKY GLYPH'},hint:'Una veta de cristal apunta al norte aunque gires alrededor.'}]},
  'starfall-world':{name:'Starfall Sanctum',theme:5,layout:'sanctum',neighbors:{left:'starfall-foothills',down:{id:'null-causeway',require:'sky-anchor',blocked:'El abismo corta el camino. SKY ANCHOR puede fijar el puente de viento.'}},portal:{chapter:5,x:210,y:72},secrets:[{id:'sky-glyph-3',x:122,y:112,require:'sky-anchor',reward:{type:'heart',label:'HEART FRAGMENT'},hint:'Una cadena termina suspendida sobre el vacío.'}]},
  'null-causeway':{name:'Null Causeway',theme:6,layout:'null',neighbors:{up:'starfall-world',down:'null-archive-world'},enemies:[['nullmote',180,52],['voidwisp',220,90],['nullguard',204,110]],enter:['NULL CAUSEWAY · Aquí los caminos no tienen nombre, solo dirección.']},
  'null-archive-world':{name:'Null Archive',theme:6,layout:'archive',neighbors:{up:'null-causeway'},portal:{chapter:6,x:210,y:72,requiresCompleted:6},enter:['THE NULL ARCHIVE · Todas las rutas de Veyra terminan aquí.']}
};

const room=(name,type,layout,extra={})=>({name,type,layout,...extra});
const target=(x,y,require,label)=>({x,y,require,label});

export const CAMPAIGN = [
  {id:'moss-gate',chapter:1,name:'Moss Gate',subtitle:'The Woods Remember',accent:'#7fd37f',theme:0,rune:'VERDANT',tool:'thorn-shears',relic:'MOSS COMPASS',region:'Bosque Umbral',worldRoom:'moss-gate-world',
   intro:['ACT I · Veyra está perdiendo sus nombres. Edda te pide recuperar la primera runa antes de que Bellwether olvide cómo volver a casa.','Moss Gate guarda el origen de la plaga de olvido.'],epilogue:['La savia vuelve a las raíces. Una memoria muestra a Oran frente al Gran Archivo.','EDDA · «El Regente Null tuvo un nombre antes de convertirse en silencio».'],
   rooms:[
    room('Rootpath','arena','grove',{enter:['Las raíces han crecido sobre nombres tallados en piedra.'],enemies:[['mossling',184,52],['mossling',220,102],['thornbat',210,58]]}),
    room('Forgotten Court','puzzle','ruins',{puzzleLabel:'STONE GLYPHS',switches:[[104,42],[146,112]],enemies:[['thornbat',188,48],['rootguard',216,84]],reward:{id:'moss-heart',type:'heart',optional:true,label:'HEART FRAGMENT'}}),
    room('Barkmaw Hollow','miniboss','thorns',{enter:['Barkmaw ha tragado la llave interior.'],enemies:[['barkmaw',194,76,16]],reward:{id:'key-moss',type:'key',label:'MOSS KEY'}}),
    room('Shear Vault','treasure','shrine',{npc:{kind:'keeper',name:'SILE',x:104,y:74},enter:['SILE · «Corta solo lo que impide crecer».'],enemies:[['rootguard',184,54],['mossling',218,106]],reward:{id:'tool-thorn',type:'tool',tool:'thorn-shears',label:'THORN SHEARS'}}),
    room('Briar Gallery','tool','thorns',{puzzleLabel:'BRIAR LOCKS',toolTargets:[target(108,44,'thorn-shears','BRIAR'),target(146,110,'thorn-shears','BRIAR')],enemies:[['thornbat',190,54],['rootguard',220,92]]}),
    room('Keeper Niche','arena','shrine',{enemies:[['mossling',180,50],['rootguard',218,100]],reward:{id:'relic-moss',type:'relic',optional:true,label:'MOSS COMPASS'}}),
    room('Bramble Heart','boss','boss',{boss:['bramble',194,74,36],enter:['GUARDIAN · BRAMBLE HEART']})
   ]},
  {id:'sunken-forge',chapter:2,name:'Sunken Forge',subtitle:'Iron Under Water',accent:'#f1a85b',theme:1,rune:'EMBER',tool:'ember-grapple',relic:'FORGE LANTERN',region:'Forja Sumergida',worldRoom:'sunken-forge-world',
   intro:['ACT I · Thorn Shears abre el acueducto sepultado. Bajo Bellwether, una forja sigue obedeciendo órdenes de hace cien años.','Ember puede fundir el segundo sello del Archivo.'],epilogue:['El horno se apaga. En el metal queda grabado: «Oran, no rompas el Archivo».'],
   rooms:[
    room('Flooded Intake','arena','canals',{enemies:[['emberling',184,54],['cinderwisp',218,94],['forgeguard',212,52]]}),
    room('Chain Foundry','puzzle','foundry',{puzzleLabel:'PRESSURE VALVES',switches:[[104,38],[145,114]],enemies:[['forgeguard',186,56],['emberling',216,82]],reward:{id:'forge-heart',type:'heart',optional:true,label:'HEART FRAGMENT'}}),
    room('Magma Ox','miniboss','furnace',{enemies:[['magmaox',194,76,24]],reward:{id:'key-forge',type:'key',label:'EMBER KEY'}}),
    room('Grapple Cradle','treasure','forge',{npc:{kind:'smith',name:'ORRIN',x:104,y:72},enemies:[['cinderwisp',180,54],['forgeguard',218,106]],reward:{id:'tool-grapple',type:'tool',tool:'ember-grapple',label:'EMBER GRAPPLE'}}),
    room('Broken Span','tool','foundry',{puzzleLabel:'GRAPPLE RINGS',toolTargets:[target(108,40,'ember-grapple','RING'),target(148,110,'ember-grapple','RING')],enemies:[['emberling',190,54],['cinderwisp',220,92]]}),
    room('Lantern Vault','arena','forge',{enemies:[['forgeguard',180,54],['cinderwisp',218,104]],reward:{id:'relic-forge',type:'relic',optional:true,label:'FORGE LANTERN'}}),
    room('Forge Keeper','boss','boss',{boss:['forge',194,74,54],enter:['GUARDIAN · FORGE KEEPER']})
   ]},
  {id:'tideglass',chapter:3,name:'Tideglass Grotto',subtitle:'The Sea Keeps Copies',accent:'#5fc6d6',theme:2,rune:'TIDE',tool:'tide-mantle',relic:'ABYSSAL PEARL',region:'Gruta de Cristal',worldRoom:'tideglass-world',
   intro:['ACT II · El mundo se abre hacia Glasswater. Bajo la costa, una gruta de cristal guarda recuerdos que el mar devuelve deformados.','Tide permitirá atravesar las corrientes que bloquean el norte.'],epilogue:['La marea retrocede y deja un nombre escrito en sal: EDDA. Ella también formó parte del Archivo.'],
   rooms:[
    room('Tidal Mouth','arena','shore',{enemies:[['brinecrawler',184,98],['lanternjelly',216,54],['tideguard',210,104]]}),
    room('Sluice Choir','puzzle','tide',{puzzleLabel:'TIDE PLATES',switches:[[104,42],[146,112]],enemies:[['lanternjelly',188,50],['brinecrawler',218,98]],reward:{id:'tide-heart',type:'heart',optional:true,label:'HEART FRAGMENT'}}),
    room('Kelp Maw','miniboss','deep',{enemies:[['kelpmaw',194,76,32]],reward:{id:'key-tide',type:'key',label:'TIDE KEY'}}),
    room('Mantle Well','treasure','tide',{npc:{kind:'tide',name:'NERI',x:104,y:72},enemies:[['tideguard',182,54],['lanternjelly',220,102]],reward:{id:'tool-tide',type:'tool',tool:'tide-mantle',label:'TIDE MANTLE'}}),
    room('Deep Channel','tool','deep',{puzzleLabel:'CURRENT SEALS',toolTargets:[target(108,44,'tide-mantle','CURRENT'),target(148,108,'tide-mantle','CURRENT')],enemies:[['brinecrawler',188,54],['tideguard',220,96]]}),
    room('Pearl Ossuary','arena','vault',{enemies:[['lanternjelly',178,52],['tideguard',218,106]],reward:{id:'relic-tide',type:'relic',optional:true,label:'ABYSSAL PEARL'}}),
    room('Abyss Ray','boss','boss',{boss:['abyssray',194,74,78],enter:['GUARDIAN · ABYSS RAY']})
   ]},
  {id:'clockwood',chapter:4,name:'Clockwood',subtitle:'Every Branch Ticks',accent:'#e3d26f',theme:3,rune:'ECHO',tool:'echo-bell',relic:'COPPER BELL',region:'Bosque Reloj',worldRoom:'clockwood-world',
   intro:['ACT II · Tide Mantle abre el paso por Deep Channel. Clockwood repite el último día de Veyra una y otra vez.','Echo puede mostrar lo que ocurrió realmente en el Gran Archivo.'],epilogue:['Ves a Oran romper las runas porque el Archivo estaba devorando los recuerdos de los muertos.'],
   rooms:[
    room('Ticking Grove','arena','clock',{enemies:[['gearling',184,54],['tickwisp',218,94],['clockguard',210,52]]}),
    room('Second Hand Trail','puzzle','gears',{puzzleLabel:'TIME PLATES',switches:[[106,42],[146,116]],enemies:[['tickwisp',174,52],['clockguard',214,88]],reward:{id:'echo-heart',type:'heart',optional:true,label:'HEART FRAGMENT'}}),
    room('Copper Owl','miniboss','belltower',{enemies:[['copperowl',194,74,40]],reward:{id:'key-clock',type:'key',label:'ECHO KEY'}}),
    room('Echo Chamber','treasure','pillars',{npc:{kind:'scribe',name:'MIRA',x:106,y:74},enemies:[['gearling',184,54],['clockguard',218,104]],reward:{id:'tool-echo',type:'tool',tool:'echo-bell',label:'ECHO BELL'}}),
    room('Silent Orchard','tool','clock',{puzzleLabel:'ECHO SIGILS',toolTargets:[target(108,42,'echo-bell','SIGIL'),target(146,110,'echo-bell','SIGIL')],enemies:[['tickwisp',188,54],['gearling',220,100]]}),
    room('Bell Archive','arena','pillars',{enemies:[['clockguard',178,54],['tickwisp',218,104]],reward:{id:'relic-clock',type:'relic',optional:true,label:'COPPER BELL'}}),
    room('Clock Stag','boss','boss',{boss:['stag',194,74,92],enter:['GUARDIAN · CLOCK STAG']})
   ]},
  {id:'obsidian-keep',chapter:5,name:'Obsidian Keep',subtitle:'Glass Has Teeth',accent:'#b88aff',theme:4,rune:'PRISM',tool:'prism-lens',relic:'MIRROR SEAL',region:'Fortaleza Espejo',worldRoom:'obsidian-world',
   intro:['ACT III · Echo revela la fortaleza que solo existe cuando alguien recuerda mirarla.','Obsidian Keep copió recuerdos antes de archivarlos. Ahora intenta copiarte a ti.'],epilogue:['El espejo central refleja a un niño frente a Edda: tú, antes de que ella borrara tu nombre para esconderte del Archivo.'],
   rooms:[
    room('Black Gallery','arena','keep',{enemies:[['shardling',184,54],['mirrorshade',218,94],['obsidianguard',210,52]]}),
    room('Mirror Hall','puzzle','mirror',{puzzleLabel:'PRISM SEALS',switches:[[106,38],[146,114]],enemies:[['mirrorshade',178,52],['shardling',218,104]],reward:{id:'prism-heart',type:'heart',optional:true,label:'HEART FRAGMENT'}}),
    room('Glass Knight','miniboss','gallery',{enemies:[['glassknight',194,74,48]],reward:{id:'key-prism',type:'key',label:'PRISM KEY'}}),
    room('Lens Vault','treasure','vault',{npc:{kind:'archive',name:'EDDA ECHO',x:104,y:72},enemies:[['obsidianguard',184,54],['shardling',218,104]],reward:{id:'tool-prism',type:'tool',tool:'prism-lens',label:'PRISM LENS'}}),
    room('False Door','tool','mirror',{puzzleLabel:'HIDDEN SEALS',toolTargets:[target(108,42,'prism-lens','SEAL'),target(148,110,'prism-lens','SEAL')],enemies:[['mirrorshade',190,54],['obsidianguard',220,98]]}),
    room('Seal Reliquary','arena','vault',{enemies:[['shardling',180,54],['obsidianguard',218,104]],reward:{id:'relic-prism',type:'relic',optional:true,label:'MIRROR SEAL'}}),
    room('Obsidian Warden','boss','boss',{boss:['warden',194,74,108],enter:['GUARDIAN · OBSIDIAN WARDEN']})
   ]},
  {id:'starfall',chapter:6,name:'Starfall Sanctum',subtitle:'Above the Remembered Sky',accent:'#8fb7ff',theme:5,rune:'AETHER',tool:'sky-anchor',relic:'STAR COMPASS',region:'Santuario Celeste',worldRoom:'starfall-world',
   intro:['ACT III · Prism revela una escalera tallada en luz. Arriba, el cielo de Veyra conserva fragmentos que nunca tocaron el Archivo.','Aether es la última runa necesaria para fijar el camino al Null.'],epilogue:['El Santuario señala hacia abajo, no hacia las estrellas. El Null Archive está bajo Lantern House, donde empezó todo.'],
   rooms:[
    room('Wind Stair','arena','peak',{enemies:[['screeimp',184,54],['galeeye',218,94],['peakguard',210,52]]}),
    room('Sky Dials','puzzle','sanctum',{puzzleLabel:'WIND DIALS',switches:[[106,42],[146,112]],enemies:[['galeeye',178,52],['screeimp',218,104]],reward:{id:'aether-heart',type:'heart',optional:true,label:'HEART FRAGMENT'}}),
    room('Rocling','miniboss','peak',{enemies:[['rocling',194,74,56]],reward:{id:'key-aether',type:'key',label:'AETHER KEY'}}),
    room('Anchor Cradle','treasure','sanctum',{npc:{kind:'climber',name:'TAMAS',x:104,y:72},enemies:[['peakguard',184,54],['galeeye',218,104]],reward:{id:'tool-anchor',type:'tool',tool:'sky-anchor',label:'SKY ANCHOR'}}),
    room('Chasm Gallery','tool','peak',{puzzleLabel:'WIND ANCHORS',toolTargets:[target(108,42,'sky-anchor','ANCHOR'),target(148,110,'sky-anchor','ANCHOR')],enemies:[['screeimp',188,54],['peakguard',220,98]]}),
    room('Star Reliquary','arena','sanctum',{enemies:[['galeeye',180,54],['peakguard',218,104]],reward:{id:'relic-star',type:'relic',optional:true,label:'STAR COMPASS'}}),
    room('Astral Ram','boss','boss',{boss:['astralram',194,74,124],enter:['GUARDIAN · ASTRAL RAM']})
   ]},
  {id:'null-archive',chapter:7,name:'Null Archive',subtitle:'The Name Returns',accent:'#df718a',theme:6,rune:'NULL',tool:null,relic:'NAME SEED',region:'Último Archivo',worldRoom:'null-archive-world',final:true,
   intro:['FINAL · Las seis runas abren el Null Archive. Edda confiesa la verdad: borró tu nombre para impedir que el Archivo te convirtiera en una memoria obediente.','Oran destruyó el sistema para liberar a los muertos, pero el vacío de millones de recuerdos lo convirtió en el Regente Null.','No vienes a restaurar el viejo Archivo. Vienes a decidir qué merece existir después de él.'],
   epilogue:['Oran cae y por primera vez recuerda su propio nombre.','EDDA · «No reconstruyas mi prisión. Construye una puerta».'],
   rooms:[
    room('Nameless Threshold','arena','null',{enemies:[['nullmote',184,54],['voidwisp',218,94],['nullguard',210,52]]}),
    room('Catalog of Doors','puzzle','archive',{puzzleLabel:'NULL INDEX',switches:[[106,42],[146,112]],enemies:[['voidwisp',178,52],['nullguard',218,104]]}),
    room('Forgotten Scribe','miniboss','null',{enemies:[['nameless',194,74,66]],reward:{id:'key-null',type:'key',label:'NULL KEY'}}),
    room('Six Locks','tool','archive',{puzzleLabel:'TOOLS OF VEYRA',toolTargets:[target(96,42,'thorn-shears','ROOT'),target(132,42,'ember-grapple','IRON'),target(168,42,'tide-mantle','TIDE'),target(96,108,'echo-bell','ECHO'),target(132,108,'prism-lens','PRISM'),target(168,108,'sky-anchor','AETHER')],enemies:[['nullmote',214,74]]}),
    room('Memory Spindle','puzzle','void',{puzzleLabel:'MEMORY AXIS',switches:[[108,42],[146,110]],enemies:[['voidwisp',184,54],['nullguard',218,102]],reward:{id:'null-heart',type:'heart',optional:true,label:'HEART FRAGMENT'}}),
    room('Quiet Index','arena','archive',{npc:{kind:'archive',name:'ORAN',x:104,y:72},enemies:[['nullguard',184,54],['voidwisp',218,104]],reward:{id:'relic-null',type:'relic',optional:true,label:'NAME SEED'}}),
    room('Hall of Unwritten Names','arena','null',{enemies:[['nullmote',176,54],['voidwisp',218,52],['nullguard',208,108],['archiveecho',190,92]]}),
    room('Regent Antechamber','puzzle','void',{puzzleLabel:'CHOICE SEALS',switches:[[106,40],[148,112]],enemies:[['archiveecho',184,54],['inkmote',218,102]]}),
    room('Null Regent','boss','boss',{boss:['regent',194,74,156],enter:['FINAL GUARDIAN · ORAN, THE NULL REGENT']})
   ]}
];

export const QUESTS = [
  {id:'names-in-bark',npc:'sile',name:'Names in Bark',start:['SILE · «Encuentra tres Memory Seeds. Quiero saber si el bosque aún recuerda a sus muertos».'],reminder:['SILE · «Tres semillas. Una en el prado, otra bajo Foxglove y otra tras las zarzas».'],complete:['SILE · «Sí. Siguen aquí. Gracias por escuchar».'],condition:{type:'secretPrefix',prefix:'memory-seed-',count:3},reward:{type:'heart',amount:1,label:'HEART FRAGMENT'}},
  {id:'cold-iron',npc:'orrin',name:'Cold Iron',start:['ORRIN · «Derriba ocho criaturas de la forja. Necesito metal que haya dejado de obedecer».'],reminder:['ORRIN · «El hierro libre suena distinto al caer».'],complete:['ORRIN · «Ahora sí. Esto puede convertirse en herramienta, no en cadena».'],condition:{type:'killsKinds',kinds:['emberling','cinderwisp','forgeguard'],count:8},reward:{type:'shards',amount:24,label:'24 SHARDS'}},
  {id:'lantern-fish',npc:'neri',name:'Lantern Fish',start:['NERI · «En el Drowned Vault duerme una Tide Pearl. Tráela cuando puedas mirar a través del agua».'],reminder:['NERI · «No busques brillo. Busca una sombra que refleje luz».'],complete:['NERI · «La costa volverá a tener faro».'],condition:{type:'secret',id:'pearl-cache'},reward:{type:'heart',amount:1,label:'HEART FRAGMENT'}},
  {id:'second-bell',npc:'mira',name:'A Second Bell',start:['MIRA · «Haz sonar tres Echo Shrines del camino. Quiero comprobar si el tiempo aún puede responder».'],reminder:['MIRA · «Tres ecos. Agua, piedra y puente».'],complete:['MIRA · «Perfecto. El día ha avanzado un segundo».'],condition:{type:'secretPrefix',prefix:'echo-shrine-',count:3},reward:{type:'shards',amount:30,label:'30 SHARDS'}},
  {id:'sky-letters',npc:'tamas',name:'Sky Letters',start:['TAMAS · «Tres glyphs cayeron antes de que existiera el Archivo. Reúnelos y veremos qué dicen».'],reminder:['TAMAS · «Cristal, montaña y cadena. Ahí están las tres letras».'],complete:['TAMAS · «No dice una profecía. Dice: SUBE PORQUE QUIERES».'],condition:{type:'secretPrefix',prefix:'sky-glyph-',count:3},reward:{type:'shards',amount:36,label:'36 SHARDS'}},
  {id:'homecoming',npc:'edda',name:'Homecoming',start:['EDDA · «Si encuentras seis reliquias antiguas, tráelas. Quiero saber qué decidió guardar Veyra sin nosotros».'],reminder:['EDDA · «Las reliquias son recuerdos que nadie ordenó conservar».'],complete:['EDDA · «Esto es suficiente para un Archivo distinto: pequeño, imperfecto y voluntario».'],condition:{type:'relics',count:6},reward:{type:'upgrade',id:'archivist-heart',label:'ARCHIVIST HEART'}}
];

export const LORE = [
  {unlock:0,title:'The Last Archivist',text:'Edda conserva recuerdos en papel porque el Gran Archivo ya no distingue memoria de mandato.'},
  {unlock:1,title:'Oran',text:'El Regente Null fue Oran, custodio del Archivo y primero en descubrir que los muertos no podían ser olvidados.'},
  {unlock:2,title:'The Furnace Order',text:'La Forja Sumergida fabricó máquinas para copiar recuerdos. Continuaron trabajando después de que todos se marcharan.'},
  {unlock:3,title:'Sea Copies',text:'Glasswater devuelve recuerdos deformados. Algunas personas prefieren esas versiones porque duelen menos.'},
  {unlock:4,title:'The Repeating Day',text:'Clockwood quedó atrapado en el último día porque el Archivo intentó guardar un instante que debía terminar.'},
  {unlock:5,title:'The Hidden Child',text:'Edda borró tu nombre para que el Archivo no pudiera encontrarte. Sobreviviste, pero Veyra dejó de reconocerte.'},
  {unlock:6,title:'The Unwritten Sky',text:'Starfall conserva fenómenos que nunca fueron archivados. Demuestra que el mundo puede existir sin ser registrado.'},
  {unlock:7,title:'A Door, Not a Prison',text:'El nuevo Archivo no conservará todo. Solo aquello que alguien decida entregar, y siempre podrá ser retirado.'}
];

export const ACHIEVEMENTS = [
  {id:'first-blood',name:'FIRST MARK',desc:'Derrota a tu primer enemigo.'},{id:'rune-one',name:'FIRST RUNE',desc:'Recupera una runa.'},
  {id:'tool-one',name:'NEW WAY',desc:'Obtén tu primera herramienta.'},{id:'relic-one',name:'POCKET ARCHIVE',desc:'Encuentra una reliquia.'},
  {id:'hunter',name:'HUNTER 25',desc:'Derrota a 25 enemigos.'},{id:'hunter-75',name:'HUNTER 75',desc:'Derrota a 75 enemigos.'},
  {id:'secret-three',name:'CURIOUS',desc:'Encuentra 3 secretos del overworld.'},{id:'quest-one',name:'NEIGHBOR',desc:'Completa una side quest.'},
  {id:'all-tools',name:'OPEN WORLD',desc:'Consigue las 6 herramientas.'},{id:'all-runes',name:'SEVEN NAMES',desc:'Recupera las 7 runas.'},
  {id:'six-relics',name:'VOLUNTARY ARCHIVE',desc:'Recupera 6 reliquias.'},{id:'boss-clean',name:'CLEAN GUARDIAN',desc:'Vence a un guardián sin recibir daño.'},
  {id:'campaign',name:'THE NAME RETURNS',desc:'Llega a los créditos.'},{id:'archive',name:'TRUE ARCHIVIST',desc:'Termina con 6 reliquias y todas las side quests.'},
  {id:'ngplus',name:'SECOND TELLING',desc:'Comienza New Game+.'},{id:'worldwalker',name:'WORLD WALKER',desc:'Descubre 15 zonas del overworld.'},
  {id:'parry-ten',name:'GLASS NERVE',desc:'Realiza 10 parries perfectos.'},{id:'arsenal',name:'POCKET ARSENAL',desc:'Desbloquea 6 armas.'},{id:'rune-burst',name:'RUNE AWAKENED',desc:'Activa una habilidad de runa.'},{id:'charged',name:'HELD BREATH',desc:'Golpea con un ataque cargado.'}
];

export const BESTIARY = [
  ['mossling','Mossling','Bosque Umbral','melee','Pequeño depredador vegetal que ataca en grupo.','♣'],['thornbat','Thornbat','Bosque Umbral','diver','Orbita al jugador y se lanza en picado cuando encuentra ángulo.','⌁'],['rootguard','Rootguard','Bosque Umbral','tank','Guardián lento de corteza endurecida.','♜'],['barkmaw','Barkmaw','Bosque Umbral','miniboss','Mandíbula vegetal que protege llaves del santuario.','♛'],['bramble','Bramble Heart','Bosque Umbral','guardian','Corazón de zarza conectado a todo Moss Gate.','♥'],
  ['emberling','Emberling','Forja Sumergida','charger','Ascua móvil que acumula calor y embiste en línea recta.','▲'],['cinderwisp','Cinderwisp','Forja Sumergida','ranged','Dispara escoria ardiente desde lejos.','✦'],['forgeguard','Forgeguard','Forja Sumergida','tank','Autómata pesado que aún obedece órdenes antiguas.','▣'],['magmaox','Magma Ox','Forja Sumergida','miniboss','Bestia de hierro fundido y embestida brutal.','♞'],['forge','Forge Keeper','Forja Sumergida','guardian','Núcleo del horno convertido en centinela.','♜'],
  ['brinecrawler','Brinecrawler','Gruta de Cristal','ambush','Crustáceo de sal que espera a media distancia y embiste de golpe.','≋'],['lanternjelly','Lantern Jelly','Gruta de Cristal','ranged','Medusa que lanza pulsos de luz fría.','☼'],['tideguard','Tideguard','Gruta de Cristal','tank','Armadura coralina que avanza con la marea.','♜'],['kelpmaw','Kelp Maw','Gruta de Cristal','miniboss','Nudo de algas con dientes de concha.','♛'],['abyssray','Abyss Ray','Gruta de Cristal','guardian','Raya espectral que curva proyectiles con la corriente.','≈'],
  ['gearling','Gearling','Clockwood','ricochet','Engranaje vivo que acelera en diagonales y rebota entre rutas.','⚙'],['tickwisp','Tickwisp','Clockwood','ranged','Fragmento de segundo convertido en proyectil.','◷'],['clockguard','Clockguard','Clockwood','tank','Centinela cuya armadura marca el tiempo.','♜'],['copperowl','Copper Owl','Clockwood','miniboss','Búho mecánico que dispara en abanico.','◉'],['stag','Clock Stag','Clockwood','guardian','Ciervo de cobre atrapado en un ciclo eterno.','♞'],
  ['shardling','Shardling','Fortaleza Espejo','mimic','Fragmento de espejo que imita tu dirección antes de atacar.','◆'],['mirrorshade','Mirror Shade','Fortaleza Espejo','teleporter','Reflejo tardío que cambia de posición antes de disparar.','◇'],['obsidianguard','Obsidian Guard','Fortaleza Espejo','tank','Armadura negra hecha para custodiar copias.','♜'],['glassknight','Glass Knight','Fortaleza Espejo','miniboss','Caballero transparente que anticipa golpes.','♝'],['warden','Obsidian Warden','Fortaleza Espejo','guardian','Juez del archivo de copias.','♛'],
  ['screeimp','Scree Imp','Santuario Celeste','hopper','Criatura de grava que avanza mediante saltos cortos y bruscos.','▲'],['galeeye','Gale Eye','Santuario Celeste','wind','Ojo suspendido que alterna ráfagas dirigidas con tiros cruzados.','◉'],['peakguard','Peak Guard','Santuario Celeste','tank','Estatua de altura alimentada por viento.','♜'],['rocling','Rocling','Santuario Celeste','miniboss','Ave pétrea que ataca desde el borde del vacío.','♞'],['astralram','Astral Ram','Santuario Celeste','guardian','Carnero estelar que rompe plataformas con ondas.','✶'],
  ['nullmote','Null Mote','Último Archivo','swarm','Vacío pequeño que zigzaguea en enjambre y devora etiquetas.','•'],['voidwisp','Void Wisp','Último Archivo','ranged','Sombra que dispara recuerdos sin dueño.','✹'],['nullguard','Null Guard','Último Archivo','tank','Custodio del silencio de Oran.','♜'],['archiveecho','Archive Echo','Último Archivo','echo','Copia incompleta que predice tu dirección y corta el paso.','◌'],['inkmote','Ink Mote','Último Archivo','mines','Gota de tinta que deja manchas peligrosas y dispara desde lejos.','✦'],['nameless','Forgotten Scribe','Último Archivo','miniboss','Escriba que olvidó qué estaba protegiendo.','♝'],['regent','Null Regent','Último Archivo','final','Oran, partido entre liberar recuerdos y destruirlos.','♚']
].map(([id,name,region,rank,desc,glyph])=>({id,name,region,rank,desc,glyph}));
