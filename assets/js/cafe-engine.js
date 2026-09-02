const CafeEngine = {
  IsActive:false,
  CurrentSubGame:'Menu',
  StrawberryCount:0,
  TargetStrawberries:4,
  BakeProgressState:0,
  TableItemsPlaced:0,
  GroceryItemsPlaced:0,
  DragNode:null,
  DragPointerId:null,
  DragOffset:{x:0,y:0},
  Scene:null,
  RewardGranted:false,
  Timers:[],

  resetBase(){
    this.EndCafeGame();
    this.IsActive=true;
    this.RewardGranted=false;
    this.Scene=document.getElementById('activityScene');
    if(!this.Scene)return false;
    this.Scene.innerHTML='';
    this.Scene.style.position='relative';
    this.Scene.style.display='block';
    this.Scene.style.minHeight='500px';
    this.Scene.style.overflow='hidden';
    this.Scene.style.touchAction='none';
    this.Scene.style.background='linear-gradient(#fff8fb,#fff0d9)';
    return true;
  },

  setProgress(done,total){
    const p=document.getElementById('activityProgress');
    if(p) p.textContent='💗'.repeat(done)+'🤍'.repeat(Math.max(0,total-done));
  },

  awardOnce(amount,audio='finished'){
    if(this.RewardGranted)return;
    this.RewardGranted=true;
    awardLoveHearts(amount);
    queueBooBoo(audio);
    celebrate();
  },

  // 🍓 Fruit counting
  StartFruitCountingGame(){
    if(!this.resetBase())return;
    this.CurrentSubGame='SnackTime';
    this.StrawberryCount=0;
    this.setProgress(0,this.TargetStrawberries);
    playBooBoo('fruit');

    const title=document.createElement('div');
    title.textContent='🍓🍓🍓🍓 ➜ 🥣';
    title.style.textAlign='center';
    title.style.fontSize='38px';
    title.style.padding='8px';
    this.Scene.appendChild(title);

    const bowl=document.createElement('div');
    bowl.id='cafe_blender_target';
    bowl.textContent='🥣';
    bowl.style.position='absolute';
    bowl.style.left='50%';
    bowl.style.top='300px';
    bowl.style.transform='translateX(-50%)';
    bowl.style.fontSize='104px';
    bowl.style.transition='transform .15s ease';
    this.Scene.appendChild(bowl);

    const fruits=[
      ['strawberry','🍓'],['banana','🍌'],['strawberry','🍓'],['apple','🍎'],
      ['strawberry','🍓'],['orange','🍊'],['strawberry','🍓'],['grape','🍇']
    ];
    this.shuffle(fruits);

    const grid=document.createElement('div');
    grid.style.display='grid';
    grid.style.gridTemplateColumns='repeat(4,1fr)';
    grid.style.gap='12px';
    grid.style.padding='18px 16px';
    fruits.forEach(([type,emoji])=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='activity-choice';
      b.textContent=emoji;
      b.style.height='86px';
      b.style.fontSize='50px';
      b.style.touchAction='manipulation';
      b.onpointerdown=e=>{
        e.preventDefault();
        this.TapFruitNode(type,b);
      };
      grid.appendChild(b);
    });
    this.Scene.appendChild(grid);
  },

  TapFruitNode(type,node){
    if(!this.IsActive || this.CurrentSubGame!=='SnackTime' || node.dataset.used==='1')return;
    if(type==='strawberry'){
      node.dataset.used='1';
      node.style.opacity='.22';
      node.style.transform='scale(.75)';
      this.StrawberryCount++;
      this.setProgress(this.StrawberryCount,this.TargetStrawberries);
      const bowl=document.getElementById('cafe_blender_target');
      if(bowl){
        bowl.animate(
          [{transform:'translateX(-50%) scale(1)'},{transform:'translateX(-50%) scale(1.16) rotate(5deg)'},{transform:'translateX(-50%) scale(1)'}],
          {duration:220}
        );
      }
      pop('🍓');
      if(this.StrawberryCount>=this.TargetStrawberries){
        this.awardOnce(2,'goodCounting');
      }
    }else{
      queueBooBoo('lookAgain');
      node.animate(
        [{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],
        {duration:240}
      );
    }
  },

  // 🧁 Baking: toddler stirs the bowl 6 times, then decorates.
  StartBakingMiniGame(){
    if(!this.resetBase())return;
    this.CurrentSubGame='Bake';
    this.BakeProgressState=0;
    this.setProgress(0,6);
    playBooBoo('bake');

    const bowl=document.createElement('button');
    bowl.type='button';
    bowl.id='cafe_mixing_bowl';
    bowl.textContent='🥣';
    bowl.className='activity-choice';
    bowl.style.position='absolute';
    bowl.style.left='50%';
    bowl.style.top='135px';
    bowl.style.transform='translateX(-50%)';
    bowl.style.width='220px';
    bowl.style.height='220px';
    bowl.style.fontSize='116px';
    bowl.style.borderRadius='50%';
    bowl.style.touchAction='none';

    let lastAngle=null;
    let accumulated=0;
    const center=()=> {
      const r=bowl.getBoundingClientRect();
      return {x:r.left+r.width/2,y:r.top+r.height/2};
    };
    bowl.onpointerdown=e=>{
      if(!this.IsActive)return;
      e.preventDefault();
      bowl.setPointerCapture?.(e.pointerId);
      const c=center();
      lastAngle=Math.atan2(e.clientY-c.y,e.clientX-c.x);
    };
    bowl.onpointermove=e=>{
      if(lastAngle===null || !this.IsActive)return;
      e.preventDefault();
      const c=center();
      const a=Math.atan2(e.clientY-c.y,e.clientX-c.x);
      let d=a-lastAngle;
      if(d>Math.PI)d-=Math.PI*2;
      if(d<-Math.PI)d+=Math.PI*2;
      accumulated+=Math.abs(d);
      lastAngle=a;
      bowl.style.rotate=(accumulated*24)+'deg';

      if(accumulated>=Math.PI*1.35){
        accumulated=0;
        this.ProcessBakingStirStroke(bowl);
      }
    };
    bowl.onpointerup=()=>lastAngle=null;
    bowl.onpointercancel=()=>lastAngle=null;

    const hand=document.createElement('div');
    hand.textContent='☝🏽 ↻';
    hand.style.position='absolute';
    hand.style.left='50%';
    hand.style.top='380px';
    hand.style.transform='translateX(-50%)';
    hand.style.fontSize='42px';
    hand.style.pointerEvents='none';

    this.Scene.appendChild(bowl);
    this.Scene.appendChild(hand);
  },

  ProcessBakingStirStroke(bowl){
    if(!this.IsActive || this.CurrentSubGame!=='Bake')return;
    this.BakeProgressState++;
    this.setProgress(this.BakeProgressState,6);
    pop('✨');

    if(this.BakeProgressState===3){
      bowl.textContent='🧁';
    }
    if(this.BakeProgressState>=6){
      bowl.textContent='🧁✨';
      this.awardOnce(2,'finished');
    }
  },

  // 🧃 Hold the pitcher to pour.
  StartDrinkMiniGame(){
    if(!this.resetBase())return;
    this.CurrentSubGame='PourDrink';
    this.setProgress(0,1);
    playBooBoo('drink');

    const cup=document.createElement('div');
    cup.style.position='absolute';
    cup.style.left='50%';
    cup.style.top='230px';
    cup.style.transform='translateX(-50%)';
    cup.style.width='150px';
    cup.style.height='180px';
    cup.style.border='8px solid #fff';
    cup.style.borderTop='0';
    cup.style.borderRadius='0 0 34px 34px';
    cup.style.background='rgba(255,255,255,.45)';
    cup.style.overflow='hidden';

    const juice=document.createElement('div');
    juice.id='juice_fluid_layer';
    juice.style.position='absolute';
    juice.style.left='0';
    juice.style.right='0';
    juice.style.bottom='0';
    juice.style.height='0%';
    juice.style.background='linear-gradient(#ffb243,#ff7a3d)';
    cup.appendChild(juice);

    const pitcher=document.createElement('button');
    pitcher.type='button';
    pitcher.className='activity-choice';
    pitcher.textContent='🧃';
    pitcher.style.position='absolute';
    pitcher.style.left='50%';
    pitcher.style.top='75px';
    pitcher.style.transform='translateX(-50%)';
    pitcher.style.width='120px';
    pitcher.style.height='110px';
    pitcher.style.fontSize='62px';
    pitcher.style.touchAction='none';

    let holdStart=0, raf=null;
    const stop=()=>{
      if(raf) cancelAnimationFrame(raf);
      raf=null;
      holdStart=0;
      pitcher.style.transform='translateX(-50%) rotate(0deg)';
    };
    const tick=now=>{
      if(!holdStart || !this.IsActive)return;
      const pct=Math.min(1,(now-holdStart)/2200);
      juice.style.height=(pct*86)+'%';
      pitcher.style.transform='translateX(-50%) rotate(28deg)';
      if(pct>=1){
        stop();
        this.setProgress(1,1);
        this.awardOnce(1,'finished');
        return;
      }
      raf=requestAnimationFrame(tick);
    };
    pitcher.onpointerdown=e=>{
      e.preventDefault();
      if(this.RewardGranted)return;
      holdStart=performance.now();
      raf=requestAnimationFrame(tick);
    };
    pitcher.onpointerup=stop;
    pitcher.onpointercancel=stop;
    pitcher.onpointerleave=stop;

    this.Scene.appendChild(pitcher);
    this.Scene.appendChild(cup);
  },

  // 🛒 Drag each grocery to refrigerator or pantry.
  StartGrocerySorting(){
    if(!this.resetBase())return;
    this.CurrentSubGame='PutAwayGroceries';
    this.GroceryItemsPlaced=0;
    this.setProgress(0,4);
    playBooBoo('groceries');

    const fridge=this.makeDropZone('fridge','🧊','8%');
    const pantry=this.makeDropZone('pantry','🚪','62%');
    this.Scene.appendChild(fridge);
    this.Scene.appendChild(pantry);

    const items=[
      {id:'milk',emoji:'🥛',target:'fridge'},
      {id:'strawberry',emoji:'🍓',target:'fridge'},
      {id:'cereal',emoji:'🥣',target:'pantry'},
      {id:'cookie',emoji:'🍪',target:'pantry'}
    ];
    items.forEach((it,i)=>this.makeDraggableItem(it,40+i*98));
  },

  makeDropZone(id,emoji,left){
    const z=document.createElement('div');
    z.id='cafe_'+id;
    z.dataset.target=id;
    z.textContent=emoji;
    z.style.position='absolute';
    z.style.left=left;
    z.style.top='75px';
    z.style.width='30%';
    z.style.height='190px';
    z.style.border='5px dashed rgba(120,80,140,.35)';
    z.style.borderRadius='28px';
    z.style.background='rgba(255,255,255,.5)';
    z.style.display='flex';
    z.style.alignItems='center';
    z.style.justifyContent='center';
    z.style.fontSize='82px';
    return z;
  },

  makeDraggableItem(it,left){
    const node=document.createElement('button');
    node.type='button';
    node.id='item_'+it.id;
    node.className='activity-choice cafe-drag-item';
    node.dataset.itemType=it.id;
    node.dataset.target=it.target;
    node.textContent=it.emoji;
    node.style.position='absolute';
    node.style.left=left+'px';
    node.style.top='340px';
    node.style.width='84px';
    node.style.height='84px';
    node.style.fontSize='48px';
    node.style.touchAction='none';
    node.dataset.homeLeft=left;
    node.dataset.homeTop=340;

    node.onpointerdown=e=>this.beginDrag(e,node);
    node.onpointermove=e=>this.moveDrag(e,node);
    node.onpointerup=e=>this.endGroceryDrag(e,node);
    node.onpointercancel=e=>this.endGroceryDrag(e,node);
    this.Scene.appendChild(node);
  },

  beginDrag(e,node){
    if(!this.IsActive || node.dataset.placed==='1')return;
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

  endGroceryDrag(e,node){
    if(this.DragNode!==node || this.DragPointerId!==e.pointerId)return;
    e.preventDefault();
    this.DragNode=null; this.DragPointerId=null;
    const nr=node.getBoundingClientRect();
    let matched=null;
    ['fridge','pantry'].forEach(id=>{
      const z=document.getElementById('cafe_'+id);
      if(!z)return;
      const zr=z.getBoundingClientRect();
      const inside=(nr.left+nr.width/2)>zr.left && (nr.left+nr.width/2)<zr.right &&
                   (nr.top+nr.height/2)>zr.top && (nr.top+nr.height/2)<zr.bottom;
      if(inside) matched=id;
    });

    if(matched===node.dataset.target){
      node.dataset.placed='1';
      node.style.pointerEvents='none';
      node.style.opacity='.25';
      this.GroceryItemsPlaced++;
      this.setProgress(this.GroceryItemsPlaced,4);
      queueBooBoo('thereYouGo');
      if(this.GroceryItemsPlaced>=4)this.awardOnce(3,'finished');
    }else{
      queueBooBoo('lookAgain');
      node.style.transition='left .3s ease,top .3s ease';
      node.style.left=node.dataset.homeLeft+'px';
      node.style.top=node.dataset.homeTop+'px';
      this.Timers.push(setTimeout(()=>node.style.transition='none',320));
    }
  },

  // 🍽️ Table setting: plate, spoon, cup to matching shadows.
  StartTableSettingRoutine(){
    if(!this.resetBase())return;
    this.CurrentSubGame='RecipesSet';
    this.TableItemsPlaced=0;
    this.setProgress(0,3);
    playBooBoo('setTable');

    const table=document.createElement('div');
    table.style.position='absolute';
    table.style.left='8%';
    table.style.right='8%';
    table.style.top='70px';
    table.style.height='240px';
    table.style.background='linear-gradient(#e2b887,#bf8a59)';
    table.style.borderRadius='50px';
    table.style.border='7px solid white';
    this.Scene.appendChild(table);

    const specs=[
      {id:'plate',emoji:'🍽️',x:42,y:82},
      {id:'spoon',emoji:'🥄',x:200,y:88},
      {id:'cup',emoji:'🥤',x:300,y:50}
    ];

    specs.forEach((it,i)=>{
      const shadow=document.createElement('div');
      shadow.id='shadow_'+it.id;
      shadow.textContent=it.emoji;
      shadow.style.position='absolute';
      shadow.style.left=it.x+'px';
      shadow.style.top=it.y+'px';
      shadow.style.fontSize='58px';
      shadow.style.opacity='.18';
      table.appendChild(shadow);

      const node=document.createElement('button');
      node.type='button';
      node.className='activity-choice table-drag-item';
      node.dataset.toolId=it.id;
      node.textContent=it.emoji;
      node.style.position='absolute';
      node.style.left=(55+i*115)+'px';
      node.style.top='360px';
      node.style.width='88px';
      node.style.height='88px';
      node.style.fontSize='48px';
      node.style.touchAction='none';
      node.dataset.homeLeft=55+i*115;
      node.dataset.homeTop=360;
      node.onpointerdown=e=>this.beginDrag(e,node);
      node.onpointermove=e=>this.moveDrag(e,node);
      node.onpointerup=e=>this.endTableDrag(e,node,table);
      node.onpointercancel=e=>this.endTableDrag(e,node,table);
      this.Scene.appendChild(node);
    });
  },

  endTableDrag(e,node,table){
    if(this.DragNode!==node || this.DragPointerId!==e.pointerId)return;
    e.preventDefault();
    this.DragNode=null; this.DragPointerId=null;
    const shadow=document.getElementById('shadow_'+node.dataset.toolId);
    const nr=node.getBoundingClientRect();
    const sr=shadow.getBoundingClientRect();
    const dx=Math.abs((nr.left+nr.width/2)-(sr.left+sr.width/2));
    const dy=Math.abs((nr.top+nr.height/2)-(sr.top+sr.height/2));

    if(dx<110 && dy<110){
      const sceneR=this.Scene.getBoundingClientRect();
      node.style.left=(sr.left-sceneR.left+(sr.width-nr.width)/2)+'px';
      node.style.top=(sr.top-sceneR.top+(sr.height-nr.height)/2)+'px';
      node.style.pointerEvents='none';
      node.dataset.placed='1';
      shadow.style.opacity='0';
      this.TableItemsPlaced++;
      this.setProgress(this.TableItemsPlaced,3);
      queueBooBoo('thereYouGo');
      if(this.TableItemsPlaced>=3)this.awardOnce(3,'finished');
    }else{
      queueBooBoo('tryAnotherSpot');
      node.style.transition='left .3s ease,top .3s ease';
      node.style.left=node.dataset.homeLeft+'px';
      node.style.top=node.dataset.homeTop+'px';
      this.Timers.push(setTimeout(()=>node.style.transition='none',320));
    }
  },

  EndCafeGame(){
    this.IsActive=false;
    this.DragNode=null;
    this.DragPointerId=null;
    this.Timers.forEach(t=>clearTimeout(t));
    this.Timers=[];
    this.Scene=null;
  },

  shuffle(array){
    for(let i=array.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [array[i],array[j]]=[array[j],array[i]];
    }
    return array;
  }
};
