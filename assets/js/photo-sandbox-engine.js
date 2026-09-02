
const PhotoSandboxEngine = {
  IsSandboxActive:false,
  ActivePhotoURI:null,
  CurrentFilterKey:'original',
  CurrentFrameKey:'none',
  ActivePointers:new Map(),
  GestureStart:null,

  FilterMatrix:{
    original:'none',
    bright:'brightness(1.25) contrast(1.05)',
    warm:'sepia(.25) saturate(1.3) hue-rotate(-10deg)',
    bw:'grayscale(100%) contrast(1.1)'
  },

  FrameMatrix:{
    none:{border:'0',shadow:'none'},
    hearts:{border:'14px solid #ff69b4',shadow:'inset 0 0 0 6px rgba(255,255,255,.75)'},
    stars:{border:'14px solid #ffd700',shadow:'inset 0 0 0 6px rgba(255,255,255,.75)'}
  },

  LaunchStickerSandbox(memoryIndex){
    if(memoryIndex<0 || !state.memories[memoryIndex])return;
    const m=state.memories[memoryIndex];
    this.IsSandboxActive=true;
    this.ActivePhotoURI=m.photo||ROOMS[m.room].img;
    this.CurrentFilterKey=m.filter||'original';
    this.CurrentFrameKey=m.frame||'none';

    this.EnsureWorkshopControls();
    this.ApplyStoredPhotoLook();
    queueBooBoo('stickerSandbox');
  },

  EnsureWorkshopControls(){
    const card=document.querySelector('#decorator .decor-card');
    const stage=document.getElementById('decorStage');
    if(!card||!stage)return;

    stage.style.position='relative';
    stage.style.overflow='hidden';

    let frame=document.getElementById('sandbox_frame_overlay');
    if(!frame){
      frame=document.createElement('div');
      frame.id='sandbox_frame_overlay';
      frame.style.position='absolute';
      frame.style.inset='0';
      frame.style.pointerEvents='none';
      frame.style.zIndex='8';
      frame.style.boxSizing='border-box';
      stage.appendChild(frame);
    }

    let workshop=document.getElementById('photo_workshop_tools');
    if(!workshop){
      workshop=document.createElement('div');
      workshop.id='photo_workshop_tools';
      workshop.style.display='grid';
      workshop.style.gridTemplateColumns='repeat(4,1fr)';
      workshop.style.gap='7px';
      workshop.style.margin='8px 0';

      const tools=[
        ['☀️','bright'],['🌅','warm'],['◼️','bw'],['↺','original'],
        ['💗','frame-hearts'],['⭐','frame-stars'],['⬜','frame-none'],['↔️','flip'],
        ['⬆️','front'],['⬇️','back'],['💬','words'],['✨','stickers']
      ];
      tools.forEach(([icon,cmd])=>{
        const b=document.createElement('button');
        b.type='button';
        b.textContent=icon;
        b.style.minHeight='48px';
        b.style.fontSize='25px';
        b.style.borderRadius='15px';
        b.style.touchAction='manipulation';
        b.onpointerdown=e=>{
          e.preventDefault();
          this.HandleWorkshopCommand(cmd);
        };
        workshop.appendChild(b);
      });

      const tray=document.getElementById('stickerTray');
      card.insertBefore(workshop,tray);
    }
  },

  HandleWorkshopCommand(cmd){
    if(cmd==='bright'||cmd==='warm'||cmd==='bw'||cmd==='original'){
      this.ApplyPhotoFilter(cmd); return;
    }
    if(cmd==='frame-hearts'){this.ApplyPictureFrameBorder('hearts');return;}
    if(cmd==='frame-stars'){this.ApplyPictureFrameBorder('stars');return;}
    if(cmd==='frame-none'){this.ApplyPictureFrameBorder('none');return;}
    if(cmd==='flip'){this.ExecuteStickerToolAction('flip_horizontal');return;}
    if(cmd==='front'){this.ExecuteStickerToolAction('depth_forward');return;}
    if(cmd==='back'){this.ExecuteStickerToolAction('depth_backward');return;}
    if(cmd==='words'){this.RenderWordStickerTray();return;}
    if(cmd==='stickers'){renderStickerSandbox();return;}
  },

  ApplyStoredPhotoLook(){
    if(editingMemoryIndex<0)return;
    const m=state.memories[editingMemoryIndex];
    const img=document.getElementById('decorPhoto');
    const frame=document.getElementById('sandbox_frame_overlay');
    if(img)img.style.filter=this.FilterMatrix[m.filter||'original']||'none';
    if(frame){
      const cfg=this.FrameMatrix[m.frame||'none']||this.FrameMatrix.none;
      frame.style.border=cfg.border;
      frame.style.boxShadow=cfg.shadow;
      frame.style.borderRadius=(m.frame&&m.frame!=='none')?'22px':'0';
    }
  },

  ApplyPhotoFilter(key){
    if(!this.IsSandboxActive || !this.FilterMatrix[key] || editingMemoryIndex<0)return;
    this.CurrentFilterKey=key;
    state.memories[editingMemoryIndex].filter=key;
    this.ApplyStoredPhotoLook();
    pop('✨');
  },

  ApplyPictureFrameBorder(key){
    if(!this.IsSandboxActive || !this.FrameMatrix[key] || editingMemoryIndex<0)return;
    this.CurrentFrameKey=key;
    state.memories[editingMemoryIndex].frame=key;
    this.ApplyStoredPhotoLook();
    pop(key==='hearts'?'💗':'⭐');
  },

  RenderWordStickerTray(){
    if(editingMemoryIndex<0)return;
    const tray=document.getElementById('stickerTray');
    if(!tray)return;
    tray.innerHTML='';

    WORD_STICKERS.forEach(text=>{
      const b=document.createElement('button');
      b.type='button';
      b.textContent=text;
      b.style.fontSize='14px';
      b.style.fontWeight='800';
      b.style.padding='8px 10px';
      b.style.borderRadius='16px';
      b.style.minWidth='92px';
      b.style.touchAction='manipulation';
      b.onpointerdown=e=>{
        e.preventDefault();
        this.StampStickerOntoCanvas(text,true);
      };
      tray.appendChild(b);
    });
  },

  StampStickerOntoCanvas(text,isWord=false){
    if(editingMemoryIndex<0)return;
    const m=state.memories[editingMemoryIndex];
    m.stickers=m.stickers||[];
    m.stickers.push({
      icon:text,
      x:50,y:50,scale:1,rotation:0,
      flipX:1,
      z:10+m.stickers.length,
      isWord:!!isWord
    });
    activeStickerIndex=m.stickers.length-1;
    renderStickerSandbox();
    if(isWord)this.SpeakPlacedWordSticker(text);
    else pop('✨');
  },

  SpeakPlacedWordSticker(text){
    if(text==='YAY!') queueBooBoo('purchaseSuccess');
    else if(text==='GOOD JOB!' || text==='PRINCESS JOURNI' || text==='SO SMART!') queueBooBoo('goodJobJourni');
    else if(text==='I LOVE YOU' || text==='BOO-BOO LOVES ME') queueBooBoo('affection');
  },

  ExecuteStickerToolAction(cmd){
    if(editingMemoryIndex<0 || activeStickerIndex<0)return;
    const m=state.memories[editingMemoryIndex];
    const st=m.stickers?.[activeStickerIndex];
    if(!st)return;

    st.scale=Number(st.scale||1);
    st.rotation=Number(st.rotation||0);
    st.flipX=Number(st.flipX||1);
    st.z=Number(st.z||10);

    if(cmd==='flip_horizontal')st.flipX*=-1;
    else if(cmd==='depth_forward')st.z+=1;
    else if(cmd==='depth_backward')st.z=Math.max(1,st.z-1);

    renderStickerSandbox();
  },

  BindStickerGestures(el,st,index){
    let dragStart=null;

    el.onpointerdown=e=>{
      e.preventDefault();
      e.stopPropagation();
      activeStickerIndex=index;
      try{el.setPointerCapture(e.pointerId)}catch(_){}
      this.ActivePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      dragStart={x:e.clientX,y:e.clientY,ox:st.x,oy:st.y};

      if(this.ActivePointers.size===2){
        const pts=[...this.ActivePointers.values()];
        const dx=pts[1].x-pts[0].x,dy=pts[1].y-pts[0].y;
        this.GestureStart={
          dist:Math.hypot(dx,dy),
          angle:Math.atan2(dy,dx)*180/Math.PI,
          scale:Number(st.scale||1),
          rotation:Number(st.rotation||0)
        };
      }
      renderStickerSandbox();
    };

    el.onpointermove=e=>{
      if(!el.hasPointerCapture(e.pointerId))return;
      this.ActivePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});

      if(this.ActivePointers.size>=2 && this.GestureStart){
        const pts=[...this.ActivePointers.values()].slice(0,2);
        const dx=pts[1].x-pts[0].x,dy=pts[1].y-pts[0].y;
        const dist=Math.max(1,Math.hypot(dx,dy));
        const angle=Math.atan2(dy,dx)*180/Math.PI;
        st.scale=Math.max(.4,Math.min(3,this.GestureStart.scale*(dist/this.GestureStart.dist)));
        st.rotation=this.GestureStart.rotation+(angle-this.GestureStart.angle);
        this.ApplyStickerTransform(el,st);
        return;
      }

      if(dragStart && this.ActivePointers.size===1){
        const layer=document.getElementById('stickerLayer');
        const r=layer.getBoundingClientRect();
        st.x=Math.max(4,Math.min(96,dragStart.ox+(e.clientX-dragStart.x)/r.width*100));
        st.y=Math.max(4,Math.min(96,dragStart.oy+(e.clientY-dragStart.y)/r.height*100));
        el.style.left=st.x+'%';
        el.style.top=st.y+'%';
      }
    };

    const end=e=>{
      this.ActivePointers.delete(e.pointerId);
      try{el.releasePointerCapture(e.pointerId)}catch(_){}
      if(this.ActivePointers.size<2)this.GestureStart=null;
      dragStart=null;
    };
    el.onpointerup=end;
    el.onpointercancel=end;
  },

  ApplyStickerTransform(el,st){
    const scale=Number(st.scale||1);
    const rot=Number(st.rotation||0);
    const flip=Number(st.flipX||1);
    el.style.transform=`translate(-50%,-50%) scale(${scale}) rotate(${rot}deg) scaleX(${flip})`;
    el.style.zIndex=String(st.z||10);
  },

  RenderEnhancedStickerSandbox(){
    if(editingMemoryIndex<0)return;
    const m=state.memories[editingMemoryIndex];
    const layer=document.getElementById('stickerLayer');
    const tray=document.getElementById('stickerTray');
    if(!layer||!tray)return;

    layer.innerHTML='';
    tray.innerHTML='';

    (m.stickers||[]).forEach((st,i)=>{
      st.scale=Number(st.scale||1);
      st.rotation=Number(st.rotation||0);
      st.flipX=Number(st.flipX||1);
      st.z=Number(st.z||10+i);

      const el=document.createElement('button');
      el.type='button';
      el.className='placed-sticker';
      el.textContent=st.icon;
      el.style.position='absolute';
      el.style.left=st.x+'%';
      el.style.top=st.y+'%';
      el.style.border='0';
      el.style.touchAction='none';
      el.style.userSelect='none';
      el.style.webkitUserSelect='none';

      if(st.isWord || (typeof st.icon==='string' && st.icon.length>3)){
        el.style.padding='6px 10px';
        el.style.background='linear-gradient(135deg,#fff,#fff0f5)';
        el.style.border='3px solid #ff1493';
        el.style.borderRadius='16px';
        el.style.color='#ff1493';
        el.style.fontWeight='800';
        el.style.fontSize='17px';
      }else{
        el.style.background='transparent';
        el.style.fontSize='42px';
      }

      if(i===activeStickerIndex){
        el.style.outline='3px dashed #ff1493';
        el.style.outlineOffset='5px';
      }
      this.ApplyStickerTransform(el,st);
      this.BindStickerGestures(el,st,i);
      layer.appendChild(el);
    });

    availableStickers().forEach(icon=>{
      const b=document.createElement('button');
      b.type='button';
      b.textContent=icon;
      b.style.touchAction='manipulation';
      b.onpointerdown=e=>{
        e.preventDefault();
        this.StampStickerOntoCanvas(icon,false);
      };
      tray.appendChild(b);
    });

    this.ApplyStoredPhotoLook();
  },

  CloseSandbox(){
    this.IsSandboxActive=false;
    this.ActivePointers.clear();
    this.GestureStart=null;
  }
};

