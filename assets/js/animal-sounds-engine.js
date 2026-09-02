
const AnimalSoundsEngine = {
  IsGameActive:false,
  CurrentTargetAnimal:null,
  ActiveOptions:[],
  CorrectRounds:0,
  TargetRounds:5,
  RewardGranted:false,
  Scene:null,
  PromptTimer:null,
  AudioCtx:null,

  AnimalRoster:{
    puppy:{symbol:'🐶',name:'Puppy'},
    bunny:{symbol:'🐰',name:'Bunny'},
    cow:{symbol:'🐮',name:'Cow'},
    duck:{symbol:'🦆',name:'Duck'},
    pig:{symbol:'🐷',name:'Pig'},
    lion:{symbol:'🦁',name:'Lion'}
  },

  StartAnimalSoundsGame(){
    this.ClearQuizElements();
    this.IsGameActive=true;
    this.CorrectRounds=0;
    this.RewardGranted=false;

    const scene=document.getElementById('activityScene');
    const prog=document.getElementById('activityProgress');
    if(!scene)return;
    this.Scene=scene;

    scene.innerHTML='';
    scene.style.position='relative';
    scene.style.display='block';
    scene.style.minHeight='500px';
    scene.style.overflow='hidden';
    scene.style.touchAction='manipulation';
    scene.style.background='linear-gradient(#e4f8ff,#f4e8ff 55%,#e4f3d6)';

    if(prog) prog.textContent='🤍'.repeat(this.TargetRounds);

    const speaker=document.createElement('button');
    speaker.type='button';
    speaker.id='animal_sound_replay_btn';
    speaker.className='activity-choice';
    speaker.textContent='🔊';
    speaker.style.position='absolute';
    speaker.style.left='50%';
    speaker.style.top='28px';
    speaker.style.transform='translateX(-50%)';
    speaker.style.width='112px';
    speaker.style.height='92px';
    speaker.style.fontSize='56px';
    speaker.style.borderRadius='30px';
    speaker.style.zIndex='20';
    speaker.style.touchAction='manipulation';
    speaker.onpointerdown=e=>{
      e.preventDefault();
      this.PlayTargetSound();
    };
    scene.appendChild(speaker);

    const grid=document.createElement('div');
    grid.id='animal_sounds_grid_layer';
    grid.style.position='absolute';
    grid.style.left='5%';
    grid.style.right='5%';
    grid.style.top='155px';
    grid.style.bottom='25px';
    grid.style.display='grid';
    grid.style.gridTemplateColumns='repeat(3,1fr)';
    grid.style.gap='14px';
    grid.style.alignItems='center';
    scene.appendChild(grid);

    playBooBoo('animalSounds');
    this.StartNextRound(true);
  },

  StartNextRound(first=false){
    if(!this.IsGameActive)return;

    const keys=Object.keys(this.AnimalRoster);
    let available=keys;
    if(this.CurrentTargetAnimal){
      available=keys.filter(k=>k!==this.CurrentTargetAnimal.id);
    }
    const key=available[Math.floor(Math.random()*available.length)];
    this.CurrentTargetAnimal={id:key,...this.AnimalRoster[key]};

    this.RenderQuizCardGrid();

    if(this.PromptTimer) clearTimeout(this.PromptTimer);
    this.PromptTimer=setTimeout(()=>{
      if(this.IsGameActive) this.PlayTargetSound();
    }, first ? 1600 : 650);
  },

  RenderQuizCardGrid(){
    const grid=document.getElementById('animal_sounds_grid_layer');
    if(!grid || !this.CurrentTargetAnimal)return;

    grid.innerHTML='';
    this.ActiveOptions=[this.CurrentTargetAnimal];

    const wrong=Object.keys(this.AnimalRoster)
      .filter(k=>k!==this.CurrentTargetAnimal.id);
    this.ShuffleArray(wrong);

    this.ActiveOptions.push(
      {id:wrong[0],...this.AnimalRoster[wrong[0]]},
      {id:wrong[1],...this.AnimalRoster[wrong[1]]}
    );
    this.ShuffleArray(this.ActiveOptions);

    this.ActiveOptions.forEach(animal=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='activity-choice';
      card.dataset.animalId=animal.id;
      card.textContent=animal.symbol;
      card.style.width='100%';
      card.style.minHeight='170px';
      card.style.fontSize='82px';
      card.style.borderRadius='34px';
      card.style.touchAction='manipulation';
      card.style.background='rgba(255,255,255,.82)';
      card.style.border='6px solid white';
      card.style.boxShadow='0 8px 20px rgba(0,0,0,.12)';
      card.onpointerdown=e=>{
        e.preventDefault();
        this.EvaluateUserSelection(animal.id,card);
      };
      grid.appendChild(card);
    });
  },

  EvaluateUserSelection(selectedId,card){
    if(!this.IsGameActive || !this.CurrentTargetAnimal)return;

    if(selectedId===this.CurrentTargetAnimal.id){
      card.style.pointerEvents='none';
      card.animate(
        [
          {transform:'scale(1)'},
          {transform:'scale(1.16) rotate(4deg)'},
          {transform:'scale(1) rotate(0deg)'}
        ],
        {duration:360,easing:'cubic-bezier(.175,.885,.32,1.275)'}
      );

      pop('✨');
      queueBooBoo('correctAnimal');
      this.CorrectRounds++;

      const prog=document.getElementById('activityProgress');
      if(prog){
        prog.textContent='💗'.repeat(this.CorrectRounds)+
          '🤍'.repeat(Math.max(0,this.TargetRounds-this.CorrectRounds));
      }

      if(this.CorrectRounds>=this.TargetRounds){
        this.CompleteGame();
      }else{
        const grid=document.getElementById('animal_sounds_grid_layer');
        if(grid) grid.style.pointerEvents='none';
        setTimeout(()=>{
          if(!this.IsGameActive)return;
          if(grid) grid.style.pointerEvents='auto';
          this.StartNextRound(false);
        },900);
      }
    }else{
      queueBooBoo('tryAnother');
      card.animate(
        [
          {transform:'translateX(0)'},
          {transform:'translateX(-8px)'},
          {transform:'translateX(8px)'},
          {transform:'translateX(0)'}
        ],
        {duration:260}
      );
    }
  },

  CompleteGame(){
    if(!this.IsGameActive)return;
    this.IsGameActive=false;
    if(this.PromptTimer){
      clearTimeout(this.PromptTimer);
      this.PromptTimer=null;
    }

    const grid=document.getElementById('animal_sounds_grid_layer');
    if(grid){
      grid.innerHTML='';
      const done=document.createElement('div');
      done.textContent='👑🐶🐰🐮🦆🐷🦁';
      done.style.gridColumn='1 / -1';
      done.style.textAlign='center';
      done.style.fontSize='48px';
      done.style.alignSelf='center';
      grid.appendChild(done);
    }

    if(!this.RewardGranted){
      this.RewardGranted=true;
      awardLoveHearts(2);
      queueBooBoo('animalsHappy');
      celebrate();
    }
  },

  // Lightweight local animal-like SFX so we don't depend on missing Audio_Assets files.
  PlayTargetSound(){
    if(!this.CurrentTargetAnimal)return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      this.AudioCtx=this.AudioCtx||new AC();
      const ctx=this.AudioCtx;
      if(ctx.state==='suspended') ctx.resume().catch(()=>{});

      const id=this.CurrentTargetAnimal.id;
      const now=ctx.currentTime;

      const tone=(freq,dur,type='sine',offset=0,vol=.08)=>{
        const osc=ctx.createOscillator();
        const g=ctx.createGain();
        osc.type=type;
        osc.frequency.setValueAtTime(freq,now+offset);
        g.gain.setValueAtTime(.0001,now+offset);
        g.gain.exponentialRampToValueAtTime(vol,now+offset+.02);
        g.gain.exponentialRampToValueAtTime(.0001,now+offset+dur);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(now+offset); osc.stop(now+offset+dur+.03);
      };

      if(id==='puppy'){
        tone(180,.12,'square',0,.055); tone(150,.13,'square',.18,.055);
      }else if(id==='bunny'){
        tone(650,.08,'sine',0,.04); tone(800,.07,'sine',.11,.035); tone(700,.06,'sine',.21,.03);
      }else if(id==='cow'){
        tone(105,.62,'sawtooth',0,.045); tone(88,.58,'sawtooth',.38,.04);
      }else if(id==='duck'){
        tone(260,.09,'square',0,.05); tone(220,.1,'square',.15,.05); tone(270,.09,'square',.31,.045);
      }else if(id==='pig'){
        tone(135,.08,'square',0,.045); tone(165,.07,'square',.11,.045); tone(120,.09,'square',.22,.04);
      }else if(id==='lion'){
        tone(72,.65,'sawtooth',0,.045); tone(58,.7,'sawtooth',.22,.04);
      }
    }catch(_){}
  },

  ShuffleArray(array){
    for(let i=array.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [array[i],array[j]]=[array[j],array[i]];
    }
    return array;
  },

  ClearQuizElements(){
    this.IsGameActive=false;
    if(this.PromptTimer){
      clearTimeout(this.PromptTimer);
      this.PromptTimer=null;
    }
    this.ActiveOptions=[];
    this.CurrentTargetAnimal=null;
    this.Scene=null;
  }
};
