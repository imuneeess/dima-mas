import * as THREE from './vendor/three.module.js';

const W=1024;
const px=x=>(x+1.8)/3.6*W;
const py=y=>(1-(y+1.9)/3.6)*W;

/** Original concept artwork, generated as texture data; no official crest or kit asset. */
function paintKit(canvas,config,back=false){
  const ctx=canvas.getContext('2d'),away=config.kit==='away';
  const base=away?'#20271c':'#edc520',ink=away?'#edc520':'#192214';
  ctx.clearRect(0,0,W,W);ctx.fillStyle=base;ctx.fillRect(0,0,W,W);
  ctx.fillStyle=away?'#263020':'#e5bd1c';
  for(let x=0;x<W;x+=150)ctx.fillRect(x,0,70,W);
  // Restrained geometric weave, inspired by the rhythm of Fès tilework.
  ctx.save();ctx.strokeStyle=away?'#617143':'#917619';ctx.globalAlpha=.16;ctx.lineWidth=1.2;
  for(let y=0;y<W;y+=47)for(let x=0;x<W;x+=47){ctx.beginPath();ctx.moveTo(x+23,y);ctx.lineTo(x+47,y+23);ctx.lineTo(x+23,y+47);ctx.lineTo(x,y+23);ctx.closePath();ctx.stroke();}
  ctx.restore();
  ctx.fillStyle=ink;ctx.fillRect(0,py(1.6),px(-1.3),py(.1)-py(1.6));ctx.fillRect(px(1.3),py(1.6),W-px(1.3),py(.1)-py(1.6));
  ctx.strokeStyle=ink;ctx.lineWidth=25;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px(-.46),py(1.49));ctx.quadraticCurveTo(px(0),py(.99),px(.46),py(1.49));ctx.stroke();
  ctx.lineWidth=5;
  for(const side of [-1,1])for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(px(side*(.63+i*.09)),py(1.43-i*.025));ctx.lineTo(px(side*(1.13+i*.09)),py(1.04-i*.08));ctx.stroke();}
  ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';
  if(back){
    ctx.font=`700 ${config.name.length>10?42:50}px Arial`;ctx.direction=/[\u0600-\u06ff]/.test(config.name)?'rtl':'ltr';ctx.fillText(config.name,px(0),py(.68),440);
    ctx.direction='ltr';ctx.font='280px Impact, Arial Narrow, sans-serif';ctx.fillText(config.number,px(0),py(-.13),470);
    ctx.font='18px Arial';ctx.fillText('FÈS · 1946',px(0),py(-1.25));
  }else{
    const cx=px(.46),cy=py(.7),s=72;
    ctx.beginPath();ctx.moveTo(cx-s/2,cy-s/2);ctx.lineTo(cx+s/2,cy-s/2);ctx.lineTo(cx+s/2,cy+s/5);ctx.lineTo(cx,cy+s/2);ctx.lineTo(cx-s/2,cy+s/5);ctx.closePath();ctx.fill();
    ctx.fillStyle=base;ctx.font='bold 25px Arial';ctx.fillText('MAS',cx,cy-6);ctx.font='10px Arial';ctx.fillText('1946',cx,cy+15);
    ctx.fillStyle=ink;ctx.font='55px Arial';ctx.fillText('✳',px(-.47),py(.7));
    ctx.font='bold 68px Arial';ctx.fillText('DIMA MAS',px(0),py(.02),420);
    ctx.font='26px Arial';ctx.fillText('فاس في القلب',px(0),py(-.27));
    ctx.font='13px Arial';ctx.fillText('CONCEPT / FÈS EDITION',px(0),py(-1.39));
  }
  // Fine fabric grain stays subtle at distance.
  ctx.fillStyle=away?'#d6d7bd':'#fff9c2';ctx.globalAlpha=.06;
  for(let y=0;y<W;y+=4)for(let x=(y%8?1:3);x<W;x+=5)ctx.fillRect(x,y,1,2);
  ctx.globalAlpha=1;
}

