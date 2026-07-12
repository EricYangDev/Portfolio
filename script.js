const SOURCE={
"Programming":{"JavaScript, HTML, CSS":["Interactive UI logic","Regex-based development","Editable text-file systems","Custom engine creation"],"Python":["Data cleanup","Data visualization","Data analysis"],"Rapid prototyping":["Feedback integration","Interactable demos","Fast UI mockups","Experimental mechanics"]},
"Game Creation":{"Game design":["Mechanics & gameplay loops","Progression & motivation","Ludology fundamentals"],"Level design":["3D level design","2D level design","Spatial flow analysis","Tutorial & onboarding","Difficulty balancing"],"Narrative systems":["Branching story writing","Dialogue scripting","Scene & outcome logic"],"Systems design":["In-game economies","Player-to-player trading","Progression systems"],"Documentation":["Visual documentation","Flowchart creation","Data sheet organization","Manual & guide writing"]},
"AI-Assisted Work":{"AI-assisted programming":["Code debugging with AI","Prompt engineering","Vibe coding efficiency"],"AI-assisted generation":["Video generation","Image generation","Audio generation","Voice generation"]},
"Creative Media":{"Graphic design":["2D image (PNG) creation","Vector art (SVG) creation","Photo editing","Image file handling"],"3D Graphic design":["3D Modeling","UV Map editing","3D Printing"],"Video editing":["Video editing","Audio editing"],"UI/UX":["Visual hierarchy","Brand-aware design","Web development","Web design","Wireframing"],"Product design":["Blueprint design","Adobe Illustrator","CNC Cutting files","Laser cutting files","Wood engraving files"]},
"Educational Technology":{"Serious games":["Health education games","Palliative care education","Clinical simulation development","Uncertainty-based mechanics","Branching outcome logic creation"],"Educational system handling":["Moodle management","Canva management","D2L management","Articulate management","SCORM file development"],"Learning experience design":["Usability testing","Accessibility verification","Interface simplification","Student feedback integration"]},
"Academic Research":{"Research":["Literature review","Academic synthesis","Experiment design","Gamification theory","Academic writing"],"Data & visualization":["Data collection","Data analysis","Visual data programming"],"Psychology integration":["Player/user behavior","Motivation analysis","Immersion analysis","Addiction analysis","Well-being framework integration"],"Human-centered design":["Human-computer interaction","User research","Accessibility awareness","Designing for non-technical users"]},
"Management & Operations":{"Project management":["Task breakdown","Iteration planning","Scope control","Productivity & time awareness"],"Stakeholder management":["Working with supervisors","Presenting for non-technical users","Feedback collection","Explaining tradeoffs","Amazing smile during meetings"],"Process improvement":["Automation integration","Content pipeline design","Repeatable production systems","Template creation"]},
"Soft Skills":{"Problem solving":["Quality assurance testing","Replicating bugs & errors","Solution prioritization"],"Creativity":["Interdisciplinary knowledge","Visual brainstorming"],"Communication":["Simplifying complex systems","Writing guides for others","Listening & remembering","Understanding constraints"],"Leadership":["Leading small projects","Owning prototypes","Coordinating design direction","Decision-making under uncertainty"]}}
;
const colors=['#6d79ff','#43c7ff','#b37cff','#f08ec2','#e9b65b','#58d0a0','#6fd3e9','#8c9cff'];
const stage=document.getElementById('stage'),nodesEl=document.getElementById('nodes'),linksEl=document.getElementById('links'),panel=document.getElementById('panel'),lens=document.getElementById('lens'),search=document.getElementById('search'),centerMark=document.getElementById('centerMark'),centerTitle=document.getElementById('centerTitle'),centerHint=document.getElementById('centerHint');
const CATEGORY_KEYS=Object.keys(SOURCE), CAT_COUNT=CATEGORY_KEYS.length;
let nodes=[],edges=[],pointer={x:-9999,y:-9999,inside:false},layout={w:0,h:0,cx:0,cy:0,coreR:0},
    activeCategory=null,activeSkill=null,activeMini=null,activeNode=null,lastPanelKey='',lockedAttempt=false;

