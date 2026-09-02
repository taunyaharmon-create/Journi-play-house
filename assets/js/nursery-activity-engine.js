
const NurseryActivityEngine = {
  IsActive:false,
  CurrentActivity:'Menu',
  ActiveBabyTarget:null,
  BrushStrokeCount:0,
  StoryPagePosition:0,
  LullabyRockCount:0,
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

  StartNurseryActivity(activityType,selectedBabyKey){
    this.EndNurseryActivity();
    if(!this.BabyRoster[selectedBabyKey])return;

    this.IsActive=true;
    this.CurrentActivity=activityType;
    this.ActiveBabyTarget=selectedBabyKey;
    this.BrushStrokeCount=0;
    this.StoryPagePosition=0;
    this.LullabyRockCount=0;
    this.RewardGranted=false;

    const scene=document.getElementById('activityScene');
    if(!scene)return;
    this.Scene=scene;
    scene.innerHTML='';
    scene.style.position='relative';
    scene.style.display='block';
    scene.style.minHeight='510px';
    scene.style.overflow='hidden';
    scene.style.touchAction='none';
    scene.style.background='linear-gradient(#fff3fa,#f0e9ff)';

    if(activityType==='Hair') this.RenderHairSalon();
    else if(activityType==='Read') this.RenderStorybook();
    else if(activityType==='Lullaby') this.RenderLullaby();
  },

  baby(){
    return this.BabyRoster[this.ActiveBabyTarget];
  },

  setProgress(done,total){
    const p=document.getElementById('activityProgress');
    if(p)p.textContent='💗'.repeat(done)+'🤍'.repeat(Math.max(0,total-done));
  },

  makeBabyImage(id,top=55){
    const baby=this.baby();
    const img=document.createElement('img');
    img.id=id;
    img.src=baby.image;
    img.alt=baby.name;
    img.style.position='absolute';
    img.style.left='50%';
    img.style.top=top+'px';
    img.style.transform='translateX(-50%)';
    img.style.width='230px';
    img.style.height='270px';
    img.style.objectFit='cover';
    img.style.objectPosition='center';
    img.style.borderRadius='34px';
    img.style.border='7px solid white';
    img.style.boxShadow='0 10px 24px rgba(0,0,0,.13)';
    img.style.pointerEvents='none';
    this.Scene.appendChild(img);
    return img;
  },

  // 🎀 Hair salon: swipe the brush across the baby's actual picture.
  RenderHairSalon(){
    this.setProgress(0,4);
    playBooBoo('babyHair');
    const babyImg=this.makeBabyImage('hair_baby_render_mesh',48);

    const pretty=document.createElement('div');
    pretty.id='hair_pretty_layer';
    pretty.style.position='absolute';
    pretty.style.left='50%';
    pretty.style.top='60px';
    pretty.style.transform='translateX(-50%)';
    pretty.style.width='230px';
    pretty.style.height='270px';
    pretty.style.pointerEvents='none';
    pretty.style.display='flex';
    pretty.style.justifyContent='space-between';
    pretty.style.alignItems='flex-start';
    pretty.style.fontSize='48px';
    pretty.style.padding='8px';
    pretty.style.zIndex='5';
    this.Scene.appendChild(pretty);

    const brush=this.makeTool('🪮',55,380);
    let lastStroke=0;
    brush.onpointerdown=e=>this.beginDrag(e,brush);
    brush.onpointermove=e=>{
      this.moveDrag(e,brush);
      if(this.DragNode!==brush)return;
      const br=brush.getBoundingClientRect();
      const tr=babyImg.getBoundingClientRect();
      const cx=br.left+br.width/2,cy=br.top+br.height/2;
      if(cx>tr.left-25&&cx<tr.right+25&&cy>tr.top-25&&cy<tr.bottom+25){
        const now=performance.now();
        if(now-lastStroke>420){
          lastStroke=now;
          this.ProcessSalonBrushStroke();
        }
      }
    };
    brush.onpointerup=e=>this.endDragReturn(e,brush);
    brush.onpointercancel=e=>this.endDragReturn(e,brush);
  },

  ProcessSalonBrushStroke(){
    if(!this.IsActive||this.CurrentActivity!=='Hair'||this.RewardGranted)return;
    if(this.BrushStrokeCount>=4)return;
    this.BrushStrokeCount++;
    this.setProgress(this.BrushStrokeCount,4);

    const img=document.getElementById('hair_baby_render_mesh');
    if(img)img.animate(
      [{transform:'translateX(-50%) scale(1)'},{transform:'translateX(-50%) scale(1.06) rotate(3deg)'},{transform:'translateX(-50%) scale(1)'}],
      {duration:230}
    );

    if(this.BrushStrokeCount===2){
      const pretty=document.getElementById('hair_pretty_layer');
      if(pretty)pretty.textContent='🎀      ✨';
      queueBooBoo('thereYouGo');
    }else pop('✨');

    if(this.BrushStrokeCount>=4){
      const pretty=document.getElementById('hair_pretty_layer');
      if(pretty)pretty.textContent='👑      🎀';
      this.AwardAffectionPoints(2,'goodJobJourni');
    }
  },

  // 📖 Three-page picture story with the selected baby's actual picture beside the book.
  RenderStorybook(){
    this.setProgress(0,3);
    playBooBoo('bedtimeStory');
    this.makeBabyImage('storybook_baby_render',42);

    const book=document.createElement('button');
    book.type='button';
    book.id='nursery_storybook_display';
    book.className='activity-choice';
    book.textContent='📖';
    book.style.position='absolute';
    book.style.left='50%';
    book.style.top='340px';
    book.style.transform='translateX(-50%)';
    book.style.width='190px';
    book.style.height='120px';
    book.style.fontSize='72px';
    book.style.touchAction='manipulation';
    book.onpointerdown=e=>{
      e.preventDefault();
      this.AdvanceStorybookPage();
    };
    this.Scene.appendChild(book);
  },

  AdvanceStorybookPage(){
    if(!this.IsActive||this.CurrentActivity!=='Read'||this.RewardGranted)return;
    this.StoryPagePosition++;
    this.setProgress(this.StoryPagePosition,3);
    const book=document.getElementById('nursery_storybook_display');
    if(this.StoryPagePosition===1){
      book.textContent='📖 🧸';
      pop('✨');
    }else if(this.StoryPagePosition===2){
      book.textContent='📖 👑';
      queueBooBoo('praiseMyBabies');
    }else{
      book.textContent='📕 💗';
      this.AwardAffectionPoints(2,'goodJobJourni');
    }
  },

  // 🌙 Rock the selected baby's actual picture five times.
  RenderLullaby(){
    this.setProgress(0,5);
    playBooBoo('bedtimeRock');

    const cradle=document.createElement('div');
    cradle.id='lullaby_cradle_render_mesh';
    cradle.style.position='absolute';
    cradle.style.left='50%';
    cradle.style.top='50px';
    cradle.style.transform='translateX(-50%)';
    cradle.style.width='285px';
    cradle.style.height='300px';
    cradle.style.borderRadius='45px 45px 90px 90px';
    cradle.style.background='linear-gradient(#f5d7ff,#d9d0ff)';
    cradle.style.border='8px solid white';
    cradle.style.boxShadow='0 10px 25px rgba(0,0,0,.13)';
    cradle.style.display='flex';
    cradle.style.alignItems='center';
    cradle.style.justifyContent='center';

    const img=document.createElement('img');
    img.src=this.baby().image;
    img.alt=this.baby().name;
    img.style.width='205px';
    img.style.height='235px';
    img.style.objectFit='cover';
    img.style.borderRadius='30px';
    img.style.pointerEvents='none';
    cradle.appendChild(img);
    this.Scene.appendChild(cradle);

    const rocker=document.createElement('button');
    rocker.type='button';
    rocker.className='activity-choice';
    rocker.textContent='↔️';
    rocker.style.position='absolute';
    rocker.style.left='50%';
    rocker.style.top='385px';
    rocker.style.transform='translateX(-50%)';
    rocker.style.width='170px';
    rocker.style.height='100px';
    rocker.style.fontSize='60px';
    rocker.style.touchAction='none';

    let startX=null;
    rocker.onpointerdown=e=>{
      e.preventDefault();
      startX=e.clientX;
      try{rocker.setPointerCapture(e.pointerId)}catch(_){}
    };
    rocker.onpointerup=e=>{
      if(startX===null)return;
      const delta=Math.abs(e.clientX-startX);
      startX=null;
      if(delta>=30)this.ExecuteCradleRockSwipe();
      else queueBooBoo('tryAgain');
    };
    rocker.onpointercancel=()=>{startX=null;};
    this.Scene.appendChild(rocker);
  },

  ExecuteCradleRockSwipe(){
    if(!this.IsActive||this.CurrentActivity!=='Lullaby'||this.RewardGranted)return;
    if(this.LullabyRockCount>=5)return;
    this.LullabyRockCount++;
    this.setProgress(this.LullabyRockCount,5);

    const cradle=document.getElementById('lullaby_cradle_render_mesh');
    if(cradle)cradle.animate(
      [
        {transform:'translateX(-50%) rotate(0deg)'},
        {transform:'translateX(calc(-50% + 24px)) rotate(4deg)'},
        {transform:'translateX(calc(-50% - 24px)) rotate(-4deg)'},
        {transform:'translateX(-50%) rotate(0deg)'}
      ],
      {duration:520,easing:'ease-in-out'}
    );

    if(this.LullabyRockCount===3)queueBooBoo('affection');
    else pop('🌙');

    if(this.LullabyRockCount>=5){
      if(this.Scene)this.Scene.animate(
        [{filter:'brightness(1)'},{filter:'brightness(.55)'},{filter:'brightness(.72)'}],
        {duration:2500,fill:'forwards'}
      );
      this.AwardAffectionPoints(3,'lightsOut');
    }
  },

  // Adds permanent baby Love Meter points without using fake NurseryEngine hooks.
  AwardAffectionPoints(points,audioKey){
    if(this.RewardGranted||!this.ActiveBabyTarget)return;
    this.RewardGranted=true;

    const key=this.ActiveBabyTarget;
    const before=Math.max(0,Math.min(5,Number(state.babies[key]||0)));
    const after=Math.min(5,before+points);
    state.babies[key]=after;

    // One spendable Love Heart for completing the Nursery activity.
    state.hearts=Math.min(25,(state.hearts||0)+1);

    const names={ella:'Ella',emma:'Emma',jhenea:'Jheneá'};
    let hitSingle=false,hitAll=false;

    if(before<5&&after===5&&!state.babyRewards[key]){
      state.babyRewards[key]=true;
      state.hearts=Math.min(25,(state.hearts||0)+3);
      hitSingle=true;
      setTimeout(()=>{if(typeof ScrapbookEngine!=='undefined')ScrapbookEngine.TriggerStickerRewardPresentFlow(key);},700);
    }
    if(state.babies.ella===5&&state.babies.emma===5&&state.babies.jhenea===5&&!state.babyRewards.trio){
      state.babyRewards.trio=true;
      state.hearts=Math.min(25,(state.hearts||0)+5);
      hitAll=true;
    }

    persist();
    if(hitAll)queueBooBoo('allBabiesFull');
    else if(hitSingle)queueBooBoo('singleBabyFull');
    else if(after===4)queueBooBoo('heartsAlmostFull');
    else queueBooBoo(audioKey||'loveMeterAdded');

    celebrate();
    pop('💗 '+names[key]+' 💗');
  },

  makeTool(symbol,left,top){
    const node=document.createElement('button');
    node.type='button';
    node.className='activity-choice';
    node.textContent=symbol;
    node.style.position='absolute';
    node.style.left=left+'px';
    node.style.top=top+'px';
    node.style.width='110px';
    node.style.height='95px';
    node.style.fontSize='60px';
    node.style.touchAction='none';
    node.dataset.homeLeft=left;
    node.dataset.homeTop=top;
    this.Scene.appendChild(node);
    return node;
  },

  beginDrag(e,node){
    if(!this.IsActive||this.RewardGranted)return;
    e.preventDefault();
    this.DragNode=node;
    this.DragPointerId=e.pointerId;
    try{node.setPointerCapture(e.pointerId)}catch(_){}
    const r=node.getBoundingClientRect();
    this.DragOffset={x:e.clientX-r.left,y:e.clientY-r.top};
    node.style.zIndex='100';
  },

  moveDrag(e,node){
    if(this.DragNode!==node||this.DragPointerId!==e.pointerId)return;
    e.preventDefault();
    const sr=this.Scene.getBoundingClientRect();
    node.style.left=(e.clientX-sr.left-this.DragOffset.x)+'px';
    node.style.top=(e.clientY-sr.top-this.DragOffset.y)+'px';
  },

  endDragReturn(e,node){
    if(this.DragNode!==node||this.DragPointerId!==e.pointerId)return;
    e.preventDefault();
    this.DragNode=null;
    this.DragPointerId=null;
    node.style.transition='left .3s ease,top .3s ease';
    node.style.left=node.dataset.homeLeft+'px';
    node.style.top=node.dataset.homeTop+'px';
    this.Timers.push(setTimeout(()=>node.style.transition='none',320));
  },

  EndNurseryActivity(){
    this.IsActive=false;
    this.DragNode=null;
    this.DragPointerId=null;
    this.Timers.forEach(t=>clearTimeout(t));
    this.Timers=[];
    this.Scene=null;
  }
};