// Patch the existing scrapbook decorator after the base game functions are defined.
(function(){
  const originalOpen=window.openDecorator;
  const originalClose=window.closeDecorator;
  const originalResize=window.resizeSticker;
  const originalRotate=window.rotateSticker;
  const originalDelete=window.deleteSticker;
  const originalSave=window.saveDecoratedMemory;
  const originalRender=window.renderStickerSandbox;

  window.openDecorator=function(i){
    originalOpen(i);
    PhotoSandboxEngine.LaunchStickerSandbox(i);
    PhotoSandboxEngine.RenderEnhancedStickerSandbox();
  };

  window.closeDecorator=function(){
    PhotoSandboxEngine.CloseSandbox();
    originalClose();
  };

  window.renderStickerSandbox=function(){
    if(PhotoSandboxEngine.IsSandboxActive){
      PhotoSandboxEngine.RenderEnhancedStickerSandbox();
    }else{
      originalRender();
    }
  };

  window.resizeSticker=function(f){
    originalResize(f);
    if(editingMemoryIndex>=0){
      const st=state.memories[editingMemoryIndex]?.stickers?.[activeStickerIndex];
      if(st && typeof st.flipX==='undefined')st.flipX=1;
      PhotoSandboxEngine.RenderEnhancedStickerSandbox();
    }
  };

  window.rotateSticker=function(deg){
    originalRotate(deg);
    if(editingMemoryIndex>=0)PhotoSandboxEngine.RenderEnhancedStickerSandbox();
  };

  window.deleteSticker=function(){
    originalDelete();
    if(editingMemoryIndex>=0)PhotoSandboxEngine.RenderEnhancedStickerSandbox();
  };

  window.saveDecoratedMemory=function(){
    if(editingMemoryIndex>=0){
      persist();
      queueBooBoo('savedPicture');
    }
    PhotoSandboxEngine.CloseSandbox();
    originalClose();
  };
})();