const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const angNorm=a=>Math.atan2(Math.sin(a),Math.cos(a));
function circularDiff(i,j,n){let d=i-j;while(d>n/2)d-=n;while(d<-n/2)d+=n;return d}
function makeNode(label,type,ci,meta={}){
  const el=document.createElement('div');
  el.className='node '+type;
  el.style.setProperty('--c',colors[ci]);
  el.innerHTML='<div class="label">'+esc(label)+'</div>';
  nodesEl.appendChild(el);
  const n={label,type,ci,el,px:0,py:0,tx:0,ty:0,scale:1,hit:false,angle:0,displayScale:1, ...meta};
  nodes.push(n);
  return n;
}
function makeEdge(a,b,kind='branch'){
  const l=document.createElementNS('http://www.w3.org/2000/svg','line');
  l.classList.add('edge');
  if(kind==='core')l.classList.add('core');
  else l.classList.add('hidden');
  linksEl.appendChild(l);
  const e={a,b,kind,el:l};edges.push(e);return e;
}
function build(){
  const r=stage.getBoundingClientRect();
  layout={w:r.width,h:r.height,cx:r.width*.5,cy:r.height*.5,coreR:Math.min(r.width,r.height)*.185};
  nodes=[];edges=[];nodesEl.innerHTML='';linksEl.innerHTML='';
  activeCategory=null;activeSkill=null;activeMini=null;activeNode=null;lastPanelKey='';
  const categoryNodes=[];
  CATEGORY_KEYS.forEach((cat,i)=>{
    const n=makeNode(cat,'category',i,{category:cat,index:i,baseAngle:-Math.PI/2 + i*Math.PI*2/CAT_COUNT});
    categoryNodes.push(n);
  });
  categoryNodes.forEach((n,i)=>makeEdge(n,categoryNodes[(i+1)%CAT_COUNT],'core'));
  categoryNodes.forEach((cn,ci)=>{
    const skills=Object.entries(SOURCE[cn.category]);
    skills.forEach(([skill,minis],si)=>{
      const sn=makeNode(skill,'skill',ci,{category:cn.category,parent:cn,skill,minis,skillIndex:si,skillCount:skills.length,catIndex:ci});
      makeEdge(cn,sn);
      minis.forEach((mini,mi)=>{
        const mn=makeNode(mini,'mini',ci,{category:cn.category,parent:sn,skill,mini,minis,miniIndex:mi,miniCount:minis.length,catIndex:ci});
        makeEdge(sn,mn);
      });
    });
  });
  computeTargets();
  nodes.forEach(n=>{n.px=n.tx;n.py=n.ty;});
  render(true);
  showIntro();
}
function sectorShift(index){
  if(!activeCategory) return 0;
  const focusIndex=CATEGORY_KEYS.indexOf(activeCategory);
  const d=circularDiff(index,focusIndex,CAT_COUNT);
  const map={0:0,1:0.24,2:0.1,3:0.03,4:0,'-1':-0.24,'-2':-0.1,'-3':-0.03,'-4':0};
  return map[d]||0;
}
function focusIntensity(cat){
  if(!activeCategory) return 0;
  const idx=CATEGORY_KEYS.indexOf(cat), focusIndex=CATEGORY_KEYS.indexOf(activeCategory);
  const d=Math.abs(circularDiff(idx,focusIndex,CAT_COUNT));
  if(d===0) return 1;
  if(d===1) return .52;
  if(d===2) return .18;
  return 0;
}
function focusedCategoryIndex(){
  return activeCategory ? CATEGORY_KEYS.indexOf(activeCategory) : -1;
}
function skillVisible(n){
  return (!!activeCategory && n.category===activeCategory) || (search.value.trim() && (n.hit || n.categoryHit));
}
function miniVisible(n){
  return (!!activeSkill && n.category===activeCategory && n.skill===activeSkill.skill) || (search.value.trim() && (n.hit || n.skillHit));
}
function collisionRadius(n){
  if(n.type==='skill') return n===activeNode ? 50 : 36;
  if(n.type==='mini') return n===activeNode ? 78 : 37;
  return 0;
}
function placeCircularGroup(group,parentX,parentY,centerAngle,radius,gap){
  if(!group.length) return;
  if(group.length===1){
    group[0].branchAngle=centerAngle;
    group[0].tx=parentX+Math.cos(centerAngle)*radius;
    group[0].ty=parentY+Math.sin(centerAngle)*radius;
    return;
  }
  const steps=[];
  for(let i=0;i<group.length-1;i++){
    const needed=collisionRadius(group[i])+collisionRadius(group[i+1])+gap;
    const ratio=Math.min(.98,needed/(2*radius));
    steps.push(2*Math.asin(ratio));
  }
  const total=steps.reduce((a,b)=>a+b,0);
  let angle=centerAngle-total/2;
  group.forEach((n,i)=>{
    if(i>0) angle+=steps[i-1];
    n.branchAngle=angle;
    n.tx=parentX+Math.cos(angle)*radius;
    n.ty=parentY+Math.sin(angle)*radius;
  });
}
function resolveCrossLevelCollisions(){
  const visibleSkills=nodes.filter(n=>n.type==='skill' && skillVisible(n));
  const visibleMinis=nodes.filter(n=>n.type==='mini' && miniVisible(n));
  const margin=14;
  const edgeMargin=34;

  // Repeatedly push mini-skills away from every visible primary skill.
  // The focused mini uses its expanded collision radius, so its text-holding
  // bubble also remains clear of the surrounding primary skill bubbles.
  for(let pass=0;pass<10;pass++){
    let moved=false;
    for(const mini of visibleMinis){
      for(const skill of visibleSkills){
        const dx=mini.tx-skill.tx, dy=mini.ty-skill.ty;
        let d=Math.hypot(dx,dy);
        const needed=collisionRadius(mini)+collisionRadius(skill)+margin;
        if(d<needed){
          let ux,uy;
          if(d<.001){
            const angle=mini.branchAngle ?? skill.branchAngle ?? 0;
            ux=Math.cos(angle); uy=Math.sin(angle); d=0;
          }else{
            ux=dx/d; uy=dy/d;
          }
          const push=needed-d+1;
          mini.tx+=ux*push;
          mini.ty+=uy*push;
          moved=true;
        }
      }
    }

    // The skill-separation pass can move mini-skills into one another, so
    // restore mini-to-mini clearance across the entire visible mini group.
    for(let i=0;i<visibleMinis.length;i++){
      for(let j=i+1;j<visibleMinis.length;j++){
        const a=visibleMinis[i], b=visibleMinis[j];
        let dx=b.tx-a.tx, dy=b.ty-a.ty;
        let d=Math.hypot(dx,dy);
        const needed=collisionRadius(a)+collisionRadius(b)+10;
        if(d<needed){
          let ux,uy;
          if(d<.001){ux=1;uy=0;d=0;}else{ux=dx/d;uy=dy/d;}
          const push=(needed-d+1)/2;
          a.tx-=ux*push; a.ty-=uy*push;
          b.tx+=ux*push; b.ty+=uy*push;
          moved=true;
        }
      }
    }
    if(!moved) break;
  }

  // Keep the corrected bubbles inside the visible stage.
  for(const mini of visibleMinis){
    const r=collisionRadius(mini);
    mini.tx=clamp(mini.tx,edgeMargin+r,layout.w-edgeMargin-r);
    mini.ty=clamp(mini.ty,edgeMargin+r,layout.h-edgeMargin-r);
  }
}
function computeTargets(){
  const categories=nodes.filter(n=>n.type==='category');
  categories.forEach(n=>{
    n.angle=n.baseAngle;
    n.tx=layout.cx + Math.cos(n.baseAngle)*layout.coreR;
    n.ty=layout.cy + Math.sin(n.baseAngle)*layout.coreR;
  });
  const categoryMap=Object.fromEntries(categories.map(n=>[n.category,n]));

  // Place primary skills on a true circular arc. Spacing is calculated from
  // the rendered bubble diameters, so sibling skill bubbles cannot overlap.
  CATEGORY_KEYS.forEach(category=>{
    const cn=categoryMap[category];
    const group=nodes.filter(n=>n.type==='skill' && n.category===category).sort((a,b)=>a.skillIndex-b.skillIndex);
    const focused=activeCategory===category;
    let radius=focused ? 130 : 78;
    if(activeSkill && activeSkill.category===category) radius+=8;
    placeCircularGroup(group,cn.tx,cn.ty,cn.angle,radius,10);
  });

  const skillMap={};
  nodes.filter(n=>n.type==='skill').forEach(n=>{skillMap[n.category+'__'+n.skill]=n;});

  // Place mini-skills on a circular arc around their parent skill. Their
  // spacing also uses actual bubble radii, preventing mini-skill overlap.
  nodes.filter(n=>n.type==='skill').forEach(sn=>{
    const group=nodes.filter(n=>n.type==='mini' && n.category===sn.category && n.skill===sn.skill).sort((a,b)=>a.miniIndex-b.miniIndex);
    const focused=!!activeSkill && activeSkill.category===sn.category && activeSkill.skill===sn.skill;
    const radius=focused ? 118 : 40;
    const centerAngle=sn.branchAngle ?? categoryMap[sn.category].angle;
    placeCircularGroup(group,sn.tx,sn.ty,centerAngle,radius,8);
  });

  resolveCrossLevelCollisions();
}
function updateHitState(){
  const q=search.value.trim().toLowerCase();
  nodes.forEach(n=>{n.hit=false;n.categoryHit=false;n.skillHit=false;});
  if(!q) return;
  nodes.forEach(n=>{
    const parts=[n.label,n.category,n.skill,n.mini].filter(Boolean).join(' ').toLowerCase();
    if(parts.includes(q)) n.hit=true;
  });
  const miniHits=nodes.filter(n=>n.type==='mini'&&n.hit);
  miniHits.forEach(n=>{
    nodes.forEach(m=>{
      if(m.type==='skill' && m.category===n.category && m.skill===n.skill) m.skillHit=true;
      if(m.type==='category' && m.category===n.category) m.categoryHit=true;
    });
  });
  const skillHits=nodes.filter(n=>n.type==='skill'&&n.hit);
  skillHits.forEach(n=>{
    nodes.forEach(m=>{ if(m.type==='category' && m.category===n.category) m.categoryHit=true; });
  });
  const categoryHits=nodes.filter(n=>n.type==='category'&&n.hit);
  categoryHits.forEach(n=>n.categoryHit=true);
}
function setPanel(){
  let key='intro';
  if(activeNode?.type==='mini') key='mini:'+activeNode.category+'/'+activeNode.skill+'/'+activeNode.mini;
  else if(activeNode?.type==='skill') key='skill:'+activeNode.category+'/'+activeNode.skill;
  else if(activeNode?.type==='category') key='cat:'+activeNode.category;
  if(key===lastPanelKey) return;
  lastPanelKey=key;
  if(activeNode?.type==='mini'){
    const n=activeNode;
    panel.innerHTML=`<div class="eyebrow">Supporting capability</div><div class="path">${esc(n.category)} / ${esc(n.skill)}</div><h1>${esc(n.mini)}</h1><p>This capability supports ${esc(n.skill)} within ${esc(n.category)}. The full branch remains in focus while this node is explored.</p><div class="chips"><span class="chip">Level 3 capability</span><span class="chip">Center reset required</span></div>`;
  } else if(activeNode?.type==='skill'){
    const n=activeNode;
    panel.innerHTML=`<div class="eyebrow">Primary skill</div><div class="path">${esc(n.category)} / ${esc(n.skill)}</div><h1>${esc(n.skill)}</h1><p>This skill is active within its branch. The other seven domains remain dimmed while you explore it.</p><div class="chips"><span class="chip">${n.minis.length} supporting capabilities</span><span class="chip">Branch locked</span></div><h2>Mini-skills</h2><div class="mini-list">${n.minis.map(x=>`<div class="mini-row">${esc(x)}</div>`).join('')}</div>`;
  } else if(activeNode?.type==='category'){
    const n=activeNode;
    const skills=Object.keys(SOURCE[n.category]);
    const count=Object.values(SOURCE[n.category]).reduce((a,x)=>a+x.length,0);
    panel.innerHTML=`<div class="eyebrow">Capability domain</div><div class="path">Octagon / ${esc(n.category)}</div><h1>${esc(n.category)}</h1><p>This branch is locked for exploration. Return the cursor to the center hub before switching to another domain.</p><div class="chips"><span class="chip">${skills.length} skills</span><span class="chip">${count} capabilities</span><span class="chip">Branch locked</span></div><h2>Primary skills</h2><div class="mini-list">${skills.map(x=>`<div class="mini-row">${esc(x)}</div>`).join('')}</div>`;
  } else showIntro();
}
function showIntro(){
  panel.innerHTML='<div class="eyebrow">Eight-domain capability model</div><h1>Dynamic focus reflow</h1><p>Hover a domain to lock and reveal its branch. To explore a different domain, move the cursor through the center reset hub first.</p><div class="chips"><span class="chip">Hover-driven</span><span class="chip">Low clutter</span><span class="chip">Space-aware</span></div><div class="intro">The octagon now remains fixed while the active branch receives visual emphasis. This keeps the structure stable and easy to scan.</div>';
}
function renderedRadius(n){
  const base=n.type==='category'?64:n.type==='skill'?33:31;
  return base*Math.max(.65,n.displayScale||1);
}
function directHit(list){
  let best=null,bestRatio=Infinity;
  for(const n of list){
    const radius=renderedRadius(n);
    const d=Math.hypot(pointer.x-n.px,pointer.y-n.py);
    const ratio=d/radius;
    if(ratio<=1 && ratio<bestRatio){best=n;bestRatio=ratio;}
  }
  return best;
}
function updateCenterHub(centerDistance=Infinity){
  const locked=!!activeCategory;
  centerMark.classList.toggle('locked',locked);
  centerMark.classList.toggle('nudge',lockedAttempt);
  centerMark.classList.toggle('reset-ready',locked && centerDistance<122);
  if(locked){
    centerTitle.textContent='Return to center';
    centerHint.textContent='to switch branches';
  }else{
    centerTitle.textContent='Choose a domain';
    centerHint.textContent='hover a large bubble';
  }
}
function determineFocus(){
  lockedAttempt=false;

  // Leaving the canvas does not release the selected branch. The user must
  // intentionally cross the central reset hub before another branch can open.
  if(!pointer.inside){
    activeNode=null;
    activeMini=null;
    updateCenterHub();
    setPanel();
    return;
  }

  const centerDistance=Math.hypot(pointer.x-layout.cx,pointer.y-layout.cy);

  // The middle hub is the only branch reset mechanism.
  if(centerDistance<112){
    activeCategory=null;
    activeSkill=null;
    activeMini=null;
    activeNode=null;
    updateCenterHub(centerDistance);
    setPanel();
    return;
  }

  if(activeCategory){
    // While locked, only bubbles belonging to the active branch can receive
    // focus. Directly hovering another domain is deliberately ignored.
    const miniNode=directHit(nodes.filter(n=>n.type==='mini' && n.category===activeCategory && miniVisible(n)));
    const skillNode=directHit(nodes.filter(n=>n.type==='skill' && n.category===activeCategory));
    const categoryNode=directHit(nodes.filter(n=>n.type==='category' && n.category===activeCategory));
    const blockedCategory=directHit(nodes.filter(n=>n.type==='category' && n.category!==activeCategory));
    const hit=miniNode||skillNode||categoryNode;

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
      if(blockedCategory) lockedAttempt=true;
    }
  }else{
    // With no branch locked, only the eight domain bubbles can start a branch.
    const categoryNode=directHit(nodes.filter(n=>n.type==='category'));
    if(categoryNode){
      activeCategory=categoryNode.category;
      activeSkill=null;
      activeMini=null;
      activeNode=categoryNode;
    }else{
      activeNode=null;
    }
  }

  updateCenterHub(centerDistance);
  setPanel();
}
function applyClasses(){
  const q=search.value.trim();
  const hardCategoryFocus = activeCategory || null;
  nodes.forEach(n=>{
    const isFocused=n===activeNode;
    n.el.classList.toggle('focused',isFocused);
    n.el.classList.toggle('visible',(n.type==='skill' && skillVisible(n)) || (n.type==='mini' && miniVisible(n)));
    n.el.classList.toggle('near',n.type==='mini' && isFocused);
    let dim=q ? !(n.hit || n.categoryHit || n.skillHit) : false;
    if(!q && hardCategoryFocus && n.type==='category' && n.category!==hardCategoryFocus) dim = true;
    n.el.classList.toggle('dim',dim);
    n.el.classList.toggle('match',q && (n.hit || n.categoryHit || n.skillHit));
  });
  edges.forEach(e=>{
    let visible=(e.kind==='core');
    if(e.kind!=='core'){
      if(e.a.type==='category' && e.b.type==='skill') visible = skillVisible(e.b);
      if(e.a.type==='skill' && e.b.type==='mini') visible = miniVisible(e.b);
    }
    e.el.classList.toggle('hidden',!visible);
    e.el.classList.toggle('visible',visible && e.kind!=='core');
    const attachedToFocusedCategory = !!hardCategoryFocus && e.kind==='core' && (e.a.category===hardCategoryFocus || e.b.category===hardCategoryFocus);
    const branchActive = !!activeNode && e.kind!=='core' && (e.a===activeNode || e.b===activeNode || (activeMini && e.a===activeMini.parent && e.b===activeMini) || (activeSkill && e.a===activeSkill.parent && e.b===activeSkill));
    e.el.classList.toggle('active',branchActive);
    let dim=q && !(e.a.hit||e.a.categoryHit||e.a.skillHit||e.b.hit||e.b.categoryHit||e.b.skillHit);
    // Create a visual gap around the active main domain by dimming only the
    // two octagon edges that connect it to its immediate neighbours.
    if(!q && attachedToFocusedCategory) dim = true;
    e.el.classList.toggle('dim',dim);
  });
}
function render(initial=false){
  computeTargets();
  nodes.forEach(n=>{
    n.px = initial ? n.tx : lerp(n.px,n.tx,.16);
    n.py = initial ? n.ty : lerp(n.py,n.ty,.16);
    const d=Math.hypot(pointer.x-n.px,pointer.y-n.py);
    const activeBranch = (activeCategory && n.category===activeCategory);
    let s = n.type==='category' ? .92 : n.type==='skill' ? .86 : .9;
    const hardCategoryFocus = activeCategory || null;
    if(n.type==='category' && hardCategoryFocus && n.category!==hardCategoryFocus) s -= .1;
    if(n.type==='category' && activeNode===n) s += .26;
    if(n.type==='skill' && activeNode===n) s += .2;
    if(n.type==='mini' && activeNode===n) s += 1.02;
    const visible = n.type==='category' || skillVisible(n) || miniVisible(n);
    if(visible){
      const directRange=renderedRadius(n)*1.08;
      const maxBoost=n.type==='category'?.42:n.type==='skill'?.68:.18;
      if(d<directRange){ const t=1-d/directRange; s += t*t*maxBoost; }
    }
    if(activeBranch && n.type==='skill' && n.category===activeCategory) s += .06;
    if(activeBranch && n.type==='mini' && n.skill===activeSkill?.skill) s += .05;
    n.displayScale=s;
    n.el.style.left=n.px+'px';
    n.el.style.top=n.py+'px';
    n.el.style.setProperty('--s',s.toFixed(3));
    n.el.style.zIndex=activeNode===n&&n.type==='mini'?'1000':String(Math.round(s*35)+(n.type==='category'?40:n.type==='skill'?20:0));
  });
  edges.forEach(e=>{
    e.el.setAttribute('x1',e.a.px); e.el.setAttribute('y1',e.a.py);
    e.el.setAttribute('x2',e.b.px); e.el.setAttribute('y2',e.b.py);
  });
  applyClasses();
  lens.style.left=pointer.x+'px'; lens.style.top=pointer.y+'px';
}
function tick(){ determineFocus(); render(); requestAnimationFrame(tick); }
search.addEventListener('input',()=>{updateHitState(); setPanel();});
stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect(); pointer.x=e.clientX-r.left; pointer.y=e.clientY-r.top; pointer.inside=true;});
stage.addEventListener('pointerleave',()=>{pointer.inside=false; pointer.x=-9999; pointer.y=-9999;});
window.addEventListener('resize',build);
build(); updateHitState(); requestAnimationFrame(tick);
