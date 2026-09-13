const THEMES={
  home:[196,247,294,247,220,294,247,196],world:[196,220,247,294,247,220,174,196],forest:[196,247,294,330,294,247,220,196],forge:[147,196,220,147,247,220,196,165],tide:[174,220,262,330,262,220,196,174],clock:[220,277,330,370,330,277,247,220],mirror:[185,233,277,349,277,233,208,185],star:[247,330,392,494,440,392,330,294],null:[110,139,165,139,123,110,92,82],boss:[98,147,196,147,110,165,220,165],ending:[196,247,330,392,330,294,247,196]
};
export class PixelAudio{
  constructor(settings){this.settings=settings;this.ctx=null;this.timer=0;this.step=0;this.scene='home';}
  ensure(){if(!this.settings.sound)return null;if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();return this.ctx;}
  tone(freq,dur=.06,wave='square',gain=.08){const ctx=this.ensure();if(!ctx)return;const now=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();o.type=wave;o.frequency.setValueAtTime(freq,now);g.gain.setValueAtTime(Math.max(.0001,gain),now);g.gain.exponentialRampToValueAtTime(.0001,now+dur);o.connect(g).connect(ctx.destination);o.start(now);o.stop(now+dur);}
  play(type){if(!this.settings.sound||!this.settings.effects)return;const vol=Math.max(.001,(this.settings.fxVolume??.65)*.09);const map={slash:[620,.055,'square'],hit:[160,.07,'square'],hurt:[90,.16,'sawtooth'],block:[880,.05,'square'],shot:[260,.06,'square'],bossShot:[120,.08,'sawtooth'],enemyDown:[420,.08,'square'],bossDown:[110,.32,'square'],clear:[760,.15,'square'],door:[330,.12,'triangle'],room:[220,.06,'square'],tick:[520,.025,'square'],achievement:[980,.22,'square'],pause:[180,.05,'square'],resume:[360,.05,'square'],map:[700,.05,'triangle'],tool:[540,.12,'triangle'],secret:[1040,.24,'square'],talk:[410,.035,'square'],error:[120,.12,'sawtooth'],credits:[660,.18,'triangle']};const [f,d,w]=map[type]||[300,.05,'square'];this.tone(f,d,w,vol);}
  setScene(scene){const next=THEMES[scene]?scene:'world';if(this.scene===next&&this.timer)return;this.scene=next;this.restartMusic();}
  restartMusic(){this.stopMusic();if(!this.settings.sound||!this.settings.music)return;const ctx=this.ensure();if(!ctx)return;this.step=0;const tick=()=>{if(!this.settings.sound||!this.settings.music)return;const notes=THEMES[this.scene]||THEMES.world;const f=notes[this.step++%notes.length];const vol=Math.max(.001,(this.settings.musicVolume??.45)*.025);this.tone(f,.14,this.scene==='null'?'sawtooth':'triangle',vol);if(this.step%2===0)this.tone(f/2,.18,'square',vol*.45);};tick();this.timer=window.setInterval(tick,this.scene==='boss'?180:260);}
  stopMusic(){if(this.timer){clearInterval(this.timer);this.timer=0;}}
  refresh(){this.restartMusic();}
  destroy(){this.stopMusic();try{this.ctx?.close()}catch{}this.ctx=null;}
}
