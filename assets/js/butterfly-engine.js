
const ButterflyEngine = {
  IsGameActive:false,
  ActiveButterflies:[],
  SpawnIntervalId:null,
  TargetColorSequence:'pink',
  TotalCaughtThisRound:0,
  MaxButterfliesAllowed:6,
  TargetCatchCount:6,
  Scene:null,
  RewardGranted:false,

  ButterflyThemes:{
    pink:{symbol:'🦋',glow:'#ff69b4',fill:'rgba(255,105,180,.22)'},
    purple:{symbol:'🦋',glow:'#9370db',fill:'rgba(147,112,219,.22)'}
  },

  StartButterflyGame(){
    this.EndButterflyGame();
    this.IsGameActive=true;
    this.TotalCaughtThisRound=0;
    this.TargetColorSequence='pink';
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
    scene.style.touchAction='none';
    scene.style.background='linear-gradient(#dff8ff,#f4e7ff 58%,#dff4cf)';

    if(prog) prog.textContent='🤍'.repeat(this.TargetCatchCount);

    const target=document.createElement('div');
    target.id='butterfly_target_cue';
    target.style.position='absolute';
    target.style.left='50%';
    target.style.top='18px';
    target.style.transform='translateX(-50%)';
    target.style.minWidth='170px';
    target.style.height='72px';
    target.style.borderRadius='36px';
    target.style.border='5px solid white';
    target.style.boxShadow='0 6px 16px rgba(0,0,0,.12)';
    target.style.display='flex';
    target.style.alignItems='center';
    target.style.justifyContent='center';
    target.style.fontSize='46px';
    target.style.zIndex='30';
    scene.appendChild(target);

    this.UpdateTargetCue();
    playBooBoo('butterfly');

    for(let i=0;i<3;i++){
      setTimeout(()=>{ if(this.IsGameActive) this.SpawnSingleButterfly(); }, i*250);
    }

    this.SpawnIntervalId=setInterval(()=>{
      if(this.IsGameActive && this.ActiveButterflies.length<this.MaxButterfliesAllowed){
        this.SpawnSingleButterfly();
      }
    },1100);
  },

  UpdateTargetCue(){
    const cue=document.getElementById('butterfly_target_cue');
    if(!cue)return;
    const isPink=this.TargetColorSequence==='pink';
    cue.textContent=(isPink?'💗':'💜')+' 🦋';
    cue.style.background=isPink?'rgba(255,105,180,.28)':'rgba(147,112,219,.28)';
  },

  SpawnSingleButterfly(){
    if(!this.IsGameActive || !this.Scene)return;

    const id='bfly_'+Date.now()+'_'+Math.floor(Math.random()*10000);
    const color=Math.random()<.5?'pink':'purple';
    const theme=this.ButterflyThemes[color];
    const scene=this.Scene;

    const node=document.createElement('button');
    node.type='button';
    node.id=id;
    node.className='toddler-button';
    node.dataset.color=color;
    node.style.position='absolute';
    node.style.width='92px';
    node.style.height='92px';
    node.style.borderRadius='50%';
    node.style.border='5px solid white';
    node.style.background=theme.fill;
    node.style.boxShadow=`0 0 18px ${theme.glow}, inset 0 2px 6px rgba(255,255,255,.7)`;
    node.style.fontSize='50px';
    node.style.zIndex='15';
    node.style.touchAction='none';
    node.textContent=theme.symbol;

    const fromLeft=Math.random()<.5;
    let x=fromLeft?-110:scene.clientWidth+20;
    const baseY=110+Math.random()*Math.max(120,scene.clientHeight-220);
    const speed=(50+Math.random()*45)*(fromLeft?1:-1); // pixels/sec
    const amp=14+Math.random()*22;
    const freq=.012+Math.random()*.015;
    const start=performance.now();

    node.style.left=x+'px';
    node.style.top=baseY+'px';

    node.onpointerdown=e=>{
      e.preventDefault();
      this.EvaluateCatchAttempt(id,color,node);
    };

    scene.appendChild(node);

    const entry={id,node,color,raf:null};
    this.ActiveButterflies.push(entry);

    const fly=now=>{
      if(!this.IsGameActive || !node.isConnected)return;
      const dt=(now-start)/1000;
      const cx=x+speed*dt;
      const y=baseY+Math.sin(cx*freq)*amp;

      node.style.left=cx+'px';
      node.style.top=y+'px';
      node.style.transform=`rotate(${Math.sin(cx*.025)*10}deg)`;

      const out=(speed>0 && cx>scene.clientWidth+130) || (speed<0 && cx<-130);
      if(out){
        this.RemoveButterflyFromRegistry(id);
        node.remove();
        return;
      }
      entry.raf=requestAnimationFrame(fly);
    };
    entry.raf=requestAnimationFrame(fly);
  },

  EvaluateCatchAttempt(id,color,node){
    if(!this.IsGameActive || node.dataset.caught==='1')return;

    if(color===this.TargetColorSequence){
      node.dataset.caught='1';
      const item=this.ActiveButterflies.find(b=>b.id===id);
      if(item?.raf) cancelAnimationFrame(item.raf);
      this.RemoveButterflyFromRegistry(id);

      this.TriggerMagicStardustExplosion(node,this.ButterflyThemes[color].glow);
      node.remove();

      this.TotalCaughtThisRound++;
      const prog=document.getElementById('activityProgress');
      if(prog){
        prog.textContent='💗'.repeat(this.TotalCaughtThisRound)+
          '🤍'.repeat(Math.max(0,this.TargetCatchCount-this.TotalCaughtThisRound));
      }

      queueBooBoo('correctAnimal');

      if(this.TotalCaughtThisRound>=this.TargetCatchCount){
        this.CompleteRound();
        return;
      }

      this.TargetColorSequence=this.TargetColorSequence==='pink'?'purple':'pink';
      this.UpdateTargetCue();
    }else{
      queueBooBoo('lookAgain');
      node.animate(
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

  CompleteRound(){
    if(!this.IsGameActive)return;
    this.IsGameActive=false;

    if(this.SpawnIntervalId){
      clearInterval(this.SpawnIntervalId);
      this.SpawnIntervalId=null;
    }

    this.ActiveButterflies.forEach(b=>{
      if(b.raf) cancelAnimationFrame(b.raf);
      b.node?.remove();
    });
    this.ActiveButterflies=[];

    const cue=document.getElementById('butterfly_target_cue');
    if(cue){
      cue.textContent='👑🦋✨';
      cue.style.background='rgba(255,215,0,.25)';
    }

    if(!this.RewardGranted){
      this.RewardGranted=true;
      awardLoveHearts(3);
      queueBooBoo('animalsHappy');
      celebrate();
      pop('🦋💗💗💗');
    }
  },

  TriggerMagicStardustExplosion(source,glow){
    if(!this.Scene)return;
    const sr=this.Scene.getBoundingClientRect();
    const r=source.getBoundingClientRect();
    const x=r.left-sr.left+r.width/2;
    const y=r.top-sr.top+r.height/2;

    for(let i=0;i<8;i++){
      const spark=document.createElement('div');
      spark.textContent='✨';
      spark.style.position='absolute';
      spark.style.left=x+'px';
      spark.style.top=y+'px';
      spark.style.fontSize='24px';
      spark.style.zIndex='50';
      spark.style.pointerEvents='none';
      spark.style.textShadow=`0 0 10px ${glow}`;
      this.Scene.appendChild(spark);

      const a=i*Math.PI/4;
      const d=55+Math.random()*40;
      spark.animate(
        [
          {transform:'translate(-50%,-50%) scale(1)',opacity:1},
          {transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(0)`,opacity:0}
        ],
        {duration:520,easing:'cubic-bezier(.1,.8,.3,1)'}
      );
      setTimeout(()=>spark.remove(),560);
    }
  },

  RemoveButterflyFromRegistry(id){
    const i=this.ActiveButterflies.findIndex(b=>b.id===id);
    if(i!==-1)this.ActiveButterflies.splice(i,1);
  },

  EndButterflyGame(){
    this.IsGameActive=false;

    if(this.SpawnIntervalId){
      clearInterval(this.SpawnIntervalId);
      this.SpawnIntervalId=null;
    }

    this.ActiveButterflies.forEach(b=>{
      if(b.raf)cancelAnimationFrame(b.raf);
      b.node?.remove();
    });
    this.ActiveButterflies=[];
    this.Scene=null;
  }
};