function shirtGeometry(){
  const shape=new THREE.Shape();
  shape.moveTo(-.46,1.5);shape.quadraticCurveTo(-.28,1.13,0,1.14);shape.quadraticCurveTo(.28,1.13,.46,1.5);
  shape.lineTo(.94,1.37);shape.quadraticCurveTo(1.08,1.33,1.19,1.2);shape.lineTo(1.67,.76);shape.lineTo(1.31,.16);shape.lineTo(.96,.46);
  shape.lineTo(.93,-1.55);shape.quadraticCurveTo(0,-1.7,-.93,-1.55);shape.lineTo(-.96,.46);shape.lineTo(-1.31,.16);shape.lineTo(-1.67,.76);shape.lineTo(-1.19,1.2);shape.quadraticCurveTo(-1.08,1.33,-.94,1.37);shape.closePath();
  const base=new THREE.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.035,bevelThickness:.045,curveSegments:12});base.translate(0,0,-.11);
  const p=base.attributes.position,n=base.attributes.normal;
  const positions=[],uvs=[],normals=[],groups=[];
  const displacement=(x,y,z)=>{const side=Math.sign(z),waist=Math.max(0,1-(x/1.75)**2);return z+side*(.11*waist+.023*Math.sin(x*16+y*5)*Math.sin((y+1.7)*.95)+.012*Math.sin(y*17+x*3));};
  function add(v,normal,material){
    const [x,y,z]=v,d=displacement(x,y,z);positions.push(x,y,d);
    if(material<2){const dx=(displacement(x+.001,y,z)-displacement(x-.001,y,z))/.002,dy=(displacement(x,y+.001,z)-displacement(x,y-.001,z))/.002;const nn=new THREE.Vector3(-dx,-dy,1).multiplyScalar(material===0?1:-1).normalize();normals.push(nn.x,nn.y,nn.z);}else normals.push(...normal);
    uvs.push(material===1?1-(x+1.8)/3.6:(x+1.8)/3.6,(y+1.9)/3.6);
  }
  for(let i=0;i<p.count;i+=3){
    const normal=[n.getX(i),n.getY(i),n.getZ(i)];const mat=normal[2]>.99?0:normal[2]<-.99?1:2;
    const a=[p.getX(i),p.getY(i),p.getZ(i)],b=[p.getX(i+1),p.getY(i+1),p.getZ(i+1)],c=[p.getX(i+2),p.getY(i+2),p.getZ(i+2)];
    const start=positions.length/3;
    if(mat<2){
      const subdivisions=10;
      const point=(u,v)=>a.map((x,k)=>x+(b[k]-x)*u/subdivisions+(c[k]-x)*v/subdivisions);
      for(let u=0;u<subdivisions;u++)for(let v=0;v<subdivisions-u;v++){
        add(point(u,v),normal,mat);add(point(u+1,v),normal,mat);add(point(u,v+1),normal,mat);
        if(u+v<subdivisions-1){add(point(u+1,v),normal,mat);add(point(u+1,v+1),normal,mat);add(point(u,v+1),normal,mat);}
      }
    }else{add(a,normal,mat);add(b,normal,mat);add(c,normal,mat);}
    const count=positions.length/3-start;
    if(groups.length&&groups.at(-1).material===mat)groups.at(-1).count+=count;else groups.push({start,count,material:mat});
  }
  base.dispose();const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));for(const g of groups)geo.addGroup(g.start,g.count,g.material);geo.computeBoundingSphere();return geo;
}

