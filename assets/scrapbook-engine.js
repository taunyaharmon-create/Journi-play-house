
const ScrapbookEngine = {
  IsAlbumOpen:false,
  ActiveTab:'babies',
  ActivePhotoId:null,
  EarnedStickersRegistry:[],

  StickerManifest:{
    decorative:['💗','⭐','👑','🌈','🦋','🌸','🎀','✨','🦄','🧸','🍼','🫧','🐶','🍓','🎈','🎂','💋','📷','💎'],
    words:['YAY!','GOOD JOB!','I LOVE YOU','BOO-BOO LOVES ME','MY BABY','MY FAMILY','PRINCESS JOURNI','SO SMART!','BEAUTIFUL!','BIG GIRL!','WE DID IT!'],
    lockedBaby:{
      ella_heart:{owner:'Ella',icon:'💗🎀'},
      ella_hug:{owner:'Ella',icon:'🤗🎀'},
      ella_crown:{owner:'Ella',icon:'👑🎀'},
      emma_heart:{owner:'Emma',icon:'💗🌸'},
      emma_hug:{owner:'Emma',icon:'🤗🌸'},
      emma_crown:{owner:'Emma',icon:'👑🌸'},
      jhenea_heart:{owner:'Jheneá',icon:'💗✨'},
      jhenea_hug:{owner:'Jheneá',icon:'🤗✨'},
      jhenea_crown:{owner:'Jheneá',icon:'👑✨'}
    }
  },

  InitializeRegistry(){
    try{
      this.EarnedStickersRegistry=JSON.parse(localStorage.getItem('journi_unlocked_stickers')||'[]');
      if(!Array.isArray(this.EarnedStickersRegistry))this.EarnedStickersRegistry=[];
    }catch(_){
      this.EarnedStickersRegistry=[];
    }
  },

  OpenScrapbookWorld(){
    this.InitializeRegistry();
    this.IsAlbumOpen=true;
    this.ActiveTab='babies';
    if(typeof activeScrapTab!=='undefined')activeScrapTab='babies';
    if(typeof show==='function')show('scrapbook');
    if(typeof renderMemories==='function')renderMemories();
    playBooBoo('scrapbookOpen');
  },

  SwitchCategoryTab(tabName){
    const map={
      MyBabies:'babies',
      Me:'me',
      MyFamily:'family',
      AtHome:'home',
      Outside:'outside',
      SpecialMemories:'special',
      All:'all'
    };
    const tab=map[tabName]||tabName||'all';
    this.ActiveTab=tab;
    if(typeof activeScrapTab!=='undefined')activeScrapTab=tab;
    if(typeof renderMemories==='function')renderMemories();
  },

  GetUnlockedStickerIcons(){
    this.InitializeRegistry();
    return this.EarnedStickersRegistry
      .map(id=>this.StickerManifest.lockedBaby[id]?.icon)
      .filter(Boolean);
  },

  TriggerStickerRewardPresentFlow(babySourceKey){
    this.InitializeRegistry();
    const ownerMap={ella:'Ella',emma:'Emma',jhenea:'Jheneá',Ella:'Ella',Emma:'Emma','Jheneá':'Jheneá'};
    const owner=ownerMap[babySourceKey]||babySourceKey;
    const pool=Object.keys(this.StickerManifest.lockedBaby)
      .filter(id=>this.StickerManifest.lockedBaby[id].owner===owner);

    const remaining=pool.filter(id=>!this.EarnedStickersRegistry.includes(id));
    if(!remaining.length)return;

    queueBooBoo('singleBabyFull');

    const overlay=document.createElement('div');
    overlay.id='reward_present_box_overlay';
    overlay.style.position='fixed';
    overlay.style.inset='0';
    overlay.style.zIndex='10000';
    overlay.style.background='rgba(28,18,48,.46)';
    overlay.style.display='flex';
    overlay.style.alignItems='center';
    overlay.style.justifyContent='center';
    overlay.style.touchAction='manipulation';

    const box=document.createElement('button');
    box.type='button';
    box.textContent='🎁';
    box.setAttribute('aria-label','Open present');
    box.style.width='210px';
    box.style.height='180px';
    box.style.border='8px solid white';
    box.style.borderRadius='42px';
    box.style.background='linear-gradient(135deg,#fff0f7,#ff9fc4)';
    box.style.fontSize='98px';
    box.style.boxShadow='0 18px 45px rgba(0,0,0,.3)';
    box.style.touchAction='manipulation';
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    box.animate(
      [{transform:'scale(.25) rotate(-8deg)'},{transform:'scale(1.12) rotate(3deg)'},{transform:'scale(1) rotate(0deg)'}],
      {duration:520,easing:'cubic-bezier(.175,.885,.32,1.275)'}
    );

    box.onpointerdown=e=>{
      e.preventDefault();
      this.BurstPresentOpenAndRevealSticker(owner,overlay);
    };
  },

  BurstPresentOpenAndRevealSticker(owner,overlay){
    const pool=Object.keys(this.StickerManifest.lockedBaby)
      .filter(id=>this.StickerManifest.lockedBaby[id].owner===owner);
    const remaining=pool.filter(id=>!this.EarnedStickersRegistry.includes(id));
    if(!remaining.length){
      overlay?.remove();
      return;
    }

    const id=remaining[Math.floor(Math.random()*remaining.length)];
    const icon=this.StickerManifest.lockedBaby[id].icon;
    this.EarnedStickersRegistry.push(id);
    localStorage.setItem('journi_unlocked_stickers',JSON.stringify(this.EarnedStickersRegistry));

    overlay.innerHTML='';
    const card=document.createElement('button');
    card.type='button';
    card.setAttribute('aria-label','Put sticker in scrapbook');
    card.style.width='270px';
    card.style.height='300px';
    card.style.border='8px solid white';
    card.style.borderRadius='44px';
    card.style.background='linear-gradient(135deg,#fff8fb,#ffc4da)';
    card.style.boxShadow='0 18px 48px rgba(0,0,0,.28)';
    card.style.display='flex';
    card.style.flexDirection='column';
    card.style.alignItems='center';
    card.style.justifyContent='center';
    card.style.gap='24px';
    card.style.touchAction='manipulation';
    card.innerHTML='<div style="font-size:96px">'+icon+'</div><div style="font-size:54px">📖✨</div>';
    overlay.appendChild(card);

    queueBooBoo('giftFromBooBoo');
    celebrate();

    card.onpointerdown=e=>{
      e.preventDefault();
      card.animate(
        [
          {transform:'translate(0,0) scale(1)',opacity:1},
          {transform:'translate(120px,320px) scale(.05)',opacity:0}
        ],
        {duration:760,easing:'cubic-bezier(.25,1,.5,1)'}
      );
      setTimeout(()=>{
        overlay.remove();
        if(typeof renderStickerSandbox==='function' && typeof editingMemoryIndex!=='undefined' && editingMemoryIndex>=0){
          renderStickerSandbox();
        }
      },790);
    };
  },

  CloseScrapbookEntirely(){
    this.IsAlbumOpen=false;
    if(typeof show==='function')show('family');
  }
};

ScrapbookEngine.InitializeRegistry();
