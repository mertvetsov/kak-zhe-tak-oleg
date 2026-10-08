(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const overlay = document.querySelector('#overlay');
  const laneButtons = [...document.querySelectorAll('[data-lane]')];
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const pauseButton = document.querySelector('#pause');
  const soundButton = document.querySelector('#sound');
  const W = canvas.width, H = canvas.height;

  const lanes = [
    [[150,120],[295,180],[390,258],[455,343]],
    [[150,285],[300,315],[400,350],[455,385]],
    [[810,120],[665,180],[570,258],[505,343]],
    [[810,285],[660,315],[560,350],[505,385]],
  ];
  const labels = ['AI','SaaS','WEB3','B2B','APP','$'];
  let game = fresh('A');
  let sound = true, audio, last = performance.now(), spawnClock = 0, id = 0;

  function fresh(mode){
    return { running:false, paused:false, mode, score:0, lives:3, lane:1, items:[], reaction:'idle', reactionClock:0, message:'ВЫБЕРИ ИГРУ', fragments:[], sparks:[], tears:[] };
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
    ctx.fillStyle=lcd();ctx.fillRect(0,0,W,H);ctx.strokeStyle=ink();ctx.fillStyle=ink();
    ctx.globalAlpha=.11;for(let y=60;y<560;y+=28)line(0,y,W,y,1);ctx.globalAlpha=.22;
    [[430,110],[680,128],[300,255]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,22,Math.PI,0);ctx.arc(x+28,y-8,26,Math.PI,0);ctx.arc(x+58,y,18,Math.PI,0);ctx.fill()});
    ctx.globalAlpha=.28;ctx.fillRect(110,450,740,65);for(let x=125;x<850;x+=48){const h=25+(x%5)*8;ctx.fillRect(x,450-h,34,h);ctx.fillStyle=lcd();for(let yy=456-h;yy<445;yy+=16)for(let xx=x+7;xx<x+30;xx+=13)ctx.fillRect(xx,yy,5,8);ctx.fillStyle=ink()}
    line(700,386,700,450,3);line(664,386,746,386,4);line(688,386,703,367,3);line(704,371,746,386,2);line(732,386,732,420,2);
    ctx.globalAlpha=.7;lanes.forEach(p=>poly(p,3));ctx.globalAlpha=1;
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
    if(game.reaction==='gameover'){sadOleg();return}
    const left=game.lane<2, upper=game.lane===0||game.lane===2, s=left?-1:1;
    const isCatch=game.reaction==='catch', isMiss=game.reaction==='miss';
    const bounce=isCatch?Math.sin(game.reactionClock*.028)*7:0, droop=isMiss?Math.min(20,game.reactionClock*.035):0;
    ctx.save();ctx.translate(480,438+bounce+droop);ctx.scale(s,1);ctx.strokeStyle=ink();ctx.fillStyle=lcd();ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=8;
    const pose=isCatch?'happy':isMiss?'sad':'neutral';face(0,-123,pose,1);
    ctx.beginPath();ctx.moveTo(-39,-75);ctx.quadraticCurveTo(0,-103,41,-73);ctx.lineTo(34,38);ctx.lineTo(-33,38);ctx.closePath();ctx.fill();ctx.stroke();
    const stride=isCatch?96:68;line(-25,34,-stride,93,11);line(27,34,stride,93,11);line(-stride,93,-stride-30,94,12);line(stride,93,stride+30,94,12);
    let hy=upper?-120:-54;if(isCatch)hy-=18;if(isMiss)hy=5;
    ctx.beginPath();ctx.moveTo(-31,-53);ctx.quadraticCurveTo(-65,hy,-102,hy);ctx.stroke();ctx.strokeRect(-148,hy-20,48,40);
    ctx.restore();
  }

  function sadOleg(){
    const t=performance.now()/1000;ctx.save();ctx.translate(480,418);ctx.strokeStyle=ink();ctx.fillStyle=lcd();ctx.lineWidth=9;ctx.lineCap='round';ctx.lineJoin='round';
    face(0,-105,'cry',1.08);ctx.beginPath();ctx.moveTo(-42,-55);ctx.quadraticCurveTo(0,-82,43,-55);ctx.lineTo(32,25);ctx.lineTo(-34,25);ctx.closePath();ctx.fill();ctx.stroke();
    line(-27,20,-80,70,12);line(28,20,82,70,12);line(-80,70,-111,70,13);line(82,70,113,70,13);
    ctx.fillStyle=ink();for(let i=0;i<4;i++){const x=-27+i*18,y=-45+((t*75+i*23)%70);ctx.beginPath();ctx.ellipse(x,y,4,10,0,0,Math.PI*2);ctx.fill()}
    ctx.restore();
  }

  function startup(item){
    const [x,y]=pathPoint(item.lane,ease(item.progress));const wobble=Math.sin(item.progress*18)*.16;
    ctx.save();ctx.translate(x,y);ctx.rotate(wobble);ctx.fillStyle=lcd();ctx.strokeStyle=ink();ctx.lineWidth=6;roundRect(-30,-24,60,48,3,true,true);line(-30,-8,30,-8,3);line(-12,-23,-12,-8,3);line(13,-23,13,-8,3);ctx.fillStyle=ink();ctx.font='900 13px monospace';ctx.textAlign='center';ctx.fillText(item.label,0,13);ctx.restore();
  }

  function effects(dt){
    game.fragments.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=.0012*dt;f.rot+=f.vr*dt;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot);ctx.fillStyle=lcd();ctx.strokeStyle=ink();ctx.lineWidth=4;ctx.fillRect(-12,-9,24,18);ctx.strokeRect(-12,-9,24,18);ctx.restore()});
    game.fragments=game.fragments.filter(f=>f.y<570&&f.life-- >0);
    game.sparks.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.life*.01);ctx.strokeStyle=ink();ctx.lineWidth=4;line(-7,0,7,0,3);line(0,-7,0,7,3);ctx.restore()});game.sparks=game.sparks.filter(s=>s.life>0);
  }

  function hud(){
    ctx.fillStyle=ink();ctx.textAlign='right';ctx.font='900 64px monospace';ctx.fillText(String(game.score).padStart(3,'0'),805,78);
    for(let i=0;i<3;i++){const x=700+i*40;ctx.beginPath();ctx.moveTo(x,102);ctx.bezierCurveTo(x-18,86,x-31,110,x,135);ctx.bezierCurveTo(x+31,110,x+18,86,x,102);if(i<game.lives)ctx.fill();else ctx.stroke()}
    ctx.textAlign='center';ctx.font='900 22px monospace';ctx.fillText(game.message,480,575);
    if(game.reaction==='catch'&&game.reactionClock<500){ctx.font='900 34px monospace';ctx.fillText('+'+(game.mode==='A'?1:2),480,210-game.reactionClock*.05)}
  }

  function draw(dt=16){
    ctx.clearRect(0,0,W,H);background();house(0);house(960,-1);investor(105,105,1,0);investor(855,105,-1,1);game.items.forEach(startup);oleg();effects(dt);hud();
    if(game.paused){ctx.fillStyle='rgba(155,170,120,.78)';ctx.fillRect(260,235,440,115);ctx.fillStyle=ink();ctx.textAlign='center';ctx.font='900 46px monospace';ctx.fillText('ПАУЗА',480,305)}
  }

  function smash(lane){
    const end=lanes[lane][3];for(let i=0;i<7;i++)game.fragments.push({x:end[0]+(lane<2?-35:35),y:510,vx:(Math.random()-.5)*.28,vy:-Math.random()*.24-.08,rot:0,vr:(Math.random()-.5)*.014,life:90});
  }
  function celebrate(){for(let i=0;i<10;i++)game.sparks.push({x:480+(Math.random()-.5)*100,y:320+(Math.random()-.5)*80,vx:(Math.random()-.5)*.08,vy:-Math.random()*.1,life:500+Math.random()*300})}
  function resolve(item){
    if(item.lane===game.lane){game.score+=game.mode==='A'?1:2;game.reaction='catch';game.reactionClock=0;game.message=['СХВАТИЛ!','ЕСТЬ РАУНД!','В ДЕКЕ!','НЕ ПРОСРАЛ!'][game.score%4];celebrate();beep('catch')}
    else{game.lives--;game.reaction='miss';game.reactionClock=0;game.message='КАК ЖЕ ТАК, ОЛЕГ?!';smash(item.lane);beep('miss');if(game.lives<=0){game.lives=0;game.running=false;game.reaction='gameover';game.message='GAME OVER · А/Б — РЕВАНШ';beep('over')}}
  }

  function update(dt){
    if(!game.running||game.paused)return;
    game.reactionClock+=dt;if((game.reaction==='catch'&&game.reactionClock>720)||(game.reaction==='miss'&&game.reactionClock>1050)){game.reaction='idle';game.reactionClock=0;game.message=`ИГРА ${game.mode==='A'?'А':'Б'}`}
    const speed=(game.mode==='A'?.000115:.00017)+Math.min(.00008,game.score*.000002);spawnClock+=dt;
    const spawnEvery=game.mode==='A'?Math.max(780,1700-game.score*18):Math.max(480,1050-game.score*12);
    if(spawnClock>spawnEvery&&game.items.length<(game.mode==='A'?3:5)){spawnClock=0;game.items.push({id:id++,lane:Math.floor(Math.random()*4),progress:0,label:labels[id%labels.length]})}
    const survivors=[];for(const item of game.items){item.progress+=dt*speed;if(item.progress>=1)resolve(item);else survivors.push(item)}game.items=survivors;
  }
  function frame(now){const dt=Math.min(40,now-last);last=now;update(dt);draw(dt);requestAnimationFrame(frame)}

  function start(mode){game=fresh(mode);game.running=true;game.message=`ИГРА ${mode==='A'?'А':'Б'}`;spawnClock=9999;overlay.classList.add('hidden');modeButtons.forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));pauseButton.textContent='ПАУЗА';beep('start')}
  function choose(lane){if(!game.running||game.paused)return;game.lane=lane;laneButtons.forEach(b=>b.classList.toggle('active',+b.dataset.lane===lane));beep('move')}
  function pause(){if(!game.running)return;game.paused=!game.paused;game.message=game.paused?'ПАУЗА':`ИГРА ${game.mode==='A'?'А':'Б'}`;pauseButton.textContent=game.paused?'ПРОДОЛЖИТЬ':'ПАУЗА'}

  laneButtons.forEach(b=>b.addEventListener('pointerdown',()=>choose(+b.dataset.lane)));
  modeButtons.forEach(b=>b.addEventListener('click',()=>start(b.dataset.mode)));
  pauseButton.addEventListener('click',pause);
  soundButton.addEventListener('click',()=>{sound=!sound;soundButton.textContent=`ЗВУК: ${sound?'ВКЛ':'ВЫКЛ'}`;soundButton.setAttribute('aria-pressed',String(sound));if(sound)beep('move')});
  addEventListener('keydown',e=>{const m={q:0,a:1,e:2,d:3};let lane=m[e.key.toLowerCase()];if(e.key==='ArrowLeft')lane=game.lane<2?game.lane:game.lane-2;if(e.key==='ArrowRight')lane=game.lane<2?game.lane+2:game.lane;if(e.key==='ArrowUp')lane=game.lane<2?0:2;if(e.key==='ArrowDown')lane=game.lane<2?1:3;if(e.key===' '){e.preventDefault();pause()}else if(lane!==undefined){e.preventDefault();choose(lane)}});
  requestAnimationFrame(frame);
})();
