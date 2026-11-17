import * as T from './vendor/three.module.js';

const gold=0xf2cb25, dark=0x14200f;
const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.42,metalness:.2,...extra});
function mesh(geo,mat,parent,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
function ring(radius,tube,parent,mat){return mesh(new T.TorusGeometry(radius,tube,8,120),mat,parent);}
function textTexture(text,bg='#eec72a',ink='#192311',size=1024){const c=document.createElement('canvas');c.width=size;c.height=size;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,size,size);x.fillStyle=ink;x.font=`900 ${size*.2}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,size/2,size/2,size*.9);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}

/** A real truncated icosahedron: 12 pentagons and 20 hexagons. */
function football(parent){
  const source=new T.IcosahedronGeometry(1,0).attributes.position,vertices=[],faces=[];
  for(let i=0;i<source.count;i+=3){const face=[];for(let j=0;j<3;j++){const v=new T.Vector3().fromBufferAttribute(source,i+j).normalize();let index=vertices.findIndex(p=>p.distanceToSquared(v)<.00001);if(index<0){index=vertices.length;vertices.push(v);}face.push(index);}faces.push(face);}
  const adjacency=vertices.map(()=>new Set());faces.forEach(f=>f.forEach((v,i)=>{adjacency[v].add(f[(i+1)%3]);adjacency[v].add(f[(i+2)%3]);}));
  const point=(a,b)=>vertices[a].clone().lerp(vertices[b],1/3).normalize().multiplyScalar(1.58);
  const black=material(0x15200f,{roughness:.65}),yellow=material(0xd9aa16,{roughness:.4,metalness:.28});
  const seam=material(0x323c21,{roughness:.75});
  function panel(points,mat){const center=points.reduce((s,p)=>s.add(p),new T.Vector3()).divideScalar(points.length),data=[];const contour=points.map(p=>p.clone().lerp(center,.015));for(let i=0;i<contour.length;i++){const a=contour[i],b=contour[(i+1)%contour.length];const cross=a.clone().sub(center).cross(b.clone().sub(center));if(cross.dot(center)>0)data.push(...center,...a,...b);else data.push(...center,...b,...a);}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(data,3));geometry.computeVertexNormals();mesh(geometry,mat,parent);const line=new T.LineLoop(new T.BufferGeometry().setFromPoints(contour),new T.LineBasicMaterial({color:0x243116}));parent.add(line);}
  vertices.forEach((v,i)=>{const ps=[...adjacency[i]].map(j=>point(i,j));const axis=ps[0].clone().sub(v.clone().multiplyScalar(ps[0].dot(v))).normalize(),up=v.clone().cross(axis);ps.sort((a,b)=>Math.atan2(a.dot(up),a.dot(axis))-Math.atan2(b.dot(up),b.dot(axis)));panel(ps,black);});
  faces.forEach(([a,b,c])=>panel([point(a,b),point(b,a),point(b,c),point(c,b),point(c,a),point(a,c)],yellow));

}

function stadium(parent){
  const stadium=new T.Group();parent.add(stadium);stadium.rotation.y=-.22;
  const base=material(0x253a25),stands=material(0x5c6637),yellow=material(gold),grey=material(0x6f7d66),steel=material(0x8a917c,{metalness:.7});
  const pitchCanvas=document.createElement('canvas');pitchCanvas.width=1024;pitchCanvas.height=640;const ctx=pitchCanvas.getContext('2d');for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#426d3b':'#365e31';ctx.fillRect(i*102.4,0,103,640);}ctx.strokeStyle='#d0dfaa';ctx.lineWidth=4;ctx.strokeRect(40,35,944,570);ctx.beginPath();ctx.moveTo(512,35);ctx.lineTo(512,605);ctx.stroke();ctx.beginPath();ctx.arc(512,320,85,0,Math.PI*2);ctx.stroke();ctx.strokeRect(40,170,155,300);ctx.strokeRect(829,170,155,300);ctx.strokeRect(40,240,65,160);ctx.strokeRect(919,240,65,160);const pt=new T.CanvasTexture(pitchCanvas);pt.colorSpace=T.SRGBColorSpace;
  const ground=mesh(new T.CylinderGeometry(3.2,3.3,.16,96),base,stadium,0,-.2,0);ground.scale.z=.7;
  const field=mesh(new T.PlaneGeometry(4.3,2.65),new T.MeshStandardMaterial({map:pt,roughness:1}),stadium,0,-.105,0);field.rotation.x=-Math.PI/2;
  const seatGeo=new T.BoxGeometry(.12,.07,.1),seatMat=material(0xe3bf2c,{roughness:.85});
  const seats=new T.InstancedMesh(seatGeo,seatMat,600);let seatIndex=0;const dummy=new T.Object3D();
  for(let tier=0;tier<5;tier++){const r=2.55+tier*.11,y=tier*.105;for(let i=0;i<96;i++){const angle=i/96*Math.PI*2;dummy.position.set(Math.cos(angle)*r,y,Math.sin(angle)*r*.66);dummy.rotation.y=-angle+Math.PI/2;dummy.updateMatrix();seats.setMatrixAt(seatIndex++,dummy.matrix);}}
  seats.count=seatIndex;stadium.add(seats);
  for(let i=0;i<64;i++){const a=i/64*Math.PI*2;const section=mesh(new T.BoxGeometry(.32,.65,.23),i%4===0?yellow:stands,stadium,Math.cos(a)*3.09,.15,Math.sin(a)*2.04);section.rotation.y=-a+Math.PI/2;}
  const shape=new T.Shape();shape.absellipse(0,0,3.3,2.27,0,Math.PI*2,false,0);const hole=new T.Path();hole.absellipse(0,0,2.57,1.7,0,Math.PI*2,true,0);shape.holes.push(hole);const roof=mesh(new T.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:false,curveSegments:70}),grey,stadium,0,.75,0);roof.rotation.x=Math.PI/2;
  const lamps=[];for(const x of [-2.45,2.45])for(const z of [-1.8,1.8]){mesh(new T.CylinderGeometry(.025,.045,1.9,8),steel,stadium,x,.7,z);const lamp=mesh(new T.BoxGeometry(.6,.25,.08),new T.MeshStandardMaterial({color:0xfff6d8,emissive:0xffe89c,emissiveIntensity:2.5}),stadium,x,1.7,z);lamp.rotation.x=z>0?-.25:.25;lamps.push(lamp);}
  for(const x of [-2.07,2.07]){const post=material(0xe1e7d1);for(const z of [-.38,.38])mesh(new T.CylinderGeometry(.012,.012,.34,6),post,stadium,x,.06,z);const cross=mesh(new T.CylinderGeometry(.012,.012,.77,6),post,stadium,x,.23,0);cross.rotation.x=Math.PI/2;}
  const label=mesh(new T.PlaneGeometry(1.15,.32),new T.MeshStandardMaterial({map:textTexture('DIMA MAS'),side:T.DoubleSide}),stadium,0,.3,2.17);label.rotation.x=-.05;
  return {stadium,lamps};
}

function trophy(parent){
  const group=new T.Group();parent.add(group);const brass=material(0xe8b627,{metalness:.78,roughness:.25}),edge=material(0xffe384,{metalness:.7,roughness:.22}),base=material(0x1e2819,{roughness:.3,metalness:.4});
  mesh(new T.CylinderGeometry(.75,.84,.24,64),base,group,0,-1.55,0);mesh(new T.CylinderGeometry(.5,.6,.16,64),brass,group,0,-1.35,0);mesh(new T.CylinderGeometry(.13,.29,.75,32),brass,group,0,-.92,0);
  const points=[new T.Vector2(.05,-.58),new T.Vector2(.3,-.52),new T.Vector2(.5,-.32),new T.Vector2(.73,.03),new T.Vector2(.91,.55),new T.Vector2(1.02,1.04),new T.Vector2(.99,1.09),new T.Vector2(.94,1.01),new T.Vector2(.84,.54),new T.Vector2(.67,.05),new T.Vector2(.46,-.28),new T.Vector2(.05,-.44)];mesh(new T.LatheGeometry(points,96),brass,group);
  const lip=ring(1,.035,group,edge);lip.rotation.x=Math.PI/2;lip.position.y=1.04;
  for(const side of [-1,1]){const path=new T.CatmullRomCurve3([new T.Vector3(side*.86,.83,0),new T.Vector3(side*1.4,.75,0),new T.Vector3(side*1.45,.1,0),new T.Vector3(side*.56,-.4,0)]);mesh(new T.TubeGeometry(path,40,.065,10,false),edge,group);const ribbon=mesh(new T.PlaneGeometry(.17,1.1,1,10),new T.MeshStandardMaterial({color:gold,side:T.DoubleSide}),group,side*1.17,-.35,.02);ribbon.rotation.z=side*.16;}
  const plaque=mesh(new T.PlaneGeometry(.75,.19),new T.MeshStandardMaterial({map:textTexture('2011','#d6ad2a','#17200e')}),group,0,-1.54,.81);plaque.rotation.x=-.02;
  return group;
}

function flags(parent){
  const group=new T.Group();parent.add(group);const cloth=[];
  for(let i=0;i<3;i++){const pole=new T.Group();pole.position.set((i-1)*1.45,-1.75,(i===1?-.65:0));pole.rotation.z=(i-1)*-.13;group.add(pole);mesh(new T.CylinderGeometry(.025,.035,4.6,12),material(0x7e8968,{metalness:.65}),pole,0,1.7,0);mesh(new T.SphereGeometry(.065,12,12),material(gold),pole,0,4.03,0);
    const c=document.createElement('canvas');c.width=1024;c.height=768;const x=c.getContext('2d');x.fillStyle=i===1?'#14200f':'#e9bf20';x.fillRect(0,0,1024,768);x.fillStyle=i===1?'#e9bf20':'#19250f';x.fillRect(0,50,1024,35);x.fillRect(0,680,1024,35);x.font='900 150px Arial';x.textAlign='center';x.fillText(i===1?'FÈS':'DIMA',512,340);x.font='900 200px Arial';x.fillText(i===1?'1946':'MAS',512,550);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const geo=new T.PlaneGeometry(2.25,1.75,40,28);geo.translate(1.125,0,0);const m=mesh(geo,new T.MeshStandardMaterial({map,side:T.DoubleSide,roughness:.82}),pole,0,2.8,0);cloth.push({mesh:m,original:geo.attributes.position.array.slice(),phase:i*1.7});}
  return cloth;
}

export class World{
  constructor(mount,paused=false){
    this.mount=mount;this.kind=mount.dataset.scene;this.paused=paused;this.visible=true;this.dirty=true;this.time=0;this.wind=1;this.dragging=false;this.y=0;this.x=0;this.pointer={x:0,y:0};this.renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
    this.canvas=this.renderer.domElement;this.canvas.tabIndex=0;this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label',mount.getAttribute('aria-label')||'Scène 3D interactive');mount.append(this.canvas);this.scene=new T.Scene();this.group=new T.Group();this.scene.add(this.group);
    this.camera=new T.PerspectiveCamera(36,1,.1,100);this.ambient=new T.HemisphereLight(0xfff8d4,0x486432,2.5);this.scene.add(this.ambient);this.key=new T.DirectionalLight(0xffefbb,4);this.key.position.set(4,5,5);this.scene.add(this.key);const rim=new T.DirectionalLight(0xd1e7a7,2.8);rim.position.set(-4,1,-3);this.scene.add(rim);const fill=new T.DirectionalLight(0xffffff,1.7);fill.position.set(-3,2,4);this.scene.add(fill);
    if(this.kind==='ball'){this.ball=new T.Group();this.group.add(this.ball);football(this.ball);this.ball.rotation.set(.25,.2,.3);this.rings=new T.Group();this.group.add(this.rings);for(let i=0;i<2;i++){const r=ring(2.12+i*.25,.006,this.rings,new T.MeshBasicMaterial({color:gold,transparent:true,opacity:.38}));r.rotation.set(.8+i*.6,.2+i*.9,.1);}const points=[];for(let i=0;i<65;i++){const a=i*2.399,r=2.5+(i%9)*.12;points.push(Math.cos(a)*r,Math.sin(a*1.13)*2,Math.sin(a)*r);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));this.sparks=new T.Points(geo,new T.PointsMaterial({color:gold,size:.022,transparent:true,opacity:.6}));this.group.add(this.sparks);}
    if(this.kind==='stadium'){this.stadium=stadium(this.group);this.x=.36;}
    if(this.kind==='trophy')this.trophy=trophy(this.group);
    if(this.kind==='flags'){this.cloth=flags(this.group);this.y=-.2;}
    this.bind();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(mount);this.visibility=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;this.dirty=true;},{rootMargin:'60px'});this.visibility.observe(mount);this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;mount.classList.remove('is-ready');});this.canvas.addEventListener('webglcontextrestored',()=>{this.lost=false;this.dirty=true;mount.classList.add('is-ready');});this.resize();mount.classList.add('is-ready');
    let last=performance.now();const tick=now=>{const dt=Math.min((now-last)/1000,.05);last=now;if(this.visible&&!document.hidden&&!this.lost&&(!this.paused||this.dirty)){if(!this.paused)this.time+=dt;this.animate();this.renderer.render(this.scene,this.camera);this.dirty=false;}this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);
  }
  resize(){const w=this.mount.clientWidth,h=this.mount.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;const narrow=Math.max(1,1/this.camera.aspect);if(this.kind==='stadium'){this.camera.position.set(0,5.2,8.1);this.camera.position.multiplyScalar(Math.max(1,narrow*.75));this.camera.lookAt(0,0,0);}else{this.camera.position.set(0,this.kind==='flags'?.45:0,(this.kind==='flags'?9:7)*Math.max(1,narrow*.74));this.camera.lookAt(0,this.kind==='flags'?.45:0,0);}this.camera.updateProjectionMatrix();this.dirty=true;}
  bind(){let px,py;this.canvas.addEventListener('pointerdown',e=>{px=e.clientX;py=e.clientY;this.dragging=true;this.canvas.setPointerCapture(e.pointerId);});this.canvas.addEventListener('pointermove',e=>{if(this.dragging){this.y+=(e.clientX-px)*.008;this.x=Math.max(-.6,Math.min(.7,this.x+(e.clientY-py)*.004));px=e.clientX;py=e.clientY;this.dirty=true;}else{const r=this.mount.getBoundingClientRect();this.pointer.x=(e.clientX-r.left)/r.width-.5;this.pointer.y=(e.clientY-r.top)/r.height-.5;}});for(const event of ['pointerup','pointercancel','lostpointercapture'])this.canvas.addEventListener(event,()=>this.dragging=false);this.canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')this.y-=.2;if(e.key==='ArrowRight')this.y+=.2;if(e.key==='ArrowUp')this.x=Math.max(-.6,this.x-.1);if(e.key==='ArrowDown')this.x=Math.min(.7,this.x+.1);this.dirty=true;});}
  animate(){const t=this.time;this.group.rotation.y=this.y+(this.paused||this.dragging?0:Math.sin(t*.18)*.1);this.group.rotation.x=this.x;
    if(this.ball){this.ball.rotation.y=t*.18+this.y*.3;this.ball.rotation.z=.25+Math.sin(t*.4)*.04;this.ball.position.y=Math.sin(t*.8)*.09;this.rings.rotation.y=t*.07;this.rings.rotation.z=t*.03;this.sparks.rotation.y=-t*.025;if(!this.paused&&!this.dragging)this.group.rotation.x+=this.pointer.y*.15;}
    if(this.trophy){this.trophy.rotation.y=t*.18;this.trophy.position.y=Math.sin(t*.7)*.05;}
    if(this.cloth)for(const c of this.cloth){const p=c.mesh.geometry.attributes.position,o=c.original;for(let i=0;i<p.count;i++){const x=o[i*3],y=o[i*3+1],strength=x/2.25;p.setZ(i,Math.sin(x*3.2+y*1.4-t*3*this.wind+c.phase)*.17*strength+Math.sin(x*5-t*2*this.wind)*.05*strength);p.setY(i,y-Math.sin(x*1.1)*.12+Math.cos(x*3-t*2*this.wind)*.035*strength);}p.needsUpdate=true;c.mesh.geometry.computeVertexNormals();}
  }
  setPaused(value){this.paused=value;this.dirty=true;}
  setMode(mode){this.mode=mode;const day=mode==='day';this.ambient.intensity=day?3.5:1.6;this.key.intensity=day?4:2.5;this.stadium?.lamps.forEach(m=>m.material.emissiveIntensity=day?.2:3);this.group.traverse(m=>{if(m.isMesh){for(const mat of (Array.isArray(m.material)?m.material:[m.material]))mat.wireframe=mode==='wire';}});this.mount.style.background=day?'radial-gradient(ellipse,#c1d18d22,transparent 70%)':'';this.dirty=true;}
}
