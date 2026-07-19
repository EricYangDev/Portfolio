(() => {
  const canvas = document.getElementById('voidStars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let last = performance.now();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function randomStar() {
    const depth = Math.random();
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.35 + Math.pow(depth, 2) * 1.55,
      speedX: (0.6 + depth * 1.3) * (Math.random() < 0.5 ? -1 : 1),
      speedY: 1.0 + depth * 2.2,
      alpha: 0.18 + depth * 0.72,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.18 + Math.random() * 0.65,
      tint: Math.random()
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.max(150, Math.min(440, Math.round((width * height) / 5200)));
    stars = Array.from({ length: target }, randomStar);
  }

  function draw(now) {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      if (!reducedMotion) {
        star.x += star.speedX * dt;
        star.y += star.speedY * dt;
      }
      if (star.x < -4) star.x = width + 4;
      if (star.x > width + 4) star.x = -4;
      if (star.y > height + 4) {
        star.y = -4;
        star.x = Math.random() * width;
      }

      const pulse = 0.68 + Math.sin(now * 0.0012 * star.twinkle + star.phase) * 0.32;
      const alpha = Math.max(0.05, star.alpha * pulse);
      const glow = star.size > 1.15;
      const rgb = star.tint > 0.84 ? '190,213,255' : star.tint > 0.68 ? '184,160,255' : '238,247,255';

      if (glow) {
        const radius = star.size * 5;
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, radius);
        gradient.addColorStop(0, `rgba(${rgb},${alpha * 0.28})`);
        gradient.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(${rgb},${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();

(() => {
const SOURCE={
"Programming":{"JavaScript, HTML, CSS":["Interactive UI logic","Regex-based development","Editable text-file systems","Custom engine creation"],"Python":["Data cleanup","Data visualization","Data analysis"],"Rapid prototyping":["Feedback integration","Interactable demos","Fast UI mockups","Experimental mechanics"]},
"Game Creation":{"Game design":["Mechanics & gameplay loops","Progression & motivation","Ludology fundamentals"],"Level design":["3D level design","2D level design","Spatial flow analysis","Tutorial & onboarding","Difficulty balancing"],"Narrative systems":["Branching story writing","Dialogue scripting","Scene & outcome logic"],"Systems design":["In-game economies","Player-to-player trading","Progression systems"],"Documentation":["Visual documentation","Flowchart creation","Data sheet organization","Manual & guide writing"]},
"AI-Assisted Work":{"AI-assisted programming":["Code debugging with AI","Prompt engineering","Vibe coding efficiency"],"AI-assisted generation":["Video generation","Image generation","Audio generation","Voice generation"]},
"Creative Media":{"Graphic design":["2D image (PNG) creation","Vector art (SVG) creation","Photo editing","Image file handling"],"3D Graphic design":["3D Modeling","UV Map editing","3D Printing"],"Video editing":["Video editing","Audio editing"],"UI/UX":["Visual hierarchy","Brand-aware design","Web development","Web design","Wireframing"],"Product design":["Blueprint design","Adobe Illustrator","CNC Cutting files","Laser cutting files"]},
"Educational Technology":{"Serious games":["Health education games","Palliative care education","Clinical simulation development","Uncertainty-based mechanics","Branching outcome logic creation"],"Educational system handling":["Moodle management","Canva management","Articulate management","SCORM file development"],"Learning experience design":["Usability testing","Accessibility verification","Interface simplification","Student feedback integration"]},
"Academic Research":{"Research":["Literature review","Experiment design","Gamification theory","Academic writing"],"Data & visualization":["Data collection","Data analysis","Visual data programming"],"Psychology integration":["Player/user behavior","Motivation analysis","Immersion analysis","Addiction analysis","Well-being framework integration"],"Human-centered design":["Human-computer interaction","User research","Accessibility awareness","Designing for non-technical users"]},
"Management & Operations":{"Project management":["Task breakdown","Iteration planning","Scope control","Productivity & time awareness"],"Stakeholder management":["Working with supervisors","Presenting for non-technical users","Feedback collection","Explaining tradeoffs","Amazing smile during meetings"],"Process improvement":["Automation integration","Content pipeline design","Repeatable production systems","Template creation"]},
"Soft Skills":{"Problem solving":["Quality assurance testing","Replicating bugs & errors","Solution prioritization"],"Creativity":["Interdisciplinary knowledge","Visual brainstorming"],"Communication":["Simplifying complex systems","Writing guides for others","Listening & remembering","Understanding constraints"],"Leadership":["Leading small projects","Owning prototypes","Coordinating design direction","Decision-making under uncertainty"]}
};
const colors=['#6d79ff','#43c7ff','#b37cff','#f08ec2','#e9b65b','#58d0a0','#6fd3e9','#8c9cff'];
const stage=document.getElementById('stage'),nodesEl=document.getElementById('nodes'),linksEl=document.getElementById('links'),panel=document.getElementById('panel'),lens=document.getElementById('lens'),centerMark=document.getElementById('centerMark'),centerTitle=document.getElementById('centerTitle'),centerHint=document.getElementById('centerHint'),backgroundMusic=document.getElementById('backgroundMusic'),hoverChime=document.getElementById('hoverChime'),startScreen=document.getElementById('startScreen'),startExploring=document.getElementById('startExploring');
const CATS=Object.keys(SOURCE),N=CATS.length;
let nodes=[],edges=[],pointer={x:-9999,y:-9999,inside:false},layout={w:0,h:0,cx:0,cy:0,baseCx:0,baseCy:0,rx:0,ry:0,scale:1},activeCategory=null,activeSkill=null,activeMini=null,activeNode=null,lastPanel='',lockedAttempt=false,layoutDirty=true;
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
let audioUnlocked=false,audioUnlocking=null,hoverFadeFrame=0,lastHoverAudioKey='',lastHoverAudioAt=0;
const BG_VOLUME=.075;
const CHIME_PEAK=.34;

function unlockAudio(){
  if(audioUnlocked)return Promise.resolve(true);
  if(audioUnlocking)return audioUnlocking;
  audioUnlocking=(async()=>{
    const results=[];
    if(backgroundMusic){
      backgroundMusic.muted=false;
      backgroundMusic.volume=0;
      results.push(await backgroundMusic.play().then(()=>true).catch(()=>false));
    }
    if(hoverChime){
      hoverChime.volume=0;
      results.push(await hoverChime.play().then(()=>{hoverChime.pause();hoverChime.currentTime=0;return true}).catch(()=>false));
    }
    audioUnlocked=results.length>0&&results.every(Boolean);
    if(audioUnlocked&&backgroundMusic){
      const started=performance.now();
      const fade=now=>{
        const t=Math.min(1,(now-started)/1400);
        backgroundMusic.volume=BG_VOLUME*t;
        if(t<1)requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
      lastHoverAudioKey='';
    }else if(backgroundMusic){
      backgroundMusic.muted=true;
    }
    audioUnlocking=null;
    return audioUnlocked;
  })();
  return audioUnlocking;
}

async function playHoverChime(){
  if(!document.body.classList.contains('started')||!hoverChime||!(await unlockAudio()))return;
  cancelAnimationFrame(hoverFadeFrame);
  const usableDuration=Math.min(25.6,Number.isFinite(hoverChime.duration)?hoverChime.duration-.45:25.6);
  try{hoverChime.currentTime=Math.max(0,Math.random()*Math.max(.1,usableDuration));}catch(_){ }
  hoverChime.volume=0;
  await hoverChime.play().catch(()=>{});
  const started=performance.now();
  const duration=700;
  const rise=190;
  const envelope=now=>{
    const elapsed=now-started;
    let volume=0;
    if(elapsed<rise)volume=CHIME_PEAK*(elapsed/rise);
    else if(elapsed<duration)volume=CHIME_PEAK*(1-(elapsed-rise)/(duration-rise));
    hoverChime.volume=Math.max(0,Math.min(CHIME_PEAK,volume));
    if(elapsed<duration)hoverFadeFrame=requestAnimationFrame(envelope);
    else hoverChime.volume=0;
  };
  hoverFadeFrame=requestAnimationFrame(envelope);
}

function updateHoverAudio(){
  const key=activeNode?[activeNode.type,activeNode.category,activeNode.skill,activeNode.mini||activeNode.label].filter(Boolean).join('|'):'';
  const now=performance.now();
  if(key&&key!==lastHoverAudioKey&&now-lastHoverAudioAt>120){
    lastHoverAudioAt=now;
    playHoverChime();
  }
  lastHoverAudioKey=key;
}

if(backgroundMusic){
  backgroundMusic.addEventListener('timeupdate',()=>{
    if(backgroundMusic.currentTime>=65.9)backgroundMusic.currentTime=0;
  });
}

startExploring?.addEventListener('click',async()=>{
  startExploring.disabled=true;
  startExploring.textContent='Entering...';
  document.body.classList.add('started');
  await unlockAudio();
  window.setTimeout(()=>startScreen?.remove(),760);
});

function makeNode(label,type,ci,meta={}){const el=document.createElement('div');el.className='node '+type;el.style.setProperty('--c',colors[ci]);el.innerHTML='<div class="label">'+esc(label)+'</div>';nodesEl.appendChild(el);const n={label,type,ci,el,px:0,py:0,tx:0,ty:0,displayScale:1,baseW:0,baseH:0,hit:false,categoryHit:false,skillHit:false,...meta};nodes.push(n);return n}
function makeEdge(a,b,kind='branch'){const el=document.createElementNS('http://www.w3.org/2000/svg','line');el.classList.add('edge');if(kind==='core')el.classList.add('core');else el.classList.add('hidden');linksEl.appendChild(el);const e={a,b,kind,el};edges.push(e);return e}
function baseSize(n){
  if(n.baseW>0&&n.baseH>0)return {w:n.baseW,h:n.baseH};
  const s=layout.scale||1;
  const fallback=n.type==='category'?{w:126*s,h:126*s}:n.type==='skill'?{w:150*s,h:58*s}:{w:174*s,h:50*s};
  n.baseW=n.el?.offsetWidth||fallback.w;
  n.baseH=n.el?.offsetHeight||fallback.h;
  return {w:n.baseW,h:n.baseH};
}
function scaledSize(n){const b=baseSize(n),s=Math.max(.55,n.displayScale||1);return {w:b.w*s,h:b.h*s}}
function boundsSize(n){const b=baseSize(n);const scale=Math.max(.82,n.displayScale||1);return {w:b.w*scale,h:b.h*scale}}
function rect(n,useTarget=true,pad=0,useScaled=true){const size=useScaled?boundsSize(n):baseSize(n);const x=useTarget?n.tx:n.px,y=useTarget?n.ty:n.py;return {l:x-size.w/2-pad,r:x+size.w/2+pad,t:y-size.h/2-pad,b:y+size.h/2+pad,w:size.w,h:size.h}}
function overlaps(a,b){return a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t}
function build(){const r=stage.getBoundingClientRect();if(r.width<30||r.height<30)return;const scale=clamp(Math.min(r.width/1100,r.height/690),.78,1.12);layout={w:r.width,h:r.height,baseCx:r.width*.5,baseCy:r.height*.52,cx:r.width*.5,cy:r.height*.52,rx:clamp(r.width*.225,205,300),ry:clamp(r.height*.205,135,190),scale};document.documentElement.style.setProperty('--scale',scale.toFixed(3));nodes=[];edges=[];nodesEl.innerHTML='';linksEl.innerHTML='';activeCategory=activeSkill=activeMini=activeNode=null;lastPanel='';const catNodes=[];CATS.forEach((cat,i)=>catNodes.push(makeNode(cat,'category',i,{category:cat,index:i,baseAngle:-Math.PI/2+i*Math.PI*2/N})));catNodes.forEach((n,i)=>makeEdge(n,catNodes[(i+1)%N],'core'));catNodes.forEach((cn,ci)=>{const entries=Object.entries(SOURCE[cn.category]);entries.forEach(([skill,minis],si)=>{const sn=makeNode(skill,'skill',ci,{category:cn.category,parent:cn,skill,minis,skillIndex:si,skillCount:entries.length});makeEdge(cn,sn);minis.forEach((mini,mi)=>{const mn=makeNode(mini,'mini',ci,{category:cn.category,parent:sn,skill,mini,miniIndex:mi,miniCount:minis.length});makeEdge(sn,mn)})})});nodes.forEach(baseSize);computeTargets();layoutDirty=false;nodes.forEach(n=>{n.px=n.tx;n.py=n.ty});showIntro();render(true)}
function skillVisible(n){return !!activeCategory&&n.category===activeCategory}
function miniVisible(n){return !!activeSkill&&n.category===activeCategory&&n.skill===activeSkill.skill}
function placeArc(group,parent,angle,radius,spread){if(!group.length)return;const count=group.length;const arc=count===1?0:Math.min(spread,Math.PI*.95);group.forEach((n,i)=>{const t=count===1?0:(i/(count-1)-.5);const a=angle+t*arc;n.branchAngle=a;n.tx=parent.tx+Math.cos(a)*radius;n.ty=parent.ty+Math.sin(a)*radius})}
function separateRectangles(group,iterations=20,gap=10){
  let anyMoved=false;
  for(let pass=0;pass<iterations;pass++){
    let moved=false;
    for(let i=0;i<group.length;i++){
      for(let j=i+1;j<group.length;j++){
        const a=group[i],b=group[j];
        const ra=rect(a,true,gap/2,true),rb=rect(b,true,gap/2,true);
        if(!overlaps(ra,rb))continue;
        const dx=b.tx-a.tx,dy=b.ty-a.ty;
        const overlapX=Math.min(ra.r-rb.l,rb.r-ra.l);
        const overlapY=Math.min(ra.b-rb.t,rb.b-ra.t);
        if(overlapX<=overlapY){
          const push=overlapX/2+1.5;
          const sign=dx===0?(i<j?1:-1):(dx>0?1:-1);
          a.tx-=push*sign;
          b.tx+=push*sign;
        }else{
          const push=overlapY/2+1.5;
          const sign=dy===0?(i<j?1:-1):(dy>0?1:-1);
          a.ty-=push*sign;
          b.ty+=push*sign;
        }
        moved=true;
        anyMoved=true;
      }
    }
    if(!moved)break;
  }
  return anyMoved;
}
function separateFromNodes(movers,obstacles,gap=12*layout.scale){
  let anyMoved=false;
  for(let pass=0;pass<20;pass++){
    let moved=false;
    for(const mover of movers){
      for(const obstacle of obstacles){
        if(mover===obstacle)continue;
        const rm=rect(mover,true,gap/2,true),ro=rect(obstacle,true,gap/2,true);
        if(!overlaps(rm,ro))continue;
        const dx=mover.tx-obstacle.tx,dy=mover.ty-obstacle.ty;
        const ox=Math.min(rm.r-ro.l,ro.r-rm.l),oy=Math.min(rm.b-ro.t,ro.b-rm.t);
        if(ox<=oy){
          const sign=dx===0?1:(dx>0?1:-1);
          mover.tx+=(ox+2)*sign;
        }else{
          const sign=dy===0?1:(dy>0?1:-1);
          mover.ty+=(oy+2)*sign;
        }
        moved=true;
        anyMoved=true;
      }
    }
    if(!moved)break;
  }
  return anyMoved;
}
function countOverlaps(group,gap=0){
  let count=0;
  for(let i=0;i<group.length;i++){
    for(let j=i+1;j<group.length;j++){
      if(overlaps(rect(group[i],true,gap/2,true),rect(group[j],true,gap/2,true)))count++;
    }
  }
  return count;
}
function rectAt(n,x,y,pad=0){
  const size=boundsSize(n);
  return {l:x-size.w/2-pad,r:x+size.w/2+pad,t:y-size.h/2-pad,b:y+size.h/2+pad,w:size.w,h:size.h};
}
function overlapArea(a,b){
  const w=Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l));
  const h=Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t));
  return w*h;
}
function forcePackRectangles(group,obstacles,gap=14*(layout.scale||1)){
  if(group.length<2)return;
  const sx=layout.scale||1;
  const marginX=36*sx,marginTop=46*sx,marginBottom=52*sx;
  const placed=[];
  const ordered=[...group].sort((a,b)=>(a.miniIndex??0)-(b.miniIndex??0));

  for(const node of ordered){
    const size=boundsSize(node);
    const idealX=node.tx,idealY=node.ty;
    let best=null,bestScore=Infinity;

    for(let ring=0;ring<=420*sx;ring+=14*sx){
      const steps=ring===0?1:Math.max(16,Math.ceil((Math.PI*2*ring)/(42*sx)));
      for(let step=0;step<steps;step++){
        const angle=ring===0?0:(step/steps)*Math.PI*2;
        const rawX=idealX+Math.cos(angle)*ring;
        const rawY=idealY+Math.sin(angle)*ring;
        const x=clamp(rawX,marginX+size.w/2,layout.w-marginX-size.w/2);
        const y=clamp(rawY,marginTop+size.h/2,layout.h-marginBottom-size.h/2);
        const candidate=rectAt(node,x,y,gap/2);
        let blocked=false;
        let area=0;
        for(const other of placed){
          const otherRect=rect(other,true,gap/2,true);
          const a=overlapArea(candidate,otherRect);
          area+=a;
          if(a>0)blocked=true;
        }
        for(const obstacle of obstacles){
          if(obstacle===node)continue;
          const obstacleRect=rect(obstacle,true,gap/2,true);
          const a=overlapArea(candidate,obstacleRect);
          area+=a;
          if(a>0)blocked=true;
        }
        const clampPenalty=Math.hypot(x-rawX,y-rawY)*3;
        const score=area*1000+Math.hypot(x-idealX,y-idealY)+clampPenalty;
        if(score<bestScore){best={x,y,blocked};bestScore=score;}
        if(!blocked){best={x,y,blocked:false};ring=999999;break;}
      }
    }

    if(best){node.tx=best.x;node.ty=best.y;}
    placed.push(node);
  }
}
function keepInside(group){
  const sx=layout.scale||1;
  const marginX=34*sx;
  const marginTop=44*sx;
  const marginBottom=50*sx;
  let moved=false;
  for(const n of group){
    const b=boundsSize(n);
    const nextX=clamp(n.tx,marginX+b.w/2,layout.w-marginX-b.w/2);
    const nextY=clamp(n.ty,marginTop+b.h/2,layout.h-marginBottom-b.h/2);
    if(Math.abs(nextX-n.tx)>.1||Math.abs(nextY-n.ty)>.1)moved=true;
    n.tx=nextX;
    n.ty=nextY;
  }
  return moved;
}
function settleVisibleCards(cats,skillNodes){
  const s=layout.scale||1;
  const visibleSkills=skillNodes.filter(n=>skillVisible(n));
  const visibleMinis=nodes.filter(n=>n.type==='mini'&&miniVisible(n));

  // Fast bounded solver: a few broad passes are enough for normal branches.
  // This runs only when the active branch changes, not on every animation frame.
  for(let pass=0;pass<10;pass++){
    let moved=false;
    moved=keepInside(visibleSkills)||moved;
    moved=keepInside(visibleMinis)||moved;
    moved=separateRectangles(visibleSkills,2,14*s)||moved;
    moved=separateRectangles(visibleMinis,3,14*s)||moved;
    moved=separateFromNodes(visibleMinis,visibleSkills,14*s)||moved;
    moved=separateFromNodes(visibleSkills,cats,12*s)||moved;
    moved=separateFromNodes(visibleMinis,cats,12*s)||moved;
    if(!moved)break;
  }

  keepInside(visibleSkills);
  keepInside(visibleMinis);

  // Only dense edge cases use the more expensive deterministic packer.
  if(countOverlaps(visibleMinis,12*s)>0){
    for(let pass=0;pass<8&&countOverlaps(visibleMinis,12*s)>0;pass++){
      separateRectangles(visibleMinis,3,15*s);
      separateFromNodes(visibleMinis,visibleSkills,14*s);
      keepInside(visibleMinis);
    }
  }
  if(countOverlaps(visibleMinis,12*s)>0){
    forcePackRectangles(visibleMinis,[...visibleSkills,...cats],14*s);
  }

  keepInside(visibleSkills);
  keepInside(visibleMinis);
}
function computeTargets(){
  const s=layout.scale||1;
  const idx=activeCategory?CATS.indexOf(activeCategory):-1;
  const activeAngle=idx>=0?-Math.PI/2+idx*Math.PI*2/N:0;
  const shift=activeCategory?Math.min(78*s,layout.h*.1):0;
  layout.cx=layout.baseCx-Math.cos(activeAngle)*shift;
  layout.cy=layout.baseCy-Math.sin(activeAngle)*shift;
  centerMark.style.left=layout.cx+'px';
  centerMark.style.top=layout.cy+'px';

  const rx=activeCategory?layout.rx*.86:layout.rx;
  const ry=activeCategory?layout.ry*.86:layout.ry;
  const cats=nodes.filter(n=>n.type==='category');
  cats.forEach(n=>{
    n.tx=layout.cx+Math.cos(n.baseAngle)*rx;
    n.ty=layout.cy+Math.sin(n.baseAngle)*ry;
  });
  const catMap=Object.fromEntries(cats.map(n=>[n.category,n]));

  for(const cat of CATS){
    const cn=catMap[cat];
    const group=nodes.filter(n=>n.type==='skill'&&n.category===cat).sort((a,b)=>a.skillIndex-b.skillIndex);
    const focused=cat===activeCategory;
    placeArc(group,cn,cn.baseAngle,(focused?190:92)*s,focused?2.05:.92);
    if(focused){
      separateRectangles(group,22,14*s);
      separateFromNodes(group,cats,12*s);
      keepInside(group);
      separateRectangles(group,12,12*s);
    }
  }

  const skillNodes=nodes.filter(n=>n.type==='skill');
  for(const sn of skillNodes){
    const minis=nodes.filter(n=>n.type==='mini'&&n.category===sn.category&&n.skill===sn.skill).sort((a,b)=>a.miniIndex-b.miniIndex);
    const focused=Boolean(activeSkill)&&activeSkill===sn;
    placeArc(minis,sn,sn.branchAngle??catMap[sn.category].baseAngle,(focused?184:48)*s,focused?2.55:.75);
    if(focused){
      const visibleSkills=skillNodes.filter(n=>n.category===activeCategory);
      separateRectangles(minis,24,12*s);
      separateFromNodes(minis,visibleSkills,14*s);
      separateFromNodes(minis,cats,12*s);
      keepInside(minis);
      separateRectangles(minis,16,10*s);
      keepInside(minis);
    }
  }
  settleVisibleCards(cats,skillNodes);
}
function hitNode(list){let best=null,bestScore=Infinity;for(const n of list){const size=scaledSize(n),dx=Math.abs(pointer.x-n.px),dy=Math.abs(pointer.y-n.py);let inside=false,score=Infinity;if(n.type==='category'){const r=size.w/2;const d=Math.hypot(pointer.x-n.px,pointer.y-n.py);inside=d<=r;score=d/r}else{inside=dx<=size.w/2&&dy<=size.h/2;score=Math.max(dx/(size.w/2),dy/(size.h/2))}if(inside&&score<bestScore){best=n;bestScore=score}}return best}
function updateCenter(distance=Infinity){const locked=!!activeCategory;centerMark.classList.toggle('locked',locked);centerMark.classList.toggle('nudge',lockedAttempt);centerMark.classList.toggle('reset-ready',locked&&distance<110*layout.scale);centerTitle.textContent=locked?'Return to center':'Choose a domain';centerHint.textContent=locked?'to switch domains':'hover a domain'}
function determineFocus(){
  const previousCategory=activeCategory;
  const previousSkill=activeSkill;
  lockedAttempt=false;

  if(!pointer.inside){
    activeNode=null;
    activeMini=null;
    updateCenter();
    setPanel();
    return;
  }

  const centerDistance=Math.hypot(pointer.x-layout.cx,pointer.y-layout.cy);
  if(centerDistance<104*layout.scale){
    activeCategory=activeSkill=activeMini=activeNode=null;
  }else if(activeCategory){
    const mini=hitNode(nodes.filter(n=>n.type==='mini'&&n.category===activeCategory&&miniVisible(n)));
    const skill=hitNode(nodes.filter(n=>n.type==='skill'&&n.category===activeCategory));
    const category=hitNode(nodes.filter(n=>n.type==='category'&&n.category===activeCategory));
    const blocked=hitNode(nodes.filter(n=>n.type==='category'&&n.category!==activeCategory));
    const hit=mini||skill||category;
    if(hit?.type==='mini'){
      activeSkill=hit.parent;
      activeMini=hit;
      activeNode=hit;
    }else if(hit?.type==='skill'){
      activeSkill=hit;
      activeMini=null;
      activeNode=hit;
    }else if(hit?.type==='category'){
      activeSkill=null;
      activeMini=null;
      activeNode=hit;
    }else{
      activeMini=null;
      activeNode=null;
      if(blocked)lockedAttempt=true;
    }
  }else{
    const category=hitNode(nodes.filter(n=>n.type==='category'));
    if(category){
      activeCategory=category.category;
      activeSkill=null;
      activeMini=null;
      activeNode=category;
    }else activeNode=null;
  }

  if(previousCategory!==activeCategory||previousSkill!==activeSkill)layoutDirty=true;
  updateCenter(centerDistance);
  setPanel();
}
function showIntro(){panel.innerHTML='<div class="eyebrow">Professional capabilities</div><h1>Eight-domain capability map</h1><p>Explore eight areas of expertise spanning development, design, educational technology, research, creative production, and project delivery.</p><div class="chips"><span class="chip">8 domains</span><span class="chip">Primary skills</span><span class="chip">Supporting capabilities</span></div><div class="intro">Hover a domain to reveal its skills. Hover a skill to explore its related capabilities. Return through the center before switching domains.</div>'}
function setPanel(){let key='intro';if(activeNode?.type==='mini')key='m:'+activeNode.mini;else if(activeNode?.type==='skill')key='s:'+activeNode.category+'/'+activeNode.skill;else if(activeNode?.type==='category')key='c:'+activeNode.category;if(key===lastPanel)return;lastPanel=key;if(activeNode?.type==='mini'){const n=activeNode;panel.innerHTML=`<div class="eyebrow">Supporting capability</div><div class="path">${esc(n.category)} / ${esc(n.skill)}</div><h1>${esc(n.mini)}</h1><p>This capability supports ${esc(n.skill)} within ${esc(n.category)}.</p><div class="chips"><span class="chip">Supporting capability</span><span class="chip">Exploring this domain</span></div>`}else if(activeNode?.type==='skill'){const n=activeNode;panel.innerHTML=`<div class="eyebrow">Primary skill</div><div class="path">${esc(n.category)} / ${esc(n.skill)}</div><h1>${esc(n.skill)}</h1><p>Explore the related capabilities connected to this skill.</p><div class="chips"><span class="chip">${n.minis.length} capabilities</span><span class="chip">Exploring this domain</span></div><h2>Supporting capabilities</h2><div class="mini-list">${n.minis.map(x=>`<div class="mini-row">${esc(x)}</div>`).join('')}</div>`}else if(activeNode?.type==='category'){const n=activeNode,skills=Object.keys(SOURCE[n.category]),count=Object.values(SOURCE[n.category]).reduce((a,b)=>a+b.length,0);panel.innerHTML=`<div class="eyebrow">Capability domain</div><div class="path">Capability Map / ${esc(n.category)}</div><h1>${esc(n.category)}</h1><p>Explore the skills and related capabilities within this domain. Return to the center before switching to another domain.</p><div class="chips"><span class="chip">${skills.length} skills</span><span class="chip">${count} capabilities</span></div><h2>Primary skills</h2><div class="mini-list">${skills.map(x=>`<div class="mini-row">${esc(x)}</div>`).join('')}</div>`}else showIntro()}
function applyClasses(){
  const focusCat=activeCategory;

  nodes.forEach(n=>{
    const focused=n===activeNode;
    n.el.classList.toggle('focused',focused);
    n.el.classList.toggle(
      'visible',
      (n.type==='skill'&&skillVisible(n)) ||
      (n.type==='mini'&&miniVisible(n))
    );

    const dim=Boolean(focusCat&&n.type==='category'&&n.category!==focusCat);
    n.el.classList.toggle('dim',dim);
  });

  edges.forEach(e=>{
    let visible=e.kind==='core';

    if(e.kind!=='core'){
      if(e.a.type==='category'&&e.b.type==='skill') visible=skillVisible(e.b);
      if(e.a.type==='skill'&&e.b.type==='mini') visible=miniVisible(e.b);
    }

    e.el.classList.toggle('hidden',!visible);
    e.el.classList.toggle('visible',visible&&e.kind!=='core');

    const active=Boolean(activeNode)&&e.kind!=='core'&&(
      e.a===activeNode ||
      e.b===activeNode ||
      (activeSkill&&e.a===activeSkill.parent&&e.b===activeSkill) ||
      (activeMini&&e.a===activeMini.parent&&e.b===activeMini)
    );
    e.el.classList.toggle('active',active);

    const dim=Boolean(focusCat&&e.kind==='core'&&(
      e.a.category===focusCat || e.b.category===focusCat
    ));
    e.el.classList.toggle('dim',dim);
  });
}
function render(initial=false){if(layoutDirty||initial){computeTargets();layoutDirty=false}for(const n of nodes){n.px=initial?n.tx:lerp(n.px,n.tx,.16);n.py=initial?n.ty:lerp(n.py,n.ty,.16);let s=n.type==='category'?.92:n.type==='skill'?.9:.92;if(n.type==='category'&&activeCategory&&n.category!==activeCategory)s-=.1;if(n===activeNode)s+=n.type==='category'?.24:n.type==='skill'?.09:.09;n.displayScale=s;n.el.style.left=n.px+'px';n.el.style.top=n.py+'px';n.el.style.setProperty('--s',s.toFixed(3));n.el.style.zIndex=n===activeNode?'1000':String(n.type==='category'?50:n.type==='skill'?30:20)}for(const e of edges){e.el.setAttribute('x1',e.a.px);e.el.setAttribute('y1',e.a.py);e.el.setAttribute('x2',e.b.px);e.el.setAttribute('y2',e.b.py)}applyClasses();lens.style.left=pointer.x+'px';lens.style.top=pointer.y+'px'}
function tick(){determineFocus();updateHoverAudio();render();requestAnimationFrame(tick)}
stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.inside=true});stage.addEventListener('pointerleave',()=>{pointer.inside=false;pointer.x=pointer.y=-9999});let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(build,90)};window.addEventListener('resize',schedule);if('ResizeObserver'in window)new ResizeObserver(schedule).observe(stage);build();requestAnimationFrame(tick);
})();
