(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const overlay = document.querySelector('#overlay');
  const buttons = [...document.querySelectorAll('[data-lane]')];
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const pauseButton = document.querySelector('#pause');
  const soundButton = document.querySelector('#sound');
  const W = canvas.width, H = canvas.height;
  const paths = [
    [[115,125],[250,190],[365,260],[452,338]],
    [[115,292],[250,320],[365,345],[452,368]],
    [[845,125],[710,190],[595,260],[508,338]],
    [[845,292],[710,320],[595,345],[508,368]]
  ];
  let game = {running:false,paused:false,mode:'A',score:0,lives:3,lane:1,items:[],tick:0,message:'ВЫБЕРИ ИГРУ'};
  let interval, seq=0, sound=true, audio;

  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const ink = () => css('--lcd-dark'), lcd = () => css('--lcd');
  function beep(kind){
    if(!sound) return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      const notes=kind==='catch'?[660,990]:kind==='miss'?[170,115]:kind==='start'?[330,440,660]:[230];
      notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.07;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.065);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.07)});
    }catch(e){}
  }
  function line(x1,y1,x2,y2,w=5){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  function investor(x,y,flip=1){ctx.save();ctx.translate(x,y);ctx.scale(flip,1);ctx.fillStyle=ink();ctx.beginPath();ctx.arc(0,0,21,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-24,30);ctx.quadraticCurveTo(0,6,30,28);ctx.lineTo(47,82);ctx.lineTo(20,88);ctx.lineTo(8,50);ctx.lineTo(-5,83);ctx.lineTo(-36,72);ctx.closePath();ctx.fill();ctx.fillRect(38,42,45,15);ctx.fillRect(75,37,25,20);ctx.restore()}
  function oleg(){
    const left=game.lane<2,upper=game.lane===0||game.lane===2,s=left?-1:1;
    ctx.save();ctx.translate(480,432);ctx.scale(s,1);ctx.strokeStyle=ink();ctx.fillStyle=lcd();ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=8;
    ctx.beginPath();ctx.ellipse(3,-116,45,55,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-30,-154);ctx.quadraticCurveTo(-40,-205,-4,-205);ctx.quadraticCurveTo(43,-205,49,-155);ctx.stroke();
    ctx.beginPath();ctx.arc(-12,-127,14,0,Math.PI*2);ctx.arc(19,-127,14,0,Math.PI*2);ctx.stroke();line(2,-127,6,-127,5);
    ctx.fillStyle=ink();ctx.beginPath();ctx.moveTo(-22,-100);ctx.quadraticCurveTo(3,-58,32,-103);ctx.quadraticCurveTo(7,-70,-22,-100);ctx.fill();
    ctx.fillStyle=lcd();ctx.beginPath();ctx.moveTo(-37,-62);ctx.quadraticCurveTo(0,-90,39,-61);ctx.lineTo(30,35);ctx.lineTo(-31,35);ctx.closePath();ctx.fill();ctx.stroke();
    line(-25,30,-51,92,9);line(27,30,55,92,9);line(-50,92,-83,102,10);line(54,92,86,102,10);
    const hy=upper?-115:-54;ctx.beginPath();ctx.moveTo(-30,-45);ctx.quadraticCurveTo(-68,hy,-102,hy);ctx.stroke();ctx.strokeRect(-145,hy-18,45,36);
    ctx.restore();
  }
  function box(item){const p=paths[item.lane][Math.min(item.step,3)],x=p[0],y=p[1];ctx.save();ctx.translate(x,y);ctx.rotate(item.step%2?.12:-.12);ctx.fillStyle=lcd();ctx.strokeStyle=ink();ctx.lineWidth=5;ctx.fillRect(-24,-18,48,36);ctx.strokeRect(-24,-18,48,36);line(-24,-6,24,-6,3);ctx.fillStyle=ink();ctx.font='900 11px monospace';ctx.textAlign='center';ctx.fillText(['AI','APP','SaaS','B2B'][item.id%4],0,10);ctx.restore()}
  function draw(){
    ctx.clearRect(0,0,W,H);ctx.fillStyle=lcd();ctx.fillRect(0,0,W,H);ctx.strokeStyle=ink();ctx.globalAlpha=.18;ctx.lineWidth=2;for(let y=85;y<H;y+=105)line(0,y,W,y,2);ctx.globalAlpha=.65;paths.forEach(p=>{ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.stroke()});ctx.globalAlpha=1;
    investor(85,92);investor(85,260);investor(875,92,-1);investor(875,260,-1);game.items.forEach(box);oleg();
    ctx.fillStyle=ink();ctx.textAlign='right';ctx.font='900 66px monospace';ctx.fillText(String(game.score).padStart(3,'0'),790,80);
    for(let i=0;i<3;i++){ctx.strokeStyle=ink();ctx.lineWidth=4;ctx.strokeRect(688+i*39,100,27,19);if(i<game.lives){ctx.fillStyle=ink();ctx.fillRect(688+i*39,100,27,19)}}
    ctx.textAlign='center';ctx.font='900 25px monospace';ctx.fillText(game.message,480,570);
  }
  function start(mode){clearInterval(interval);game={running:true,paused:false,mode,score:0,lives:3,lane:1,items:[],tick:0,message:`ИГРА ${mode==='A'?'А':'Б'}`};overlay.classList.add('hidden');modeButtons.forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));pauseButton.textContent='ПАУЗА';interval=setInterval(step,mode==='A'?390:255);beep('start');draw()}
  function step(){
    if(!game.running||game.paused)return;game.tick++;
    const every=game.mode==='A'?Math.max(2,5-Math.floor(game.score/12)):Math.max(1,3-Math.floor(game.score/15));
    if(game.tick%every===0&&game.items.length<(game.mode==='A'?3:5))game.items.push({id:seq++,lane:Math.floor(Math.random()*4),step:0});
    const next=[];for(const item of game.items){item.step++;if(item.step>=4){if(item.lane===game.lane){game.score+=game.mode==='A'?1:2;game.message=['СХВАТИЛ!','ЕСТЬ РАУНД!','В ДЕКЕ!','НЕ ПРОСРАЛ!'][game.score%4];beep('catch')}else{game.lives--;game.message='КАК ЖЕ ТАК, ОЛЕГ?!';beep('miss');if(game.lives<=0){game.running=false;clearInterval(interval);game.message='GAME OVER';overlay.innerHTML=`<strong>GAME OVER</strong><span>Счёт: ${game.score} · выбери режим для реванша</span>`;overlay.classList.remove('hidden')}}}else next.push(item)}game.items=next;draw()
  }
  function choose(lane){if(!game.running||game.paused)return;game.lane=lane;buttons.forEach(b=>b.classList.toggle('active',+b.dataset.lane===lane));beep('move');draw()}
  function pause(){if(!game.running)return;game.paused=!game.paused;game.message=game.paused?'ПАУЗА':`ИГРА ${game.mode==='A'?'А':'Б'}`;pauseButton.textContent=game.paused?'ПРОДОЛЖИТЬ':'ПАУЗА';draw()}
  buttons.forEach(b=>b.addEventListener('pointerdown',()=>choose(+b.dataset.lane)));modeButtons.forEach(b=>b.addEventListener('click',()=>start(b.dataset.mode)));pauseButton.addEventListener('click',pause);soundButton.addEventListener('click',()=>{sound=!sound;soundButton.textContent=`ЗВУК: ${sound?'ВКЛ':'ВЫКЛ'}`;soundButton.setAttribute('aria-pressed',String(sound));if(sound)beep('move')});
  addEventListener('keydown',e=>{const m={q:0,a:1,e:2,d:3};let lane=m[e.key.toLowerCase()];if(e.key==='ArrowLeft')lane=game.lane<2?game.lane:game.lane-2;if(e.key==='ArrowRight')lane=game.lane<2?game.lane+2:game.lane;if(e.key==='ArrowUp')lane=game.lane<2?0:2;if(e.key==='ArrowDown')lane=game.lane<2?1:3;if(e.key===' '){e.preventDefault();pause()}else if(lane!==undefined){e.preventDefault();choose(lane)}});
  draw();
})();
