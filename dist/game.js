(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const overlay = document.querySelector('#overlay');
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
  backgroundArt.src = 'assets/lcd-background.png';
  olegSprites.src = 'assets/oleg-sprites.png';
  upperCatchSprites.src = 'assets/oleg-upper-catch-v2.png';
  emotionSprites.src = 'assets/oleg-emotions-v2.png';
  directionalSprites.src = 'assets/oleg-four-directions-v3.png';
  missedSprite.src = 'assets/oleg-missed-v3.png';
  boxFlightSprites.src = 'assets/startup-box-flight-v3.png';

  const lanes = [
    [[150,120],[295,180],[390,258],[455,343]],
    [[150,285],[300,315],[400,350],[455,385]],
    [[810,120],[665,180],[570,258],[505,343]],
    [[810,285],[660,315],[560,350],[505,385]],
  ];
  const directionFrames = [
    [16,101,250,573],[285,37,250,635],[550,33,255,637],[825,71,250,601],
    [1095,21,250,653],[1370,66,248,633],[1640,67,250,607],[1910,118,252,555]
  ];
  const boxFrames = [
    [15,45,337,566],[373,89,341,601],[734,93,340,543],
    [1097,103,341,492],[1457,120,331,548],[1821,116,328,477]
  ];
  const labels = ['AI','SaaS','WEB3','B2B','APP','$'];
  let game = fresh('A');
  let sound = true, audio, last = performance.now(), spawnClock = 0, id = 0;

  function fresh(mode){
    return { running:false, paused:false, mode, score:0, lives:3, lane:1, items:[], reaction:'idle', reactionClock:0, message:'ВЫБЕРИ ИГРУ', fragments:[], sparks:[], tears:[], catchAnim:null };
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
      const notes = kind==='catch'?[520,760,1040]:kind==='miss'?[210,145,95]:kind==='over'?[220,185,150,110]:kind==='start'?[330,440,660]:[250];
      notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.065;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.04,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.07)});
    }catch(e){}
  }

  function line(x1,y1,x2,y2,w=5){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  function poly(points,w=5){ctx.lineWidth=w;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}
  function roundRect(x,y,w,h,r,fill=true,stroke=true){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
  function pathPoint(lane,t){
    const p=lanes[lane], scaled=clamp(t,0,.999)*3, i=Math.floor(scaled), u=scaled-i;
    return [p[i][0]+(p[i+1][0]-p[i][0])*u,p[i][1]+(p[i+1][1]-p[i][1])*u];
  }

  function background(){
    ctx.fillStyle=lcd();ctx.fillRect(0,0,W,H);
    if(backgroundArt.complete&&backgroundArt.naturalWidth)ctx.drawImage(backgroundArt,0,0,W,H);
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
    if(!olegSprites.complete||!olegSprites.naturalWidth){sadOleg();return}
    if(game.reaction==='miss'&&missedSprite.complete&&missedSprite.naturalWidth){
      const h=345,w=h*(missedSprite.naturalWidth/missedSprite.naturalHeight);ctx.drawImage(missedSprite,480-w/2,228,w,h);return;
    }
    if(game.reaction!=='gameover'&&directionalSprites.complete&&directionalSprites.naturalWidth){
      const emptyFrame=[2,0,4,6][game.lane],caughtFrame=[3,1,5,7][game.lane];
      const caught=game.reaction==='catch'&&game.catchAnim?.t>190;
      const frame=caught?caughtFrame:emptyFrame,src=directionFrames[frame],h=320,w=h*(src[2]/src[3]),bounce=caught?Math.sin(game.reactionClock*.025)*6:0;
      ctx.drawImage(directionalSprites,...src,480-w/2,552-h+bounce,w,h);return;
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

  function startupBox(x,y,label,rotation=0,scale=1,frame=0){
    if(boxFlightSprites.complete&&boxFlightSprites.naturalWidth){const src=boxFrames[frame%6],maxSide=Math.max(src[2],src[3]),dw=72*scale*(src[2]/maxSide),dh=72*scale*(src[3]/maxSide);ctx.drawImage(boxFlightSprites,...src,x-dw/2,y-dh/2,dw,dh);return}
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale,scale);ctx.fillStyle=lcd();ctx.strokeStyle=ink();ctx.lineWidth=6;roundRect(-30,-24,60,48,3,true,true);line(-30,-8,30,-8,3);line(-12,-23,-12,-8,3);line(13,-23,13,-8,3);ctx.fillStyle=ink();ctx.font='900 13px monospace';ctx.textAlign='center';ctx.fillText(label,0,13);ctx.restore();
  }
  function startup(item){
    const [x,y]=pathPoint(item.lane,ease(item.progress));startupBox(x,y,item.label,Math.sin(item.progress*18)*.16,1,Math.floor(item.progress*12));
  }
  function caughtBox(){
    const a=game.catchAnim;if(!a||a.t>360)return;
    const p=clamp(a.t/360,0,1), q=1-Math.pow(1-p,3);
    const target=[480+(a.lane<2?-54:54),a.upper?255:340];
    const x=a.x+(target[0]-a.x)*q, y=a.y+(target[1]-a.y)*q-28*Math.sin(p*Math.PI);
    startupBox(x,y,a.label,(1-p)*a.rotation,1-p*.28,Math.floor(a.t/60));
  }

  function effects(dt){
    game.fragments.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=.0012*dt;f.rot+=f.vr*dt;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot);ctx.fillStyle=lcd();ctx.strokeStyle=ink();ctx.lineWidth=4;ctx.fillRect(-12,-9,24,18);ctx.strokeRect(-12,-9,24,18);ctx.restore()});
    game.fragments=game.fragments.filter(f=>f.y<570&&f.life-- >0);
    game.sparks.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.life*.01);ctx.strokeStyle=ink();ctx.lineWidth=4;line(-7,0,7,0,3);line(0,-7,0,7,3);ctx.restore()});game.sparks=game.sparks.filter(s=>s.life>0);
  }

  function hud(){
    ctx.fillStyle=ink();ctx.textAlign='right';ctx.font='900 64px monospace';ctx.fillText(String(game.score).padStart(3,'0'),805,78);
    for(let i=0;i<3;i++){const x=235+i*40;ctx.beginPath();ctx.moveTo(x,74);ctx.bezierCurveTo(x-18,58,x-31,82,x,107);ctx.bezierCurveTo(x+31,82,x+18,58,x,74);if(i<game.lives)ctx.fill();else ctx.stroke()}
    ctx.textAlign='center';ctx.font='900 22px monospace';ctx.fillText(game.message,480,575);
    if(game.reaction==='catch'&&game.reactionClock<500){ctx.font='900 34px monospace';ctx.fillText('+'+(game.mode==='A'?1:2),480,210-game.reactionClock*.05)}
  }

  function draw(dt=16){
    ctx.clearRect(0,0,W,H);background();game.items.forEach(startup);caughtBox();oleg();effects(dt);hud();
    if(game.paused){ctx.fillStyle='rgba(155,170,120,.78)';ctx.fillRect(260,235,440,115);ctx.fillStyle=ink();ctx.textAlign='center';ctx.font='900 46px monospace';ctx.fillText('ПАУЗА',480,305)}
    gameStatus.textContent=`Счёт ${game.score}, жизни ${game.lives}, ${game.message}`;
  }

  function smash(lane){
    const end=lanes[lane][3];for(let i=0;i<7;i++)game.fragments.push({x:end[0]+(lane<2?-35:35),y:510,vx:(Math.random()-.5)*.28,vy:-Math.random()*.24-.08,rot:0,vr:(Math.random()-.5)*.014,life:90});
  }
  function celebrate(){for(let i=0;i<10;i++)game.sparks.push({x:480+(Math.random()-.5)*100,y:320+(Math.random()-.5)*80,vx:(Math.random()-.5)*.08,vy:-Math.random()*.1,life:500+Math.random()*300})}
  function catchItem(item){
    const [x,y]=pathPoint(item.lane,ease(item.progress));
    game.score+=game.mode==='A'?1:2;game.reaction='catch';game.reactionClock=0;game.catchAnim={lane:item.lane,upper:item.lane===0||item.lane===2,label:item.label,x,y,t:0,rotation:Math.sin(item.progress*18)*.16};
    game.message=item.lane===0||item.lane===2?'ВЕРХНЯЯ ЛОВЛЯ!':['СХВАТИЛ!','ЕСТЬ РАУНД!','В ДЕКЕ!','НЕ ПРОСРАЛ!'][game.score%4];celebrate();beep('catch');
  }
  function missItem(item){
    game.lives--;game.reaction='miss';game.reactionClock=0;game.catchAnim=null;game.message='КАК ЖЕ ТАК, ОЛЕГ?!';smash(item.lane);beep('miss');if(game.lives<=0){game.lives=0;game.running=false;game.reaction='gameover';game.message='GAME OVER · А/Б — РЕВАНШ';beep('over')}
  }

  function update(dt){
    if(!game.running||game.paused)return;
    game.reactionClock+=dt;if(game.catchAnim)game.catchAnim.t+=dt;if((game.reaction==='catch'&&game.reactionClock>900)||(game.reaction==='miss'&&game.reactionClock>1050)){game.reaction='idle';game.reactionClock=0;game.catchAnim=null;game.message=`ИГРА ${game.mode==='A'?'А':'Б'}`}
    const speed=(game.mode==='A'?.000115:.00017)+Math.min(.00008,game.score*.000002);spawnClock+=dt;
    const spawnEvery=game.mode==='A'?Math.max(780,1700-game.score*18):Math.max(480,1050-game.score*12);
    const cap=game.mode==='A'?1:2;
    if(spawnClock>spawnEvery&&game.reaction==='idle'&&game.items.length<cap&&!game.items.some(item=>item.progress>.45)){spawnClock=0;game.items.push({id:id++,lane:Math.floor(Math.random()*4),progress:0,label:labels[id%labels.length]})}
    const survivors=[];for(const item of game.items){item.progress+=dt*speed;if(item.lane===game.lane&&item.progress>=.72)catchItem(item);else if(item.progress>=1)missItem(item);else survivors.push(item)}game.items=survivors;
  }
  function frame(now){const dt=Math.min(40,now-last);last=now;update(dt);draw(dt);requestAnimationFrame(frame)}

  function start(mode){game=fresh(mode);game.running=true;game.message=`ИГРА ${mode==='A'?'А':'Б'}`;spawnClock=9999;overlay.classList.add('hidden');modeButtons.forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));pauseButton.textContent='ПАУЗА';beep('start')}
  function choose(lane){if(!game.running||game.paused)return;game.lane=lane;laneButtons.forEach(b=>b.classList.toggle('active',+b.dataset.lane===lane));const ready=game.items.filter(item=>item.lane===lane&&item.progress>=.18).sort((a,b)=>b.progress-a.progress)[0];if(ready){catchItem(ready);game.items=game.items.filter(item=>item!==ready)}else beep('move')}
  function pause(){if(!game.running)return;game.paused=!game.paused;game.message=game.paused?'ПАУЗА':`ИГРА ${game.mode==='A'?'А':'Б'}`;pauseButton.textContent=game.paused?'ПРОДОЛЖИТЬ':'ПАУЗА'}

  laneButtons.forEach(b=>b.addEventListener('pointerdown',()=>choose(+b.dataset.lane)));
  modeButtons.forEach(b=>b.addEventListener('click',()=>start(b.dataset.mode)));
  pauseButton.addEventListener('click',pause);
  soundButton.addEventListener('click',()=>{sound=!sound;soundButton.textContent=`ЗВУК: ${sound?'ВКЛ':'ВЫКЛ'}`;soundButton.setAttribute('aria-pressed',String(sound));if(sound)beep('move')});
  addEventListener('keydown',e=>{const m={q:0,a:1,e:2,d:3};let lane=m[e.key.toLowerCase()];if(e.key==='ArrowLeft')lane=game.lane<2?game.lane:game.lane-2;if(e.key==='ArrowRight')lane=game.lane<2?game.lane+2:game.lane;if(e.key==='ArrowUp')lane=game.lane<2?0:2;if(e.key==='ArrowDown')lane=game.lane<2?1:3;if(e.key===' '){e.preventDefault();pause()}else if(lane!==undefined){e.preventDefault();choose(lane)}});
  requestAnimationFrame(frame);
})();
