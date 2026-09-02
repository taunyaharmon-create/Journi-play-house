
const BedtimeRoutineEngine = {
  IsActive:false,
  CurrentStep:'PickBaby',
  ActiveBaby:null,
  PajamaSkin:null,
  Scene:null,
  RewardGranted:false,
  NightLightOn:true,
  Timers:[],

  BabyRoster:{
    ella:{name:'Ella',image:'assets/images/babies/ella.webp'},
    emma:{name:'Emma',image:'assets/images/babies/emma.webp'},
    jhenea:{name:'Jheneá',image:'assets/images/babies/jhenea.webp'}
  },

  StepOrder:['Pajamas','StuffedFriends','Jewelry','ReadBook','Lights'],

  StartBedtimeRoutine(babyKey=null){
    this.EndBedtimeRoutine();
    this.IsActive=true;
    this.CurrentStep=babyKey?'Pajamas':'PickBaby';
    this.ActiveBaby=babyKey&&this.BabyRoster[babyKey]?babyKey:null;
    this.PajamaSkin=null;
    this.RewardGranted=false;
    this.NightLightOn=true;

    const scene=document.getElementById('activityScene');
    const prog=document.getElementById('activityProgress');
    if(!scene)return;
    this.Scene=scene;

    scene.innerHTML='';
    scene.style.position='relative';
    scene.style.display='block';
    scene.style.minHeight='520px';
    scene.style.overflow='hidden';
    scene.style.touchAction='none';
    scene.style.background='radial-gradient(circle at 50% 30%,#45456c 0%,#25253f 55%,#111122 100%)';

    if(prog)prog.textContent='🤍'.repeat(this.StepOrder.length);

    if(this.ActiveBaby){
      this.RenderStep();
      playBooBoo('pajamas');
    }else{
      this.RenderBabyPicker();
    }
  },

  RenderBabyPicker(){
    if(!this.Scene)return;
    this.Scene.innerHTML='';

    const moon=document.createElement('div');
    moon.textContent='🌙✨';
    moon.style.position='absolute';
    moon.style.top='24px';
    moon.style.left='50%';
    moon.style.transform='translateX(-50%)';
    moon.style.fontSize='64px';
    moon.style.pointerEvents='none';
    this.Scene.appendChild(moon);

    const row=document.createElement('div');
    row.style.position='absolute';
    row.style.left='4%';
    row.style.right='4%';
    row.style.top='135px';
    row.style.display='grid';
    row.style.gridTemplateColumns='repeat(3,1fr)';
    row.style.gap='12px';

    Object.entries(this.BabyRoster).forEach(([key,baby])=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='activity-choice';
      card.style.height='260px';
      card.style.padding='0';
      card.style.overflow='hidden';
      card.style.borderRadius='30px';
      card.style.touchAction='manipulation';
      const img=document.createElement('img');
      img.src=baby.image;
      img.alt=baby.name;
      img.style.width='100%';
      img.style.height='100%';
      img.style.objectFit='cover';
      img.style.display='block';
      img.style.pointerEvents='none';
      card.appendChild(img);
      card.onpointerdown=e=>{
        e.preventDefault();
        this.ActiveBaby=key;
        this.CurrentStep='Pajamas';
        playBooBoo('pajamas');
        this.RenderStep();
      };
      row.appendChild(card);
    });

    this.Scene.appendChild(row);
  },

  RenderStep(){
    if(!this.Scene||!this.ActiveBaby)return;
    this.Scene.innerHTML='';

    const light=document.createElement('button');
    light.type='button';
    light.id='night_light_toggle_btn';
    light.className='activity-choice';
    light.textContent=this.NightLightOn?'💡':'🌙';
    light.style.position='absolute';
    light.style.right='14px';
    light.style.top='14px';
    light.style.width='88px';
    light.style.height='70px';
    light.style.fontSize='40px';
    light.style.zIndex='50';
    light.style.touchAction='manipulation';
    light.onpointerdown=e=>{
      e.preventDefault();
      this.ToggleNightLightSwitch();
    };
    this.Scene.appendChild(light);

    const baby=this.BabyRoster[this.ActiveBaby];
    const frame=document.createElement('div');
    frame.id='bedtime_baby_frame';
    frame.style.position='absolute';
    frame.style.left='50%';
    frame.style.top='86px';
    frame.style.transform='translateX(-50%)';
    frame.style.width='245px';
    frame.style.height='285px';
    frame.style.borderRadius='42px';
    frame.style.border='7px solid rgba(255,255,255,.92)';
    frame.style.background='rgba(255,255,255,.12)';
    frame.style.boxShadow='0 10px 28px rgba(0,0,0,.28)';
    frame.style.overflow='hidden';

    const img=document.createElement('img');
    img.id='bedtime_baby_mesh';
    img.src=baby.image;
    img.alt=baby.name;
    img.style.width='100%';
    img.style.height='100%';
    img.style.objectFit='cover';
    img.style.display='block';
    img.style.transition='filter .25s ease,transform .25s ease';
    frame.appendChild(img);

    const deco=document.createElement('div');
    deco.id='bedtime_baby_decor';
    deco.style.position='absolute';
    deco.style.inset='0';
    deco.style.display='flex';
    deco.style.alignItems='flex-end';
    deco.style.justifyContent='center';
    deco.style.fontSize='62px';
    deco.style.paddingBottom='8px';
    deco.style.pointerEvents='none';
    deco.style.zIndex='4';
    frame.appendChild(deco);
    this.Scene.appendChild(frame);

    const stepIndex=Math.max(0,this.StepOrder.indexOf(this.CurrentStep));
    const prog=document.getElementById('activityProgress');
    if(prog){
      prog.textContent='💗'.repeat(stepIndex)+
        '🤍'.repeat(Math.max(0,this.StepOrder.length-stepIndex));
    }

    if(this.CurrentStep==='Pajamas') this.RenderPajamaTray();
    else if(this.CurrentStep==='StuffedFriends') this.RenderActionButton('🧸',()=>this.GiveStuffedFriend());
    else if(this.CurrentStep==='Jewelry') this.RenderActionButton('👑💎',()=>this.ApplyPrincessJewelry());
    else if(this.CurrentStep==='ReadBook') this.RenderActionButton('📖',()=>this.ReadBedtimeBook());
    else if(this.CurrentStep==='Lights') this.RenderActionButton('🌙',()=>this.FinishBedtime());
  },

  RenderPajamaTray(){
    const tray=document.createElement('div');
    tray.id='bedtime_pajama_selection_tray';
    tray.style.position='absolute';
    tray.style.left='50%';
    tray.style.bottom='34px';
    tray.style.transform='translateX(-50%)';
    tray.style.width='92%';
    tray.style.display='grid';
    tray.style.gridTemplateColumns='repeat(3,1fr)';
    tray.style.gap='12px';

    [
      ['pink_clouds','☁️','rgba(255,182,193,.9)'],
      ['green_stars','⭐','rgba(204,244,179,.9)'],
      ['blue_moons','🌙','rgba(182,224,255,.9)']
    ].forEach(([skin,symbol,bg])=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='activity-choice';
      btn.textContent=symbol;
      btn.style.height='105px';
      btn.style.fontSize='58px';
      btn.style.background=bg;
      btn.style.touchAction='manipulation';
      btn.onpointerdown=e=>{
        e.preventDefault();
        this.SelectPajamaSkin(skin,symbol,bg);
      };
      tray.appendChild(btn);
    });
    this.Scene.appendChild(tray);
  },

  SelectPajamaSkin(skin,symbol,bg){
    if(!this.IsActive||this.CurrentStep!=='Pajamas')return;
    this.PajamaSkin=skin;
    const decor=document.getElementById('bedtime_baby_decor');
    if(decor){
      decor.textContent=symbol+' 👘';
      decor.style.background=`linear-gradient(transparent 58%,${bg})`;
    }
    pop('✨');
    queueBooBoo('thereYouGo');
    this.Timers.push(setTimeout(()=>{
      if(!this.IsActive)return;
      this.CurrentStep='StuffedFriends';
      this.RenderStep();
    },650));
  },

  GiveStuffedFriend(){
    if(!this.IsActive||this.CurrentStep!=='StuffedFriends')return;
    const decor=document.getElementById('bedtime_baby_decor');
    if(decor)decor.textContent='🧸💗';
    queueBooBoo('affection');
    this.AdvanceAfter(600,'Jewelry');
  },

  ApplyPrincessJewelry(){
    if(!this.IsActive||this.CurrentStep!=='Jewelry')return;
    const decor=document.getElementById('bedtime_baby_decor');
    if(decor)decor.textContent='👑💎';
    pop('✨');
    queueBooBoo('thereYouGo');
    this.AdvanceAfter(650,'ReadBook');
  },

  ReadBedtimeBook(){
    if(!this.IsActive||this.CurrentStep!=='ReadBook')return;
    const decor=document.getElementById('bedtime_baby_decor');
    if(decor)decor.textContent='📖💗';
    queueBooBoo('bedtimeStory');
    this.AdvanceAfter(1100,'Lights');
  },

  FinishBedtime(){
    if(!this.IsActive||this.CurrentStep!=='Lights'||this.RewardGranted)return;
    this.NightLightOn=false;
    this.ToggleNightLightSwitch(false);

    const img=document.getElementById('bedtime_baby_mesh');
    if(img)img.style.filter='brightness(.58) saturate(.75)';
    const decor=document.getElementById('bedtime_baby_decor');
    if(decor)decor.textContent='🌙💤';

    const prog=document.getElementById('activityProgress');
    if(prog)prog.textContent='💗'.repeat(this.StepOrder.length);

    this.RewardGranted=true;
    awardLoveHearts(3);
    queueBooBoo('lightsOut');
    celebrate();
    pop('👑🌙💗');
  },

  AdvanceAfter(delay,next){
    const currentIndex=this.StepOrder.indexOf(this.CurrentStep)+1;
    const prog=document.getElementById('activityProgress');
    if(prog){
      prog.textContent='💗'.repeat(currentIndex)+
        '🤍'.repeat(Math.max(0,this.StepOrder.length-currentIndex));
    }
    this.Timers.push(setTimeout(()=>{
      if(!this.IsActive)return;
      this.CurrentStep=next;
      this.RenderStep();
    },delay));
  },

  RenderActionButton(symbol,handler){
    const btn=document.createElement('button');
    btn.type='button';
    btn.id='bedtime_task_action_btn';
    btn.className='activity-choice';
    btn.textContent=symbol;
    btn.style.position='absolute';
    btn.style.left='50%';
    btn.style.bottom='42px';
    btn.style.transform='translateX(-50%)';
    btn.style.width='190px';
    btn.style.height='115px';
    btn.style.fontSize='64px';
    btn.style.touchAction='manipulation';
    btn.onpointerdown=e=>{
      e.preventDefault();
      handler();
    };
    this.Scene.appendChild(btn);
  },

  ToggleNightLightSwitch(force){
    if(typeof force==='boolean')this.NightLightOn=force;
    else this.NightLightOn=!this.NightLightOn;

    const btn=document.getElementById('night_light_toggle_btn');
    if(btn)btn.textContent=this.NightLightOn?'💡':'🌙';

    if(this.Scene){
      this.Scene.style.background=this.NightLightOn
        ? 'radial-gradient(circle at 50% 30%,#45456c 0%,#25253f 55%,#111122 100%)'
        : 'radial-gradient(circle at 50% 30%,#24243d 0%,#151525 60%,#090914 100%)';
    }
  },

  EndBedtimeRoutine(){
    this.IsActive=false;
    this.Timers.forEach(t=>clearTimeout(t));
    this.Timers=[];
    this.Scene=null;
    this.ActiveBaby=null;
  }
};