export class JerseyStudio{
  constructor(mount,{config,paused,onView,onReady,onError}){
    this.mount=mount;this.config=config;this.paused=paused;this.onView=onView;this.onError=onError;this.visible=false;this.dirty=true;this.dragging=false;this.time=0;this.x=.03;this.y=-.25;this.targetY=-.25;this.targetX=.03;this.view='front';this.contextLost=false;
    this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.35;
    this.canvas=this.renderer.domElement;this.canvas.tabIndex=0;this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label','Maillot 3D interactif. Glisser ou utiliser les flèches pour tourner.');mount.append(this.canvas);
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(35,1,.1,30);this.camera.position.set(0,0,7.5);this.camera.lookAt(0,-.05,0);
    this.scene.add(new THREE.HemisphereLight(0xfff8d7,0x515c36,2.4));const key=new THREE.DirectionalLight(0xfff5da,3.2);key.position.set(-3,5,5);this.scene.add(key);const fill=new THREE.DirectionalLight(0xffffff,1.8);fill.position.set(4,2,3);this.scene.add(fill);const backlight=new THREE.DirectionalLight(0xffd76c,2.5);backlight.position.set(-2,3,-4);this.scene.add(backlight);
    this.front=document.createElement('canvas');this.back=document.createElement('canvas');for(const c of [this.front,this.back])c.width=c.height=W;
    this.textures=[new THREE.CanvasTexture(this.front),new THREE.CanvasTexture(this.back)];this.textures.forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());});
    this.materials=this.textures.map(map=>new THREE.MeshStandardMaterial({map,roughness:.88,metalness:.02,side:THREE.FrontSide}));this.materials.push(new THREE.MeshStandardMaterial({color:0xc9a218,roughness:.9}));
    this.shirt=new THREE.Mesh(shirtGeometry(),this.materials);this.scene.add(this.shirt);this.update(config);
    this.bind();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(mount);this.intersection=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;this.dirty=true;},{rootMargin:'150px'});this.intersection.observe(mount);this.resize();
    this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.contextLost=true;this.onError?.();});this.canvas.addEventListener('webglcontextrestored',()=>{this.contextLost=false;this.dirty=true;onReady?.();});
    let last=performance.now();const tick=now=>{const dt=Math.min((now-last)/1000,.05);last=now;if(this.visible&&!document.hidden&&!this.contextLost){if(!this.paused){this.time+=dt;if(this.autoRotate&&!this.dragging)this.targetY+=dt*.45;}const moving=Math.abs(this.targetY-this.y)>.001||Math.abs(this.targetX-this.x)>.001;this.y+=(this.targetY-this.y)*(this.paused?1:.13);this.x+=(this.targetX-this.x)*(this.paused?1:.13);if(!this.paused||this.dirty||moving){this.shirt.rotation.set(this.x,this.y+(this.paused||this.dragging?0:Math.sin(this.time*.45)*.07),-.015);this.shirt.position.y=this.paused?0:Math.sin(this.time*.8)*.035;this.renderer.render(this.scene,this.camera);this.dirty=false;}}this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);onReady?.();
  }
  resize(){const w=this.mount.clientWidth,h=this.mount.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.position.z=Math.max(6.2,5.9/this.camera.aspect);this.camera.updateProjectionMatrix();this.dirty=true;}
  bind(){let lastX,lastY,pointer;
    this.canvas.addEventListener('pointerdown',e=>{pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;this.dragging=true;this.autoRotate=false;document.querySelector('#auto-rotate')?.setAttribute('aria-pressed','false');this.canvas.setPointerCapture(pointer);});
    this.canvas.addEventListener('pointermove',e=>{if(!this.dragging||e.pointerId!==pointer)return;this.targetY+=(e.clientX-lastX)*.013;this.targetX=Math.max(-.5,Math.min(.5,this.targetX+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;this.dirty=true;this.notifyView();});
    const end=()=>{this.dragging=false;};this.canvas.addEventListener('pointerup',end);this.canvas.addEventListener('pointercancel',end);this.canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')this.targetY-=.2;if(e.key==='ArrowRight')this.targetY+=.2;if(e.key==='ArrowUp')this.targetX=Math.max(-.5,this.targetX-.1);if(e.key==='ArrowDown')this.targetX=Math.min(.5,this.targetX+.1);this.dirty=true;this.notifyView();});
  }
  notifyView(){this.view=Math.cos(this.targetY)>=0?'front':'back';this.onView?.(this.view);}
  setView(view){this.autoRotate=false;document.querySelector('#auto-rotate')?.setAttribute('aria-pressed','false');this.view=view;const turns=Math.round(this.targetY/(Math.PI*2));this.targetY=turns*Math.PI*2+(view==='back'?Math.PI+.18:-.18);this.targetX=.03;this.dirty=true;this.onView?.(view);}
  update(config){this.config={...config};paintKit(this.front,config);paintKit(this.back,config,true);this.textures.forEach(t=>t.needsUpdate=true);this.materials[2].color.set(config.kit==='away'?0x1e2719:0xd4ac16);this.dirty=true;}
  setPaused(value){this.paused=value;this.dirty=true;}
  async exportImage(){
    const output=document.createElement('canvas');output.width=1600;output.height=1200;const ctx=output.getContext('2d');ctx.fillStyle='#e5e8db';ctx.fillRect(0,0,1600,1200);ctx.fillStyle='#1c2515';ctx.font='bold 36px Arial';ctx.fillText('DIMA MAS / MON DESIGN',70,75);ctx.font='18px Arial';ctx.fillText('CONCEPT NON OFFICIEL · UNOFFICIAL CONCEPT',70,110);
    const rotation=this.shirt.rotation.clone(),position=this.shirt.position.clone(),size=new THREE.Vector2();this.renderer.getSize(size);const aspect=this.camera.aspect,z=this.camera.position.z,pixelRatio=this.renderer.getPixelRatio();
    try{this.renderer.setPixelRatio(1);this.renderer.setSize(720,900,false);this.camera.aspect=.8;this.camera.position.z=7.5;this.camera.updateProjectionMatrix();this.shirt.position.y=0;
      for(const [index,angle] of [[0,-.1],[1,Math.PI+.1]]){this.shirt.rotation.set(.02,angle,0);this.renderer.render(this.scene,this.camera);ctx.drawImage(this.canvas,80+index*720,155,720,900);}
      ctx.fillStyle='#1c2515';ctx.font='22px Arial';ctx.textAlign='center';ctx.fillText(`${this.config.kit.toUpperCase()} / ${this.config.size} / ${this.config.name||'—'} / ${this.config.number||'—'}`,800,1110);ctx.font='15px Arial';ctx.fillText('Personalized concept design. No purchase or official affiliation.',800,1150);
      return await new Promise(resolve=>output.toBlob(resolve,'image/png'));
    }finally{this.shirt.rotation.copy(rotation);this.shirt.position.copy(position);this.renderer.setPixelRatio(pixelRatio);this.renderer.setSize(size.x,size.y,false);this.camera.aspect=aspect;this.camera.position.z=z;this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);this.dirty=true;}
  }
}
