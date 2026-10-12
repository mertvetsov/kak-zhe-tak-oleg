
(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const overlay = document.querySelector('#overlay');
  const overlayTitle = overlay.querySelector('strong');
  const overlayStatus = overlay.querySelector('span');
  const laneButtons = [...document.querySelectorAll('[data-lane]')];
  const startButton = document.querySelector('#start');
  const pauseButton = document.querySelector('#pause');
  const soundButton = document.querySelector('#sound');
  const gameStatus = document.querySelector('#game-status');
  const W = canvas.width, H = canvas.height;
  const backgroundArt = new Image();
  const olegSprites = new Image();
  const emotionSprites = new Image();
  const boxFlightSprites = new Image();
  const userLeftLow = new Image();
  const userLeftLowBox = new Image();
  const userLeftUp = new Image();
  const userLeftUpBox = new Image();
  const underwearOlegSprites = Array.from({length:4},()=>new Image());
  const droppedCrySprites = new Image();
  const toxicSurpriseSprites = new Image();
  const investorSprites = Array.from({length:4},()=>new Image());
  const balconyBack = new Image();
  const balconyFrontUp = new Image();
  const balconyFrontDown = new Image();
  const toxicItemSprites = new Image();
  const unicornItemSprites = new Image();
  const underwearItemSprites = new Image();
  const cryingSprites = new Image();
  const achievementSprites = new Image();
  const newAchievementSprites = new Image();
  const danceSprites = [new Image(),new Image()];
  const SPRITE_ASSETS = {
    investors: [
      'assets/investor-young-7-frames-v3.png',
      'assets/investor-businesswoman-7-frames-v3.png',
      'assets/investor-banker-7-frames-v3.png',
      'assets/investor-dirty-briefs-7x512-v2.png',
    ],
    items: {
      normal: 'assets/item-box-normal-6-frames-v3.png',
      toxic: 'assets/item-box-toxic-6-frames-v3.png',
      unicorn: 'assets/item-unicorn-6-frames-v3.png',
      underwear: 'assets/item-dirty-briefs-6x512.png',
    },
  };
  backgroundArt.src = 'assets/oleg-new-background-green.png';
  olegSprites.src = 'assets/oleg-sprites.png';
  emotionSprites.src = 'assets/oleg-emotions-v2.png';
  userLeftLow.src = 'assets/oleg-left-low-user-v4.png';
  userLeftLowBox.src = 'assets/oleg-left-low-caught-user-v4.png';
  userLeftUp.src = 'assets/oleg-left-up-user-v4.png';
  userLeftUpBox.src = 'assets/oleg-left-up-caught-user-v4.png';
  [
    'assets/oleg-left-low-dirty-briefs.png',
    'assets/oleg-left-low-box-dirty-briefs.png',
    'assets/oleg-left-up-dirty-briefs.png',
    'assets/oleg-left-up-box-dirty-briefs.png',
  ].forEach((source,index)=>underwearOlegSprites[index].src=source);
  droppedCrySprites.src = 'assets/oleg-dropped-box-cry-loop-7x512-v2.png';
  toxicSurpriseSprites.src = 'assets/oleg-toxic-surprise-7x512-v4-style-match.png';
  SPRITE_ASSETS.investors.forEach((source,index)=>investorSprites[index].src=source);
  balconyBack.src = 'assets/balcony-back-two-floor-user-v9.png';
  balconyFrontUp.src = 'assets/balcony-front-up-user-v9.png';
  balconyFrontDown.src = 'assets/balcony-front-down-user-v9.png';
  boxFlightSprites.src = SPRITE_ASSETS.items.normal;
  toxicItemSprites.src = SPRITE_ASSETS.items.toxic;
  unicornItemSprites.src = SPRITE_ASSETS.items.unicorn;
  underwearItemSprites.src = SPRITE_ASSETS.items.underwear;
  cryingSprites.src = 'assets/oleg-crying-v1.png';
  achievementSprites.src = 'assets/startup-achievements-v2.png';
  newAchievementSprites.src = 'assets/startup-achievements-07-11-v1.png';
  danceSprites[0].src = 'assets/oleg-cringe-butt-dance-loop-7x512.png';
  danceSprites[1].src = 'assets/oleg-cringe-chicken-shimmy-loop-7x512.png';

  const allAssets = [backgroundArt,olegSprites,emotionSprites,boxFlightSprites,userLeftLow,userLeftLowBox,userLeftUp,userLeftUpBox,...underwearOlegSprites,droppedCrySprites,toxicSurpriseSprites,...investorSprites,balconyBack,balconyFrontUp,balconyFrontDown,toxicItemSprites,unicornItemSprites,underwearItemSprites,cryingSprites,achievementSprites,newAchievementSprites,...danceSprites];
  const resourceCount=allAssets.length+2;
  let assetsReady=false,loadedAssets=0,olegLines=null,underwearLines=null;
  const updateLoadStatus=()=>{loadedAssets++;overlayStatus.textContent=`${loadedAssets} / ${resourceCount}`};
  const trackAsset=image=>new Promise(resolve=>{
    const done=ok=>{updateLoadStatus();resolve(ok)};
    if(image.complete)return done(Boolean(image.naturalWidth));
    image.addEventListener('load',()=>done(true),{once:true});
    image.addEventListener('error',()=>done(false),{once:true});
  });
  const loadOlegLines=async()=>{
    try{
      const response=await fetch('resources/oleg-exclamations.json?v=1');
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json(),groups=['catch','unicorn','toxic'];
      if(!groups.every(group=>Array.isArray(data[group])&&data[group].length&&data[group].every(line=>typeof line==='string'&&line.trim())))throw new Error('Invalid exclamations file');
      olegLines=data;return true;
    }catch(error){console.error('Не удалось загрузить реплики Олега',error);return false}
    finally{updateLoadStatus()}
  };
  const loadUnderwearLines=async()=>{
    try{
      const response=await fetch('resources/underwear-exclamations.json?v=2');
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      if(!['activate','deactivate'].every(group=>Array.isArray(data[group])&&data[group].length&&data[group].every(line=>typeof line==='string'&&line.trim())))throw new Error('Invalid underwear exclamations file');
      underwearLines=data;return true;
    }catch(error){console.error('Не удалось загрузить реплики эффекта трусов',error);return false}
    finally{updateLoadStatus()}
  };
  Promise.all([...allAssets.map(trackAsset),loadOlegLines(),loadUnderwearLines()]).then(results=>{
    if(results.every(Boolean)){assetsReady=true;overlayTitle.textContent='СПАСИ СТАРТАПЫ';overlayStatus.textContent='Нажми СТАРТ';startButton.disabled=false}
    else{overlayTitle.textContent='ОШИБКА ЗАГРУЗКИ';overlayStatus.textContent='Обнови страницу, чтобы попробовать снова'}
  });

  const ANIMATION_CONFIG = {
    investors: {
      frames: 7,
      scale: .8,
      baseSize: 292,
      enterMs: 200,
      actionFrameMs: 110,
      exitMs: 200,
      positions: [
        { floor: 0, x: -18, y: 43,  slide: 100, mirror: false },
        { floor: 1, x: -18, y: 283, slide: 100, mirror: false },
        { floor: 0, x: 744, y: 43,  slide: 100, mirror: true },
        { floor: 1, x: 744, y: 283, slide: 100, mirror: true },
      ],
    },
    items: {
      frames: 6,
      scale: .65,
      baseSize: 341,
      normal: { mode: 'loop', frameMs: 105, spin: .0022 },
      unicorn: { mode: 'loop', frameMs: 115, spin: -.0020 },
      toxic: { mode: 'once-hold', frameMs: 130, spin: .0017, holdSpin: .0032 },
      underwear: { mode: 'loop', frameMs: 95, spin: .0026 },
    },
    trajectories: [
      [[160,145],[340,28],[430,70],[455,300]],
      [[160,405],[320,300],[415,330],[455,430]],
      [[800,145],[620,28],[530,70],[505,300]],
      [[800,405],[640,300],[545,330],[505,430]],
    ],
  };
  const investorActionMs = ANIMATION_CONFIG.investors.actionFrameMs * 5;
  const investorExitAt = ANIMATION_CONFIG.investors.enterMs + investorActionMs;
  const investorReleaseAt = ANIMATION_CONFIG.investors.enterMs + ANIMATION_CONFIG.investors.actionFrameMs * 4;
  const investorCycleMs = investorExitAt + ANIMATION_CONFIG.investors.exitMs;
  const directionFrames = [
    [16,101,250,573],[285,37,250,635],[550,33,255,637],[825,71,250,601],
    [1095,21,250,653],[1370,66,248,633],[1640,67,250,607],[1910,118,252,555]
  ];
  const CRYING_CROPS = [
    [67,40,122,175],[321,43,126,170],[578,44,124,168],[835,39,121,178],
    [1089,37,125,181],[1346,44,123,167],[1602,46,124,163],[1856,40,128,175]
  ];
  const ACHIEVEMENT_CROPS = [
    [0,58,81,801,233],[0,916,81,803,233],[0,55,354,802,233],
    [0,913,352,812,235],[0,55,616,800,240],[0,917,616,806,241],
    [1,55,80,806,244],[1,914,80,806,244],[1,55,350,806,244],
    [1,914,350,806,244],[1,55,620,806,244]
  ];
  const ITEM_CHANCES = { unicorn:.04, toxic:.10 };
  const UNDERWEAR_INVESTOR_INDEX = 3;
  const UNDERWEAR_INVESTOR_CHANCE = .18;
  const UNDERWEAR_EFFECT_DURATION_MS = 15000;
  const UNDERWEAR_OLEG_SCALE = .27;
  const UNDERWEAR_OLEG_FOOT_Y = 1480;
  const labels = ['AI','SaaS','WEB3','B2B','APP','$'];
  const CATCH_START = .70;
  const CATCH_END = .84;
  const TOXIC_REJECT_END = .77;
  const FLIGHT_SPEED_START = .00036;
  const FLIGHT_SPEED_END = .00060;
  const DIFFICULTY_RAMP_MS = 180000;
  const DANCE_FRAME_MS = 100;
  const DANCE_DURATION_MS = 1600;
  const DANCE_FOOT_Y = 499;
  const DROPPED_CRY_FRAME_MS = 120;
  const DROPPED_CRY_FOOT_Y = 499;
  const TOXIC_REACTION_FRAME_MS = 140;
  const TOXIC_REACTION_FOOT_Y = 499;
  let game = fresh();
  let sound = true, audio, last = performance.now(), spawnClock = 0, id = 0;

  function fresh(){
    return { running:false, paused:false, score:0, lives:3, lane:1, missLane:1, items:[], reaction:'idle', reactionClock:0, message:'НАЖМИ СТАРТ', fragments:[], sparks:[], dollarRain:[], championBurst:[], poopBurst:[], catchAnim:null, lastDelta:0, danceQueued:false, danceIndex:0, nextDanceAt:18000+Math.random()*14000, throwTimers:[9999,9999,9999,9999], throwActors:[-1,-1,-1,-1], playTime:0, nextHypeAt:5000+Math.random()*5000, hypeText:'', hypeClock:0, caughtBoxes:0, catchStreak:0, missedBoxes:0, movedSinceCatch:false, agileStreak:0, pivotLanes:[], firstStartupSpawned:false, oneLifeSince:null, underwearEffect:{active:false,remainingMs:0,durationMs:UNDERWEAR_EFFECT_DURATION_MS}, achievements:Array(ACHIEVEMENT_CROPS.length).fill(false), achievementQueue:[], achievement:null, achievementClock:0, gameOverCause:null, gameOverStartedAt:0, gameOverSoundPending:false, gameOverSoundPlayed:false };
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
      if(audio.state==='suspended'){audio.resume().then(()=>beep(kind)).catch(()=>{});return}
      const tone=(frequency,offset,duration,type='square',volume=.04)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+offset;o.type=type;o.frequency.value=frequency;g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+duration+.01)};
      if(kind==='unicorn'){
        [[523,0],[659,.11],[784,.22],[1047,.36],[1319,.5]].forEach(([frequency,offset])=>{tone(frequency,offset,.24,'triangle',.06);tone(frequency/2,offset,.18,'square',.018)});
        [1047,1319,1568].forEach(frequency=>tone(frequency,.68,.58,'triangle',.045));
        tone(2093,.72,.5,'sine',.035);return;
      }
      if(kind==='toxic'){
        const t=audio.currentTime;
        [[118,0,.48],[92,.12,.58],[71,.3,.72]].forEach(([frequency,offset,duration],i)=>{
          const oscillator=audio.createOscillator(),gain=audio.createGain();
          oscillator.type=i===1?'square':'sawtooth';oscillator.frequency.setValueAtTime(frequency,t+offset);oscillator.frequency.exponentialRampToValueAtTime(Math.max(38,frequency*.48),t+offset+duration);
          gain.gain.setValueAtTime(i===1?.022:.05,t+offset);gain.gain.exponentialRampToValueAtTime(.001,t+offset+duration);oscillator.connect(gain).connect(audio.destination);oscillator.start(t+offset);oscillator.stop(t+offset+duration+.02);
        });
        const length=Math.floor(audio.sampleRate*.82),buffer=audio.createBuffer(1,length,audio.sampleRate),data=buffer.getChannelData(0);
        for(let i=0;i<length;i++){const progress=i/length,pulse=.55+.45*Math.sin(progress*Math.PI*13);data[i]=(Math.random()*2-1)*pulse*Math.pow(1-progress,1.8)}
        const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
        source.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(680,t);filter.frequency.exponentialRampToValueAtTime(120,t+.82);gain.gain.setValueAtTime(.105,t);gain.gain.exponentialRampToValueAtTime(.001,t+.82);source.connect(filter).connect(gain).connect(audio.destination);source.start(t);source.stop(t+.84);return;
      }
      if(kind==='achievement'){
        [523,659,784,1047].forEach((frequency,i)=>tone(frequency,i*.08,.22,'square',.045));
        [1319,1568].forEach((frequency,i)=>tone(frequency,.34+i*.08,.28,'triangle',.055));return;
      }
      if(kind==='dance'){
        [[392,0],[523,.12],[659,.24],[523,.36],[784,.5],[659,.64],[1047,.8],[784,.96]].forEach(([frequency,offset])=>{tone(frequency,offset,.18,'square',.035);tone(frequency/2,offset,.2,'triangle',.026)});
        [523,659,784].forEach(frequency=>tone(frequency,1.12,.36,'triangle',.035));return;
      }
      if(kind==='underwearOn'){
        [[196,0],[784,.08],[247,.17],[988,.27],[165,.39],[1319,.52]].forEach(([frequency,offset],i)=>tone(frequency,offset,.2,i%2?'sawtooth':'square',.055));
        [98,123,147].forEach((frequency,i)=>tone(frequency,.08+i*.15,.42,'triangle',.035));return;
      }
      if(kind==='underwearOff'){
        [330,440,660,880].forEach((frequency,i)=>tone(frequency,i*.065,.15,'triangle',.042));return;
      }
      if(kind==='over'){
        tone(392,0,.28,'square',.045);tone(330,.34,.28,'square',.043);tone(262,.68,1.28,'triangle',.055);tone(988,2.12,.12,'square',.032);return;
      }
      const notes = kind==='catch'?[520,760,1040]:kind==='miss'?[210,145,95]:kind==='start'?[330,440,660]:[250];
      notes.forEach((frequency,i)=>tone(frequency,i*.065,.06));
    }catch(e){}
  }

  function line(x1,y1,x2,y2,w=5){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  function poly(points,w=5){ctx.lineWidth=w;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}
  function roundRect(x,y,w,h,r,fill=true,stroke=true){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
  function pathPoint(lane,t){
    const p=ANIMATION_CONFIG.trajectories[lane],u=clamp(t,0,1),v=1-u;
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

  function horizontalFrame(image,frameCount,frame,x,y,width,height,rotation=0,mirror=false){
    if(!image?.complete||!image.naturalWidth)return;
    const index=clamp(frame,0,frameCount-1),sx=Math.round(index*image.naturalWidth/frameCount),ex=Math.round((index+1)*image.naturalWidth/frameCount);
    ctx.save();ctx.translate(x+width/2,y+height/2);ctx.rotate(rotation);if(mirror)ctx.scale(-1,1);ctx.drawImage(image,sx,0,ex-sx,image.naturalHeight,-width/2,-height/2,width,height);ctx.restore();
  }

  function animatedInvestors(floor){
    const config=ANIMATION_CONFIG.investors,size=config.baseSize*config.scale;
    for(const lane of floor===0?[0,2]:[1,3]){
      const timer=game.throwTimers[lane],actor=game.throwActors[lane],position=config.positions[lane];
      if(timer>=investorCycleMs||actor<0)continue;
      let frame,y=position.y;
      if(timer<config.enterMs){frame=0;y+=position.slide*(1-ease(timer/config.enterMs))}
      else if(timer<investorExitAt)frame=1+Math.min(4,Math.floor((timer-config.enterMs)/config.actionFrameMs));
      else{frame=6;y+=position.slide*ease((timer-investorExitAt)/config.exitMs)}
      horizontalFrame(investorSprites[actor],config.frames,frame,position.x,y,size,size,0,position.mirror);
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
    if(game.reaction==='gameover'&&game.gameOverCause==='toxic'&&toxicSurpriseSprites.complete&&toxicSurpriseSprites.naturalWidth){
      const elapsed=performance.now()-game.gameOverStartedAt,openingDuration=7*TOXIC_REACTION_FRAME_MS;
      const frame=elapsed<openingDuration?Math.min(6,Math.floor(elapsed/TOXIC_REACTION_FRAME_MS)):5+Math.floor((elapsed-openingDuration)/220)%2;
      const size=300,y=552-size*TOXIC_REACTION_FOOT_Y/512;
      horizontalFrame(toxicSurpriseSprites,7,frame,480-size/2,y,size,size,0,game.missLane>=2);return;
    }
    if(game.reaction==='gameover'&&cryingSprites.complete&&cryingSprites.naturalWidth){
      const frame=Math.floor(performance.now()/170)%CRYING_CROPS.length,src=CRYING_CROPS[frame],height=210,width=height*(src[2]/src[3]);
      ctx.drawImage(cryingSprites,...src,480-width/2,552-height,width,height);return;
    }
    const danceSprite=danceSprites[game.danceIndex]||danceSprites[0];
    if(game.reaction==='dance'&&danceSprite.complete&&danceSprite.naturalWidth){
      const frame=Math.floor(game.reactionClock/DANCE_FRAME_MS)%7,size=270,y=552-size*DANCE_FOOT_Y/512;
      horizontalFrame(danceSprite,7,frame,480-size/2,y,size,size);return;
    }
    if(game.reaction==='miss'&&droppedCrySprites.complete&&droppedCrySprites.naturalWidth){
      const frame=Math.floor(game.reactionClock/DROPPED_CRY_FRAME_MS)%7,size=300,y=552-size*DROPPED_CRY_FOOT_Y/512;
      horizontalFrame(droppedCrySprites,7,frame,480-size/2,y,size,size,0,game.missLane>=2);return;
    }
    if(game.reaction==='toxic'&&toxicSurpriseSprites.complete&&toxicSurpriseSprites.naturalWidth){
      const frame=Math.min(6,Math.floor(game.reactionClock/TOXIC_REACTION_FRAME_MS)),size=300,y=552-size*TOXIC_REACTION_FOOT_Y/512;
      horizontalFrame(toxicSurpriseSprites,7,frame,480-size/2,y,size,size,0,game.missLane>=2);return;
    }
    if(game.reaction!=='gameover'&&userLeftLow.complete&&userLeftLow.naturalWidth){
      const upper=game.lane===0||game.lane===2;
      const caught=(game.reaction==='catch'||game.reaction==='unicorn')&&game.catchAnim?.t>300;
      if(game.underwearEffect.active){
        const sprite=underwearOlegSprites[upper?(caught?3:2):(caught?1:0)],bounce=caught?Math.sin(game.reactionClock*.025)*6:0;
        drawUnderwearOleg(sprite,game.lane>=2,bounce);return;
      }
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

  function drawUnderwearOleg(image,mirror=false,bounce=0){
    const width=image.naturalWidth*UNDERWEAR_OLEG_SCALE,height=image.naturalHeight*UNDERWEAR_OLEG_SCALE,y=552-UNDERWEAR_OLEG_FOOT_Y*UNDERWEAR_OLEG_SCALE+bounce;
    ctx.save();ctx.translate(480,0);if(mirror)ctx.scale(-1,1);
    ctx.drawImage(image,-width/2,y,width,height);ctx.restore();
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

  function itemAnimation(item,elapsed){
    const type=item.type==='startup'?'normal':item.type||'normal',config=ANIMATION_CONFIG.items[type],rawFrame=Math.floor(elapsed/config.frameMs),frame=config.mode==='loop'?rawFrame%ANIMATION_CONFIG.items.frames:Math.min(ANIMATION_CONFIG.items.frames-1,rawFrame);
    const duration=config.frameMs*ANIMATION_CONFIG.items.frames;
    const rotation=config.mode==='once-hold'
      ? elapsed<duration
        ? config.spin*elapsed+(config.holdSpin-config.spin)*elapsed*elapsed/(2*duration)
        : (config.spin+config.holdSpin)*duration/2+config.holdSpin*(elapsed-duration)
      : config.spin*elapsed;
    return {frame,rotation};
  }
  function drawItem(x,y,item,scale=1,elapsed=0,rotationOverride=null){
    const type=item.type==='startup'?'normal':item.type||'normal',image=type==='unicorn'?unicornItemSprites:type==='toxic'?toxicItemSprites:type==='underwear'?underwearItemSprites:boxFlightSprites;
    const animation=itemAnimation(item,elapsed),size=ANIMATION_CONFIG.items.baseSize*ANIMATION_CONFIG.items.scale*scale;
    horizontalFrame(image,ANIMATION_CONFIG.items.frames,animation.frame,x-size/2,y-size/2,size,size,rotationOverride??animation.rotation);
  }
  function startup(item){
    if(item.age<item.releaseAt)return;
    const [x,y]=pathPoint(item.lane,item.progress);
    drawItem(x,y,item,1,item.age-item.releaseAt);
  }
  function caughtBox(){
    const a=game.catchAnim;if(!a||a.t>360)return;
    const p=clamp(a.t/360,0,1), q=1-Math.pow(1-p,3);
    const target=[480+(a.lane<2?-54:54),a.upper?255:340];
    const x=a.x+(target[0]-a.x)*q, y=a.y+(target[1]-a.y)*q-28*Math.sin(p*Math.PI);
    const rotation=a.type==='toxic'?itemAnimation(a,a.flightElapsed+a.t).rotation:(1-p)*a.rotation;
    drawItem(x,y,a,1,a.flightElapsed+a.t,rotation);
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
    game.championBurst.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.00012*dt;p.rot+=p.vr*dt;p.life-=dt;const fade=clamp(p.life/350,0,1);ctx.save();ctx.globalAlpha=fade;ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=ink();ctx.strokeStyle=lcd();ctx.lineWidth=2;if(p.kind==='dollar'){ctx.font=`900 ${p.size*2}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeText('$',0,0);ctx.fillText('$',0,0)}else{ctx.beginPath();for(let point=0;point<10;point++){const radius=point%2?p.size*.42:p.size,angle=-Math.PI/2+point*Math.PI/5,x=Math.cos(angle)*radius,y=Math.sin(angle)*radius;point?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.stroke();ctx.fill()}ctx.restore()});game.championBurst=game.championBurst.filter(p=>p.life>0);
    game.poopBurst.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.0005*dt;p.rot+=p.vr*dt;p.life-=dt;drawPoop(p)});game.poopBurst=game.poopBurst.filter(p=>p.life>0&&p.y<H+40);
  }

  function gameoverDollarDrift(){
    if(game.reaction!=='gameover')return;
    const t=performance.now()*.001;
    for(let i=0;i<5;i++){
      const travel=(t*.16+i/5)%1,side=i%2?-1:1,x=480+side*(52+travel*65)+Math.sin(t*1.5+i)*7,y=500-travel*205;
      ctx.save();ctx.globalAlpha=Math.sin(Math.PI*travel)*.85;ctx.translate(x,y);ctx.rotate(side*(travel-.5)*.35);ctx.fillStyle=ink();ctx.strokeStyle=lcd();ctx.lineWidth=2;ctx.font=`900 ${24+i%2*4}px monospace`;ctx.textAlign='center';ctx.strokeText('$',0,0);ctx.fillText('$',0,0);ctx.restore();
    }
  }

  function hud(){
    const gameover=game.reaction==='gameover';
    if(!gameover){
      ctx.fillStyle=ink();ctx.textAlign='right';ctx.font='900 54px monospace';const scoreText=game.score<0?'-$'+String(Math.abs(game.score)).padStart(3,'0'):'$'+String(game.score).padStart(3,'0');ctx.fillText(scoreText,805,78);
      for(let i=0;i<3;i++){const x=235+i*40;ctx.beginPath();ctx.moveTo(x,74);ctx.bezierCurveTo(x-18,58,x-31,82,x,107);ctx.bezierCurveTo(x+31,82,x+18,58,x,74);if(i<game.lives)ctx.fill();else ctx.stroke()}
      ctx.textAlign='center';
      if(['catch','unicorn','toxic','underwear'].includes(game.reaction)&&game.reactionClock<650){ctx.font='900 34px monospace';const sign=game.lastDelta>=0?'+':'−';ctx.fillText(`${sign}$${Math.abs(game.lastDelta)}`,480,210-game.reactionClock*.05)}
    }
    if(game.achievement!==null){
      const [sheet,...src]=ACHIEVEMENT_CROPS[game.achievement],image=sheet===0?achievementSprites:newAchievementSprites,enter=clamp(game.achievementClock/240,0,1),fade=game.achievementClock<2200?1:(2600-game.achievementClock)/400,width=560,height=width*(src[3]/src[2]),y=190+(1-ease(enter))*100;
      if(image.complete&&image.naturalWidth){ctx.save();ctx.globalAlpha=clamp(fade,0,1);ctx.drawImage(image,...src,480-width/2,y-height/2,width,height);ctx.restore()}
    }
    else if(!gameover&&game.hypeText&&game.hypeClock<1800){
      const fade=game.hypeClock<1400?1:(1800-game.hypeClock)/400;
      let size=44;ctx.font=`900 ${size}px "Arial Narrow",Arial,sans-serif`;while(ctx.measureText(game.hypeText).width>650&&size>24){size--;ctx.font=`900 ${size}px "Arial Narrow",Arial,sans-serif`}
      const y=245-Math.min(105,game.hypeClock*.07);
      ctx.save();ctx.globalAlpha=clamp(fade,0,1);ctx.lineWidth=5;ctx.strokeStyle='rgba(36,48,29,.62)';ctx.strokeText(game.hypeText,480,y);ctx.fillStyle='#eee6d0';ctx.fillText(game.hypeText,480,y);ctx.restore();
    }
    if(gameover&&game.achievement===null){
      const time=formatTime(game.playTime),unlocked=game.achievements.filter(Boolean).length;
      ctx.textAlign='center';ctx.font='900 68px "Arial Narrow",Arial,sans-serif';ctx.lineWidth=7;ctx.strokeStyle=ink();ctx.fillStyle='#eee6d0';ctx.strokeText('РАЗОЧАРОВАНИЕ',480,198);ctx.fillText('РАЗОЧАРОВАНИЕ',480,198);
      ctx.font='900 31px "Arial Narrow",Arial,sans-serif';ctx.lineWidth=5;ctx.strokeStyle='rgba(36,48,29,.72)';ctx.fillStyle='#eee6d0';ctx.textAlign='left';
      ctx.strokeText(`СЧЁТ: $${game.score}`,250,278);ctx.fillText(`СЧЁТ: $${game.score}`,250,278);ctx.strokeText(`ВРЕМЯ: ${time}`,250,326);ctx.fillText(`ВРЕМЯ: ${time}`,250,326);
      ctx.strokeText(`КОРОБОК: ${game.caughtBoxes}`,575,278);ctx.fillText(`КОРОБОК: ${game.caughtBoxes}`,575,278);ctx.strokeText(`ДОСТИЖЕНИЙ: ${unlocked}/${game.achievements.length}`,575,326);ctx.fillText(`ДОСТИЖЕНИЙ: ${unlocked}/${game.achievements.length}`,575,326);
    }
  }

  function draw(dt=16){
    ctx.clearRect(0,0,W,H);
    background();
    animatedInvestors(0);
    drawMirroredLayer(balconyFrontUp);
    animatedInvestors(1);
    drawMirroredLayer(balconyFrontDown);
    game.items.forEach(startup);caughtBox();gameoverDollarDrift();oleg();effects(dt);hud();
    if(game.paused){ctx.fillStyle='rgba(155,170,120,.78)';ctx.fillRect(260,235,440,115);ctx.fillStyle=ink();ctx.textAlign='center';ctx.font='900 46px monospace';ctx.fillText('ПАУЗА',480,305)}
    gameStatus.textContent=`Счёт $${game.score}, жизни ${game.lives}, ${game.message}`;
  }

  function smash(lane){
    const end=ANIMATION_CONFIG.trajectories[lane][3];for(let i=0;i<7;i++)game.fragments.push({x:end[0]+(lane<2?-35:35),y:510,vx:(Math.random()-.5)*.28,vy:-Math.random()*.24-.08,rot:0,vr:(Math.random()-.5)*.014,life:90});
  }
  function celebrate(count=9){for(let i=0;i<count;i++)game.sparks.push({x:480+(Math.random()-.5)*100,y:320+(Math.random()-.5)*80,vx:(Math.random()-.5)*.08,vy:-Math.random()*.14-.03,life:650+Math.random()*350})}
  function rainDollars(){for(let i=0;i<42;i++)game.dollarRain.push({x:70+Math.random()*(W-140),y:-30-Math.random()*520,vy:.12+Math.random()*.12,drift:(Math.random()-.5)*.035,phase:Math.random()*Math.PI*2,size:22+Math.random()*20,life:3200+Math.random()*900})}
  function burstChampion(){for(let i=0;i<64;i++){const angle=Math.PI*2*i/64+(Math.random()-.5)*.16,speed=.13+Math.random()*.19;game.championBurst.push({kind:i%3?'star':'dollar',x:480+Math.cos(angle)*38,y:345+Math.sin(angle)*46,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-.025,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.018,size:5+Math.random()*7,life:850+Math.random()*650})}}
  function burstPoop(){for(let i=0;i<18;i++){const angle=-Math.PI*.92+Math.random()*Math.PI*.84,speed=.13+Math.random()*.18;game.poopBurst.push({x:480+(Math.random()-.5)*45,y:365+(Math.random()-.5)*55,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-.05,rot:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.012,size:7+Math.random()*6,life:850+Math.random()*550})}}
  function showHype(lines){game.hypeText=lines[Math.floor(Math.random()*lines.length)];game.hypeClock=0}
  function activateUnderwearEffect(){game.underwearEffect.active=true;game.underwearEffect.remainingMs=game.underwearEffect.durationMs;showHype(underwearLines.activate);beep('underwearOn')}
  function deactivateUnderwearEffect(playSound=true){if(!game.underwearEffect.active)return;game.underwearEffect.active=false;game.underwearEffect.remainingMs=0;if(playSound){showHype(underwearLines.deactivate);beep('underwearOff')}}
  function updateUnderwearEffect(dt){if(!game.underwearEffect.active)return;game.underwearEffect.remainingMs=Math.max(0,game.underwearEffect.remainingMs-dt);if(game.underwearEffect.remainingMs===0)deactivateUnderwearEffect()}
  function rollItemType(){const roll=Math.random();return roll<ITEM_CHANCES.unicorn?'unicorn':roll<ITEM_CHANCES.unicorn+ITEM_CHANCES.toxic?'toxic':'startup'}
  function formatTime(ms){const seconds=Math.floor(ms/1000),minutes=Math.floor(seconds/60);return `${String(minutes).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
  function showNextAchievement(){if(game.achievement!==null||!game.achievementQueue.length)return;game.achievement=game.achievementQueue.shift();game.achievementClock=0;game.hypeText='';game.hypeClock=0;beep('achievement')}
  function unlockAchievement(index){if(game.achievements[index])return false;game.achievements[index]=true;game.achievementQueue.push(index);game.hypeText='';game.hypeClock=0;showNextAchievement();return true}
  function playPendingGameoverSound(){if(game.reaction==='gameover'&&game.gameOverSoundPending&&!game.gameOverSoundPlayed&&game.achievement===null&&!game.achievementQueue.length){game.gameOverSoundPending=false;game.gameOverSoundPlayed=true;beep('over')}}
  function advanceAchievement(dt){if(game.achievement===null){showNextAchievement();playPendingGameoverSound();return}game.achievementClock+=dt;if(game.achievementClock>=2600){game.achievement=null;game.achievementClock=0;showNextAchievement();playPendingGameoverSound()}}
  function markOneLife(){if(game.lives===1&&game.oneLifeSince===null)game.oneLifeSince=game.playTime}
  function queueRandomDance(){game.danceIndex=Math.floor(Math.random()*danceSprites.length);game.danceQueued=true}
  function triggerGameover(cause='miss'){deactivateUnderwearEffect(false);game.lives=0;game.running=false;game.reaction='gameover';game.reactionClock=0;game.catchAnim=null;game.hypeText='';game.hypeClock=0;game.gameOverCause=cause;game.gameOverStartedAt=performance.now();game.message='РАЗОЧАРОВАНИЕ · СТАРТ — РЕВАНШ';game.gameOverSoundPending=true;if(game.caughtBoxes===0)unlockAchievement(5);playPendingGameoverSound()}
  function catchItem(item){
    const [x,y]=pathPoint(item.lane,item.progress);
    const type=item.type||'startup';
    game.lastDelta=type==='unicorn'?1000:type==='toxic'?-2000:200;
    const flightElapsed=Math.max(0,item.age-item.releaseAt),rotation=itemAnimation(item,flightElapsed).rotation;
    game.score+=game.lastDelta;game.reaction=type==='startup'?'catch':type;game.reactionClock=0;game.catchAnim={...item,upper:item.lane===0||item.lane===2,x,y,t:0,flightElapsed,rotation};
    if(type==='toxic'){const lostWhileBlind=game.underwearEffect.active;game.catchStreak=0;game.agileStreak=0;game.pivotLanes=[];game.movedSinceCatch=false;game.lives=Math.max(0,game.lives-1);markOneLife();game.missLane=item.lane;game.message='ТОКСИЧНЫЙ АКТИВ!';game.danceQueued=false;burstPoop();showHype(olegLines.toxic);if(game.lives===0){triggerGameover(lostWhileBlind?'miss':'toxic');return}deactivateUnderwearEffect();beep('toxic');return}
    if(type==='underwear'){game.movedSinceCatch=false;game.message='ТРУСЫ НА ГОЛОВЕ!';game.danceQueued=false;beep('catch');activateUnderwearEffect();return}
    let achievementUnlocked=game.score>=10000&&unlockAchievement(10);
    if(type==='startup'){
      game.caughtBoxes++;game.catchStreak++;
      if(game.catchStreak>=50)achievementUnlocked=unlockAchievement(9)||achievementUnlocked;
      game.agileStreak=game.movedSinceCatch?game.agileStreak+1:0;game.movedSinceCatch=false;if(game.agileStreak>=10)achievementUnlocked=unlockAchievement(3)||achievementUnlocked;
      game.pivotLanes.push(item.lane);game.pivotLanes=game.pivotLanes.slice(-4);if(game.pivotLanes.length===4&&new Set(game.pivotLanes).size===4)achievementUnlocked=unlockAchievement(4)||achievementUnlocked;
    }
    if(type==='unicorn'){game.movedSinceCatch=false;game.message='ЕДИНОРОГ!';queueRandomDance();rainDollars();burstChampion();if(!achievementUnlocked&&game.achievement===null)showHype(olegLines.unicorn);beep('unicorn');return}
    game.message='ИГРА';
    if(game.playTime>=game.nextDanceAt){queueRandomDance();game.nextDanceAt=game.playTime+25000+Math.random()*20000}
    if(!achievementUnlocked&&game.achievement===null&&game.playTime>=game.nextHypeAt){game.hypeText=olegLines.catch[Math.floor(Math.random()*olegLines.catch.length)];game.hypeClock=0;game.nextHypeAt=game.playTime+5000+Math.random()*4000}
    celebrate();if(!achievementUnlocked)beep('catch');
  }
  function missItem(item){
    if(item.type==='toxic'||item.type==='underwear')return;
    const streak=game.catchStreak;let achievementUnlocked=false;game.catchStreak=0;game.agileStreak=0;game.pivotLanes=[];game.movedSinceCatch=false;if((item.type||'startup')==='startup'){game.missedBoxes++;if(streak>=20)achievementUnlocked=unlockAchievement(0)||achievementUnlocked;if(item.isFirstStartup)achievementUnlocked=unlockAchievement(7)||achievementUnlocked}game.lives--;markOneLife();game.reaction='miss';game.reactionClock=0;game.catchAnim=null;game.missLane=item.lane;game.message='КАК ЖЕ ТАК, ОЛЕГ?!';smash(item.lane);if(game.lives<=0){triggerGameover();return}if(!achievementUnlocked)beep('miss');
    deactivateUnderwearEffect();
  }

  function update(dt){
    if(game.paused)return;
    advanceAchievement(dt);
    if(!game.running)return;
    game.playTime+=dt;updateUnderwearEffect(dt);if(game.hypeText)game.hypeClock+=dt;
    if(game.playTime>=10000&&game.caughtBoxes===0)unlockAchievement(2);
    if(game.playTime>=300000)unlockAchievement(1);
    if(game.playTime>=180000)unlockAchievement(6);
    if(game.lives===1&&game.oneLifeSince!==null&&game.playTime-game.oneLifeSince>=120000)unlockAchievement(8);
    game.throwTimers.forEach((timer,lane)=>game.throwTimers[lane]=timer+dt);
    game.reactionClock+=dt;if(game.catchAnim)game.catchAnim.t+=dt;
    if(game.reaction==='catch'&&game.reactionClock>900){game.reaction=game.danceQueued?'dance':'idle';game.reactionClock=0;game.catchAnim=null;if(game.danceQueued)beep('dance');game.danceQueued=false;game.message='ИГРА'}
    else if(game.reaction==='unicorn'&&game.reactionClock>1250){game.reaction='dance';game.reactionClock=0;game.catchAnim=null;game.danceQueued=false;game.message='ИГРА';beep('dance')}
    else if((game.reaction==='miss'&&game.reactionClock>1050)||(game.reaction==='toxic'&&game.reactionClock>1100)||(game.reaction==='underwear'&&game.reactionClock>900)||(game.reaction==='dance'&&game.reactionClock>DANCE_DURATION_MS)){game.reaction='idle';game.reactionClock=0;game.catchAnim=null;game.message='ИГРА'}
    const progress=clamp(game.playTime/DIFFICULTY_RAMP_MS,0,1),ramp=progress*progress*(3-2*progress);
    const speed=FLIGHT_SPEED_START+ramp*(FLIGHT_SPEED_END-FLIGHT_SPEED_START);spawnClock+=dt;
    const spawnEvery=1050-ramp*670;
    const cap=game.playTime>120000?4:game.playTime>45000?3:2;
    if(spawnClock>spawnEvery&&game.reaction==='idle'&&game.items.length<cap){
      spawnClock=0;
      const occupied=new Set(game.items.map(item=>item.lane)),free=[0,1,2,3].filter(lane=>!occupied.has(lane)&&game.throwTimers[lane]>=investorCycleMs),pool=free.length?free:[0,1,2,3].filter(lane=>!occupied.has(lane));
      const lane=pool[Math.floor(Math.random()*pool.length)],actor=Math.random()<UNDERWEAR_INVESTOR_CHANCE?UNDERWEAR_INVESTOR_INDEX:Math.floor(Math.random()*UNDERWEAR_INVESTOR_INDEX),releaseAt=investorReleaseAt;
      game.throwTimers[lane]=0;game.throwActors[lane]=actor;
      const type=actor===UNDERWEAR_INVESTOR_INDEX?'underwear':rollItemType(),isFirstStartup=type==='startup'&&!game.firstStartupSpawned;if(isFirstStartup)game.firstStartupSpawned=true;
      game.items.push({id:id++,lane,actor,releaseAt,progress:0,age:0,type,isFirstStartup,label:labels[id%labels.length]});
    }
    const survivors=[];for(const item of game.items){const previousFlightAge=Math.max(0,item.age-item.releaseAt);item.age+=dt;const flightAge=Math.max(0,item.age-item.releaseAt);item.progress+=(flightAge-previousFlightAge)*speed;if(item.type==='toxic'&&item.progress>=CATCH_START&&item.lane!==game.lane)item.rejected=true;if(item.rejected&&item.progress>=TOXIC_REJECT_END)continue;if(!item.rejected&&item.lane===game.lane&&item.progress>=CATCH_START&&item.progress<=CATCH_END)catchItem(item);else if(item.progress>=1)missItem(item);else survivors.push(item)}game.items=game.reaction==='gameover'?[]:survivors;
  }
  function frame(now){const dt=Math.min(40,now-last);last=now;update(dt);draw(dt);requestAnimationFrame(frame)}

  function start(){if(!assetsReady)return;game=fresh();game.running=true;game.message='ИГРА';spawnClock=9999;overlay.classList.add('hidden');pauseButton.textContent='ПАУЗА';beep('start')}
  function interruptReaction(){if(!['miss','toxic','underwear','dance'].includes(game.reaction))return;game.reaction='idle';game.reactionClock=0;game.catchAnim=null;game.danceQueued=false;game.message='ИГРА'}
  function choose(requestedLane){if(!game.running||game.paused)return;interruptReaction();const lane=game.underwearEffect.active?3-requestedLane:requestedLane;if(lane!==game.lane)game.movedSinceCatch=true;game.lane=lane;laneButtons.forEach(b=>b.classList.toggle('active',+b.dataset.lane===lane));const ready=game.items.filter(item=>!item.rejected&&item.lane===lane&&item.progress>=CATCH_START&&item.progress<=CATCH_END).sort((a,b)=>b.progress-a.progress)[0];if(ready){catchItem(ready);game.items=game.items.filter(item=>item!==ready)}else beep('move')}
  function pause(){if(!game.running)return;game.paused=!game.paused;game.message=game.paused?'ПАУЗА':'ИГРА';pauseButton.textContent=game.paused?'ПРОДОЛЖИТЬ':'ПАУЗА'}

  laneButtons.forEach(b=>b.addEventListener('pointerdown',()=>choose(+b.dataset.lane)));
  startButton.addEventListener('click',start);
  pauseButton.addEventListener('click',pause);
  soundButton.addEventListener('click',()=>{sound=!sound;soundButton.textContent=`ЗВУК: ${sound?'ВКЛ':'ВЫКЛ'}`;soundButton.setAttribute('aria-pressed',String(sound));if(sound)beep('move')});
  addEventListener('keydown',e=>{let lane;if(e.key==='ArrowLeft')lane=game.lane<2?game.lane:game.lane-2;if(e.key==='ArrowRight')lane=game.lane<2?game.lane+2:game.lane;if(e.key==='ArrowUp')lane=game.lane<2?0:2;if(e.key==='ArrowDown')lane=game.lane<2?1:3;if(e.key===' '){e.preventDefault();pause()}else if(lane!==undefined){e.preventDefault();choose(lane)}});
  requestAnimationFrame(frame);
})();
