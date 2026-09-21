(() => {
  'use strict';
  const canvas=document.getElementById('gameCanvas'),ctx=canvas.getContext('2d');
  const oxygenEl=document.getElementById('oxygen'),energyEl=document.getElementById('energy'),timeEl=document.getElementById('time'),scoreEl=document.getElementById('score');
  const overlay=document.getElementById('overlay'),overlayIcon=document.getElementById('overlayIcon'),overlayTitle=document.getElementById('overlayTitle'),overlayText=document.getElementById('overlayText');
  const startBtn=document.getElementById('startBtn'),restartBtn=document.getElementById('restartBtn');
  const keys={}; const player={x:450,y:330,r:18,speed:270};
  let oxygen=100,energy=100,timeLeft=60,score=0,running=false,last=0,spawnPickup=0,spawnMeteor=0,stars=[],pickups=[],meteors=[];

  function showOverlay(icon,title,text,button,fn){overlayIcon.textContent=icon;overlayTitle.textContent=title;overlayText.textContent=text;startBtn.textContent=button;startBtn.onclick=fn;overlay.classList.add('show')}
  function hud(){oxygenEl.textContent=Math.max(0,Math.round(oxygen))+'%';energyEl.textContent=Math.max(0,Math.round(energy))+'%';timeEl.textContent=Math.max(0,Math.ceil(timeLeft));scoreEl.textContent=Math.floor(score)}
  function reset(){running=false;player.x=450;player.y=330;oxygen=100;energy=100;timeLeft=60;score=0;pickups=[];meteors=[];spawnPickup=.5;spawnMeteor=1.3;stars=Array.from({length:180},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.5+.4,a:Math.random()*.7+.2}));hud();showOverlay('🧑‍🚀','جاهز للمهمة؟','اصمد دقيقة كاملة وحافظ على الأكسجين والطاقة.','ابدأ المهمة',start);draw()}
  function start(){overlay.classList.remove('show');running=true;last=performance.now();requestAnimationFrame(loop)}
  function end(win,reason){running=false;if(win){const best=Number(localStorage.getItem('vertexSpaceSurvivalBest')||0);if(score>best)localStorage.setItem('vertexSpaceSurvivalBest',String(Math.floor(score)));showOverlay('🏆','نجحت بالمهمة!','صمدت 60 ثانية. نتيجتك: '+Math.floor(score),'العب مرة ثانية',()=>{reset();start()})}else{showOverlay('💥','فشلت المهمة',reason+' — نتيجتك: '+Math.floor(score),'حاول مرة ثانية',()=>{reset();start()})}}
  function spawnResource(){const type=Math.random()<.55?'oxygen':'energy';pickups.push({x:30+Math.random()*(canvas.width-60),y:30+Math.random()*(canvas.height-60),r:11,type,life:10})}
  function spawnRock(){const edge=Math.floor(Math.random()*4);let x,y,vx,vy;const speed=105+Math.random()*100+score*.015;if(edge===0){x=-30;y=Math.random()*canvas.height;vx=speed;vy=(Math.random()-.5)*90}else if(edge===1){x=canvas.width+30;y=Math.random()*canvas.height;vx=-speed;vy=(Math.random()-.5)*90}else if(edge===2){x=Math.random()*canvas.width;y=-30;vx=(Math.random()-.5)*90;vy=speed}else{x=Math.random()*canvas.width;y=canvas.height+30;vx=(Math.random()-.5)*90;vy=-speed}meteors.push({x,y,vx,vy,r:15+Math.random()*15,spin:Math.random()*6})}
  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  function update(dt){
    timeLeft-=dt;oxygen-=dt*1.2;energy-=dt*.72;score+=dt*8;
    if(timeLeft<=0){end(true);return} if(oxygen<=0){end(false,'نفد الأكسجين');return} if(energy<=0){end(false,'نفدت الطاقة');return}
    let dx=0,dy=0;if(keys.ArrowLeft||keys.a)dx--;if(keys.ArrowRight||keys.d)dx++;if(keys.ArrowUp||keys.w)dy--;if(keys.ArrowDown||keys.s)dy++;if(dx||dy){const m=Math.hypot(dx,dy);player.x+=dx/m*player.speed*dt;player.y+=dy/m*player.speed*dt;energy-=dt*.9}
    player.x=Math.max(player.r,Math.min(canvas.width-player.r,player.x));player.y=Math.max(player.r,Math.min(canvas.height-player.r,player.y));
    spawnPickup-=dt;if(spawnPickup<=0){spawnResource();spawnPickup=2.2+Math.random()*2}
    spawnMeteor-=dt;if(spawnMeteor<=0){spawnRock();spawnMeteor=Math.max(.42,1.35-score*.0015)}
    for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.life-=dt;if(p.life<=0){pickups.splice(i,1);continue}if(dist(player,p)<player.r+p.r+4){if(p.type==='oxygen')oxygen=Math.min(100,oxygen+28);else energy=Math.min(100,energy+33);score+=50;pickups.splice(i,1)}}
    for(let i=meteors.length-1;i>=0;i--){const m=meteors[i];m.x+=m.vx*dt;m.y+=m.vy*dt;m.spin+=dt*2;if(dist(player,m)<player.r+m.r*.75){oxygen-=22;energy-=12;score=Math.max(0,score-25);meteors.splice(i,1);continue}if(m.x<-80||m.x>canvas.width+80||m.y<-80||m.y>canvas.height+80)meteors.splice(i,1)}
    hud()
  }
  function draw(){
    const g=ctx.createRadialGradient(canvas.width*.5,canvas.height*.45,30,canvas.width*.5,canvas.height*.45,600);g.addColorStop(0,'#111b3a');g.addColorStop(1,'#01030a');ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
    stars.forEach(s=>{ctx.globalAlpha=s.a;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;
    pickups.forEach(p=>{const c=p.type==='oxygen'?'#55eaff':'#ffd85e';ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#07101a';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.type==='oxygen'?'O₂':'E',p.x,p.y)});
    meteors.forEach(m=>{ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.spin);ctx.fillStyle='#8a6550';ctx.shadowColor='#ff7847';ctx.shadowBlur=9;ctx.beginPath();for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const r=m.r*(.76+Math.random()*.24);const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.restore();ctx.shadowBlur=0});
    ctx.shadowColor='#57e9ff';ctx.shadowBlur=20;ctx.fillStyle='#e9faff';ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#3c79ff';ctx.beginPath();ctx.arc(player.x,player.y,player.r*.72,Math.PI*.98,Math.PI*1.98);ctx.fill();ctx.fillStyle='#07101a';ctx.font='13px Arial';ctx.textAlign='center';ctx.fillText('V',player.x,player.y+5)
  }
  function loop(now){if(!running)return;const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(loop)}
  document.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();keys[e.key]=true;keys[e.key.toLowerCase()]=true},{passive:false});
  document.addEventListener('keyup',e=>{keys[e.key]=false;keys[e.key.toLowerCase()]=false});
  document.querySelectorAll('[data-dir]').forEach(b=>{const map={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'},k=map[b.dataset.dir];b.addEventListener('pointerdown',()=>keys[k]=true);['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=false))});
  restartBtn.addEventListener('click',reset);reset();
})();