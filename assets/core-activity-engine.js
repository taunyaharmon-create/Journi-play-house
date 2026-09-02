
const CoreActivityEngine = {
  IsActive:false,
  Scene:null,
  Activity:null,
  BabyKey:null,
  Completed:false,
  Timers:[],
  Drag:null,

  BabyRoster:{
    ella:{name:'Ella',image:'assets/images/babies/ella.webp'},
    emma:{name:'Emma',image:'assets/images/babies/emma.webp'},
    jhenea:{name:'Jheneá',image:'assets/images/babies/jhenea.webp'}
  },

  Start(type){
    this.End();
    this.IsActive=true;
    this.Activity=type;
    this.Completed=false;
    this.BabyKey=(typeof selectedBaby!=='undefined'&&selectedBaby)?selectedBaby:null;
    const scene=document.getElementById('activityScene');
    if(!scene)return;
    this.Scene=scene;
    scene.innerHTML='';
    scene.style.position='relative';
    scene.style.display='block';
    scene.style.minHeight='500px';
    scene.style.overflow='hidden';
    scene.style.touchAction='none';
    scene.style.background='linear-gradient(#fff7fb,#f2ecff)';
    if(type==='nurseryBottle')this.NurseryBottle();
    else if(type==='nurseryFeed')this.NurseryFeed();
    else if(type==='nurseryDiaper')this.NurseryDiaper();
    else if(type==='nurseryDress')this.NurseryDress();
    else if(type==='cafeSnack')this.CafeSnack();
    else if(type==='bedroomBottle')this.BedroomBottle();
    else if(type==='bedroomPacifier')this.BedroomPacifier();
    else if(type==='bedroomStory')this.BedroomStory();
    else if(type==='bedroomRock')this.BedroomRock();
    else if(type==='bedroomLights')this.BedroomLights();
  },

  progress(done,total){
    const p=document.getElementById('activityProgress');
    if(p)p.textContent='💗'.repeat(done)+'🤍'.repeat(Math.max(0,total-done));
  },

  babyImage(top=50){
    const b=this.BabyRoster[this.BabyKey];
    if(!b)return null;
    const img=document.createElement('img');
    img.src=b.image;
    img.alt=b.name;
    img.style.position='absolute';
    img.style.left='50%';
    img.style.top=top+'px';
    img.style.transform='translateX(-50%)';
    img.style.width='235px';
    img.style.height='275px';
    img.style.objectFit='cover';
    img.style.borderRadius='36px';
    img.style.border='7px solid white';
    img.style.boxShadow='0 12px 28px rgba(0,0,0,.14)';
    img.style.pointerEvents='none';
    this.Scene.appendChild(img);
    return img;
  },

  makeTool(symbol,left,top){
    const b=document.createElement('button');
    b.type='button';
    b.className='activity-choice';
    b.textContent=symbol;
    b.style.position='absolute';
    b.style.left=left+'px';
    b.style.top=top+'px';
    b.style.width='112px';
    b.style.height='100px';
    b.style.fontSize='60px';
    b.style.touchAction='none';
    b.dataset.homeLeft=left;
    b.dataset.homeTop=top;
    this.Scene.appendChild(b);
    return b;
  },

  bindDragToTarget(tool,target,onHit,onMiss){
    let ox=0,oy=0;
    tool.onpointerdown=e=>{
      e.preventDefault();
      this.Drag={node:tool,pointer:e.pointerId};
      try{tool.setPointerCapture(e.pointerId)}catch(_){}
      const r=tool.getBoundingClientRect();
      ox=e.clientX-r.left;oy=e.clientY-r.top;
      tool.style.zIndex='100';
    };
    tool.onpointermove=e=>{
      if(!this.Drag||this.Drag.node!==tool||this.Drag.pointer!==e.pointerId)return;
      const sr=this.Scene.getBoundingClientRect();
      tool.style.left=(e.clientX-sr.left-ox)+'px';
      tool.style.top=(e.clientY-sr.top-oy)+'px';
    };
    const end=e=>{
      if(!this.Drag||this.Drag.node!==tool)return;
      this.Drag=null;
      const a=tool.getBoundingClientRect(),b=target.getBoundingClientRect();
      const cx=a.left+a.width/2,cy=a.top+a.height/2;
      const hit=cx>b.left-50&&cx<b.right+50&&cy>b.top-50&&cy<b.bottom+50;
      if(hit)onHit();
      else{
        tool.animate([{transform:'translateX(0)'},{transform:'translateX(-10px)'},{transform:'translateX(10px)'},{transform:'translateX(0)'}],{duration:260});
        if(onMiss)onMiss();
      }
      tool.style.transition='left .28s ease,top .28s ease';
      tool.style.left=tool.dataset.homeLeft+'px';
      tool.style.top=tool.dataset.homeTop+'px';
      this.Timers.push(setTimeout(()=>tool.style.transition='none',300));
    };
    tool.onpointerup=end;
    tool.onpointercancel=end;
  },

  NurseryBottle(){
    this.progress(0,3);
    playBooBoo('bottle');
    const baby=this.babyImage(42);
    if(!baby)return;
    const bottle=this.makeTool('🍼',30,375);
    let feeds=0;
    this.bindDragToTarget(bottle,baby,()=>{
      if(this.Completed)return;
      feeds++;this.progress(feeds,3);pop('💗');
      if(feeds>=3)this.finishNursery('Bottle','goodJobJourni');
      else queueBooBoo('thereYouGo');
    },()=>queueBooBoo('tryAgain'));
  },

  NurseryFeed(){
    this.progress(0,3);
    playBooBoo('feedBaby');
    const baby=this.babyImage(42);
    if(!baby)return;
    const spoon=this.makeTool('🥄🥣',22,375);
    let bites=0;
    this.bindDragToTarget(spoon,baby,()=>{
      if(this.Completed)return;
      bites++;this.progress(bites,3);pop('✨');
      if(bites>=3)this.finishNursery('Feed Baby','goodJobJourni');
      else queueBooBoo('thereYouGo');
    },()=>queueBooBoo('tryAgain'));
  },

  NurseryDiaper(){
    this.progress(0,3);
    playBooBoo('diaper');
    const baby=this.babyImage(42);
    if(!baby)return;

    const steps=[
      {icon:'🧻',audio:'thereYouGo'},
      {icon:'🧴',audio:'thereYouGo'},
      {icon:'🩲',audio:'goodJobJourni'}
    ];
    let step=0;
    const tool=this.makeTool(steps[0].icon,30,375);
    this.bindDragToTarget(tool,baby,()=>{
      if(this.Completed)return;
      step++;
      this.progress(step,3);
      pop(step===3?'💗✨':'✨');
      if(step>=3){
        this.finishNursery('Diaper','goodJobJourni');
      }else{
        tool.textContent=steps[step].icon;
        queueBooBoo(steps[step-1].audio);
      }
    },()=>queueBooBoo('tryAgain'));
  },

  NurseryDress(){
    this.progress(0,1);
    playBooBoo('dressBaby');
    const baby=this.babyImage(42);
    if(!baby)return;

    const tray=document.createElement('div');
    tray.style.position='absolute';
    tray.style.left='4%';
    tray.style.right='4%';
    tray.style.bottom='24px';
    tray.style.display='grid';
    tray.style.gridTemplateColumns='repeat(3,1fr)';
    tray.style.gap='12px';
    [['👗','💗'],['🩷👚','🌸'],['✨👗','⭐']].forEach(([look,deco])=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='activity-choice';
      b.textContent=look;
      b.style.height='105px';
      b.style.fontSize='52px';
      b.style.touchAction='manipulation';
      b.onpointerdown=e=>{
        e.preventDefault();
        if(this.Completed)return;
        const badge=document.createElement('div');
        badge.textContent=deco+' '+look;
        badge.style.position='absolute';
        badge.style.left='50%';
        badge.style.top='245px';
        badge.style.transform='translateX(-50%)';
        badge.style.fontSize='52px';
        badge.style.pointerEvents='none';
        badge.style.zIndex='6';
        this.Scene.appendChild(badge);
        this.progress(1,1);
        this.finishNursery('Dress','goodJobJourni');
      };
      tray.appendChild(b);
    });
    this.Scene.appendChild(tray);
  },

  CafeSnack(){
    this.progress(0,4);
    playBooBoo('snack');
    const plate=document.createElement('div');
    plate.textContent='🍽️';
    plate.style.position='absolute';
    plate.style.left='50%';plate.style.top='190px';
    plate.style.transform='translateX(-50%)';
    plate.style.fontSize='130px';
    plate.style.pointerEvents='none';
    this.Scene.appendChild(plate);

    const snacks=['🥪','🍓','🍎','🧀'];
    let done=0;
    const tray=document.createElement('div');
    tray.style.position='absolute';
    tray.style.left='4%';tray.style.right='4%';tray.style.bottom='28px';
    tray.style.display='grid';tray.style.gridTemplateColumns='repeat(4,1fr)';tray.style.gap='8px';

    snacks.forEach(icon=>{
      const b=document.createElement('button');
      b.type='button';b.className='activity-choice';b.textContent=icon;
      b.style.height='92px';b.style.fontSize='48px';b.style.touchAction='manipulation';
      b.onpointerdown=e=>{
        e.preventDefault();
        if(b.disabled||this.Completed)return;
        b.disabled=true;b.style.opacity='.35';
        done++;this.progress(done,4);pop('✨');
        if(done>=4)this.finishGeneric('Snack',2,'finished');
        else queueBooBoo('thereYouGo');
      };
      tray.appendChild(b);
    });
    this.Scene.appendChild(tray);
  },

  BedroomBottle(){
    this.progress(0,3);
    playBooBoo('bedtimeBottle');
    this.Scene.style.background='radial-gradient(circle at 50% 30%,#45456c,#1d1d34 68%,#10101f)';
    const crib=document.createElement('div');
    crib.textContent='🛏️';
    crib.style.position='absolute';
    crib.style.left='50%';crib.style.top='80px';
    crib.style.transform='translateX(-50%)';crib.style.fontSize='170px';
    crib.style.pointerEvents='none';
    this.Scene.appendChild(crib);

    const bottle=this.makeTool('🍼',30,370);
    let sips=0;
    this.bindDragToTarget(bottle,crib,()=>{
      if(this.Completed)return;
      sips++;this.progress(sips,3);pop('🌙');
      if(sips>=3)this.finishGeneric('Bottle',2,'goodJobJourni');
      else queueBooBoo('thereYouGo');
    },()=>queueBooBoo('tryAgain'));
  },

  BedroomPacifier(){
    this.progress(0,1);
    playBooBoo('bedtimePacifier');
    this.Scene.style.background='radial-gradient(circle at 50% 30%,#45456c,#1d1d34 68%,#10101f)';
    const crib=document.createElement('div');
    crib.textContent='🛏️💤';
    crib.style.position='absolute';
    crib.style.left='50%';crib.style.top='100px';
    crib.style.transform='translateX(-50%)';crib.style.fontSize='150px';
    crib.style.pointerEvents='none';
    this.Scene.appendChild(crib);
    const paci=this.makeTool('🍼',30,370);
    // Visual pacifier substitute uses existing game iconography but correct mechanic.
    paci.textContent='🩷';
    this.bindDragToTarget(paci,crib,()=>{
      if(this.Completed)return;
      this.progress(1,1);
      this.finishGeneric('Pacifier',1,'goodJobJourni');
    },()=>queueBooBoo('tryAgain'));
  },

  BedroomStory(){
    this.progress(0,3);
    playBooBoo('bedtimeStory');
    this.Scene.style.background='radial-gradient(circle at 50% 20%,#4d456f,#24213a 70%,#11101d)';
    const book=document.createElement('button');
    book.type='button';book.className='activity-choice';book.textContent='📖';
    book.style.position='absolute';book.style.left='50%';book.style.top='145px';
    book.style.transform='translateX(-50%)';book.style.width='230px';book.style.height='180px';
    book.style.fontSize='95px';book.style.touchAction='manipulation';
    let page=0;
    const pages=['📖 🧸','📖 👑','📕 🌙'];
    book.onpointerdown=e=>{
      e.preventDefault();if(this.Completed)return;
      page++;book.textContent=pages[page-1];this.progress(page,3);pop('✨');
      if(page>=3)this.finishGeneric('Story',2,'goodJobJourni');
      else if(page===2)queueBooBoo('praiseMyBabies');
    };
    this.Scene.appendChild(book);
  },

  BedroomRock(){
    this.progress(0,5);
    playBooBoo('bedtimeRock');
    this.Scene.style.background='radial-gradient(circle at 50% 20%,#4d456f,#24213a 70%,#11101d)';
    const chair=document.createElement('div');
    chair.textContent='🪑🧸';
    chair.style.position='absolute';chair.style.left='50%';chair.style.top='105px';
    chair.style.transform='translateX(-50%)';chair.style.fontSize='130px';chair.style.pointerEvents='none';
    this.Scene.appendChild(chair);

    const pad=document.createElement('button');
    pad.type='button';pad.className='activity-choice';pad.textContent='↔️';
    pad.style.position='absolute';pad.style.left='50%';pad.style.bottom='70px';
    pad.style.transform='translateX(-50%)';pad.style.width='190px';pad.style.height='110px';
    pad.style.fontSize='64px';pad.style.touchAction='none';
    let startX=null,rocks=0;
    pad.onpointerdown=e=>{e.preventDefault();startX=e.clientX;try{pad.setPointerCapture(e.pointerId)}catch(_){}};
    pad.onpointerup=e=>{
      if(startX===null)return;
      const d=Math.abs(e.clientX-startX);startX=null;
      if(d<28){queueBooBoo('tryAgain');return;}
      rocks++;this.progress(rocks,5);
      chair.animate([{transform:'translateX(-50%) rotate(-5deg)'},{transform:'translateX(-50%) rotate(5deg)'},{transform:'translateX(-50%) rotate(0)'}],{duration:520});
      if(rocks>=5)this.finishGeneric('Rock',2,'lightsOut');
      else if(rocks===3)queueBooBoo('affection');
    };
    pad.onpointercancel=()=>startX=null;
    this.Scene.appendChild(pad);
  },

  BedroomLights(){
    this.progress(0,1);
    playBooBoo('lightsOut');
    this.Scene.style.background='radial-gradient(circle at 50% 25%,#4d456f,#24213a 70%,#11101d)';
    const moon=document.createElement('div');
    moon.textContent='🌙✨';
    moon.style.position='absolute';moon.style.left='50%';moon.style.top='90px';
    moon.style.transform='translateX(-50%)';moon.style.fontSize='140px';moon.style.pointerEvents='none';
    this.Scene.appendChild(moon);
    const sw=document.createElement('button');
    sw.type='button';sw.className='activity-choice';sw.textContent='💡';
    sw.style.position='absolute';sw.style.left='50%';sw.style.bottom='95px';
    sw.style.transform='translateX(-50%)';sw.style.width='170px';sw.style.height='125px';
    sw.style.fontSize='72px';sw.style.touchAction='manipulation';
    sw.onpointerdown=e=>{
      e.preventDefault();if(this.Completed)return;
      this.Scene.animate([{filter:'brightness(1)'},{filter:'brightness(.42)'}],{duration:900,fill:'forwards'});
      sw.textContent='🌙';this.progress(1,1);
      this.Timers.push(setTimeout(()=>this.finishGeneric('Lights',1,'lightsOut'),500));
    };
    this.Scene.appendChild(sw);
  },

  finishNursery(name,audio){
    if(this.Completed)return;
    this.Completed=true;
    // Use the game's official complete() path so Love Meter milestones and presents stay correct.
    if(audio)queueBooBoo(audio);
    this.Timers.push(setTimeout(()=>complete(name),250));
  },

  finishGeneric(name,hearts,audio){
    if(this.Completed)return;
    this.Completed=true;
    if(audio)queueBooBoo(audio);
    state.completed[currentRoom]=state.completed[currentRoom]||{};
    state.completed[currentRoom][name]=(state.completed[currentRoom][name]||0)+1;
    awardLoveHearts(hearts);
    persist();
    this.Timers.push(setTimeout(()=>celebrate(),220));
  },

  End(){
    this.IsActive=false;
    this.Completed=false;
    this.Drag=null;
    this.Timers.forEach(t=>clearTimeout(t));
    this.Timers=[];
    this.Scene=null;
  }
};
