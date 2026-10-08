(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const overlay = document.querySelector('#overlay');
  const overlayTitle = overlay.querySelector('strong');
  const overlayStatus = overlay.querySelector('span');
  const laneButtons = [...document.querySelectorAll('[data-lane]')];
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const pauseButton = document.querySelector('#pause');
  const soundButton = document.querySelector('#sound');
  const gameStatus = document.querySelector('#game-status');
  const W = canvas.width, H = canvas.height;
  const backgroundArt = new Image();
  const olegSprites = new Image();
  const upperCatchSprites = new Image();
  const emotionSprites = new Image();
  const directionalSprites = new Image();
  const missedSprite = new Image();
  const boxFlightSprites = new Image();
  const userLeftLow = new Image();
  const userLeftLowBox = new Image();
  const userLeftUp = new Image();
  const userLeftUpBox = new Image();
  const userLeftDropped = new Image();
  const investorFrames = Array.from({length:7},()=>new Image());
  const investorFrames2 = Array.from({length:6},()=>new Image());
  const balconyBack = new Image();
  const balconyFrontUp = new Image();
  const balconyFrontDown = new Image();
  const toxicItemSprites = new Image();
  const unicornItemSprites = new Image();
  const danceFrames = Array.from({length:8},()=>new Image());
  backgroundArt.src = 'assets/lcd-background-no-houses-user-v8.png';
  olegSprites.src = 'assets/oleg-sprites.png';
  upperCatchSprites.src = 'assets/oleg-upper-catch-v2.png';
  emotionSprites.src = 'assets/oleg-emotions-v2.png';
  directionalSprites.src = 'assets/oleg-four-directions-v3.png';
  missedSprite.src = 'assets/oleg-missed-v3.png';
  boxFlightSprites.src = 'assets/startup-box-flight-v4.png';
  userLeftLow.src = 'assets/oleg-left-low-user-v4.png';
  userLeftLowBox.src = 'assets/oleg-left-low-caught-user-v4.png';
  userLeftUp.src = 'assets/oleg-left-up-user-v4.png';
  userLeftUpBox.src = 'assets/oleg-left-up-caught-user-v4.png';
  userLeftDropped.src = 'assets/oleg-left-dropped-user-v4.png';
  investorFrames.forEach((image,i)=>image.src=`assets/investor-balcony-${String(i).padStart(2,'0')}-v7.png`);
  investorFrames2.forEach((image,i)=>image.src=`assets/investor2-balcony-${String(i).padStart(2,'0')}-v9.png`);
  balconyBack.src = 'assets/balcony-back-two-floor-user-v9.png';
  balconyFrontUp.src = 'assets/balcony-front-up-user-v9.png';
  balconyFrontDown.src = 'assets/balcony-front-down-user-v9.png';
  toxicItemSprites.src = 'assets/toxic-box-flight-v2.png';
  unicornItemSprites.src = 'assets/unicorn-flight-v2.png';
  danceFrames.forEach((image,i)=>image.src=`assets/oleg-dance-${String(i+1).padStart(2,'0')}-v1.png`);

  const allAssets = [backgroundArt,olegSprites,upperCatchSprites,emotionSprites,directionalSprites,missedSprite,boxFlightSprites,userLeftLow,userLeftLowBox,userLeftUp,userLeftUpBox,userLeftDropped,...investorFrames,...investorFrames2,balconyBack,balconyFrontUp,balconyFrontDown,toxicItemSprites,unicornItemSprites,...danceFrames];
  let assetsReady=false,loadedAssets=0;
  const trackAsset=image=>new Promise(resolve=>{
    const done=ok=>{loadedAssets++;overlayStatus.textContent=`${loadedAssets} / ${allAssets.length}`;resolve(ok)};
    if(image.complete)return done(Boolean(image.naturalWidth));
    image.addEventListener('load',()=>done(true),{once:true});
    image.addEventListener('error',()=>done(false),{once:true});
  });
  Promise.all(allAssets.map(trackAsset)).then(results=>{
    if(results.every(Boolean)){assetsReady=true;overlayTitle.textContent='СПАСИ СТАРТАПЫ';overlayStatus.textContent='Выбери режим игры';modeButtons.forEach(button=>button.disabled=false)}
    else{overlayTitle.textContent='ОШИБКА ЗАГРУЗКИ';overlayStatus.textContent='Обнови страницу, чтобы попробовать снова'}
  });

  const lanes = [
    [[260,140],[390,25],[435,65],[455,300]],
    [[220,400],[315,305],[405,325],[455,430]],
    [[700,140],[570,25],[525,65],[505,300]],
    [[740,400],[645,305],[555,325],[505,430]],
  ];
  const directionFrames = [
    [16,101,250,573],[285,37,250,635],[550,33,255,637],[825,71,250,601],
    [1095,21,250,653],[1370,66,248,633],[1640,67,250,607],[1910,118,252,555]
  ];
  const boxFrames = [
    [97,132,178,128],[441,131,156,135],[756,130,172,122],
    [1094,114,222,149],[1415,124,242,149],[1756,132,176,129]
  ];
  const toxicFrames = [
    [92,102,172,125],[403,98,230,136],[732,94,242,156],
    [1074,80,242,181],[1415,78,242,183],[1756,109,220,152]
  ];
  const unicornFrames = [
    [47,80,247,181],[398,55,228,231],[761,42,184,257],
    [1078,79,233,183],[1418,74,236,193],[1765,71,224,199]
  ];
  const DANCE_CROPS = [
    [117,254,243,423],[73,192,289,485],[154,253,187,415],[95,200,289,472],
    [57,251,300,420],[141,250,193,427],[120,246,247,433],[117,285,249,395]
  ];
  const ITEM_CHANCES = { unicorn:.04, toxic:.10 };
  const labels = ['AI','SaaS','WEB3','B2B','APP','$'];
  const hypeLines = [
    'ЕДЕМ В ЕДИНОРОГИ!','МАСШТАБИРУЕМСЯ!','РАУНД ЗАКРЫТ!',
    'ЮНИТ-ЭКОНОМИКА СОШЛАСЬ!','ПОШЁЛ ТРЕКШН!','ХОККЕЙНАЯ КЛЮШКА!',
    'PRODUCT–MARKET FIT!','ИНВЕСТОР В ВОСТОРГЕ!','X10 К ОЦЕНКЕ!',
    'ЭТО УЖЕ НЕ MVP!','СЖИГАЕМ КЭШ!','ПИВОТИМ!','СИНЕРГИЯ!','DISRUPT!'
  ];
  const unicornLines = ['ЕДЕМ В ЕДИНОРОГИ!','VALUATION В КОСМОС!','X10 К ОЦЕНКЕ!','РАУНД ЗАКРЫТ!'];
  const toxicLines = ['DUE DILIGENCE НЕ ПРОШЁЛ!','КЭШ-ФЛОУ ПОПЛЫЛ!','АКТИВ ОКАЗАЛСЯ ТОКСИЧНЫМ!','СЛИШКОМ МНОГО LEGACY!'];
  const CATCH_START = .44;
  const CATCH_END = .72;
  const TOXIC_REJECT_END = .52;
  const ITEM_RENDER_SIZE = 96;
  let game = fresh('A');
  let sound = true, audio, last = performance.now(), spawnClock = 0, id = 0;

  function fresh(mode){
    const firstActor=Math.random()<.5?0:1;
    return { running:false, paused:false, mode, score:0, lives:3, lane:1, missLane:1, items:[], reaction:'idle', reactionClock:0, message:'ВЫБЕРИ ИГРУ', fragments:[], sparks:[], dollarRain:[], poopBurst:[], catchAnim:null, lastDelta:0, danceQueued:false, nextDanceAt:18000+Math.random()*14000, throwTimers:[9999,9999,9999,9999], throwActors:[-1,-1,-1,-1], lastActor:firstActor, playTime:0, nextHypeAt:5000+Math.random()*5000, hypeText:'', hypeClock:0 };
  }
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const ink = () => css('--lcd-dark');
  const lcd = () => css('--lcd');
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const ease = t => 1 - Math.pow(1-t,3);

  function beep(kind){
    if(!sound) return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      const tone=(frequency,offset,duration,type='square',volume=.04)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+offset;o.type=type;o.frequency.value=frequency;g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+duration+.01)};
      if(kind==='unicorn'){
        [523,659,784,1047,1319].forEach((frequency,i)=>tone(frequency,i*.075,.16,'triangle',.055));
        tone(2093,.31,.22,'sine',.035);return;
      }
      if(kind==='toxic'){
        [185,128,82].forEach((frequency,i)=>tone(frequency,i*.07,.2,'sawtooth',.045));
        const length=Math.floor(audio.sampleRate*.24),buffer=audio.createBuffer(1,length,audio.sampleRate),data=buffer.getChannelData(0);
        for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
        const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain(),t=audio.currentTime;
        source.buffer=buffer;filter.type='lowpass';filter.frequency.value=520;gain.gain.setValueAtTime(.065,t);gain.gain.exponentialRampToValueAtTime(.001,t+.24);source.connect(filter).connect(gain).connect(audio.destination);source.start(t);return;
      }
      const notes = kind==='catch'?[520,760,1040]:kind==='miss'?[210,145,95]:kind==='over'?[220,185,150,110]:kind==='start'?[330,440,660]:[250];
      notes.forEach((frequency,i)=>tone(frequency,i*.065,.06));
    }catch(e){}
  }

  function line(x1,y1,x2,y2,w=5){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  function poly(points,w=5){ctx.lineWidth=w;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}
  function roundRect(x,y,w,h,r,fill=true,stroke=true){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
  function pathPoint(lane,t){
    const p=lanes[lane],u=clamp(t,0,1),v=1-u;
    return [
      v*v*v*p[0][0]+3*v*v*u*p[1][0]+3*v*u*u*p[2][0]+u*u*u*p[3][0],
      v*v*v*p[0][1]+3*v*v*u*p[1][1]+3*v*u*u*p[2][1]+u*u*u*p[3][1]
    ];
  }

  function background(){
    ctx.fillStyle=lcd();ctx.fillRect(0,0,W,H);
    if(backgroundArt.complete&&backgroundArt.naturalWidth)ctx.drawImage(backgroundArt,0,0,W,H);
    drawMirroredLayer(balconyBack);
  }

  function drawMirroredLayer(image){
    if(!image.complete||!image.naturalWidth)return;
    const offset=-8,width=H*(image.naturalWidth/image.naturalHeight)+8;
    ctx.drawImage(image,offset,0,width,H);
    ctx.save();ctx.translate(W,0);ctx.scale(-1,1);ctx.drawImage(image,offset,0,width,H);ctx.restore();
  }

  function animatedInvestors(floor){
    for(const lane of floor===0?[0,2]:[1,3]){
      const timer=game.throwTimers[lane],actor=game.throwActors[lane];
      if(timer>=900||actor<0)continue;
      const frames=actor===0?investorFrames:investorFrames2;
      if(frames.some(image=>!image.complete||!image.naturalWidth))continue;
      const frame=actor===0
        ? (timer<100?0:timer<230?1:timer<360?2:timer<480?3:timer<610?4:timer<750?5:6)
        : (timer<100?0:timer<250?1:timer<400?2:timer<550?3:timer<720?4:5);
      const image=frames[frame],dw=220,dh=183,dy=floor===0?30:270,side=lane>=2;
      ctx.save();
      if(side){ctx.translate(W,0);ctx.scale(-1,1);ctx.drawImage(image,-6,dy,dw,dh)}
      else ctx.drawImage(image,-6,dy,dw,dh);
      ctx.restore();
    }
  }

  function house(x,flip=1){
    ctx.save();ctx.translate(x,0);ctx.scale(flip,1);ctx.strokeStyle=ink();ctx.fillStyle=lcd();ctx.lineWidth=7;
    ctx.fillRect(-2,44,112,370);ctx.strokeRect(-2,44,112,370);ctx.fillStyle=ink();
    ctx.beginPath();ctx.moveTo(-10,54);ctx.lineTo(52,13);ctx.lineTo(121,54);ctx.closePath();ctx.fill();
    for(let y=95;y<350;y+=86){ctx.fillStyle=lcd();ctx.fillRect(18,y,30,47);ctx.strokeRect(18,y,30,47);ctx.fillRect(64,y,29,47);ctx.strokeRect(64,y,29,47)}
    ctx.fillStyle=ink();ctx.fillRect(-4,170,126,11);ctx.fillRect(-4,337,126,11);
    ctx.restore();
  }

  function investor(x,y,flip=1,variant=0){
    ctx.save();ctx.translate(x,y);ctx.scale(flip,1);ctx.strokeStyle=ink();ctx.fillStyle=lcd();ctx.lineWidth=6;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.fillStyle=ink();ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=lcd();ctx.beginPath();ctx.arc(1,4,19,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=ink();ctx.beginPath();ctx.arc(-7,0,7,0,Math.PI*2);ctx.arc(10,0,7,0,Math.PI*2);ctx.stroke();line(0,0,3,0,3);
    if(variant){ctx.beginPath();ctx.arc(2,8,17,.1,Math.PI-.1);ctx.stroke()}else{ctx.fillStyle=ink();ctx.fillRect(-22,-26,45,10)}
    ctx.fillStyle=ink();ctx.beginPath();ctx.moveTo(-25,31);ctx.quadraticCurveTo(0,15,32,33);ctx.lineTo(48,92);ctx.lineTo(-35,92);ctx.closePath();ctx.fill();
    ctx.strokeStyle=ink();ctx.beginPath();ctx.moveTo(24,38);ctx.quadraticCurveTo(58,33,79,57);ctx.stroke();ctx.beginPath();ctx.arc(84,60,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=lcd();ctx.strokeStyle=ink();roundRect(-49,76,115,47,3,true,true);ctx.fillStyle=ink();ctx.font='900 18px sans-serif';ctx.textAlign='center';ctx.fillText('ИНВЕСТОР',8,106);ctx.restore();
  }

  function face(x,y,state,scale=1){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.strokeStyle=ink();ctx.fillStyle=lcd();ctx.lineWidth=6;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.ellipse(0,0,42,49,-.08,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-37,-27);ctx.quadraticCurveTo(-45,-67,-12,-66);ctx.quadraticCurveTo(34,-68,43,-27);ctx.quadraticCurveTo(27,-45,15,-36);ctx.quadraticCurveTo(-4,-57,-17,-35);ctx.quadraticCurveTo(-29,-47,-37,-27);ctx.fillStyle=ink();ctx.fill();
    ctx.fillStyle=lcd();ctx.beginPath();ctx.arc(-14,-5,13,0,Math.PI*2);ctx.arc(16,-5,13,0,Math.PI*2);ctx.fill();ctx.stroke();line(-1,-5,3,-5,4);line(28,-2,38,2,4);
    ctx.fillStyle=ink();ctx.beginPath();ctx.moveTo(-27,15);ctx.quadraticCurveTo(0,50,30,14);ctx.quadraticCurveTo(17,52,0,42);ctx.quadraticCurveTo(-18,51,-27,15);ctx.fill();
    ctx.strokeStyle=lcd();ctx.lineWidth=3;
    if(state==='happy'){ctx.beginPath();ctx.arc(1,21,14,0,Math.PI);ctx.stroke()}
    else{ctx.strokeStyle=ink();ctx.beginPath();ctx.arc(1,39,15,Math.PI,Math.PI*2);ctx.stroke()}
    if(state==='cry'){
      ctx.fillStyle=ink();const drop=(performance.now()/7)%32;ctx.beginPath();ctx.ellipse(-17,12+drop,4,9,0,0,Math.PI*2);ctx.ellipse(18,22+(drop+14)%32,4,9,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function oleg(){
    if(!olegSprites.complete||!olegSprites.naturalWidth)return;
    if(game.reaction==='dance'&&danceFrames.every(image=>image.complete&&image.naturalWidth)){
      const frame=Math.min(danceFrames.length-1,Math.floor(game.reactionClock/130)),image=danceFrames[frame],src=DANCE_CROPS[frame];
      const height=270,width=height*(src[2]/src[3]);
      ctx.drawImage(image,...src,480-width/2,552-height,width,height);return;
    }
    if((game.reaction==='miss'||game.reaction==='toxic')&&userLeftDropped.complete&&userLeftDropped.naturalWidth){
      drawUserOleg(userLeftDropped,[28,245,344,440],game.missLane>=2,0);return;
    }
    if(game.reaction!=='gameover'&&userLeftLow.complete&&userLeftLow.naturalWidth){
      const upper=game.lane===0||game.lane===2;
      const caught=(game.reaction==='catch'||game.reaction==='unicorn')&&game.catchAnim?.t>300;
      const sprite=upper?(caught?userLeftUpBox:userLeftUp):(caught?userLeftLowBox:userLeftLow);
      const crop=upper?(caught?[68,68,298,605]:[55,145,305,530]):(caught?[68,222,300,452]:[65,222,300,452]);
      const bounce=caught?Math.sin(game.reactionClock*.025)*6:0;
      drawUserOleg(sprite,crop,game.lane>=2,bounce);return;
    }
    let pose=0;
    if(game.reaction==='catch')pose=game.catchAnim?.upper?1:2;
    if(game.reaction==='miss')pose=3;
    if(game.reaction==='gameover')pose=4;
    const sw=olegSprites.naturalWidth/5, sh=olegSprites.naturalHeight;
    const isFinal=game.reaction==='gameover';
    const height=isFinal?330:315, width=height*(sw/sh);
    const bounce=game.reaction==='catch'?Math.sin(game.reactionClock*.025)*8:0;
    const dx=480-width/2, dy=isFinal?250:265+bounce;
    const flip=!isFinal&&game.lane<2;
    ctx.save();
    if(flip){ctx.translate(960,0);ctx.scale(-1,1)}
    ctx.drawImage(olegSprites,pose*sw,0,sw,sh,dx,dy,width,height);
    ctx.restore();
  }

  function drawUserOleg(image,src,mirror=false,bounce=0){
    const scale=.58, w=src[2]*scale, h=src[3]*scale, y=552-h+bounce;
    ctx.save();ctx.translate(480,0);if(mirror)ctx.scale(-1,1);
    ctx.drawImage(image,...src,-w/2,y,w,h);ctx.restore();
  }

  function emotionPortrait(){
    if(!emotionSprites.complete||!emotionSprites.naturalWidth||game.reaction==='gameover')return;
    const danger=game.items.reduce((best,item)=>item.progress>(best?.progress||0)?item:best,null);
    let frame=-1;
    if(game.reaction==='catch')frame=game.score%3===0?4:3;
    else if(game.reaction==='miss')frame=6;
    else if(danger?.progress>.7)frame=2;
    else if(danger?.progress>.43)frame=1;
    if(frame<0)return;
    const sw=emotionSprites.naturalWidth/8,sh=emotionSprites.naturalHeight,w=112,h=112*(sh/sw);
    const pop=game.reaction==='catch'||game.reaction==='miss'?Math.min(1,game.reactionClock/120):1;
    ctx.save();ctx.globalAlpha=.9;ctx.translate(480,155);ctx.scale(pop,pop);ctx.drawImage(emotionSprites,frame*sw,0,sw,sh,-w/2,-h/2,w,h);ctx.restore();
  }

  function sadOleg(){
    const t=performance.now()/1000;ctx.save();ctx.translate(480,418);ctx.strokeStyle=ink();ctx.fillStyle=lcd();ctx.lineWidth=9;ctx.lineCap='round';ctx.lineJoin='round';
    face(0,-105,'cry',1.08);ctx.beginPath();ctx.moveTo(-42,-55);ctx.quadraticCurveTo(0,-82,43,-55);ctx.lineTo(32,25);ctx.lineTo(-34,25);ctx.closePath();ctx.fill();ctx.stroke();
    line(-27,20,-80,70,12);line(28,20,82,70,12);line(-80,70,-111,70,13);line(82,70,113,70,13);
    ctx.fillStyle=ink();for(let i=0;i<4;i++){const x=-27+i*18,y=-45+((t*75+i*23)%70);ctx.beginPath();ctx.ellipse(x,y,4,10,0,0,Math.PI*2);ctx.fill()}
    ctx.restore();
  }

  function spriteFrame(image,frames,frame,x,y,scale=1,mirror=false,loop=false,glow=false){
    if(!image.complete||!image.naturalWidth)return;
    const src=frames[loop?frame%frames.length:Math.min(frames.length-1,frame)],reference=frames[0],referenceScale=ITEM_RENDER_SIZE/Math.max(reference[2],reference[3]),areaScale=Math.sqrt((reference[2]*reference[3])/(src[2]*src[3])),dw=src[2]*referenceScale*areaScale*scale,dh=src[3]*referenceScale*areaScale*scale;
    ctx.save();ctx.translate(x,y);if(mirror)ctx.scale(-1,1);if(glow){ctx.shadowColor='#f3ce4d';ctx.shadowBlur=10}ctx.drawImage(image,...src,-dw/2,-dh/2,dw,dh);ctx.restore();
  }
  function startupBox(x,y,label,rotation=0,scale=1,frame=0){
    spriteFrame(boxFlightSprites,boxFrames,frame,x,y,scale,false,true);
  }
  function specialItem(x,y,type,scale=1,frame=0,mirror=false){
    const image=type==='unicorn'?unicornItemSprites:toxicItemSprites;
    const frames=type==='unicorn'?unicornFrames:toxicFrames;
    spriteFrame(image,frames,frame,x,y,scale,mirror,false,type==='unicorn');
  }
  function drawItem(x,y,item,scale=1,frame=0,rotation=Math.sin(item.progress*18)*.16){
    if(item.type==='unicorn'||item.type==='toxic')specialItem(x,y,item.type,scale,frame,item.lane>=2);
    else startupBox(x,y,item.label,rotation,scale,frame);
  }
  function startup(item){
    if(item.age<item.releaseAt)return;
    const [x,y]=pathPoint(item.lane,ease(item.progress)),special=item.type==='unicorn'||item.type==='toxic';
    const frame=item.type==='toxic'?Math.floor(item.progress*14):Math.floor(item.progress*(special?6:12));
    drawItem(x,y,item,1,frame);
  }
  function caughtBox(){
    const a=game.catchAnim;if(!a||a.t>360)return;
    const p=clamp(a.t/360,0,1), q=1-Math.pow(1-p,3);
    const target=[480+(a.lane<2?-54:54),a.upper?255:340];
    const x=a.x+(target[0]-a.x)*q, y=a.y+(target[1]-a.y)*q-28*Math.sin(p*Math.PI);
    drawItem(x,y,a,1-p*.28,Math.floor(a.t/(a.type==='toxic'?35:60)),(1-p)*a.rotation);
  }

  function drawPoop(p){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(p.size,p.size);ctx.fillStyle=ink();ctx.strokeStyle=lcd();ctx.lineWidth=.18;
    ctx.beginPath();ctx.arc(0,-.72,.33,0,Math.PI*2);ctx.arc(-.28,-.38,.47,0,Math.PI*2);ctx.arc(.28,-.38,.47,0,Math.PI*2);ctx.ellipse(0,.08,.78,.48,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=lcd();ctx.beginPath();ctx.arc(-.22,-.4,.09,0,Math.PI*2);ctx.arc(.22,-.4,.09,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function effects(dt){
    game.fragments.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=.0012*dt;f.rot+=f.vr*dt;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot);ctx.fillStyle=lcd();ctx.strokeStyle=ink();ctx.lineWidth=4;ctx.fillRect(-12,-9,24,18);ctx.strokeRect(-12,-9,24,18);ctx.restore()});
    game.fragments=game.fragments.filter(f=>f.y<570&&f.life-- >0);
    game.sparks.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=.00035*dt;s.life-=dt;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.sin(s.life*.015)*.18);ctx.fillStyle=ink();ctx.font='900 27px monospace';ctx.textAlign='center';ctx.fillText('$',0,0);ctx.restore()});game.sparks=game.sparks.filter(s=>s.life>0);
    game.dollarRain.forEach(d=>{d.y+=d.vy*dt;d.x+=Math.sin(d.y*.025+d.phase)*d.drift*dt;d.life-=dt;if(d.y>-20){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(Math.sin(d.y*.018+d.phase)*.28);ctx.fillStyle=ink();ctx.font=`900 ${d.size}px monospace`;ctx.textAlign='center';ctx.fillText('$',0,0);ctx.restore()}});game.dollarRain=game.dollarRain.filter(d=>d.life>0&&d.y<H+50);
    game.poopBurst.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.0005*dt;p.rot+=p.vr*dt;p.life-=dt;drawPoop(p)});game.poopBurst=game.poopBurst.filter(p=>p.life>0&&p.y<H+40);
  }

  function hud(){
    ctx.fillStyle=ink();ctx.textAlign='right';ctx.font='900 54px monospace';const scoreText=game.score<0?'-$'+String(Math.abs(game.score)).padStart(3,'0'):'$'+String(game.score).padStart(3,'0');ctx.fillText(scoreText,805,78);
    for(let i=0;i<3;i++){const x=235+i*40;ctx.beginPath();ctx.moveTo(x,74);ctx.bezierCurveTo(x-18,58,x-31,82,x,107);ctx.bezierCurveTo(x+31,82,x+18,58,x,74);if(i<game.lives)ctx.fill();else ctx.stroke()}
    ctx.textAlign='center';
    if(['catch','unicorn','toxic'].includes(game.reaction)&&game.reactionClock<650){ctx.font='900 34px monospace';const sign=game.lastDelta>=0?'+':'−';ctx.fillText(`${sign}$${Math.abs(game.lastDelta)}`,480,210-game.reactionClock*.05)}
    if(game.hypeText&&game.hypeClock<1800){
      const fade=game.hypeClock<1400?1:(1800-game.hypeClock)/400;
      let size=44;ctx.font=`900 ${size}px "Arial Narrow",Arial,sans-serif`;while(ctx.measureText(game.hypeText).width>650&&size>24){size--;ctx.font=`900 ${size}px "Arial Narrow",Arial,sans-serif`}
      const y=245-Math.min(105,game.hypeClock*.07);
      ctx.save();ctx.globalAlpha=clamp(fade,0,1);ctx.lineWidth=5;ctx.strokeStyle='rgba(36,48,29,.62)';ctx.strokeText(game.hypeText,480,y);ctx.fillStyle='#eee6d0';ctx.fillText(game.hypeText,480,y);ctx.restore();
    }
  }

  function draw(dt=16){
    ctx.clearRect(0,0,W,H);
    background();
    animatedInvestors(0);
    drawMirroredLayer(balconyFrontUp);
    animatedInvestors(1);
    drawMirroredLayer(balconyFrontDown);
    game.items.forEach(startup);caughtBox();oleg();effects(dt);hud();
    if(game.paused){ctx.fillStyle='rgba(155,170,120,.78)';ctx.fillRect(260,235,440,115);ctx.fillStyle=ink();ctx.textAlign='center';ctx.font='900 46px monospace';ctx.fillText('ПАУЗА',480,305)}
    gameStatus.textContent=`Счёт $${game.score}, жизни ${game.lives}, ${game.message}`;
  }

  function smash(lane){
    const end=lanes[lane][3];for(let i=0;i<7;i++)game.fragments.push({x:end[0]+(lane<2?-35:35),y:510,vx:(Math.random()-.5)*.28,vy:-Math.random()*.24-.08,rot:0,vr:(Math.random()-.5)*.014,life:90});
  }
  function celebrate(count=9){for(let i=0;i<count;i++)game.sparks.push({x:480+(Math.random()-.5)*100,y:320+(Math.random()-.5)*80,vx:(Math.random()-.5)*.08,vy:-Math.random()*.14-.03,life:650+Math.random()*350})}
  function rainDollars(){for(let i=0;i<42;i++)game.dollarRain.push({x:70+Math.random()*(W-140),y:-30-Math.random()*520,vy:.12+Math.random()*.12,drift:(Math.random()-.5)*.035,phase:Math.random()*Math.PI*2,size:22+Math.random()*20,life:3200+Math.random()*900})}
  function burstPoop(){for(let i=0;i<18;i++){const angle=-Math.PI*.92+Math.random()*Math.PI*.84,speed=.13+Math.random()*.18;game.poopBurst.push({x:480+(Math.random()-.5)*45,y:365+(Math.random()-.5)*55,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-.05,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.012,size:7+Math.random()*6,life:850+Math.random()*550})}}
  function showHype(lines){game.hypeText=lines[Math.floor(Math.random()*lines.length)];game.hypeClock=0}
  function rollItemType(){const roll=Math.random();return roll<ITEM_CHANCES.unicorn?'unicorn':roll<ITEM_CHANCES.unicorn+ITEM_CHANCES.toxic?'toxic':'startup'}
  function catchItem(item){
    const [x,y]=pathPoint(item.lane,ease(item.progress));
    const type=item.type||'startup';
    game.lastDelta=type==='unicorn'?1000:type==='toxic'?-2000:(game.mode==='A'?100:200);
    game.score+=game.lastDelta;game.reaction=type==='startup'?'catch':type;game.reactionClock=0;game.catchAnim={...item,upper:item.lane===0||item.lane===2,x,y,t:0,rotation:Math.sin(item.progress*18)*.16};
    if(type==='toxic'){game.missLane=item.lane;game.message='ТОКСИЧНЫЙ АКТИВ!';game.danceQueued=false;burstPoop();showHype(toxicLines);beep('toxic');return}
    if(type==='unicorn'){game.message='ЕДИНОРОГ!';game.danceQueued=false;rainDollars();celebrate(18);showHype(unicornLines);beep('unicorn');return}
    game.message=`ИГРА ${game.mode==='A'?'А':'Б'}`;
    if(game.playTime>=game.nextDanceAt){game.danceQueued=true;game.nextDanceAt=game.playTime+25000+Math.random()*20000}
    if(game.playTime>=game.nextHypeAt){game.hypeText=hypeLines[Math.floor(Math.random()*hypeLines.length)];game.hypeClock=0;game.nextHypeAt=game.playTime+5000+Math.random()*4000}
    celebrate();beep('catch');
  }
  function missItem(item){
    if(item.type==='toxic')return;
    game.lives--;game.reaction='miss';game.reactionClock=0;game.catchAnim=null;game.missLane=item.lane;game.message='КАК ЖЕ ТАК, ОЛЕГ?!';smash(item.lane);beep('miss');if(game.lives<=0){game.lives=0;game.running=false;game.reaction='gameover';game.message='GAME OVER · А/Б — РЕВАНШ';beep('over')}
  }

  function update(dt){
    if(!game.running||game.paused)return;
    game.playTime+=dt;if(game.hypeText)game.hypeClock+=dt;
    game.throwTimers.forEach((timer,lane)=>game.throwTimers[lane]=timer+dt);
    game.reactionClock+=dt;if(game.catchAnim)game.catchAnim.t+=dt;
    if(game.reaction==='catch'&&game.reactionClock>900){game.reaction=game.danceQueued?'dance':'idle';game.reactionClock=0;game.catchAnim=null;game.danceQueued=false;game.message=`ИГРА ${game.mode==='A'?'А':'Б'}`}
    else if((game.reaction==='miss'&&game.reactionClock>1050)||(game.reaction==='unicorn'&&game.reactionClock>1250)||(game.reaction==='toxic'&&game.reactionClock>1100)||(game.reaction==='dance'&&game.reactionClock>1040)){game.reaction='idle';game.reactionClock=0;game.catchAnim=null;game.message=`ИГРА ${game.mode==='A'?'А':'Б'}`}
    const progress=clamp(game.playTime/180000,0,1),ramp=progress*progress*(3-2*progress);
    const speed=game.mode==='A'?.00012+ramp*.00012:.000175+ramp*.000165;spawnClock+=dt;
    const spawnEvery=game.mode==='A'?1600-ramp*1000:1050-ramp*670;
    const cap=game.mode==='A'?(game.playTime>60000?2:1):(game.playTime>120000?4:game.playTime>45000?3:2);
    if(spawnClock>spawnEvery&&game.reaction==='idle'&&game.items.length<cap){
      spawnClock=0;
      const occupied=new Set(game.items.map(item=>item.lane)),free=[0,1,2,3].filter(lane=>!occupied.has(lane)&&game.throwTimers[lane]>=900),pool=free.length?free:[0,1,2,3].filter(lane=>!occupied.has(lane));
      const lane=pool[Math.floor(Math.random()*pool.length)],actor=1-game.lastActor,releaseAt=actor===0?750:720;
      game.lastActor=actor;game.throwTimers[lane]=0;game.throwActors[lane]=actor;
      game.items.push({id:id++,lane,actor,releaseAt,progress:0,age:0,type:rollItemType(),label:labels[id%labels.length]});
    }
    const survivors=[];for(const item of game.items){item.age+=dt;if(item.age>=item.releaseAt)item.progress+=dt*speed;if(item.type==='toxic'&&item.progress>=CATCH_START&&item.lane!==game.lane)item.rejected=true;if(item.rejected&&item.progress>=TOXIC_REJECT_END)continue;if(!item.rejected&&item.lane===game.lane&&item.progress>=CATCH_START&&item.progress<=CATCH_END)catchItem(item);else if(item.progress>=1)missItem(item);else survivors.push(item)}game.items=survivors;
  }
  function frame(now){const dt=Math.min(40,now-last);last=now;update(dt);draw(dt);requestAnimationFrame(frame)}

  function start(mode){if(!assetsReady)return;game=fresh(mode);game.running=true;game.message=`ИГРА ${mode==='A'?'А':'Б'}`;spawnClock=9999;overlay.classList.add('hidden');modeButtons.forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));pauseButton.textContent='ПАУЗА';beep('start')}
  function choose(lane){if(!game.running||game.paused)return;game.lane=lane;laneButtons.forEach(b=>b.classList.toggle('active',+b.dataset.lane===lane));const ready=game.items.filter(item=>!item.rejected&&item.lane===lane&&item.progress>=CATCH_START&&item.progress<=CATCH_END).sort((a,b)=>b.progress-a.progress)[0];if(ready){catchItem(ready);game.items=game.items.filter(item=>item!==ready)}else beep('move')}
  function pause(){if(!game.running)return;game.paused=!game.paused;game.message=game.paused?'ПАУЗА':`ИГРА ${game.mode==='A'?'А':'Б'}`;pauseButton.textContent=game.paused?'ПРОДОЛЖИТЬ':'ПАУЗА'}

  laneButtons.forEach(b=>b.addEventListener('pointerdown',()=>choose(+b.dataset.lane)));
  modeButtons.forEach(b=>b.addEventListener('click',()=>start(b.dataset.mode)));
  pauseButton.addEventListener('click',pause);
  soundButton.addEventListener('click',()=>{sound=!sound;soundButton.textContent=`ЗВУК: ${sound?'ВКЛ':'ВЫКЛ'}`;soundButton.setAttribute('aria-pressed',String(sound));if(sound)beep('move')});
  addEventListener('keydown',e=>{let lane;if(e.key==='ArrowLeft')lane=game.lane<2?game.lane:game.lane-2;if(e.key==='ArrowRight')lane=game.lane<2?game.lane+2:game.lane;if(e.key==='ArrowUp')lane=game.lane<2?0:2;if(e.key==='ArrowDown')lane=game.lane<2?1:3;if(e.key===' '){e.preventDefault();pause()}else if(lane!==undefined){e.preventDefault();choose(lane)}});
  requestAnimationFrame(frame);
})();
