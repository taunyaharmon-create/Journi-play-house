
const WinCelebrationEngine = {
  IsOpen:false,
  Overlay:null,
  EffectLayer:null,
  LastVariant:-1,
  LastEffect:-1,
  Timers:[],

  WinVariants:[
    {title:'YOU DID IT!',sub:'Way to go, Journi!',badge:'YAY!',hero:'👑💗'},
    {title:'JOURNI WON!',sub:'Amazing! You helped Journi win!',badge:'Winner!',hero:'🏆✨'},
    {title:'Princess Perfect!',sub:"You're a SUPER STAR!",badge:'SUPER STAR!',hero:'👑⭐'},
    {title:'Good Job!',sub:'You Rock!',badge:'You Rock!',hero:'🌟💗'},
    {title:'So Smart!',sub:'Beautiful!',badge:'So Smart!',hero:'🧠✨'}
  ],

  StickerWords:['YAY!','Good Job!','You Rock!','So Smart!','Winner!','Beautiful!','SUPER STAR!'],

  Effects:[
    'star-burst',
    'heart-sparkle',
    'confetti-shower',
    'magic-wand',
    'crown-glow',
    'firework-fun',
    'rainbow-shine'
  ],

  randomDifferent(max,last){
    if(max<=1)return 0;
    let n=Math.floor(Math.random()*max);
    if(n===last)n=(n+1)%max;
    return n;
  },

  celebrate(options={}){
    const activity=document.getElementById('activityOverlay');
    const activityVisible=activity && !activity.classList.contains('hidden');

    // Outside a game (shop purchase, photo save, daily gift), keep celebration lightweight.
    if(!activityVisible){
      this.RunAmbientBurst(options.effect);
      return;
    }

    this.Close(false);

    const vi=this.randomDifferent(this.WinVariants.length,this.LastVariant);
    const ei=options.effect
      ? Math.max(0,this.Effects.indexOf(options.effect))
      : this.randomDifferent(this.Effects.length,this.LastEffect);
    this.LastVariant=vi;
    this.LastEffect=ei;

    const v=this.WinVariants[vi];
    this.IsOpen=true;

    const overlay=document.createElement('div');
    overlay.id='journi_win_popup';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label',v.title);
    overlay.style.position='fixed';
    overlay.style.inset='0';
    overlay.style.zIndex='8500';
    overlay.style.background='rgba(39,20,57,.48)';
    overlay.style.backdropFilter='blur(3px)';
    overlay.style.display='flex';
    overlay.style.alignItems='center';
    overlay.style.justifyContent='center';
    overlay.style.padding='18px';
    overlay.style.touchAction='manipulation';

    const card=document.createElement('div');
    card.style.position='relative';
    card.style.width='min(92vw,430px)';
    card.style.minHeight='520px';
    card.style.borderRadius='42px';
    card.style.border='8px solid white';
    card.style.background='linear-gradient(160deg,#fff9fd 0%,#ffe2f2 45%,#eadcff 100%)';
    card.style.boxShadow='0 24px 70px rgba(22,8,38,.38)';
    card.style.overflow='hidden';
    card.style.display='flex';
    card.style.flexDirection='column';
    card.style.alignItems='center';
    card.style.textAlign='center';
    card.style.padding='26px 18px 20px';

    const effect=document.createElement('div');
    effect.style.position='absolute';
    effect.style.inset='0';
    effect.style.pointerEvents='none';
    effect.style.overflow='hidden';
    effect.style.zIndex='1';
    card.appendChild(effect);
    this.EffectLayer=effect;

    const crown=document.createElement('div');
    crown.textContent=v.hero;
    crown.style.position='relative';
    crown.style.zIndex='3';
    crown.style.fontSize='78px';
    crown.style.lineHeight='1';
    crown.style.filter='drop-shadow(0 8px 12px rgba(0,0,0,.15))';
    crown.style.marginTop='8px';
    card.appendChild(crown);

    const title=document.createElement('div');
    title.textContent=v.title;
    title.style.position='relative';
    title.style.zIndex='3';
    title.style.fontSize='clamp(34px,9vw,50px)';
    title.style.fontWeight='1000';
    title.style.letterSpacing='-.8px';
    title.style.color='#d81b73';
    title.style.textShadow='0 3px 0 white';
    title.style.marginTop='14px';
    card.appendChild(title);

    const sub=document.createElement('div');
    sub.textContent=v.sub;
    sub.style.position='relative';
    sub.style.zIndex='3';
    sub.style.fontSize='clamp(20px,5.5vw,27px)';
    sub.style.fontWeight='850';
    sub.style.color='#6d3c87';
    sub.style.margin='8px 10px 12px';
    card.appendChild(sub);

    const sticker=document.createElement('div');
    sticker.textContent=this.StickerWords[Math.floor(Math.random()*this.StickerWords.length)];
    sticker.style.position='relative';
    sticker.style.zIndex='3';
    sticker.style.display='inline-flex';
    sticker.style.alignItems='center';
    sticker.style.justifyContent='center';
    sticker.style.minHeight='58px';
    sticker.style.padding='6px 22px';
    sticker.style.borderRadius='999px';
    sticker.style.background='linear-gradient(135deg,#ff5aa5,#ff8ac4)';
    sticker.style.border='5px solid white';
    sticker.style.boxShadow='0 8px 18px rgba(216,27,115,.25)';
    sticker.style.fontSize='clamp(21px,5.8vw,29px)';
    sticker.style.fontWeight='1000';
    sticker.style.color='white';
    sticker.style.transform='rotate(-3deg)';
    card.appendChild(sticker);

    const buttons=document.createElement('div');
    buttons.style.position='relative';
    buttons.style.zIndex='4';
    buttons.style.width='100%';
    buttons.style.display='grid';
    buttons.style.gridTemplateColumns='1fr 1fr';
    buttons.style.gap='10px';
    buttons.style.marginTop='auto';
    buttons.style.paddingTop='22px';

    const continueBtn=this.MakeButton('➡️','Continue',()=>this.Continue());
    const replayBtn=this.MakeButton('🔁','Keep Playing!',()=>this.KeepPlaying());
    const nextBtn=this.MakeButton('🎮','Next Game!',()=>this.NextGame());
    nextBtn.style.gridColumn='1 / -1';

    buttons.appendChild(continueBtn);
    buttons.appendChild(replayBtn);
    buttons.appendChild(nextBtn);
    card.appendChild(buttons);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    this.Overlay=overlay;

    card.animate(
      [
        {transform:'scale(.55) translateY(35px)',opacity:0},
        {transform:'scale(1.06) translateY(-5px)',opacity:1,offset:.72},
        {transform:'scale(1) translateY(0)',opacity:1}
      ],
      {duration:520,easing:'cubic-bezier(.175,.885,.32,1.275)'}
    );

    crown.animate(
      [
        {transform:'scale(.4) rotate(-12deg)'},
        {transform:'scale(1.25) rotate(7deg)'},
        {transform:'scale(1) rotate(0deg)'}
      ],
      {duration:650,delay:110,easing:'ease-out'}
    );

    sticker.animate(
      [
        {transform:'scale(.25) rotate(-18deg)',opacity:0},
        {transform:'scale(1.12) rotate(5deg)',opacity:1},
        {transform:'scale(1) rotate(-3deg)',opacity:1}
      ],
      {duration:520,delay:260,easing:'ease-out'}
    );

    this.RunEffect(this.Effects[ei],effect);
  },

  MakeButton(icon,label,handler){
    const b=document.createElement('button');
    b.type='button';
    b.setAttribute('aria-label',label);
    b.style.minHeight='86px';
    b.style.border='5px solid white';
    b.style.borderRadius='26px';
    b.style.background='linear-gradient(145deg,#fff,#ffe7f4)';
    b.style.boxShadow='0 7px 16px rgba(81,38,103,.16)';
    b.style.color='#752d78';
    b.style.fontWeight='950';
    b.style.fontSize='16px';
    b.style.display='flex';
    b.style.flexDirection='column';
    b.style.alignItems='center';
    b.style.justifyContent='center';
    b.style.gap='2px';
    b.style.touchAction='manipulation';

    const big=document.createElement('span');
    big.textContent=icon;
    big.style.fontSize='38px';
    const txt=document.createElement('span');
    txt.textContent=label;
    b.appendChild(big);
    b.appendChild(txt);

    b.onpointerdown=e=>{
      e.preventDefault();
      b.animate([{transform:'scale(1)'},{transform:'scale(.92)'},{transform:'scale(1)'}],{duration:180});
      handler();
    };
    return b;
  },

  Continue(){
    this.Close();
  },

  KeepPlaying(){
    this.Close();
    if(typeof activeActivity!=='undefined' && activeActivity && typeof renderActivityGame==='function'){
      this.Timers.push(setTimeout(()=>renderActivityGame(),120));
    }
  },

  NextGame(){
    this.Close();
    if(typeof currentRoom==='undefined'||!currentRoom||typeof ROOMS==='undefined')return;
    const acts=ROOMS[currentRoom]?.acts||[];
    if(!acts.length)return;

    const currentName=(typeof activeActivity!=='undefined'&&activeActivity)?activeActivity.name:null;
    let idx=acts.findIndex(a=>a[1]===currentName);
    idx=(idx+1)%acts.length;
    const next=acts[idx];
    if(next && typeof startActivity==='function'){
      if(typeof closeActivity==='function')closeActivity();
      this.Timers.push(setTimeout(()=>startActivity(next[1],next[0]),160));
    }
  },

  Close(animate=true){
    if(!this.Overlay){
      this.IsOpen=false;
      return;
    }
    const node=this.Overlay;
    this.Overlay=null;
    this.EffectLayer=null;
    this.IsOpen=false;

    if(animate){
      const a=node.animate(
        [{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.96)'}],
        {duration:180,easing:'ease-in'}
      );
      a.onfinish=()=>node.remove();
    }else node.remove();
  },

  RunEffect(name,layer){
    if(!layer)return;
    if(name==='star-burst')this.StarBurst(layer);
    else if(name==='heart-sparkle')this.HeartSparkle(layer);
    else if(name==='confetti-shower')this.ConfettiShower(layer);
    else if(name==='magic-wand')this.MagicWand(layer);
    else if(name==='crown-glow')this.CrownGlow(layer);
    else if(name==='firework-fun')this.FireworkFun(layer);
    else if(name==='rainbow-shine')this.RainbowShine(layer);
  },

  piece(layer,symbol,x,y,size,delay=0,duration=1000,dx=0,dy=-90,rot=0){
    const p=document.createElement('div');
    p.textContent=symbol;
    p.style.position='absolute';
    p.style.left=x+'%';
    p.style.top=y+'%';
    p.style.fontSize=size+'px';
    p.style.lineHeight='1';
    p.style.pointerEvents='none';
    p.style.zIndex='2';
    layer.appendChild(p);
    p.animate(
      [
        {transform:'translate(-50%,-50%) scale(.2) rotate(0deg)',opacity:0},
        {transform:'translate(-50%,-50%) scale(1.2) rotate('+(rot*.4)+'deg)',opacity:1,offset:.35},
        {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.3) rotate(${rot}deg)`,opacity:0}
      ],
      {duration,delay,easing:'ease-out'}
    ).onfinish=()=>p.remove();
  },

  StarBurst(layer){
    for(let i=0;i<20;i++){
      const a=Math.PI*2*i/20;
      this.piece(layer,i%3===0?'🌟':'⭐',50,44,18+(i%4)*4,i*24,900,
        Math.cos(a)*(85+Math.random()*65),Math.sin(a)*(85+Math.random()*65),180);
    }
  },

  HeartSparkle(layer){
    for(let i=0;i<22;i++){
      this.piece(layer,i%4===0?'✨':'💗',10+Math.random()*80,75+Math.random()*15,
        18+Math.random()*20,i*35,1150,(Math.random()-.5)*45,-100-Math.random()*170,80);
    }
  },

  ConfettiShower(layer){
    const bits=['💗','⭐','🎀','✨','👑','🌸'];
    for(let i=0;i<28;i++){
      this.piece(layer,bits[i%bits.length],5+Math.random()*90,-5,15+Math.random()*18,
        i*28,1300,(Math.random()-.5)*100,470+Math.random()*100,240);
    }
  },

  MagicWand(layer){
    const wand=document.createElement('div');
    wand.textContent='🪄';
    wand.style.position='absolute';
    wand.style.left='15%';
    wand.style.top='58%';
    wand.style.fontSize='56px';
    wand.style.zIndex='2';
    layer.appendChild(wand);
    wand.animate(
      [
        {transform:'translate(0,0) rotate(-25deg)'},
        {transform:'translate(240px,-190px) rotate(18deg)'},
        {transform:'translate(40px,-300px) rotate(-12deg)'}
      ],
      {duration:1500,easing:'ease-in-out'}
    ).onfinish=()=>wand.remove();
    for(let i=0;i<18;i++){
      this.piece(layer,'✨',18+i*3.5,62-i*2.2,16+(i%3)*5,i*55,700,20,-35,90);
    }
  },

  CrownGlow(layer){
    const glow=document.createElement('div');
    glow.textContent='👑';
    glow.style.position='absolute';
    glow.style.left='50%';
    glow.style.top='23%';
    glow.style.fontSize='116px';
    glow.style.filter='drop-shadow(0 0 25px gold)';
    glow.style.zIndex='2';
    layer.appendChild(glow);
    glow.animate(
      [
        {transform:'translate(-50%,-50%) scale(.5)',opacity:0},
        {transform:'translate(-50%,-50%) scale(1.25)',opacity:.85},
        {transform:'translate(-50%,-50%) scale(1)',opacity:.15}
      ],
      {duration:1700,easing:'ease-out'}
    ).onfinish=()=>glow.remove();
  },

  FireworkFun(layer){
    const centers=[[25,28],[75,34],[50,18]];
    centers.forEach((c,j)=>{
      for(let i=0;i<12;i++){
        const a=Math.PI*2*i/12;
        this.piece(layer,j===1?'💗':'✨',c[0],c[1],16,j*220+i*12,950,
          Math.cos(a)*80,Math.sin(a)*80,180);
      }
    });
  },

  RainbowShine(layer){
    const rain=document.createElement('div');
    rain.textContent='🌈';
    rain.style.position='absolute';
    rain.style.left='50%';
    rain.style.top='45%';
    rain.style.fontSize='210px';
    rain.style.zIndex='1';
    rain.style.opacity='.18';
    layer.appendChild(rain);
    rain.animate(
      [
        {transform:'translate(-50%,-50%) scale(.4)',opacity:0},
        {transform:'translate(-50%,-50%) scale(1.1)',opacity:.28},
        {transform:'translate(-50%,-50%) scale(1)',opacity:.08}
      ],
      {duration:1800,easing:'ease-out'}
    ).onfinish=()=>rain.remove();
    for(let i=0;i<14;i++)this.piece(layer,'✨',10+Math.random()*80,20+Math.random()*55,17,i*55,800,0,-45,90);
  },

  RunAmbientBurst(effectName){
    const layer=document.createElement('div');
    layer.style.position='fixed';
    layer.style.inset='0';
    layer.style.pointerEvents='none';
    layer.style.zIndex='7000';
    layer.style.overflow='hidden';
    document.body.appendChild(layer);
    const name=effectName||this.Effects[Math.floor(Math.random()*this.Effects.length)];
    this.RunEffect(name,layer);
    this.Timers.push(setTimeout(()=>layer.remove(),2100));
  }
};

// Existing game engines already call celebrate(). This makes those calls open
// the actual Journi win window without changing each mini-game one-by-one.
window.celebrate=function(options){
  WinCelebrationEngine.celebrate(options||{});
};
