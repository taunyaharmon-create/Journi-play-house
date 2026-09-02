
const CopyBooBooEngine = {
  IsGameActive:false,
  CurrentStepIndex:0,
  TimelineTimerId:null,
  BeatTimerId:null,
  RewardGranted:false,
  Scene:null,
  BeatAudioContext:null,

  DanceRoutineTimeline:[
    {key:'clap',symbol:'👏',duration:4000},
    {key:'stomp',symbol:'👣',duration:4000},
    {key:'turn',symbol:'🔄',duration:4000},
    {key:'shake',symbol:'💃🏽',duration:4000},
    {key:'freeze',symbol:'🛑',duration:3000}
  ],

  StartCopyBooBooGame(){
    this.EndCopyBooBooGame();
    this.IsGameActive=true;
    this.CurrentStepIndex=0;
    this.RewardGranted=false;

    const scene=document.getElementById('activityScene');
    const prog=document.getElementById('activityProgress');
    if(!scene)return;
    this.Scene=scene;

    scene.innerHTML='';
    scene.style.position='relative';
    scene.style.display='flex';
    scene.style.flexDirection='column';
    scene.style.alignItems='center';
    scene.style.justifyContent='center';
    scene.style.minHeight='500px';
    scene.style.overflow='hidden';
    scene.style.touchAction='manipulation';
    scene.style.background='linear-gradient(#dcf8ff,#f2e7ff 58%,#dff1ce)';

    if(prog) prog.textContent='🤍'.repeat(this.DanceRoutineTimeline.length);

    const cue=document.createElement('div');
    cue.id='copy_booboo_cue_node';
    cue.style.width='220px';
    cue.style.height='220px';
    cue.style.borderRadius='50%';
    cue.style.background='radial-gradient(circle,#fff 8%,#ffd9ed 58%,#dcb8ff 100%)';
    cue.style.border='8px solid white';
    cue.style.boxShadow='0 12px 28px rgba(0,0,0,.16)';
    cue.style.display='flex';
    cue.style.alignItems='center';
    cue.style.justifyContent='center';
    cue.style.fontSize='112px';
    cue.style.pointerEvents='none';
    cue.style.zIndex='20';
    scene.appendChild(cue);

    const done=document.createElement('button');
    done.id='copy_booboo_done_smash_btn';
    done.type='button';
    done.className='activity-choice';
    done.textContent='⭐';
    done.setAttribute('aria-label','done');
    done.style.display='none';
    done.style.width='160px';
    done.style.height='116px';
    done.style.marginTop='30px';
    done.style.borderRadius='36px';
    done.style.fontSize='68px';
    done.style.alignItems='center';
    done.style.justifyContent='center';
    done.style.touchAction='manipulation';
    done.onpointerdown=e=>{
      e.preventDefault();
      this.OnJourniSmashDoneButton();
    };
    scene.appendChild(done);

    // Existing Boo-Boo "Copy Boo-Boo" recording.
    playBooBoo('copyBooBoo');

    this.InitializeBackgroundSynthBeat();
    this.ProcessActiveTimelineStep();
  },

  InitializeBackgroundSynthBeat(){
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      this.BeatAudioContext=this.BeatAudioContext||new AC();

      const hit=()=>{
        if(!this.IsGameActive || !this.BeatAudioContext)return;
        const ctx=this.BeatAudioContext;
        const osc=ctx.createOscillator();
        const gain=ctx.createGain();
        osc.type='sine';
        osc.frequency.value=105;
        gain.gain.setValueAtTime(.03,ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.11);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime+.12);
      };

      hit();
      this.BeatTimerId=setInterval(hit,700);
    }catch(_){}
  },

  ProcessActiveTimelineStep(){
    if(!this.IsGameActive)return;

    if(this.CurrentStepIndex>=this.DanceRoutineTimeline.length){
      this.RevealFinalDoneSmashButton();
      return;
    }

    const step=this.DanceRoutineTimeline[this.CurrentStepIndex];
    const cue=document.getElementById('copy_booboo_cue_node');
    if(cue){
      cue.textContent=step.symbol;
      this.AnimateIconPopEffect(cue);
    }

    const prog=document.getElementById('activityProgress');
    if(prog){
      prog.textContent='💗'.repeat(this.CurrentStepIndex+1)+
        '🤍'.repeat(Math.max(0,this.DanceRoutineTimeline.length-this.CurrentStepIndex-1));
    }

    this.TimelineTimerId=setTimeout(()=>{
      this.CurrentStepIndex++;
      this.ProcessActiveTimelineStep();
    },step.duration);
  },

  AnimateIconPopEffect(el){
    el.animate(
      [
        {transform:'scale(.35) rotate(-14deg)',opacity:.25},
        {transform:'scale(1.12) rotate(3deg)',opacity:1},
        {transform:'scale(1) rotate(0deg)',opacity:1}
      ],
      {duration:460,easing:'cubic-bezier(.175,.885,.32,1.275)'}
    );
  },

  RevealFinalDoneSmashButton(){
    if(this.TimelineTimerId){
      clearTimeout(this.TimelineTimerId);
      this.TimelineTimerId=null;
    }

    const cue=document.getElementById('copy_booboo_cue_node');
    if(cue){
      cue.textContent='⭐';
      this.AnimateIconPopEffect(cue);
    }

    const done=document.getElementById('copy_booboo_done_smash_btn');
    if(done){
      done.style.display='flex';
      this.AnimateIconPopEffect(done);
    }
  },

  OnJourniSmashDoneButton(){
    if(!this.IsGameActive || this.RewardGranted)return;
    this.RewardGranted=true;

    const done=document.getElementById('copy_booboo_done_smash_btn');
    if(done) done.style.display='none';

    queueBooBoo('goodJobJourni');
    this.TriggerMagicalGemExplosion();
    awardLoveHearts(3);

    const cue=document.getElementById('copy_booboo_cue_node');
    if(cue) cue.textContent='👑💗';
  },

  TriggerMagicalGemExplosion(){
    if(!this.Scene)return;

    for(let i=0;i<15;i++){
      const gem=document.createElement('div');
      gem.textContent=i%3===0?'💎':'👑';
      gem.style.position='absolute';
      gem.style.left='50%';
      gem.style.top='43%';
      gem.style.fontSize='34px';
      gem.style.zIndex='60';
      gem.style.pointerEvents='none';
      this.Scene.appendChild(gem);

      const a=Math.random()*Math.PI*2;
      const r=120+Math.random()*150;
      gem.animate(
        [
          {transform:'translate(-50%,-50%) scale(.7)',opacity:1},
          {
            transform:`translate(calc(-50% + ${Math.cos(a)*r}px),calc(-50% + ${Math.sin(a)*r}px)) scale(0) rotate(${Math.random()*360}deg)`,
            opacity:0
          }
        ],
        {duration:900,easing:'cubic-bezier(.1,.8,.25,1)'}
      );
      setTimeout(()=>gem.remove(),940);
    }
  },

  EndCopyBooBooGame(){
    this.IsGameActive=false;

    if(this.TimelineTimerId){
      clearTimeout(this.TimelineTimerId);
      this.TimelineTimerId=null;
    }

    if(this.BeatTimerId){
      clearInterval(this.BeatTimerId);
      this.BeatTimerId=null;
    }

    this.CurrentStepIndex=0;
    this.Scene=null;
  }
};
