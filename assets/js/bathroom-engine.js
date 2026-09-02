
const BathroomEngine = {
  IsActive:false,
  CurrentRoutine:'Menu',
  PottyStepState:0,
  TeethBrushedCount:0,
  TargetTeethBrushes:5,
  HandwashStepState:0,
  BathProgressState:0,
  SelectedBaby:null,
  Scene:null,
  DragNode:null,
  DragPointerId:null,
  DragOffset:{x:0,y:0},
  RewardGranted:false,
  Timers:[],

  BabyRoster:{
    ella:{name:'Ella',image:'assets/images/babies/ella.webp'},
    emma:{name:'Emma',image:'assets/images/babies/emma.webp'},
    jhenea:{name:'Jheneá',image:'assets/images/babies/jhenea.webp'}
  },

  resetScene(){
    this.EndBathroomGame();
    this.IsActive=true;
    this.RewardGranted=false;
    this.Scene=document.getElementById('activityScene');
    if(!this.Scene)return false;
    this.Scene.innerHTML='';
    this.Scene.style.position='relative';
    this.Scene.style.display='block';
    this.Scene.style.minHeight='510px';
    this.Scene.style.overflow='hidden';
    this.Scene.style.touchAction='none';
    this.Scene.style.background='linear-gradient(#e9fbff,#f7efff)';
    return true;
  },

  setProgress(done,total){
    const p=document.getElementById('activityProgress');
    if(p) p.textContent='💗'.repeat(done)+'🤍'.repeat(Math.max(0,total-done));
  },

  awardOnce(amount,audio='goodJobJourni'){
    if(this.RewardGranted)return;
    this.RewardGranted=true;
    awardLoveHearts(amount);
    queueBooBoo(audio);
    celebrate();
  },

  // 🚽 Potty: sit → wipe → flush.
  StartPottyRoutine(){
    if(!this.resetScene())return;
    this.CurrentRoutine='Potty';
    this.PottyStepState=0;
    this.setProgress(0,3);
    playBooBoo('pottyTime');

    const cue=document.createElement('div');
    cue.id='potty_cue';
    cue.style.position='absolute';
    cue.style.left='50%';
    cue.style.top='75px';
    cue.style.transform='translateX(-50%)';
    cue.style.fontSize='120px';
    cue.textContent='🚽';
    this.Scene.appendChild(cue);

    const btn=document.createElement('button');
    btn.type='button';
    btn.id='potty_action_btn';
    btn.className='activity-choice';
    btn.style.position='absolute';
    btn.style.left='50%';
    btn.style.top='300px';
    btn.style.transform='translateX(-50%)';
    btn.style.width='150px';
    btn.style.height='120px';
    btn.style.fontSize='66px';
    btn.style.touchAction='manipulation';
    btn.onpointerdown=e=>{
      e.preventDefault();
      this.AdvancePottyStep();
    };
    this.Scene.appendChild(btn);
    this.UpdatePottyVisuals();
  },

  AdvancePottyStep(){
    if(!this.IsActive || this.CurrentRoutine!=='Potty' || this.RewardGranted)return;
    this.PottyStepState++;
    this.setProgress(this.PottyStepState,3);

    if(this.PottyStepState===1){
      pop('🧻');
      queueBooBoo('thereYouGo');
    }else if(this.PottyStepState===2){
      pop('🌊');
      queueBooBoo('thereYouGo');
    }else if(this.PottyStepState>=3){
      pop('✨');
      this.awardOnce(2,'goodJobJourni');
    }
    this.UpdatePottyVisuals();
  },

  UpdatePottyVisuals(){
    const btn=document.getElementById('potty_action_btn');
    const cue=document.getElementById('potty_cue');
    if(!btn||!cue)return;
    if(this.PottyStepState===0){btn.textContent='🚽';cue.textContent='🚽';}
    else if(this.PottyStepState===1){btn.textContent='🧻';cue.textContent='🧻';}
    else if(this.PottyStepState===2){btn.textContent='🌊';cue.textContent='🚽💦';}
    else {btn.textContent='⭐';cue.textContent='👑✨';btn.style.pointerEvents='none';}
  },

  // 🪥 Brush by swiping across the big smile five times.
  StartTeethBrushing(){
    if(!this.resetScene())return;
    this.CurrentRoutine='Teeth';
    this.TeethBrushedCount=0;
    this.setProgress(0,this.TargetTeethBrushes);
    playBooBoo('brushTeeth');

    const teeth=document.createElement('div');
    teeth.id='bathroom_teeth_display';
    teeth.textContent='😁';
    teeth.style.position='absolute';
    teeth.style.left='50%';
    teeth.style.top='95px';
    teeth.style.transform='translateX(-50%)';
    teeth.style.fontSize='150px';
    teeth.style.pointerEvents='none';
    this.Scene.appendChild(teeth);

    const brush=this.makeTool('🪥',55,360);
    brush.dataset.kind='toothbrush';
    let lastStroke=0;
    brush.onpointerdown=e=>this.beginDrag(e,brush);
    brush.onpointermove=e=>{
      this.moveDrag(e,brush);
      if(this.DragNode!==brush)return;
      const br=brush.getBoundingClientRect(), tr=teeth.getBoundingClientRect();
      const cx=br.left+br.width/2, cy=br.top+br.height/2;
      if(cx>tr.left-30 && cx<tr.right+30 && cy>tr.top-30 && cy<tr.bottom+30){
        const now=performance.now();
        if(now-lastStroke>380){
          lastStroke=now;
          this.RegisterTeethBrushStroke();
        }
      }
    };
    brush.onpointerup=e=>this.endDragReturn(e,brush);
    brush.onpointercancel=e=>this.endDragReturn(e,brush);
  },

  RegisterTeethBrushStroke(){
    if(!this.IsActive || this.CurrentRoutine!=='Teeth' || this.RewardGranted)return;
    if(this.TeethBrushedCount>=this.TargetTeethBrushes)return;
    this.TeethBrushedCount++;
    this.setProgress(this.TeethBrushedCount,this.TargetTeethBrushes);
    pop('✨');
    const teeth=document.getElementById('bathroom_teeth_display');
    if(teeth) teeth.animate(
      [{transform:'translateX(-50%) scale(1)'},{transform:'translateX(-50%) scale(1.1) rotate(-3deg)'},{transform:'translateX(-50%) scale(1)'}],
      {duration:220}
    );
    if(this.TeethBrushedCount>=this.TargetTeethBrushes){
      this.awardOnce(2,'goodJobJourni');
    }
  },

  // 🧼 Hands: water → soap → rub → rinse.
  StartHandwashing(){
    if(!this.resetScene())return;
    this.CurrentRoutine='Handwash';
    this.HandwashStepState=0;
    this.setProgress(0,4);
    playBooBoo('washHands');

    const hands=document.createElement('div');
    hands.id='handwash_hands';
    hands.textContent='🤲🏽';
    hands.style.position='absolute';
    hands.style.left='50%';
    hands.style.top='105px';
    hands.style.transform='translateX(-50%)';
    hands.style.fontSize='130px';
    this.Scene.appendChild(hands);

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='activity-choice';
    btn.id='handwash_step_btn';
    btn.style.position='absolute';
    btn.style.left='50%';
    btn.style.top='340px';
    btn.style.transform='translateX(-50%)';
    btn.style.width='150px';
    btn.style.height='120px';
    btn.style.fontSize='66px';
    btn.style.touchAction='manipulation';
    btn.onpointerdown=e=>{
      e.preventDefault();
      this.AdvanceHandwashStep();
    };
    this.Scene.appendChild(btn);
    this.UpdateHandwashVisuals();
  },

  AdvanceHandwashStep(){
    if(!this.IsActive || this.CurrentRoutine!=='Handwash' || this.RewardGranted)return;
    this.HandwashStepState++;
    this.setProgress(this.HandwashStepState,4);
    const hands=document.getElementById('handwash_hands');
    if(this.HandwashStepState===1) pop('💧');
    else if(this.HandwashStepState===2) pop('🫧');
    else if(this.HandwashStepState===3) pop('🫧');
    else if(this.HandwashStepState>=4){
      pop('✨');
      this.awardOnce(1,'goodJobJourni');
    }
    if(hands) hands.animate([{transform:'translateX(-50%) scale(1)'},{transform:'translateX(-50%) scale(1.08)'},{transform:'translateX(-50%) scale(1)'}],{duration:220});
    this.UpdateHandwashVisuals();
  },

  UpdateHandwashVisuals(){
    const btn=document.getElementById('handwash_step_btn');
    const hands=document.getElementById('handwash_hands');
    if(!btn||!hands)return;
    const steps=['🚰','🧼','🤲🏽','💦','⭐'];
    btn.textContent=steps[Math.min(this.HandwashStepState,4)];
    if(this.HandwashStepState===0) hands.textContent='🤲🏽';
    else if(this.HandwashStepState===1) hands.textContent='💧🤲🏽💧';
    else if(this.HandwashStepState===2||this.HandwashStepState===3) hands.textContent='🫧🤲🏽🫧';
    else hands.textContent='✨🤲🏽✨';
    if(this.HandwashStepState>=4)btn.style.pointerEvents='none';
  },

  // 🛁 Bath uses Ella, Emma, and Jheneá's ACTUAL existing baby artwork.
  StartBathTimeMiniGame(){
    if(!this.resetScene())return;
    this.CurrentRoutine='Bath';
    this.BathProgressState=0;
    this.SelectedBaby=null;
    this.setProgress(0,4);
    playBooBoo('babyBath');
    this.RenderBabyPicker();
  },

  RenderBabyPicker(){
    this.Scene.innerHTML='';
    const row=document.createElement('div');
    row.style.display='grid';
    row.style.gridTemplateColumns='repeat(3,1fr)';
    row.style.gap='12px';
    row.style.padding='38px 14px 12px';

    Object.entries(this.BabyRoster).forEach(([id,baby])=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='activity-choice';
      card.style.width='100%';
      card.style.height='250px';
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
      img.style.objectPosition='center';
      img.style.display='block';
      img.style.pointerEvents='none';
      card.appendChild(img);
      card.onpointerdown=e=>{
        e.preventDefault();
        this.SelectBaby(id);
      };
      row.appendChild(card);
    });
    this.Scene.appendChild(row);
  },

  SelectBaby(id){
    if(!this.BabyRoster[id] || !this.IsActive)return;
    this.SelectedBaby=id;
    this.BathProgressState=0;
    this.RenderBathScene();
  },

  RenderBathScene(){
    const baby=this.BabyRoster[this.SelectedBaby];
    this.Scene.innerHTML='';

    const tub=document.createElement('div');
    tub.style.position='absolute';
    tub.style.left='50%';
    tub.style.top='62px';
    tub.style.transform='translateX(-50%)';
    tub.style.width='300px';
    tub.style.height='280px';
    tub.style.borderRadius='55px 55px 90px 90px';
    tub.style.background='linear-gradient(#dff8ff,#bddff8)';
    tub.style.border='8px solid white';
    tub.style.boxShadow='0 10px 24px rgba(0,0,0,.12)';
    tub.style.overflow='hidden';

    const img=document.createElement('img');
    img.id='bath_doll_render_mesh';
    img.src=baby.image;
    img.alt=baby.name;
    img.style.position='absolute';
    img.style.left='50%';
    img.style.top='48%';
    img.style.transform='translate(-50%,-50%)';
    img.style.width='210px';
    img.style.height='245px';
    img.style.objectFit='cover';
    img.style.borderRadius='28px';
    img.style.zIndex='2';
    tub.appendChild(img);

    const effects=document.createElement('div');
    effects.id='bath_effects';
    effects.style.position='absolute';
    effects.style.inset='0';
    effects.style.display='flex';
    effects.style.alignItems='center';
    effects.style.justifyContent='center';
    effects.style.fontSize='44px';
    effects.style.zIndex='3';
    effects.style.pointerEvents='none';
    tub.appendChild(effects);

    const btn=document.createElement('button');
    btn.type='button';
    btn.id='bath_action_step_btn';
    btn.className='activity-choice';
    btn.style.position='absolute';
    btn.style.left='50%';
    btn.style.top='380px';
    btn.style.transform='translateX(-50%)';
    btn.style.width='150px';
    btn.style.height='110px';
    btn.style.fontSize='62px';
    btn.style.touchAction='manipulation';
    btn.onpointerdown=e=>{
      e.preventDefault();
      this.AdvanceBathStep();
    };

    this.Scene.appendChild(tub);
    this.Scene.appendChild(btn);
    this.UpdateBathVisuals();
  },

  AdvanceBathStep(){
    if(!this.IsActive || this.CurrentRoutine!=='Bath' || !this.SelectedBaby || this.RewardGranted)return;
    this.BathProgressState++;
    this.setProgress(this.BathProgressState,4);
    if(this.BathProgressState===1){pop('🫧');queueBooBoo('thereYouGo');}
    else if(this.BathProgressState===2){pop('🧽');queueBooBoo('thereYouGo');}
    else if(this.BathProgressState===3){pop('💦');queueBooBoo('thereYouGo');}
    else if(this.BathProgressState>=4){
      pop('✨');
      this.awardOnce(3,'goodJobJourni');
    }
    this.UpdateBathVisuals();
  },

  UpdateBathVisuals(){
    const btn=document.getElementById('bath_action_step_btn');
    const effects=document.getElementById('bath_effects');
    if(!btn||!effects)return;
    if(this.BathProgressState===0){btn.textContent='🧼';effects.textContent='';}
    else if(this.BathProgressState===1){btn.textContent='🧽';effects.textContent='🫧   🫧';}
    else if(this.BathProgressState===2){btn.textContent='💦';effects.textContent='🫧🫧🫧';}
    else if(this.BathProgressState===3){btn.textContent='🧻';effects.textContent='💦   💦';}
    else {btn.textContent='⭐';effects.textContent='✨💗✨';btn.style.pointerEvents='none';}
  },

  makeTool(symbol,left,top){
    const node=document.createElement('button');
    node.type='button';
    node.className='activity-choice';
    node.textContent=symbol;
    node.style.position='absolute';
    node.style.left=left+'px';
    node.style.top=top+'px';
    node.style.width='105px';
    node.style.height='95px';
    node.style.fontSize='58px';
    node.style.touchAction='none';
    node.dataset.homeLeft=left;
    node.dataset.homeTop=top;
    this.Scene.appendChild(node);
    return node;
  },

  beginDrag(e,node){
    if(!this.IsActive || this.RewardGranted)return;
    e.preventDefault();
    this.DragNode=node;
    this.DragPointerId=e.pointerId;
    try{node.setPointerCapture(e.pointerId)}catch(_){}
    const r=node.getBoundingClientRect();
    this.DragOffset={x:e.clientX-r.left,y:e.clientY-r.top};
    node.style.zIndex='100';
  },

  moveDrag(e,node){
    if(this.DragNode!==node || this.DragPointerId!==e.pointerId)return;
    e.preventDefault();
    const sr=this.Scene.getBoundingClientRect();
    node.style.left=(e.clientX-sr.left-this.DragOffset.x)+'px';
    node.style.top=(e.clientY-sr.top-this.DragOffset.y)+'px';
  },

  endDragReturn(e,node){
    if(this.DragNode!==node || this.DragPointerId!==e.pointerId)return;
    e.preventDefault();
    this.DragNode=null;
    this.DragPointerId=null;
    node.style.transition='left .3s ease,top .3s ease';
    node.style.left=node.dataset.homeLeft+'px';
    node.style.top=node.dataset.homeTop+'px';
    this.Timers.push(setTimeout(()=>node.style.transition='none',320));
  },

  EndBathroomGame(){
    this.IsActive=false;
    this.DragNode=null;
    this.DragPointerId=null;
    this.Timers.forEach(t=>clearTimeout(t));
    this.Timers=[];
    this.Scene=null;
  }
};
