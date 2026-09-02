
const BackyardCareEngine = {
  IsGameActive:false,
  ActivePet:null,
  BrushStrokeCount:0,
  ActionProgress:0,
  DragNode:null,
  DragPointerId:null,
  DragOffset:{x:0,y:0},
  Scene:null,
  RewardGranted:false,
  Timers:[],

  PetRoster:{
    Bunny:{symbol:'🐰',tool:'🥕',toolType:'carrot',promptKey:'bunny',needed:1},
    Puppy:{symbol:'🐶',tool:'🧼',toolType:'soap',promptKey:'puppy',needed:4},
    Pony:{symbol:'🐴',tool:'🪮',toolType:'brush',promptKey:'pony',needed:4},
    Kitty:{symbol:'🐱',tool:'🧶',toolType:'yarn',promptKey:'kitten',needed:3}
  },

  AnimalLoveMeters:{Bunny:0,Puppy:0,Pony:0,Kitty:0},

  loadMeters(){
    Object.keys(this.AnimalLoveMeters).forEach(id=>{
      const raw=localStorage.getItem('love_meter_pet_'+id.toLowerCase());
      const n=parseInt(raw||'0',10);
      this.AnimalLoveMeters[id]=Number.isFinite(n)?Math.max(0,Math.min(5,n)):0;
    });
  },

  StartAnimalCareGame(petId){
    this.EndAnimalCareGame();
    if(!this.PetRoster[petId])return;

    this.loadMeters();
    this.IsGameActive=true;
    this.ActivePet={id:petId,...this.PetRoster[petId]};
    this.BrushStrokeCount=0;
    this.ActionProgress=0;
    this.RewardGranted=false;

    const scene=document.getElementById('activityScene');
    const prog=document.getElementById('activityProgress');
    if(!scene)return;
    this.Scene=scene;

    scene.innerHTML='';
    scene.style.position='relative';
    scene.style.display='block';
    scene.style.minHeight='510px';
    scene.style.overflow='hidden';
    scene.style.touchAction='none';
    scene.style.background='linear-gradient(#dff7ff,#f4e9ff 58%,#d9efc8)';

    const meter=this.AnimalLoveMeters[petId];
    if(prog) prog.textContent='💗'.repeat(meter)+'🤍'.repeat(5-meter);

    // Big pet in the middle.
    const pet=document.createElement('div');
    pet.id='pet_display_mesh';
    pet.textContent=this.ActivePet.symbol;
    pet.style.position='absolute';
    pet.style.left='50%';
    pet.style.top='105px';
    pet.style.transform='translateX(-50%)';
    pet.style.width='230px';
    pet.style.height='230px';
    pet.style.borderRadius='50%';
    pet.style.background='rgba(255,255,255,.55)';
    pet.style.border='7px solid white';
    pet.style.boxShadow='0 10px 25px rgba(0,0,0,.14)';
    pet.style.display='flex';
    pet.style.alignItems='center';
    pet.style.justifyContent='center';
    pet.style.fontSize='132px';
    pet.style.pointerEvents='none';
    scene.appendChild(pet);

    // Simple visual action counter: no reading needed.
    const actionMeter=document.createElement('div');
    actionMeter.id='pet_action_meter';
    actionMeter.style.position='absolute';
    actionMeter.style.left='50%';
    actionMeter.style.top='345px';
    actionMeter.style.transform='translateX(-50%)';
    actionMeter.style.fontSize='28px';
    actionMeter.textContent='🤍'.repeat(this.ActivePet.needed);
    scene.appendChild(actionMeter);

    const tool=document.createElement('button');
    tool.type='button';
    tool.id='pet_tool_interaction_btn';
    tool.textContent=this.ActivePet.tool;
    tool.className='activity-choice';
    tool.dataset.toolType=this.ActivePet.toolType;
    tool.style.position='absolute';
    tool.style.left='50%';
    tool.style.top='400px';
    tool.style.transform='translateX(-50%)';
    tool.style.width='112px';
    tool.style.height='96px';
    tool.style.fontSize='58px';
    tool.style.touchAction='none';
    tool.dataset.homeLeft='50%';
    tool.dataset.homeTop='400px';

    tool.onpointerdown=e=>this.beginToolDrag(e,tool);
    tool.onpointermove=e=>this.moveToolDrag(e,tool);
    tool.onpointerup=e=>this.endToolDrag(e,tool);
    tool.onpointercancel=e=>this.endToolDrag(e,tool);
    scene.appendChild(tool);

    playBooBoo(this.ActivePet.promptKey);
  },

  beginToolDrag(e,node){
    if(!this.IsGameActive || this.RewardGranted)return;
    e.preventDefault();
    this.DragNode=node;
    this.DragPointerId=e.pointerId;
    try{node.setPointerCapture(e.pointerId)}catch(_){}

    const r=node.getBoundingClientRect();
    this.DragOffset={x:e.clientX-r.left,y:e.clientY-r.top};

    const sr=this.Scene.getBoundingClientRect();
    // convert 50%-anchored starting position to pixels on first drag
    node.style.transform='none';
    node.style.left=(r.left-sr.left)+'px';
    node.style.top=(r.top-sr.top)+'px';
    node.style.zIndex='100';
  },

  moveToolDrag(e,node){
    if(this.DragNode!==node || this.DragPointerId!==e.pointerId)return;
    e.preventDefault();
    const sr=this.Scene.getBoundingClientRect();
    node.style.left=(e.clientX-sr.left-this.DragOffset.x)+'px';
    node.style.top=(e.clientY-sr.top-this.DragOffset.y)+'px';

    // Puppy/Pony feel like washing/brushing while the tool passes over the animal.
    if(this.ActivePet && (this.ActivePet.id==='Puppy' || this.ActivePet.id==='Pony')){
      const nr=node.getBoundingClientRect();
      const pr=document.getElementById('pet_display_mesh').getBoundingClientRect();
      const cx=nr.left+nr.width/2, cy=nr.top+nr.height/2;
      if(cx>pr.left && cx<pr.right && cy>pr.top && cy<pr.bottom){
        const now=performance.now();
        if(!node._lastStroke || now-node._lastStroke>380){
          node._lastStroke=now;
          this.ApplyToolInteraction(node.dataset.toolType);
        }
      }
    }
  },

  endToolDrag(e,node){
    if(this.DragNode!==node || this.DragPointerId!==e.pointerId)return;
    e.preventDefault();
    this.DragNode=null;
    this.DragPointerId=null;
    try{node.releasePointerCapture(e.pointerId)}catch(_){}

    if(!this.ActivePet || this.RewardGranted)return;

    const nr=node.getBoundingClientRect();
    const pet=document.getElementById('pet_display_mesh');
    const pr=pet.getBoundingClientRect();
    const cx=nr.left+nr.width/2, cy=nr.top+nr.height/2;
    const inside=cx>pr.left-25 && cx<pr.right+25 && cy>pr.top-25 && cy<pr.bottom+25;

    if(this.ActivePet.id==='Bunny' || this.ActivePet.id==='Kitty'){
      if(inside)this.ApplyToolInteraction(node.dataset.toolType);
      else{
        queueBooBoo('tryAnother');
        this.returnToolHome(node);
      }
    }else{
      // For wash/brush, if not enough strokes were logged, tool returns for another swipe.
      if(this.ActionProgress<this.ActivePet.needed){
        if(!inside) queueBooBoo('tryAnother');
        this.returnToolHome(node);
      }
    }
  },

  returnToolHome(node){
    if(!node || !this.Scene)return;
    const sr=this.Scene.getBoundingClientRect();
    const w=node.getBoundingClientRect().width;
    node.style.transition='left .32s ease,top .32s ease,transform .32s ease';
    node.style.left=(sr.width/2-w/2)+'px';
    node.style.top='400px';
    node.style.transform='none';
    this.Timers.push(setTimeout(()=>{ if(node) node.style.transition='none'; },340));
  },

  ApplyToolInteraction(toolType){
    if(!this.IsGameActive || !this.ActivePet || this.RewardGranted)return;
    if(toolType!==this.ActivePet.toolType){
      queueBooBoo('tryAnother');
      return;
    }

    if(this.ActionProgress>=this.ActivePet.needed)return;
    this.ActionProgress++;

    const actionMeter=document.getElementById('pet_action_meter');
    if(actionMeter){
      actionMeter.textContent='💗'.repeat(this.ActionProgress)+
        '🤍'.repeat(Math.max(0,this.ActivePet.needed-this.ActionProgress));
    }

    const pet=document.getElementById('pet_display_mesh');
    if(pet){
      pet.animate(
        [
          {transform:'translateX(-50%) scale(1) rotate(0deg)'},
          {transform:'translateX(-50%) scale(1.08) rotate(3deg)'},
          {transform:'translateX(-50%) scale(1) rotate(0deg)'}
        ],
        {duration:240}
      );
    }

    if(this.ActivePet.id==='Puppy') pop('🫧');
    else if(this.ActivePet.id==='Pony') pop('✨');
    else if(this.ActivePet.id==='Kitty') pop('💗');
    else pop('🥕');

    if(this.ActionProgress>=this.ActivePet.needed){
      this.CompletePetCare();
    }
  },

  CompletePetCare(){
    if(this.RewardGranted || !this.ActivePet)return;
    this.RewardGranted=true;

    const id=this.ActivePet.id;
    let meter=this.AnimalLoveMeters[id]||0;
    if(meter<5){
      meter++;
      this.AnimalLoveMeters[id]=meter;
      localStorage.setItem('love_meter_pet_'+id.toLowerCase(),String(meter));
      awardLoveHearts(1);
    }

    const prog=document.getElementById('activityProgress');
    if(prog) prog.textContent='💗'.repeat(meter)+'🤍'.repeat(5-meter);

    this.TriggerLoveBurstAnimation();
    queueBooBoo(meter===5?'animalsHappy':'correctAnimal');

    // Keep the completed pet scene visible rather than kicking her out automatically.
    const tool=document.getElementById('pet_tool_interaction_btn');
    if(tool){
      tool.style.pointerEvents='none';
      tool.style.opacity='.35';
    }
    const actionMeter=document.getElementById('pet_action_meter');
    if(actionMeter) actionMeter.textContent='👑💗';
  },

  TriggerLoveBurstAnimation(){
    if(!this.Scene)return;
    const pet=document.getElementById('pet_display_mesh');
    if(!pet)return;

    const sr=this.Scene.getBoundingClientRect();
    const pr=pet.getBoundingClientRect();
    const x=pr.left-sr.left+pr.width/2;
    const y=pr.top-sr.top+pr.height/2;

    for(let i=0;i<8;i++){
      const heart=document.createElement('div');
      heart.textContent=i%3===0?'✨':'💗';
      heart.style.position='absolute';
      heart.style.left=x+'px';
      heart.style.top=y+'px';
      heart.style.fontSize='28px';
      heart.style.zIndex='60';
      heart.style.pointerEvents='none';
      this.Scene.appendChild(heart);

      const a=i*Math.PI/4;
      const d=70+Math.random()*45;
      heart.animate(
        [
          {transform:'translate(-50%,-50%) scale(.7)',opacity:1},
          {transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(0)`,opacity:0}
        ],
        {duration:650,easing:'cubic-bezier(.08,.82,.17,1)'}
      );
      setTimeout(()=>heart.remove(),690);
    }
  },

  EndAnimalCareGame(){
    this.IsGameActive=false;
    this.DragNode=null;
    this.DragPointerId=null;
    this.Timers.forEach(t=>clearTimeout(t));
    this.Timers=[];
    this.Scene=null;
    this.ActivePet=null;
  }
};
