/*
  Gravi-o-roids! (c) 2017-2021 N. Landsteiner, www.masswerk.at
  URL: www.masswerk.at/gravioroids/
*/
"use strict";
var GraviOroids=(function(){var TAU=Math.PI*2,PI2=Math.PI/2,IFPS=90,IFSLICE=1000/IFPS,IFFRACS=1/IFPS,SCREEN_WIDTH=840,SCREEN_HEIGHT=630,SAUCERS_MAX=8,ASTEROIDS_MAX=15,ASTEROID_SIZE=25,ASTEROID_VELOCITY=80,ASTEROID_SIDES=11,ASTEROID_ROTATION=Math.PI*0.5,SHIP_ACCELERATION=36.6,SHIP_MAX_VELOCITY=208,SHIP_ROTATION=Math.PI*0.7,SHIP_SHOT_V0COEF=0.85,CENTER_X=SCREEN_WIDTH/2,CENTER_Y=SCREEN_HEIGHT/2,MARGIN=10,MAX_X=SCREEN_WIDTH+MARGIN,MAX_Y=SCREEN_HEIGHT+MARGIN,DMAX_X=MAX_X/2,DMAX_Y=MAX_Y/2,GRAVITY_HI=9.3,GRAVITY_LO=GRAVITY_HI/1.75,GRAVITY=GRAVITY_HI,SHOT_LENGTH=2.75,SHIP_SHOTS_MAX=5,SAUCER_SHOTS_MAX=6,HIT_DELTACOEF=0.3,HIT_EPSILON=1.5,SHIP_COOLING=0.4,SAUCER_COOLING=3,SHIP_SHOT_ACCELERATION=150,SAUCER_SHOT_ACCELERATION=180,PARTICLE_VELOCITY=22,PARTICLE_ROTATION=TAU*0.8,EXPLOSION_LENGTH=1.5,AIM_NOISE=10*SHOT_LENGTH/3,AIM_EPSILON=5,AP_SMOOTHING=0.8,AMAX_X=DMAX_X+MARGIN,AMAX_Y=DMAX_Y+MARGIN,WAVE_DURATION=80,AUTOPLAY_DELAY=25,AUTOPLAY_MIN_DURATION=20,AUTOPLAY_WAVE=1,GUIDED_SHOTS=true,SHOT_STEERING_COEF=0.6,CANVAS_ID='crt',DEBUG=false,SAUCER_SHOT_DISABLE=false,ECONOMY=false;var S_IDLE=0,S_ACTIVE=1,S_EXPLODE=2,GS_IDLE=0,GS_ATTRACT=1,GS_NEWWAVE=2,GS_RUN=3,GS_WAVEEND=4,GS_GAMEOVER=5,GS_HSINPUT=6,GS_AUTOPLAY=7;var WAVE_DEFS=[[2,4,55,true],[2,6,40,false],[3,7,25,false],[3,8,0,false],[2,9,0,false],[2,10,0,false],[2,5,0,false],[2,10,0,false],[4,9,0,false],[2,10,0,false],[3,10,0,false],[2,10,0,false],[2,10,0,false],[8,1,0,false,25],[1,15,0,true],[1,1,0,true,30]],WAVE_REPEAT_RANGE=6,WAVE_REPEAT_OFFSET=7;var reqAnimFrame=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.oRequestAnimationFrame||null,hasAnimFrame=Boolean(reqAnimFrame),hasPath2D=(typeof Path2D!=='undefined'),paused=false,suspended=false,canvas,context,lastUpdate,enterTime,timer,gameDuration,timeDisplay,asteroids,ship,saucers,shots,saucerShots,saucerCooling,scores,labels,wave,waveDuration,bonusBlink,waveAimError,singleShootingSaucer,nAsteroids,nSaucers,nSaucerShots,saucerShotCooling,gameState=GS_IDLE;var KeyManager=(function(){var keyLang,keyCharMap,keyLegends,keyLock=false,control=0,cursorActive=true,keyMaps={'int':{'keys':{'W':1,'S':2,'D':4,'A':8,'I':16,'K':32,'L':64,'J':128},'legends':{'p1':'W,A,S,D','p2':'I,J,K,L'}},'fr':{'keys':{'Z':1,'S':2,'D':4,'Q':8,'I':16,'K':32,'L':64,'J':128},'legends':{'p1':'Z,Q,S,D','p2':'I,J,K,L'}},'dvorak':{'keys':{',':1,'\u00bc':1,'O':2,'E':4,'A':8,'C':16,'T':32,'N':64,'H':128},'legends':{'p1':', A O E','p2':'C H T N'}},'colemak':{'keys':{'W':1,'R':2,'S':4,'A':8,'U':16,'E':32,'I':64,'N':128},'legends':{'p1':'W,A,R,S','p2':'U,N,E,I'}},'arcade1':{'keys':{'L':1,'K':2,'D':4,'S':8,'M':16,'N':32,'C':64,'X':128},'legends':{'p1':'S,D,K,L','p2':'X,C,N,M','keypad':'4,6,5,8','order':'Left,Right,Thrust,Fire'}},'arcade2':{'keys':{'S':1,'A':2,'G':4,'D':8,'X':16,'Y':32,'B':64,'C':128},'legends':{'p1':'D,G,A,S','p2':'C,B,Y,X','keypad':'4,6,5,8','order':'Left,Right,Thrust,Fire'}}},keyCodeMap={104:16,101:32,102:64,100:128,13:1,96:1},cursorMap={38:16,40:32,39:64,37:128};function setLang(v,noStore){if(keyMaps[v]){keyCharMap=keyMaps[v].keys;keyLegends=keyMaps[v].legends;if(!keyLegends['keypad'])keyLegends['keypad']='8,4,5,6';if(!keyLegends['order'])keyLegends['order']='Fire,Left,Thrust,Right';keyLang=v;if(!noStore&&HighScores.stored())HighScores.write();}}
function getLang(){return keyLang;}
function getLegend(k){return keyLegends[k];}
function keyExpression(){return(keyLegends[arguments[1]]||'').toUpperCase();}
setLang('int',true);function handleKeydown(e){if(Sound.prototype.initFlag)Sound.prototype.initFromUI();if(e.ctrlKey||e.metaKey||e.shiftKey||(e.altKey&&e.keyCode!==80))return;if(keyLock){if(e.preventDefault)e.preventDefault();return;}
var c=e.keyCode,ch=String.fromCharCode(c),b=keyCodeMap[c]||keyCharMap[ch];if(cursorActive&&!b){b=cursorMap[c];if(b){if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();e.returnValue=false;}}
if(b){control|=b;if(paused&&(b&17))resume();}
else{switch(ch){case' ':control|=1;if(paused)resume();if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();e.returnValue=false;break;case'\b':if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();e.returnValue=false;break;case'P':pause();break;}}}
function handleKeyup(e){if(keyLock||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;var c=e.keyCode,ch=String.fromCharCode(c),b=keyCodeMap[c]||keyCharMap[ch];if(cursorActive&&!b){b=cursorMap[c];if(b){if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();e.returnValue=false;}}
if(b){control&=~b;}
else if(ch===' '){control&=~1;if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();e.returnValue=false;}}
function reset(){control=0;}
function init(){window.addEventListener('keydown',handleKeydown,false);window.addEventListener('keyup',handleKeyup,false);keyLock=false;}
function lock(){keyLock=true;}
function unlock(){keyLock=false;}
function enableCursorKeys(v){cursorActive=(typeof v==='undefined')||Boolean(v);}
function getControls(){var c=(control|(control>>4))&15;var t=0;if(c&8)t-=1;if(c&4)t+=1;return{'turn':t,'thrust':(c&2)!=0,'fire':(c&1)!=0};}
function read(){return(control|(control>>4))&15;}
return{'init':init,'setLang':setLang,'getLang':getLang,'getLegend':getLegend,'keyExpression':keyExpression,'handleKeydown':handleKeydown,'handleKeyup':handleKeyup,'enableCursorKeys':enableCursorKeys,'lock':lock,'unlock':unlock,'getControls':getControls,'read':read,'reset':reset};})();var glyphs={'A':[[0,6,0,2,2,0,4,2,4,6],[4,4,0,4]],'B':[[3,3,4,4,4,5,3,6,0,6,0,0,3,0,4,1,4,2,3,3,0,3]],'C':[[4,5,3,6,1,6,0,5,0,1,1,0,3,0,4,1]],'D':[[0,6,0,0,3,0,4,1,4,5,3,6,0,6]],'E':[[4,0,0,0,0,6,4,6],[0,3,3,3]],'F':[[4,0,0,0,0,6],[0,3,3,3]],'G':[[2,3.5,4,3.5,4,5,3,6,1,6,0,5,0,1,1,0,3,0,4,1]],'H':[[0,0,0,6],[4,0,4,6],[0,3,4,3]],'I':[[1,0,3,0],[1,6,3,6],[2,0,2,6]],'J':[[4,0,4,5,3,6,1,6,0,5]],'K':[[0,0,0,6],[4,0,0,3,4,6]],'L':[[0,0,0,6,4,6]],'M':[[0,6,0,0,2,2,4,0,4,6]],'N':[[0,6,0,0,4,6,4,0]],'O':[[4,5,3,6,1,6,0,5,0,1,1,0,3,0,4,1,4,5]],'P':[[0,6,0,0,3,0,4,1,4,2,3,3,0,3]],'Q':[[4,4,3,6,1,6,0,5,0,1,1,0,3,0,4,1,4,4],[2,4,4,6]],'R':[[0,6,0,0,3,0,4,1,4,2,3,3,0,3],[1,3,4,6]],'S':[[4,1,3,0,1,0,0,1,0,2,1,3,3,3,4,4,4,5,3,6,1,6,0,5]],'T':[[0,0,4,0],[2,0,2,6]],'U':[[0,0,0,5,1,6,3,6,4,5,4,0]],'V':[[0,0,0,4,2,6,4,4,4,0]],'W':[[0,0,0,6,2,4,4,6,4,0]],'X':[[0,0,4,6],[4,0,0,6]],'Y':[[0,0,2,3,4,0],[2,3,2,6]],'Z':[[0,0,4,0,0,6,4,6]],'0':[[4,4,3,6,1,6,0,4,0,2,1,0,3,0,4,2,4,4]],'1':[[1,1,2,0,2,6],[0.5,6,3.5,6]],'2':[[0,1,1,0,3,0,4,1,4,2,3,3,1,4,0,5,0,6,4,6]],'3':[[0,1,1,0,3,0,4,1,4,2,3,3,4,4,4,5,3,6,1,6,0,5],[1.5,3,3,3]],'4':[[0,0,0,3,4,3],[3,0,3,6]],'5':[[4,0,0,0,0,3,3,3,4,4,4,5,3,6,1,6,0,5]],'6':[[4,1,3,0,1,0,0,1,0,5,1,6,3,6,4,5,4,4,3,3,0,3]],'7':[[0,0,4,0,1,4,1,6]],'8':[[1,3,0,2,0,1,1,0,3,0,4,1,4,2,3,3,4,4,4,5,3,6,1,6,0,5,0,4,1,3],[1,3,3,3]],'9':[[4,3,1,3,0,2,0,1,1,0,3,0,4,1,4,4,2,6,0.75,6]],'_':[[0,6,4,6]],':':[[1,1.75,1,2.5],[1,4.5,1,5.25]],';':[[1,2,1,2.75],[1,4,1,5,0,6]],',':[[1,4,1,5,0,6]],'.':[[1,5.25,1,6]],'!':[[1,0,1,4],[1,5.25,1,6]],'?':[[0,1,1,0,3,0,4,1,4,1.5,3,2.5,2,3.5,2,4.5],[2,5.25,2,6]],'\'':[[2,0,2,2]],'"':[[1,0,1,2],[3,0,3,2]],'-':[[0,3,4,3]],'+':[[0,3,4,3],[2,1,2,5]],'/':[[0,6,4,0]],'*':[[2,1,2,5],[0,2,4,4],[0,4,4,2]],'=':[[0,2,4,2],[0,4,4,4]],'<':[[3.5,1,0.5,3,3.5,5]],'>':[[0.5,1,3.5,3,0.5,5]],'&':[[3,1,2,0,1,0,0,1,0,1.5,1,2.5,0,3.5,0,5,1,6,2,6,3,5,3,3.5],[2,3.5,4,3.5]],'|':[[2,0,2,6]],'\\':[[4,6,0,0]],'(':[[3,0,1,2,1,4,3,6]],')':[[1,0,3,2,3,4,1,6]],'[':[[3,0,1,0,1,6,3,6]],']':[[1,0,3,0,3,6,1,6]],'%':[[4,0,0,6],[0,1.5,0,0,1,0,1,1.5,0,1.5],[3,6,3,4.5,4,4.5,4,6,3,6]],'$':[[4,1,1,1,0,2,1,3,3,3,4,4,3,5,0,5],[2,0,2,6]],'#':[[0,2,4,2],[0,4,4,4],[1.5,0,0.5,6],[3.5,0,2.5,6]],'Â©':[[4.5,5,3.5,6,0.5,6,-0.5,5,-0.5,1,0.5,0,3.5,0,4.5,1,4.5,5],[3,2,1,2,1,4,3,4]],'Â±':[[0,5.5,4,5.5],[2,0.5,2,4.5],[0,2.5,4,2.5]],'ÃŸ':[[0,6,0,1,1,0,2,0,3,1,3,2,2,3,3,4,3,5,2,6]],'@':[[0,2,1,1,2.5,1,3.5,2,3.5,5,3,6,1,6,0,5,0,4,1,3,2,3,2,6]],'~':[[0,3.5,1,2,1.5,2,2.5,4,3,4,4,2.5]],'^':[[0,2.5,2,0,4,2.5]],'â†’':[[0,3,4,3],[2.5,1,4,3,2.5,5]]};function drawGlyph(ctx,g,x,y,s){var paths=glyphs[g];if(!paths)return;for(var i=0;i<paths.length;i++){var p=paths[i];ctx.moveTo(x+p[0]*s,y+p[1]*s);for(var j=2,l=p.length;j<l;j+=2)ctx.lineTo(x+p[j]*s,y+p[j+1]*s);}}
function drawText(ctx,chars,x0,y,s){var x=x0,w=s*7;for(var i=0;i<chars.length;i++){var c=chars[i];if(c=='\n'){x=x0;y+=s*12;}
else if(c==' '){x+=w;}
else{drawGlyph(ctx,c,x,y,s);x+=w;}}}
function getTextPaths(chars,x0,y,s){var x=x0,w=s*7,paths=[];for(var i=0;i<chars.length;i++){var c=chars[i];if(c=='\n'){x=x0;y+=s*12;}
else if(c==' '){x+=w;}
else{var g=glyphs[c];if(g){for(var j=0;j<g.length;j++){var p=g[j],points=[];for(var k=0,l=p.length;k<l;k+=2)points.push(x+p[k]*s,y+p[k+1]*s);paths.push(points);};}
x+=w;}}
return paths;}
function dumpGlyphs(){var x=10,y=10,s=2;var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ\n0123456789:;,._Â©!?\'"-+/*=\n<>&()[]|\\%$#';context.save();context.lineJoin='bevel';context.beginPath();for(var i=0;i<chars.length;i++){var c=chars[i];if(c=='\n'){x=10;y+=s*9;}
else{drawGlyph(context,chars[i],x,y,s);x+=s*8;}}
context.stroke();context.restore();}
var now=(Date.now)?Date.now:function(){return new Date().getTime();};var Asteroid=function(g){this.init(g);};Asteroid.prototype={'init':function(c){var p=[],d=TAU/ASTEROID_SIDES,r=ASTEROID_SIZE*c,v,m=0;for(var i=0;i<ASTEROID_SIDES;i++){var a=i*d,u=(i%3)?c:c*(0.55+Math.random()*0.4);m+=u;p.push(Math.cos(a)*u*ASTEROID_SIZE);p.push(Math.sin(a)*u*ASTEROID_SIZE);}
m/=ASTEROID_SIDES;v=(1-m)*ASTEROID_VELOCITY;this.g=(m*m+m)/2;this.r=r;this.r2=r*r;this.rs=r*r/2;this.points=p;this.x=(0.25+Math.random()*0.25)*SCREEN_WIDTH*(Math.random()<0.5?1:-1)+CENTER_X;this.y=(0.25+Math.random()*0.25)*SCREEN_HEIGHT*(Math.random()<0.5?1:-1)+CENTER_Y;this.a=TAU*Math.random();this.dx=v*(0.2+Math.random()*0.8)*(Math.random()<0.5?1:-1);this.dy=v*(0.2+Math.random()*0.8)*(Math.random()<0.5?1:-1);this.da=ASTEROID_ROTATION*(0.2+Math.random()*0.8)*(Math.random()<0.5?1:-1);this.cdx=this.dx/50;this.cdy=this.dy/50;},'update':function(c){this.x+=this.dx*c;this.y+=this.dy*c;this.a+=this.da*c;if(this.x<0)this.x+=MAX_X;else if(this.x>=MAX_X)this.x-=MAX_X;if(this.y<0)this.y+=MAX_Y;else if(this.y>=MAX_Y)this.y-=MAX_Y;if(this.a<0)this.a+=TAU;else if(this.a>=TAU)this.a-=TAU;},'drawOutline':function(ctx,x,y,sin,cos){var p=this.points;ctx.beginPath();ctx.moveTo(x+p[0]*cos-p[1]*sin,y+p[0]*sin+p[1]*cos);for(var i=p.length-2;i>=0;i-=2){ctx.lineTo(x+p[i]*cos-p[i+1]*sin,y+p[i]*sin+p[i+1]*cos);}
ctx.stroke();},'draw':function(ctx){if(this.r>=MARGIN){var x=this.x,y=this.y,r=this.r,sin=Math.sin(this.a),cos=Math.cos(this.a),coorsx=[],coorsy=[];if(x-r<SCREEN_WIDTH)coorsx.push(x);if(y-r<SCREEN_HEIGHT)coorsy.push(y);if(x+r>MAX_X)coorsx.push(x-MAX_X);else if(r-x>MARGIN)coorsx.push(MAX_X+x);if(y+r>MAX_Y)coorsy.push(y-MAX_Y);else if(r-y>MARGIN)coorsy.push(MAX_Y+y);for(var i=0;i<coorsx.length;i++){for(var j=0;j<coorsy.length;j++)this.drawOutline(ctx,coorsx[i],coorsy[j],sin,cos);}}
else{this.drawOutline(ctx,this.x,this.y,Math.sin(this.a),Math.cos(this.a));}},getGravity(x,y){var dx=this.x-x,dy=this.y-y;if(dy<-DMAX_Y)dy+=MAX_Y;else if(dy>DMAX_Y)dy-=MAX_Y;if(dx<-DMAX_X)dx+=MAX_X;else if(dx>DMAX_X)dx-=MAX_X;var tx=dx/8,ty=dy/8,t=tx*tx+ty*ty;t=(Math.sqrt(t)*t)/(GRAVITY*100);return{x:this.g*dx/t,y:this.g*dy/t};}};var Ship=function(){this.reset(true);};Ship.prototype={'hull':[0,-16.5,0,-14,-4,-10.5,-5.75,-7,-6.5,-3.5,-5.75,0.7,-3.25,8.5,3.25,8.5,5.75,0.7,6.5,-3.5,5.75,-7,4,-10.5,0,-14],'fin1':[-5.75,0.7,-9.75,6.25,-7.15,11.9,-3.25,8.5],'fin2':[5.75,0.7,9.75,6.25,7.15,11.9,3.25,8.5],'exhaust':[-2,8.5,0,10.5,2,8.5],'envelope':[0,-15.5,4,-10.5,5.75,-7,6.5,-3.5,5.75,0.7,9.75,6.25,7.15,11.9],'envelopeSegments':[],'boundingBox':[9.75,-15,11.9],'outerBound':0,'r':15,'r2':200,'reset':function(fullReset){this.x=CENTER_X,this.y=CENTER_Y;this.dx=0;this.dy=0;this.thrusting=false;this.cooling=0;this.cnt=0;this.state=S_ACTIVE;if(fullReset){this.a=0;if(!this.particles)this.generateParticles();}},'resetAngle':function(){this.a=0;},'turn':function(dir,c){if(dir>0){this.a+=SHIP_ROTATION*c;if(this.a>TAU)this.a-=TAU;}
else if(dir<0){this.a-=SHIP_ROTATION*c;if(this.a<0)this.a+=TAU;}
if(dir)fxEvent('rotate');},'thrust':function(v,c){if(v){var sin=Math.sin(this.a),cos=Math.cos(this.a);this.dx+=SHIP_ACCELERATION*sin*c;this.dy-=SHIP_ACCELERATION*cos*c;fxEvent('thrust');this.thrusting=true;}
else{this.thrusting=false;}},'update':function(c){switch(this.state){case S_ACTIVE:var v=Math.sqrt(this.dx*this.dx+this.dy*this.dy);if(v>SHIP_MAX_VELOCITY){var vc=SHIP_MAX_VELOCITY/v;this.dx*=vc;this.dy*=vc;}
this.x+=this.dx*c;this.y+=this.dy*c;if(this.x<0)this.x+=MAX_X;else if(this.x>=MAX_X)this.x-=MAX_X;if(this.y<0)this.y+=MAX_Y;else if(this.y>=MAX_Y)this.y-=MAX_Y;break;case S_EXPLODE:var p=this.particles;for(var i=0,l=p.length;i<l;i++)p[i].update(c);break;}},'drawOutline':function(ctx,x,y,sin,cos,exhaustLength){var p=this.hull;ctx.beginPath();ctx.moveTo(x+p[0]*cos-p[1]*sin,y+p[0]*sin+p[1]*cos);for(var i=2,j=3,l=p.length;i<l;i+=2,j+=2){ctx.lineTo(x+p[i]*cos-p[j]*sin,y+p[i]*sin+p[j]*cos);}
p=this.fin1;ctx.moveTo(x+p[0]*cos-p[1]*sin,y+p[0]*sin+p[1]*cos);for(var i=2,j=3,l=p.length;i<l;i+=2,j+=2){ctx.lineTo(x+p[i]*cos-p[j]*sin,y+p[i]*sin+p[j]*cos);}
p=this.fin2;ctx.moveTo(x+p[0]*cos-p[1]*sin,y+p[0]*sin+p[1]*cos);for(var i=2,j=3,l=p.length;i<l;i+=2,j+=2){ctx.lineTo(x+p[i]*cos-p[j]*sin,y+p[i]*sin+p[j]*cos);}
if(this.thrusting){p=this.exhaust;ctx.moveTo(x+p[0]*cos-p[1]*sin,y+p[0]*sin+p[1]*cos);var d=p[3]+exhaustLength;ctx.lineTo(x+p[2]*cos-d*sin,y+p[2]*sin+d*cos);ctx.lineTo(x+p[4]*cos-p[5]*sin,y+p[4]*sin+p[5]*cos);}
ctx.stroke();},'draw':function(ctx){switch(this.state){case S_ACTIVE:var exhaustLength=(this.thrusting)?10*Math.random():0;if(this.r>=MARGIN){var x=this.x,y=this.y,r=this.r,sin=Math.sin(this.a),cos=Math.cos(this.a),coorsx=[x],coorsy=[y];if(x+r>MAX_X)coorsx.push(x-MAX_X);else if(r-x>MARGIN)coorsx.push(MAX_X+x);if(y+r>MAX_Y)coorsy.push(y-MAX_Y);else if(r-y>MARGIN)coorsy.push(MAX_Y+y);for(var i=0;i<coorsx.length;i++){for(var j=0;j<coorsy.length;j++)this.drawOutline(ctx,coorsx[i],coorsy[j],sin,cos,exhaustLength);}}
else{this.drawOutline(ctx,this.x,this.y,Math.sin(this.a),Math.cos(this.a),exhaustLength);}
break;case S_EXPLODE:var p=this.particles;ctx.beginPath();for(var i=0,l=p.length;i<l;i++)p[i].draw(ctx);ctx.stroke();break;}},'explode':function(){var p=this.particles;for(var i=0,l=p.length;i<l;i++)p[i].setup(this);this.state=S_EXPLODE;this.cnt=EXPLOSION_LENGTH;fxEvent('explode');},generateParticles(){var p=this.hull,a=[];a.push(new Particle(p.slice(0,4)));a.push(new Particle(p.slice(2,12)));a.push(new Particle(p.slice(10,16)));a.push(new Particle(p.slice(14,16)));a.push(new Particle(p.slice(14,20)));a.push(new Particle(p.slice(18,26)));a.push(new Particle(this.fin1.slice(0,6)));a.push(new Particle(this.fin1.slice(4,8).concat(this.fin1.slice(0,2))));a.push(new Particle(this.fin2.slice(0,6)));a.push(new Particle(this.fin2.slice(4,8).concat(this.fin2.slice(0,2))));this.particles=a;},'generateEnvelope':function(){for(var i=0,l=this.envelope.length-2;i<l;i+=2){var x1=this.envelope[i],y1=this.envelope[i+1],x2=this.envelope[i+2],y2=this.envelope[i+3],dy=y1-y2,dx=x1-x2,slope=(dx!==0)?dy/dx:1000000.1;this.envelopeSegments.push({x:x1,y:y1,m:slope});}
var b=0;for(var i=0;i<this.boundingBox.length;i++){var v=Math.abs(this.boundingBox[i]);if(v>b)b=v;}
this.outerBound=Math.sqrt(b*b*2);},'checkHit':function(obj,ct){if(this.state!=S_ACTIVE)return false;var x=obj.x-this.x,y=obj.y-this.y,epsilonX=HIT_EPSILON+Math.abs(obj.dx*ct*HIT_DELTACOEF),epsilonY=HIT_EPSILON+Math.abs(obj.dy*ct*HIT_DELTACOEF);if(Math.abs(x)>this.outerBound+epsilonX||Math.abs(y)>this.outerBound+epsilonY)return false;var sin=Math.sin(-this.a),cos=Math.cos(-this.a),tx=Math.abs(x*cos-y*sin),ty=x*sin+y*cos,bb=this.boundingBox,ex=Math.abs(epsilonX*cos-epsilonY*sin),ey=Math.abs(epsilonX*sin+epsilonY*cos);if(tx-ex>bb[0]||ty+ey<bb[1]||ty-ey>bb[2])return false;var idx=0,segs=this.envelopeSegments;for(var i=1;i<segs.length;i++){if(segs[i].y>ty)break;idx++;}
var s=segs[idx];return tx<=(ty-s.y)/s.m+s.x+ex;},'scaleOutline':function(c){var i;for(i=this.hull.length-1;i>=0;i--)this.hull[i]*=c;for(i=this.fin1.length-1;i>=0;i--)this.fin1[i]*=c;for(i=this.fin2.length-1;i>=0;i--)this.fin2[i]*=c;for(i=this.envelope.length-1;i>=0;i--)this.envelope[i]*=c;for(i=this.boundingBox.length-1;i>=0;i--)this.boundingBox[i]*=c;this.r*=c;this.r2=this.r*this.r;}};Ship.prototype.scaleOutline(0.95);Ship.prototype.generateEnvelope();var Saucer=function(id){this.id=id;this.reset();};Saucer.prototype={'dirs':[0,TAU*0.125,TAU*0.25,TAU*0.375,TAU*0.5,TAU*0.625,TAU*0.75,TAU*0.875],'hull':[-15,2,-6,8,6,8,15,2,7,-3,-7,-3],'top':[-7,-3,-3,-8,3,-8,7,-3],'envelope':[3,-8,7,-3,15,2,6,8],'envelopeSegments':[],'reset':function(){this.x=0;this.y=0;this.dx=0;this.dy=0;this.dcnt=0;this.dc=15;this.dir=0;this.a=0;this.r=14;this.r2=this.r*this.r,this.e2=28*28;this.v=80;this.legCnt=0;this.uCnt=0;this.state=S_ACTIVE;this.standalone=false;this.cooling=0;if(!this.particles)this.generateParticles();},'isBlocked':function(){var x,y;if(this.dir<0){x=this.x;y=this.y;}
else{var t=this.dirs[this.dir];x=this.x+Math.sin(t)*8;y=this.y-Math.cos(t)*8;}
for(var i=0;i<nAsteroids;i++){var a=asteroids[i],dx=x-a.x-a.cdx,dy=y-a.y-a.cdy;if(dy<-DMAX_Y)dy+=MAX_Y;else if(dy>DMAX_Y)dy-=MAX_Y;if(dx<-DMAX_X)dx+=MAX_X;else if(dx>DMAX_X)dx-=MAX_X;if(dx*dx+dy*dy<a.r2+this.e2)return true;}
return false;},'getDir':function(flex){if(++this.uCnt>10){this.dx=0;this.dy=0;this.dc=0;this.legCnt=Math.random()*0.1;this.dir=-1;return;}
if(flex){if(this.dir<0){this.dir=Math.floor(Math.random()*8);}
else{this.dir+=(Math.floor(Math.random()*2)+1)*(Math.random()<0.5?-1:1);}
if(this.dir<0)this.dir+=8;if(this.dir>7)this.dir-=8;}
else{this.dir=Math.floor(Math.random()*10);if(this.dir>7){this.dir=-1;this.dx=0;this.dy=0;this.legCnt=Math.random()+0.5;this.dc=(this.dc<0?-1:1)*(4+Math.random()*3);return;}}
if(this.isBlocked()){this.getDir(flex);}
else{var t=this.dirs[this.dir];this.dx=Math.sin(t)*this.v;this.dy=-Math.cos(t)*this.v;this.legCnt=3+Math.random()*5;if(flex)this.legCnt/=3;this.dc=8+Math.random()*14;if(Math.random()<0.5)this.dc=-this.dc;}},'update':function(c){if(this.cooling>0){this.cooling-=c;if(this.cooling<0)this.cooling=0;}
switch(this.state){case S_ACTIVE:if(!this.standalone){this.uCnt=0;this.legCnt-=c;if(this.legCnt<=0){this.getDir(false);}
else if(this.isBlocked()){this.getDir(true);}}
this.x+=this.dx*c;this.y+=this.dy*c;if(this.x<0)this.x+=MAX_X;else if(this.x>=MAX_X)this.x-=MAX_X;if(this.y<0)this.y+=MAX_Y;else if(this.y>=MAX_Y)this.y-=MAX_Y;this.dcnt+=this.dc*c;if(this.dcnt>7)this.dcnt-=7;else if(this.dcnt<0)this.dcnt+=7;break;case S_EXPLODE:var p=this.particles;for(var i=0,l=p.length;i<l;i++)p[i].update(c);break;}},'drawOutline':function(ctx,x,y){var p=this.hull;ctx.beginPath();ctx.moveTo(x+p[0],y+p[1]);for(var i=p.length-2;i>=0;i-=2)ctx.lineTo(x+p[i],y+p[i+1]);p=this.top;i=p.length-2;ctx.moveTo(x+p[0],y+p[1]);for(var i=2,l=p.length;i<l;i+=2)ctx.lineTo(x+p[i],y+p[i+1]);var offset=this.dcnt-4;y+=2;if(offset<0){ctx.moveTo(x-13,y);ctx.lineTo(x-9+offset,y);offset+=7;}
for(var i=x-13+offset,l=x+13;i<l;i+=7){ctx.moveTo(i,y);ctx.lineTo(Math.min(l,i+4),y);}
ctx.stroke();},'draw':function(ctx){switch(this.state){case S_ACTIVE:if(15>=MARGIN){var x=this.x,y=this.y,w=15,h=8,coorsx=[x],coorsy=[y];if(x+w>MAX_X)coorsx.push(x-MAX_X);else if(w-x>MARGIN)coorsx.push(MAX_X+x);if(y+h>MAX_Y)coorsy.push(y-MAX_Y);else if(h-y>MARGIN)coorsy.push(MAX_Y+y);for(var i=0;i<coorsx.length;i++){for(var j=0;j<coorsy.length;j++)this.drawOutline(ctx,coorsx[i],coorsy[j]);}}
else{this.drawOutline(ctx,this.x,this.y);}
break;case S_EXPLODE:var p=this.particles;ctx.beginPath();for(var i=0,l=p.length;i<l;i++)p[i].draw(ctx);ctx.stroke();break;}},'explode':function(){var p=this.particles;for(var i=0,l=p.length;i<l;i++)p[i].setup(this);this.state=S_EXPLODE;this.uCnt=EXPLOSION_LENGTH;fxEvent('sExplode');},'generateParticles':function(){var p=this.hull,a=[];for(var i=0,l=p.length-3;i<l;i+=2)a.push(new Particle(p.slice(i,i+4)));p=this.top;for(var i=0,l=p.length-3;i<l;i+=2)a.push(new Particle(p.slice(i,i+4)));this.particles=a;},'respawn':function(x,y){this.x=x;this.y=y;this.legCnt=0;this.cooling=0;this.state=S_ACTIVE;this.standalone=false;},'generateEnvelope':function(){for(var i=0,l=this.envelope.length-2;i<l;i+=2){var x1=this.envelope[i],y1=this.envelope[i+1],x2=this.envelope[i+2],y2=this.envelope[i+3],dy=y1-y2,dx=x1-x2,slope=(dx!==0)?dy/dx:1000000.1;this.envelopeSegments.push({x:x1,y:y1,m:slope});}},'checkHit':function(obj,ct){if(this.state!=S_ACTIVE)return false;var x=Math.abs(obj.x-this.x),y=obj.y-this.y,epsilonX=HIT_EPSILON+Math.abs(obj.dx*ct*HIT_DELTACOEF),epsilonY=HIT_EPSILON+Math.abs(obj.dy*ct*HIT_DELTACOEF);if(x-epsilonX>15||Math.abs(y)-epsilonY>8)return false;var idx=0,segs=this.envelopeSegments;for(var i=1;i<segs.length;i++){if(segs[i].y>y)break;idx++;}
var s=segs[idx];return x<=(y-s.y)/s.m+s.x+epsilonX;}};Saucer.prototype.generateEnvelope();var Shot=function(v,length,explodes,guided,snd){this.v=v;this.explodes=Boolean(explodes);this.guided=Boolean(guided);this.offset=length/2;this.state=S_IDLE;this.points=[];this.particles=[[],[],[]];this.sound=snd||'torpedo';};Shot.prototype={'init':function(x,y,sin,cos,dx,dy,shooterId){this.x=x;this.y=y;this.dx=dx+sin*this.v;this.dy=dy-cos*this.v;this.points[0]=-sin*this.offset;this.points[1]=cos*this.offset;this.points[2]=sin*this.offset;this.points[3]=-cos*this.offset;this.shooterId=(typeof shooterId!=='undefined')?shooterId:-1;this.cnt=SHOT_LENGTH;this.sin=sin;this.cos=cos;this.state=S_ACTIVE;this.targetPath=null;if(this.guided){this.dx0=dx;this.dy0=dy;this.sin1=sin;this.cos1=cos;}
fxEvent(this.sound);},'reset':function(){this.state=S_IDLE;this.shooterId=-1;this.targetPath=null;},'adjustAngle':function(sin,cos){this.sin1=sin;this.cos1=cos;},'update':function(c){this.cnt-=c;if(this.cnt<=0){if(this.state==S_ACTIVE&&this.explodes){this.explode();}
else{this.state=S_IDLE;}
if(DEBUG)this.targetPath=null;return;}
if(GUIDED_SHOTS&&this.guided&&this.sin!=this.sin1){var cf1=1.0-SHOT_STEERING_COEF,cf2=1.0-SHOT_STEERING_COEF/100;this.sin1=this.sin=this.sin*cf1+this.sin1*SHOT_STEERING_COEF;this.cos1=this.cos=this.cos*cf1+this.cos1*SHOT_STEERING_COEF;this.dx0*=cf2;this.dy0*=cf2;this.dx=this.dx0+this.sin*this.v;this.dy=this.dy0-this.cos*this.v;var dx=this.sin*this.offset,dy=this.cos*this.offset;this.points[0]=-dx;this.points[1]=dy;this.points[2]=dx;this.points[3]=-dy;}
switch(this.state){case S_ACTIVE:this.x+=this.dx*c;this.y+=this.dy*c;if(this.x<0)this.x+=MAX_X;else if(this.x>=MAX_X)this.x-=MAX_X;if(this.y<0)this.y+=MAX_Y;else if(this.y>=MAX_Y)this.y-=MAX_Y;break;case S_EXPLODE:for(var i=0;i<3;i++){var p=this.particles[i];p[0]+=p[2]*c;p[1]+=p[3]*c;}
break;}},'draw':function(ctx){switch(this.state){case S_ACTIVE:var p=this.points;ctx.beginPath();ctx.moveTo(this.x+p[0],this.y+p[1]);ctx.lineTo(this.x+p[2],this.y+p[3]);ctx.stroke();if(DEBUG&&this.targetPath){if(hasPath2D){ctx.beginPath();ctx.stroke(this.targetPath);}
else{CanvasRenderingContext2D.prototype.strokeRect.apply(ctx,this.targetPath);}}
break;case S_EXPLODE:ctx.beginPath();for(var i=0;i<3;i++){var p=this.particles[i];ctx.moveTo(p[0]+p[4],p[1]+p[5]);ctx.lineTo(p[0]+p[6],p[1]+p[7]);}
ctx.stroke();break;}},'explode':function(){for(var i=0;i<3;i++){var a=Math.random()*TAU,sin=Math.sin(a),cos=Math.cos(a),p=this.particles[i],v=PARTICLE_VELOCITY*2;p[0]=this.x;p[1]=this.y;p[2]=sin*v;p[3]=-cos*v;p[4]=-sin;p[5]=cos;p[6]=sin;p[7]=-cos;}
this.state=S_EXPLODE;this.cnt=EXPLOSION_LENGTH/4;},'setTarget':function(x,y){if(hasPath2D){this.targetPath=new Path2D();this.targetPath.rect(x-2,y-2,4,4);}
else{this.targetPath=[x-2,y-2,4,4];}}};var Particle=function(points){this.points=points;this.init();};Particle.prototype={'init':function(){var x=0,y=0,p=this.points,i,l=p.length,n=l/2,v,d;for(i=0;i<l;i+=2){x+=p[i];y+=p[i+1];}
x/=n;y/=n;d=Math.sqrt(x*x+y*y);if(d){v=PARTICLE_VELOCITY/d;this.dx0=x*v;this.dy0=y*v;}
else{this.dx0=(Math.random()*2-1)*PARTICLE_VELOCITY*0.9;this.dy0=(Math.random()*2-1)*PARTICLE_VELOCITY*0.9;}
this.x=0;this.y=0;this.x0=x;this.y0=y;this.a=0;this.da=0;this.dx=0;this.dy=0;},'setup':function(obj,drift){var a=obj.a||0,cos=Math.cos(a),sin=Math.sin(a);this.x=obj.x+this.x0*cos-this.y0*sin;this.y=obj.y+this.x0*sin+this.y0*cos;this.a=a;a+=Math.random()-0.5;cos=Math.cos(a);sin=Math.sin(a);this.dx=this.dx0*cos-this.dy0*sin;this.dy=this.dx0*sin+this.dy0*cos;if(drift){this.dx+=obj.dx||0;this.dy+=obj.dy||0;}
this.da=(Math.random()-0.5)*PARTICLE_ROTATION;},'update':function(c){this.x+=this.dx*c;this.y+=this.dy*c;this.a+=this.da*c;if(this.x<0)this.x+=MAX_X;else if(this.x>=MAX_X)this.x-=MAX_X;if(this.y<0)this.y+=MAX_Y;else if(this.y>=MAX_Y)this.y-=MAX_Y;if(this.a<0)this.a+=TAU;else if(this.a>=TAU)this.a-=TAU;this.dx-=this.dx*0.065*c;this.dy-=this.dy*0.065*c;this.da-=this.da*0.05*c;},'draw':function(ctx){var p=this.points,sin=Math.sin(this.a),cos=Math.cos(this.a),x=this.x,y=this.y;ctx.moveTo(x+p[0]*cos-p[1]*sin,y+p[0]*sin+p[1]*cos);for(var i=0,l=p.length;i<l;i+=2){ctx.lineTo(x+p[i]*cos-p[i+1]*sin,y+p[i]*sin+p[i+1]*cos);}}};var Score=function(label,x,y,size,initialValue,max,minLength,forceSign){this.label=label||'';this.x=x;this.y=y;this.size=size;this.initialValue=initialValue||0;this.max=max;this.minLength=minLength||0;this.value=this.initialValue-1;this.sign=(typeof forceSign!=='undefined')?Boolean(forceSign):false;this.stale=true;this.reset();};Score.prototype={'setValue':function(v){if(this.max)v%=this.max;if(v!=this.value){this.value=v;this.stale=true;}},'draw':function(ctx){if(this.stale){var s=String(this.value),l=this.minLength;while(s.length<l)s='0'+s;if(this.sign){if(this.value>0)s='+'+s;else if(this.value==0)s='Â±'+s;}
if(hasPath2D){this.path=new Path2D();drawText(this.path,this.label+s,this.x,this.y,this.size);}
else{this.points=getTextPaths(this.label+s,this.x,this.y,this.size);}
this.stale=false;}
if(hasPath2D){ctx.stroke(this.path);}
else{var paths=this.points;ctx.beginPath();for(var i=0;i<paths.length;i++){var p=paths[i];ctx.moveTo(p[0],p[1]);for(var j=2,l=p.length;j<l;j+=2)ctx.lineTo(p[j],p[j+1]);}
ctx.stroke();}},'reset':function(){this.setValue(this.initialValue);},'add':function(n){this.setValue(this.value+(n||1));}};var Label=function(t,x,y,s){if(hasPath2D){this.path=new Path2D();drawText(this.path,t,x,y,s);}
else{this.points=getTextPaths(t,x,y,s);}};Label.prototype={'draw':function(ctx){if(hasPath2D){ctx.stroke(this.path)}
else{var paths=this.points;ctx.beginPath();for(var i=0;i<paths.length;i++){var p=paths[i];ctx.moveTo(p[0],p[1]);for(var j=2,l=p.length;j<l;j+=2)ctx.lineTo(p[j],p[j+1]);}
ctx.stroke();}}};var Sparks=(function(){var nSparks=11,coolingDelay=0.045,duration=0.5,particles=[],timers=[],ptr=0,sparks=0,cooling=0,opts={'x':0,'y':0,'a':0,'dx':0,'dy':0};function initParticle(asteroid){if(cooling<=0){var p=particles[ptr],a=Math.atan2(ship.y-asteroid.y,ship.x-asteroid.x)+PI2,r=asteroid.r-1;opts.x=(ship.x+(asteroid.x+Math.sin(a)*r)*1.25)/2.25;opts.y=(ship.y+(asteroid.y-Math.cos(a)*r)*1.25)/2.25;opts.a=a;opts.dx=asteroid.dx;opts.dy=asteroid.dy;particles[ptr].setup(opts,true);timers[ptr]=duration;sparks++;ptr=(ptr+1)%nSparks;cooling=coolingDelay;}}
function update(c){if(cooling>0)cooling-=c;if(sparks>0){for(var i=0;i<nSparks;i++){if(timers[i]>0){timers[i]-=c;if(timers[i]<=0){timers[i]=0;sparks--;}
else{particles[i].update(c);}}}}}
function draw(ctx){if(sparks>0){ctx.beginPath();for(var i=0;i<nSparks;i++){if(timers[i]>0)particles[i].draw(ctx);}
ctx.stroke();}}
function reset(){for(var i=0;i<nSparks;i++)timers[i]=0;cooling=sparks=ptr=0;}
(function(){for(var i=0;i<nSparks;i++)
particles.push(new Particle([-1.5,0,0.5,0]));})();return{'reset':reset,'update':update,'draw':draw,'spark':initParticle};})();var Title=(function(){var glyphs={'G':[[2,3.5,4,3.5,4,5,3,6,1,6,0,5,0,1,1,0,3,0,4,1]],'r':[[1,6,1,3,2,2,4,2]],'a':[[0.75,2,3,2,4,3,4,6],[4,5,3,6,0.75,6,0,5.25,0,4.75,0.75,4,4,4]],'v':[[0.5,2,0.5,3.5,2.5,6,4.5,3.5,4.5,2]],'i':[[2,2,2,6],[2,0.5,2,1]],'-':[[0,3,4,3]],'o':[[0,5,0,3,1,2,3,2,4,3,4,5,3,6,1,6,0,5]],'d':[[3.5,-0.25,3.5,6,1,6,0,5,0,3,1,2,3.5,2]],'s':[[4,2,1.5,2,0.5,2.75,0.5,3.25,1.5,4,3,4,4,4.75,4,5.25,3,6,0.5,6]],'m':[[0,6,0,2],[0,2.5,0.75,2,1.5,2,2,2.5,2,6],[2,2.5,2.75,2,3.5,2,4,2.5,4,6]],'e':[[3.5,6,1,6,0,5,0,3,1,2,3,2,4,3,4,4,0,4]],'!':[[1,0,1,4],[1,5.25,1,6]]},glyphPaths=[],asteroid=[17.630056090964036,0,16.856251188437167,10.83285486015587,8.323697355590049,18.22635484350711,-2.6953781903857017,18.7467670918389,-13.121486679142658,15.14300286858501,-19.2254224744303,5.645093376425424,-14.116047935297024,-4.144845649391134,-13.121486679142663,-15.143002868585004,-2.8515715752217905,-19.833115945314265,7.34738964235227,-16.08853915202548,16.856251188437167,-10.832854860155868],a=0,da=Math.PI*0.3,a2=0,da2=Math.PI*0.4,a3d=0,da3d=0.0525,isGameOver,fLength;function setup(){var t=(isGameOver)?'Game  ver!':'Gravi  roids!',s=7.5,x=-(t.length-1)*3*s+s,y=-3.5*s,q=[];for(var k=0;k<t.length;k++){var paths=glyphs[t.charAt(k)]
if(paths){for(var i=0;i<paths.length;i++){var p=paths[i],r=[x+p[0]*s,y+p[1]*s];for(var j=2,l=p.length;j<l;j+=2)r.push(x+p[j]*s,y+p[j+1]*s);q.push(r);}}
x+=6*s;}
glyphPaths=q;var d=Math.ceil(t.length/2)*12*s;fLength=Math.sqrt(d*d/2)*4.5;if(isGameOver){var saucer=saucers[0];saucer.dcnt=0;saucer.dc=14;saucer.dx=0;saucer.dy=0;saucer.state=S_ACTIVE;saucer.standalone=true;da2=Math.PI*0.275;}
else{ship.reset();da2=Math.PI*0.4;}
a=a2=a3d=0;}
function draw(ctx,c){a3d=(a3d+da3d*c)%1;var x=CENTER_X,y=(isGameOver)?CENTER_Y-20:116,rotY=Math.sin(a3d*TAU)*0.41,rotX=rotY/2.5,ct=Math.cos(rotX),cf=Math.cos(rotY),st=Math.sin(rotX),sf=Math.sin(rotY),m00=cf,m02=sf,m10=st*sf,m11=ct,m12=-st*cf,m20=-ct*sf,m21=st,m22=ct*cf;ctx.beginPath();for(var i=0,l=glyphPaths.length;i<l;i++){var p=glyphPaths[i],t=[];for(var j=0,pl=p.length;j<pl;j+=2){var sr=fLength/(fLength-(m20*p[j]+m21*p[j+1]));t.push((m00*p[j])*sr,(m10*p[j]+m11*p[j+1])*sr);}
ctx.moveTo(x+t[0],y+t[1]);for(var j=2;j<pl;j+=2){ctx.lineTo(x+t[j],y+t[j+1]);}}
a+=da*c;if(a<0)a+=TAU;else if(a>=TAU)a-=TAU;var cos=Math.cos(a)*1.5,sin=Math.sin(a)*1.5;var t=[],p=asteroid,ax=(isGameOver)?30:0;for(var i=0,l=p.length;i<l;i+=2){var x1=p[i]*cos-p[i+1]*sin+ax,y1=p[i]*sin+p[i+1]*cos,sr=fLength/(fLength-(m20*x1+m21*y1));t.push((m00*x1)*sr,(m10*x1+m11*y1)*sr);}
ctx.moveTo(x+t[0],y+t[1]);for(var i=p.length-2;i>=0;i-=2){ctx.lineTo(x+t[i],y+t[i+1]);}
ctx.stroke();a2+=da2*c;if(a2<0)a2+=TAU;else if(a2>=TAU)a2-=TAU;var r=(isGameOver)?120:90;x1=Math.cos(a2)*r+ax;y1=Math.sin(a2)*r;sr=fLength/(fLength-(m20*x1+m21*y1));x+=(m00*x1)*sr;y+=(m10*x1+m11*y1)*sr;ctx.save();if(isGameOver){ctx.globalAlpha=0.85;var saucer=saucers[0];saucer.update(c);saucer.x=x;saucer.y=y;saucer.draw(ctx);}
else{ctx.globalAlpha=0.65;ship.x=x;ship.y=y;ship.a=a2+Math.PI;ship.thrusting=(KeyManager.getControls().thrust||(a2+Math.PI/2-0.4)%Math.PI<0.6);ship.draw(ctx);}
ctx.restore();}
function attract(){isGameOver=false;setup();}
function gameOver(){isGameOver=true;setup();}
return{'attract':attract,'gameOver':gameOver,'draw':draw};})();var HighScores=(function(){var alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZ_1234567890#',x0=CENTER_X+60,y0=CENTER_Y+46,r=SCREEN_HEIGHT*0.35,rm=r+31,size=2,repeatDelay=0.085,nameLength=6,nameSize=3,nameX=38,nameY=CENTER_Y-57,nameBlinkDelay=0.35,currScore,currWave,tableLength=5,tableSize=1.75,tableY=250,chars,charIndex,charLength,cooling,state,theLetter,particles,letters,theLetter,nameString,nameLabel,nameLabelBlink,nameBlink,nameBlinkCntr,hasLocalStorage=typeof window.localStorage!=='undefined',marker=[-5.5,-3,5.5,-3,0,3,-5.5,-3],states={'IDLE':0,'ROTATE':1,'SHOOT':2,'SELECT':3},table=[['STEVE_R',1050,0],['NOLAN_B',1040,0],['TED_D',1030,0],['LYLE_R',1020,0],['ED_L',1010,0]];var storageId='GravioroidsGameData',hasStorage=false;function Char(c,a){var x=x0+Math.sin(a)*r-(c.length>1?c.length*1.5:2)*size,y=y0-Math.cos(a)*r-size*3;this.c=c;this.a=a;this.x=x;this.y=y;if(hasPath2D){this.path=new Path2D();drawText(this.path,c,x,y,size);}
else{this.points=getTextPaths(c,x,y,size);}}
function generateTable(){var caption='THE WIZS LIST',t='\n',l=Math.min(tableLength,table.length),nmax=0,smax=0,wmax=0;for(var i=0;i<l;i++){var sl=String(table[i][0]).length;if(sl>nmax)nmax=sl;sl=String(table[i][1]).length;if(sl>smax)smax=sl;if(table[i][2]){sl=String(table[i][2]).length;if(sl>wmax)wmax=sl;}}
var rowLength=Math.max(caption.length,nmax+4+smax),wavesLength=(wmax)?wmax+3:0;if((rowLength+wavesLength-caption.length)%2)rowLength++;for(var i=0;i<l;i++){var name=table[i][0],score=String(table[i][1]),spacing='';for(var k=rowLength-score.length-name.length;k>0;k--)spacing+=' ';t+='\n'+name+spacing+score;if(table[i][2]){var ws=' ('+table[i][2]+')';for(var k=wavesLength-ws.length;k>0;k--)t+=' ';t+=ws;}}
var padding='',tl=rowLength+wavesLength;for(var i=(tl-caption.length)/2;i>0;i--)padding+=' ';labels.highScores=new Label(padding+caption+t,CENTER_X-tl*3.5*tableSize,tableY,tableSize);}
function generateParticlesFromChar(c){var t=c.c,coors={x:c.x+2*size,y:c.y+2*size,a:0};particles=[];for(var i=0;i<t.length;i++){var paths=getTextPaths(t.charAt(i),-2*size,-3*size,size);for(var j=0,jl=paths.length;j<jl;j++){var p=paths[j];for(var k=0,kl=p.length-3;k<kl;k+=2){var particle=new Particle(p.slice(k,k+4));particle.setup(coors);particles.push(particle);}}
coors.x+=size*7;}}
function setup(score,wave){charIndex=11;if(!chars){chars=[];var l=alpha.length,da=TAU/(l+5),a0=TAU-da*charIndex;for(var i=0;i<l;i++)chars.push(new Char(alpha.charAt(i),(a0+i*da)%TAU));chars.push(new Char('RUB-OUT',a0+(l+1)*da));chars.push(new Char('FINISH',a0+(l+3)*da));charLength=chars.length;}
ship.reset();ship.x=x0;ship.y=y0;shots[0].state=S_IDLE;cooling=0;state=states.IDLE;letters=[];for(var i=0;i<nameLength;i++)letters.push('_');theLetter=0;updateName();currScore=score;currWave=wave;}
function updateName(){var s=3;nameString=letters.join('');nameLabel=new Label('> '+nameString,nameX,nameY,nameSize);var t=letters[theLetter];letters[theLetter]=' ';nameLabelBlink=new Label('> '+letters.join(''),nameX,nameY,nameSize);letters[theLetter]=t;nameBlink=false,nameBlinkCntr=nameBlinkDelay;}
function finish(){nameString=(/^_+$/.test(nameString))?'???':nameString.replace(/_+$/,'');var entry=[nameString,currScore,currWave],found=false;for(var i=0;i<table.length;i++){if(table[i][1]<=currScore){table.splice(i,0,entry);found=true;break;}}
if(table.length<tableLength-1&&!found)table.push(entry);if(table.length>=tableLength)table.length=tableLength;generateTable();if(hasStorage)write();setupAttractMode();}
function update(ctx,ct){var ctrl=KeyManager.getControls();if(state==states.IDLE||state==states.ROTATE){if(cooling>0){cooling-=ct;if(cooling<0)cooling=0;else if(state==states.ROTATE)fxEvent('rotate');}
if(cooling==0){if(ctrl.turn){charIndex=(charIndex+ctrl.turn)%charLength;if(charIndex<0)charIndex+=charLength;cooling=repeatDelay;if(state==states.IDLE||(ctrl.turn<0&&charIndex>=charLength-3)||(ctrl.turn>0&&(charIndex==0||charIndex>=charLength-2)))cooling*=2;state=states.ROTATE;fxEvent('rotate');}
else if(ctrl.fire){var sin=Math.sin(ship.a),cos=Math.cos(ship.a);shots[0].init(x0+sin*18,y0-cos*18,sin,cos,sin*40,-cos*40);state=states.SHOOT;}
else{state=states.IDLE;}}}
var a=ship.a=chars[charIndex].a;ship.thrusting=ctrl.thrust;if(ship.thrusting)fxEvent('thrust');ship.draw(ctx);if(state==states.SHOOT){var s=shots[0],dx,dy;s.update(ct);dx=s.x-x0;dy=s.y-y0;if(dx*dx+dy*dy>=r*r){s.state=S_IDLE;state=states.SELECT;cooling=EXPLOSION_LENGTH*0.6;generateParticlesFromChar(chars[charIndex]);switch(charIndex){case charLength-1:fxEvent('explode');break;case charLength-2:fxEvent('screetch');break;default:fxEvent('sExplode');break;}}
else{s.draw(ctx);}}
ctx.save();ctx.lineJoin='bevel';for(var ci=0,cl=chars.length;ci<cl;ci++){if(state==states.SELECT&&ci==charIndex){ctx.beginPath();for(var i=0,l=particles.length;i<l;i++){var p=particles[i];p.update(ct);p.draw(ctx);}
ctx.stroke();cooling-=ct;if(cooling<=0){cooling=0;state=states.IDLE;switch(charIndex){case charLength-1:finish();break;case charLength-2:if(theLetter<nameLength-1||letters[theLetter]=='_'){if(--theLetter<0)theLetter=0;}
letters[theLetter]='_';updateName();break;default:letters[theLetter]=chars[charIndex].c;if(++theLetter==nameLength)theLetter--;updateName();break;}}}
else{if(hasPath2D){ctx.stroke(chars[ci].path);}
else{ctx.beginPath();var paths=chars[ci].points;for(var i=0;i<paths.length;i++){var p=paths[i];ctx.moveTo(p[0],p[1]);for(var j=2,l=p.length;j<l;j+=2)ctx.lineTo(p[j],p[j+1]);}
ctx.stroke();}}}
nameBlinkCntr-=ct;if(nameBlinkCntr<=0){nameBlink=!nameBlink;nameBlinkCntr=nameBlinkDelay;}
if(nameBlink)nameLabelBlink.draw(ctx);else nameLabel.draw(ctx);ctx.restore();var sin=Math.sin(a),cos=Math.cos(a),x=x0+sin*rm,y=y0-cos*rm,p=marker;ctx.save();ctx.globalAlpha=0.75;ctx.beginPath();ctx.moveTo(x+p[0]*cos-p[1]*sin,y+p[0]*sin+p[1]*cos);for(var i=2,j=3,l=p.length;i<l;i+=2,j+=2){ctx.lineTo(x+p[i]*cos-p[j]*sin,y+p[i]*sin+p[j]*cos);}
ctx.stroke();ctx.restore();}
function checkScore(score){return(tableLength>0&&(table.length<tableLength-1||score>=table[Math.min(tableLength,table.length)-1][1]));}
function read(){function extract(s){var rows=decodeURIComponent(s).split(','),t=[],nMax=8;for(var j=0;j<rows.length;j++){var cols=rows[j].split(':');if(cols[0]=='*keymap'){if(cols.length>1)KeyManager.setLang(cols[1],true);}
else if(cols.length==2||cols.length==3){var n=cols[0].toUpperCase().replace(/[^A-Z0-9_#!\?]/g,''),v=parseInt(cols[1],10),w=parseInt(cols[2],10)||0;if(isNaN(w))w=0;if(n.length>nMax)n=n.substring(0,nMax);if(n&&!isNaN(v)&&v>0)t.push([n,v,w]);}}
if(t.length){var sum=0,check=t.pop();for(var i=0;i<t.length;i++){if(i>0&&t[i][1]>t[i-1][1])return;sum+=t[i][1]*(2<<i)+t[i][2];for(var n=t[i][0],j=0;j<n.length;j++)sum+=n.charCodeAt(j)%17;}
if(check[0].indexOf('!')!=0||check[1]!=sum||parseInt(check[0].substring(1),36)!=sum)return;if(t.length>tableLength)t.length=tableLength;table=t;}
hasStorage=true;}
if(hasLocalStorage){var s=localStorage.getItem(storageId);if(s)extract(s);}
else if(!hasLocalStorage&&document.cookie){var cookies=document.cookie.split(/;\s*/g);for(var i=0;i<cookies.length;i++){var parts=cookies[i].split('=');if(parts[0]==storageId){extract(parts[1]);break;}}
if(hasStorage)write();}}
function write(){var q=[],sum=0;for(var i=0,l=table.length-1;i<=l;i++){q.push(table[i].join(':'));sum+=table[i][1]*(2<<i)+(table[i][2]||0);for(var n=table[i][0],j=0;j<n.length;j++)sum+=n.charCodeAt(j)%17;}
q.push('!'+sum.toString(36)+':'+sum);q.push('*keymap:'+KeyManager.getLang());if(hasLocalStorage){localStorage.setItem(storageId,encodeURIComponent(q.join(',')));}
else{var t=storageId+'='+encodeURIComponent(q.join(',')),expires=new Date(),path='/',secure=(location.protocol.indexOf('https')==0)?'secure=1':'';expires.setMilliseconds(expires.getMilliseconds()+365*864e+5);t+='; expires='+expires.toUTCString();if(path)t+='; path='+path;if(secure)t+='; '+secure;document.cookie=t;}
hasStorage=true;}
function destroy(){if(hasStorage){if(hasLocalStorage){localStorage.removeItem(storageId);}
else{var t=storageId+'=; expires=Thu, 01 Jan 1970 00:00:00 GMT',path='/',secure=(location.protocol.indexOf('https')==0)?'secure=1':'';if(path)t+='; path='+path;if(secure)t+='; '+secure;document.cookie=t;}
hasStorage=false;}}
function stored(){return hasStorage;}
return{'setup':setup,'update':update,'checkScore':checkScore,'init':generateTable,'read':read,'write':write,'destroy':destroy,'stored':stored};})();var Autopilot=(function(){var thrustRate,timeoutCounter,shotCooling,targetLock,asteroidAwarnessDistance2=125*125,asteroidAlertDistance2=100*100,asteroidEmergenyDistance2=60*60,saucerAlertDistance=140,shotTravelCoeff=1/SHIP_SHOT_ACCELERATION/3,saucerAlert=false,targetLock=-1,ctrls={'thrust':false,'turn':0,'fire':false,'a':0},rk4=[0,0,0];function reset(){ctrls.thrust=true;ctrls.turn=0;ctrls.fire=false;ctrls.a=ship.a;thrustRate=0.3+Math.random()*1.75;timeoutCounter=0;shotCooling=0;targetLock=-1;for(var i=0;i<3;i++)rk4[i]=0;}
function getAngle1(x,y){var a=Math.atan2(y,x)+PI2;if(a<0)a+=TAU;return a;}
function getAngle(x,y){var a=Math.atan2(y%MAX_Y,x%MAX_X)+PI2;if(a<0)a+=TAU;return a;}
function getAlignment(a){a%=TAU;if(a<-Math.PI)a+=TAU;else if(a>Math.PI)a-=TAU;return a;}
function proximitySorter(a,b){return a.d-b.d;}
function getFiringSolution(i,d,p){var saucer=saucers[i],stc=(d+2*Math.sqrt(d))*shotTravelCoeff,ta=getAngle(saucer.x-ship.x+(saucer.dx-ship.dx*SHIP_SHOT_V0COEF)*stc,saucer.y-ship.y+(saucer.dy-ship.dy*SHIP_SHOT_V0COEF)*stc),sa=Math.abs(getAlignment(ta-ship.a)),e=TAU/360*Math.min(0.25,Math.random()*(saucerAlert?4:1.4)),ps;if(d<saucerAlertDistance)saucerAlert;ps=0.1*(saucerAlert?p*4:p);if(!GUIDED_SHOTS){e*=1.25;ps=Math.min(0.4,ps);}
if(d<SCREEN_HEIGHT&&sa<e&&Math.random()<ps){ctrls.fire=true;shotCooling=SHOT_LENGTH*0.85;if(GUIDED_SHOTS)targetLock=i;}
else if(targetLock>=0&&(d>SCREEN_HEIGHT||sa>4*3)){targetLock=-1;}
return ta;}
function update(ct){if(ctrls.thrust&&thrustRate>0){thrustRate-=ct;if(thrustRate<0)ctrls.thrust=false;}
ctrls.fire=false;ctrls.turn=0;var turn=false,turnTarget,saucerAlert=false,saucersByProx=[];if(shotCooling){shotCooling-=ct;if(shotCooling<0){shotCooling=0;}}
for(var i=0;i<nSaucers;i++){if(saucers[i].state==S_ACTIVE)saucersByProx.push({i:i,d:Math.sqrt(distance2(ship,saucers[i]))});}
saucersByProx.sort(proximitySorter);saucerAlert=false;if(targetLock>=0&&saucers[targetLock].state==S_ACTIVE){var d=Math.sqrt(distance2(ship,saucers[targetLock]));if(saucersByProx.length&&saucersByProx[0].d<d/3){targetLock=saucersByProx[0].i;d=saucersByProx[0].d;}
turnTarget=getFiringSolution(targetLock,d,2);turn=true;}
else{targetLock=-1;for(var i=0,l=saucersByProx.length;i<l;i++){var sbp=saucersByProx[i],ta=getFiringSolution(sbp.i,sbp.d,(l-i)*3);if(!turn||ctrls.fire){turnTarget=ta;turn=true;if(GUIDED_SHOTS&&ctrls.fire){if(i==0)targetLock=sbp.i;break;}}}}
var asteroidsByProx=[],v=Math.sqrt(ship.dx*ship.dx+ship.dy*ship.dy),ma=getAngle(ship.dx,ship.dy),oa=Math.abs(getAlignment(ma-ship.a)),aa=0,dist=0;for(var i=0;i<nAsteroids;i++)asteroidsByProx.push({i:i,d:distance2(ship,asteroids[i])*Math.cbrt(asteroids[i].g)});asteroidsByProx.sort(proximitySorter);var a=asteroids[asteroidsByProx[0].i];if(asteroidsByProx[0].d<asteroidAwarnessDistance2){var a=asteroids[asteroidsByProx[0].i];aa=getAngle(a.x-ship.x,a.y-ship.y);dist=asteroidsByProx[0].d;}
if(v>SHIP_MAX_VELOCITY*0.5&&!saucerAlert){turnTarget=(ma+Math.PI)%TAU;turn=true;}
if(dist){var adma=Math.abs(getAlignment(ma-aa)),adra=Math.abs(getAlignment(aa-ship.a));if(adma<2.0&&adra>1.4){if(v<SHIP_MAX_VELOCITY*(dist<asteroidEmergenyDistance2?0.8:0.5)){ctrls.thrust=true;thrustRate=0.3;targetLock=-1;}
else if(adra<0.8&&ctrls.thrust){ctrls.thrust=false;thrustRate=0;}}
if(dist<asteroidAlertDistance2&&(((adma<1||(adma<2&&v<SHIP_MAX_VELOCITY*0.35))&&Math.abs(adra-PI2)<0.8)||((adma<1&&adra>2)||(oa<1&&v<SHIP_MAX_VELOCITY*0.35&&Math.abs(adma-PI2)<0.8))&&Math.random()<0.3)){ctrls.thrust=true;thrustRate=0.15;targetLock=-1;}
var ta=(aa+(getAlignment(aa-ma)>0?-PI2:+PI2))%TAU;if(ta<0)ta+=TAU;if(Math.abs(getAlignment(ta-ship.a))>0.15){turnTarget=ta;turn=true;targetLock=-1;}}
if(!ctrls.thrust&&(Math.random()<ct*0.1&&v<SHIP_MAX_VELOCITY*0.3)||(v>SHIP_MAX_VELOCITY*0.4&&oa>2)){ctrls.thrust=true;thrustRate=0.1+Math.random();}
if(turn){if(AP_SMOOTHING){var raw=getAlignment(turnTarget-ship.a),delta=(rk4[0]+2*rk4[1]+2*rk4[2]+raw)/6;delta=(raw+AP_SMOOTHING*(raw+delta))/(AP_SMOOTHING+1);rk4.shift();rk4.push(raw);ctrls.turn=(delta<0)?-1:1;}
else{ctrls.turn=(getAlignment(turnTarget-ship.a)<0)?-1:1;}}
else if(AP_SMOOTHING){rk4[0]=rk4[1]=rk4[2]=rk4[3]=rk4[3]*0.999;}}
function getControls(){return ctrls;}
function setTimeout(v){timeoutCounter=v;}
function checkTimeout(ct){if(timeoutCounter){timeoutCounter-=ct;return(timeoutCounter<=0);}
return false;}
return{'reset':reset,'update':update,'getControls':getControls,'setTimeout':setTimeout,'checkTimeout':checkTimeout};})();function distance2(obj1,obj2){var dx=Math.abs(obj1.x-obj2.x),dy=Math.abs(obj1.y-obj2.y);if(dy>DMAX_Y)dy-=MAX_Y;if(dx>DMAX_X)dx-=MAX_X;return dx*dx+dy*dy;}
function resetShip(resetAllSaucers){ship.reset();for(var i=0;i<SHIP_SHOTS_MAX;i++)shots[i].reset();ship.cooling=0;for(var i=0;i<SAUCER_SHOTS_MAX;i++)saucerShots[i].reset();for(var i=0;i<nAsteroids;i++){var a=asteroids[i],dx=Math.abs(a.x-CENTER_X),dy=Math.abs(a.y-CENTER_Y);if(dx*dx+dy*dy<32400){if(dx<=dy){a.x=(a.x<CENTER_X)?a.r:SCREEN_WIDTH-a.r;a.y+=dx/CENTER_X*(a.y-CENTER_Y);}
else{a.y=(a.y<CENTER_Y)?a.r:SCREEN_HEIGHT-a.r;a.x+=dy/CENTER_Y*(a.x-CENTER_X);}}}
for(var i=0;i<nSaucers;i++){if(resetAllSaucers||(Math.abs(ship.x-saucers[i].x)<150&&Math.abs(ship.y-saucers[i].y)<100))resetSaucer(i);}
for(var i=0;i<nAsteroids;i++){var a=asteroids[i],redo;do{redo=false;for(var j=0;j<nSaucers;j++){if(distance2(a,saucers[j])<a.r2+400){if(Math.random()<0.5){a.x=a.r+Math.random()*(SCREEN_WIDTH-2*a.r);a.y=(Math.random()<0.5)?a.r:SCREEN_HEIGHT-a.r;}
else{a.x=(Math.random()<0.5)?a.r:SCREEN_WIDTH-a.r;a.y=a.r+Math.random()*(SCREEN_HEIGHT-2*a.r);}
redo=true
break;}}}while(redo);}
saucerCooling=SAUCER_COOLING;GravityMap.reset();}
function resetSaucer(id){var x,y,redo=true;while(redo){redo=false;x=ship.x+(200+Math.random()*(MAX_X-400))*(Math.random()<.5?-1:1);y=ship.y+(150+Math.random()*(MAX_Y-300))*(Math.random()<.5?-1:1);if(x<0)x+=MAX_X;else if(x>MAX_X)x-=MAX_X;if(y<0)y+=MAX_Y;else if(y>MAX_Y)y-=MAX_Y;for(var i=0;i<nAsteroids;i++){var a=asteroids[i],dx=Math.abs(x-a.x),dy=Math.abs(x-a.y),dmin=a.r+20;if(dx<dmin&&dy<dmin){redo=true;break;}}}
saucers[id].respawn(x,y);}
function resetSaucerShot(id){var ss=saucerShots[id];if(ss.shooterId>=0){if(nSaucerShots==1)saucers[ss.shooterId].cooling=0;ss.shooterId=-1;}}
var GravityMap=(function(){var gmGridMaxX,gmGridMaxY,gmUnitX,gmUnitY,gmUnitCX,gmUnitCY,gmScaleX,gmScaleY,gmSkewX,gmSkewY,gmData,gmFrameCnt,gmFrameCntMax,gmPath,gmEnabled=false;function enable(v){if(v){if(!gmData)init();gmFrameCnt=0;gmEnabled=true;}
else{gmEnabled=false;}}
function reset(){gmFrameCnt=0;}
function init(){var w=120;gmFrameCntMax=0.210;gmGridMaxX=30;gmUnitX=MAX_X/gmGridMaxX;gmGridMaxY=Math.round(MAX_Y/gmUnitX);gmUnitY=MAX_Y/gmGridMaxY;gmUnitCX=w/gmGridMaxX;gmUnitCY=gmUnitY*(w/MAX_X);gmSkewX=0.55;gmSkewY=0.55;gmScaleX=MAX_X/w;gmScaleY=MAX_Y/(gmGridMaxY*gmUnitCY);gmData=[];for(var y=0;y<=gmGridMaxY;y++){var r=gmData[y]=[];for(var x=0;x<=gmGridMaxX;x++)r[x]=[0,0];}}
function renderData(ctx){for(var y=0;y<=gmGridMaxY;y++){var r=gmData[y],p=r[0];ctx.moveTo(p[0],p[1]);for(var x=1;x<=gmGridMaxX;x++){p=r[x];ctx.lineTo(p[0],p[1]);}}
for(var x=0;x<=gmGridMaxX;x++){var p=gmData[0][x];ctx.moveTo(p[0],p[1]);for(var y=1;y<=gmGridMaxY;y++){p=gmData[y][x];ctx.lineTo(p[0],p[1]);}}}
function draw(context,ct){gmFrameCnt-=ct;if(gmFrameCnt<=0){gmFrameCnt+=gmFrameCntMax;if(gmFrameCnt<=0)gmFrameCnt=gmFrameCntMax;var cz=0.7/GRAVITY;for(var i=0;i<=gmGridMaxY;i++){var r=gmData[i],y=i*gmUnitY,sy=i*gmUnitCY*gmSkewY,scy=sy*gmSkewX;for(var j=0;j<=gmGridMaxX;j++){var x=j*gmUnitX,gx=0,gy=0;for(var k=0;k<nAsteroids;k++){var g=asteroids[k].getGravity(x,y);gx+=g.x;gy+=g.y;}
var z=Math.min(26,Math.sqrt(gx*gx+gy*gy)*cz);r[j]=[j*gmUnitCX-scy,sy+z];}}
if(hasPath2D){gmPath=new Path2D();renderData(gmPath);}}
context.save();context.globalAlpha=0.4;context.translate(SCREEN_WIDTH-135,15);context.beginPath();if(gmPath){context.stroke(gmPath);}
else{renderData(context);context.stroke();context.beginPath();}
var x=ship.x/gmScaleX,y=ship.y/gmScaleY*gmSkewY;context.globalAlpha=0.65;context.shadowBlur=1;context.fillStyle='rgb(51,201,255)';context.rect(x-y*gmSkewX-1,y-1,2,2);context.fill();context.restore();}
function enabled(){return gmEnabled;}
return{'enable':enable,'enabled':enabled,'draw':draw,'reset':reset};})();function drawLabels(icludeGravity){context.save();context.globalAlpha=0.7;context.lineJoin='bevel';scores.ship.draw(context);scores.saucer.draw(context);scores.balance.draw(context);scores.time.draw(context);if(icludeGravity&&GravityMap.enabled()){labels.gravity.draw(context);}
else{scores.score.draw(context);}
context.globalAlpha=0.6;labels.signature.draw(context);context.restore();}
function gameSubFrame(ctrl,ct){if(ship.state==S_ACTIVE){ship.turn(ctrl.turn,ct);ship.thrust(ctrl.thrust,ct);if(GUIDED_SHOTS&&ctrl.turn){var sin=Math.sin(ship.a),cos=Math.cos(ship.a);for(var i=0;i<SHIP_SHOTS_MAX;i++)shots[i].adjustAngle(sin,cos);}}
var gx=0,gy=0;for(var i=0;i<nAsteroids;i++){var a=asteroids[i];a.update(ct);var g=a.getGravity(ship.x,ship.y);gx+=g.x;gy+=g.y;}
ship.dx+=gx*ct;ship.dy+=gy*ct;for(var i=0;i<SHIP_SHOTS_MAX;i++){var s=shots[i];if(s.state==S_ACTIVE){s.update(ct);for(var j=0;j<nSaucers;j++){if(saucers[j].checkHit(s,ct)){saucers[j].explode();s.state=S_IDLE;scores.ship.add();scores.balance.add();scores.score.add(5+5*wave);for(var k=0;k<nSaucerShots;k++){var ss=saucerShots[k];if(ss.state==S_ACTIVE&&ss.shooterId==j){ss.explode();ss.shooterId=-1;break;}}
break;}}}
if(s.state==S_ACTIVE){for(var j=0;j<nAsteroids;j++){var a=asteroids[j];if(distance2(a,s)<a.r2){s.explode();fxEvent('asteroid');break;}}}
if(s.state==S_ACTIVE){for(var j=0;j<nSaucerShots;j++){var ss=saucerShots[j];if(ss.state==S_ACTIVE&&distance2(s,ss)<=10){s.explode();ss.explode();break;}}}}
for(var i=0;i<nSaucerShots;i++){var ss=saucerShots[i];if(ss.state==S_ACTIVE){ss.update(ct);if(ss.state==S_IDLE){resetSaucerShot(i);}
else if(ship.checkHit(ss,ct)){ship.explode();ss.state=S_IDLE;resetSaucerShot(i);scores.saucer.add();scores.balance.add(-1);}
else{for(var j=0;j<nAsteroids;j++){var a=asteroids[j];if(distance2(a,ss)<a.r2){ss.explode();fxEvent('asteroid');break;}}}}}
if(ship.state==S_ACTIVE){ship.update(ct);var x=ship.x,y=ship.y;for(var i=0;i<nAsteroids;i++){var a=asteroids[i],d=distance2(a,ship);if(d<a.rs){ship.explode();scores.saucer.add();scores.balance.add(-1);Sparks.reset();break;}
if(d<a.r2+ship.r2){Sparks.spark(a);fxEvent('screetch');}}}
for(var i=0;i<nSaucers;i++){var saucer=saucers[i];if(saucer.state==S_ACTIVE){saucer.update(ct);if(ship.state==S_ACTIVE&&distance2(saucer,ship)<500){ship.explode();saucer.explode();scores.saucer.add();scores.ship.add();scores.score.add(5+5*wave);break;}}}
Sparks.update(ct);if(SAUCER_SHOT_DISABLE)saucerCooling=SAUCER_COOLING;if(saucerCooling){saucerCooling-=ct;if(saucerCooling<0)saucerCooling=0;}
else if(ship.state==S_ACTIVE){var sId;if(singleShootingSaucer){sId=0;}
else{var available=[];for(var i=0;i<nSaucers;i++){if(saucers[i].state==S_ACTIVE&&saucers[i].cooling<=0)available.push(i);}
sId=(available.length)?available[Math.floor(Math.random()*available.length)]:-1;}
if(sId>=0){var ssId=-1;for(var i=0;i<nSaucerShots;i++){if(saucerShots[i].state==S_IDLE){ssId=i;break;}}
if(ssId>=0){var saucer=saucers[sId],d=Math.sqrt(distance2(ship,saucer))/SAUCER_SHOT_ACCELERATION*SHOT_LENGTH*(0.35+Math.random()*0.2),tx=ship.x+ship.dx*d,ty=ship.y+ship.dy*d,x=saucer.x,y=saucer.y+2,dir=-1,weX,weY;if(waveAimError){weX=waveAimError*(0.1+Math.random()*0.9);weY=waveAimError*(0.1+Math.random()*0.9);if(Math.random()<0.5)weX=-weX;if(Math.random()<0.5)weY=-weY;}
else{weX=weY=0;}
if(tx>MAX_X)tx-=MAX_X;else if(tx<0)tx+=MAX_X;if(ty>MAX_X)ty-=MAX_Y;else if(ty<0)ty+=MAX_Y;var dx=tx-x,dy=ty-y;if(dx>AMAX_X)dx-=MAX_X;else if(dx<-AMAX_X)dx+=MAX_X;if(dy>AMAX_Y)dy-=MAX_Y;else if(dy<-AMAX_Y)dy+=MAX_Y;dx+=(Math.random()-0.35)*AIM_NOISE*(dx<0?-1:1)+weX;dy+=(Math.random()-0.35)*AIM_NOISE*(dy<0?-1:1)+weY;var adx=Math.abs(dx),ady=Math.abs(dy);if(ady<AIM_EPSILON){dir=(dx>0)?2:6;}
else if(adx<AIM_EPSILON){dir=(dy>0)?4:0;}
else if(Math.abs(adx-ady)<AIM_EPSILON){if(dx<0){dir=(dy<0)?7:5;}
else{dir=(dy<0)?1:3;}}
if(dir>=0){var a=saucer.dirs[dir],sin=Math.sin(a),cos=Math.cos(a);saucerShots[ssId].init(x+sin*10,y-cos*(cos<0?8:12),sin,cos,0,0,sId);saucer.cooling=saucerShotCooling;if(DEBUG){x+=dx;y+=dy;if(x>MAX_X)x-=MAX_X;else if(x<0)x+=MAX_X;if(y>MAX_X)y-=MAX_Y;else if(y<0)y+=MAX_Y;saucerShots[ssId].setTarget(x,y);}}}}}}
function gameFrame(dt){gameDuration+=dt;var gd=waveDuration-Math.floor(gameDuration);switch(gameState){case GS_WAVEEND:var idle=(ship.state==S_IDLE);for(var i=0;i<nSaucers;i++){if(saucers[i].state!=S_IDLE)idle=false;}
if(idle){if(scores.balance.value>0){newWave();}
else{if(HighScores.checkScore(scores.score.value)){setupHighScoreInput();}
else{gameOver();}}
return;}
break;case GS_RUN:if(gd<0){scores.time.reset();gameState=GS_WAVEEND;if(ship.state==S_ACTIVE)ship.explode();for(var i=0;i<SHIP_SHOTS_MAX;i++){if(shots[i].state==S_ACTIVE)shots[i].explode();}
for(var i=0;i<nSaucers;i++){if(saucers[i].state==S_ACTIVE)saucers[i].explode();}
for(var i=0;i<nSaucerShots;i++){if(saucerShots[i].state==S_ACTIVE)saucerShots[i].explode();}}
else{scores.time.setValue(gd);}
break;case GS_AUTOPLAY:if(KeyManager.read()){setupAttractMode();return;}
if(Autopilot.checkTimeout(dt)){setupAttractMode();return;}
if(ship.state==S_ACTIVE)Autopilot.update(dt);break;}
context.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);drawLabels(true);if(GravityMap.enabled())GravityMap.draw(context,dt);var t=now(),dt=(t-lastUpdate)%1000,dt1=Math.floor(dt/IFSLICE),dt2=dt-dt1*IFSLICE,dt0=dt/1000,ctrl=(gameState==GS_AUTOPLAY)?Autopilot.getControls():KeyManager.getControls();for(var k=0;k<dt1;k++)gameSubFrame(ctrl,IFFRACS);if(ship.state==S_EXPLODE){ship.update(dt0);ship.cnt-=dt0;if(ship.cnt<0){if(gameState==GS_RUN)resetShip(false);else ship.state=S_IDLE;if(gameState==GS_AUTOPLAY){if(gameDuration<AUTOPLAY_MIN_DURATION){resetShip(false);Autopilot.reset();}
else Autopilot.setTimeout(2.1);}}}
else if(ship.state==S_ACTIVE){if(ship.cooling){ship.cooling-=dt0;if(ship.cooling<0)ship.cooling=0;}
else if(ctrl.fire){for(var i=0;i<SHIP_SHOTS_MAX;i++){var s=shots[i];if(s.state==S_IDLE){var sin=Math.sin(ship.a),cos=Math.cos(ship.a);s.init(ship.x+sin*17.5,ship.y-cos*17.5,sin,cos,ship.dx*SHIP_SHOT_V0COEF,ship.dy*SHIP_SHOT_V0COEF);ship.cooling=(GUIDED_SHOTS)?SHIP_COOLING*1.75:SHIP_COOLING;break;}}}}
for(var i=0;i<nSaucers;i++){var saucer=saucers[i];if(saucer.state==S_EXPLODE){saucer.update(dt0);saucer.uCnt-=dt0;if(saucer.uCnt<=0){if(gameState==GS_RUN||gameState==GS_AUTOPLAY)resetSaucer(i);else saucer.state=S_IDLE;}}}
for(var i=0;i<nAsteroids;i++)asteroids[i].draw(context);for(var i=0;i<SHIP_SHOTS_MAX;i++){var s=shots[i];if(s.state>S_IDLE){if(s.state==S_EXPLODE)s.update(dt0);s.draw(context);}}
for(var i=0;i<nSaucerShots;i++){var ss=saucerShots[i];if(ss.state>S_IDLE){if(ss.state==S_EXPLODE){ss.update(dt0);if(ss.state=S_IDLE){resetSaucerShot(i);continue;}}
ss.draw(context);}}
ship.draw(context);for(var i=0;i<nSaucers;i++)saucers[i].draw(context);Sparks.draw(context);lastUpdate=t-dt2;}
function gameOver(){context.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);drawLabels(false);gameDuration=0;Title.gameOver();KeyManager.reset();gameState=GS_GAMEOVER;}
function gameOverFrame(dt){context.clearRect(0,100,SCREEN_WIDTH,SCREEN_HEIGHT-200);Title.draw(context,dt);gameDuration+=dt;if(gameDuration>50||(gameDuration>1.2&&KeyManager.getControls().fire))setupAttractMode();lastUpdate=enterTime;}
function setupHighScoreInput(){context.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);drawLabels(false);context.save();context.lineJoin='bevel';context.globalAlpha=0.8;context.beginPath();var txt='GAME OVER! - YOUR SCORE IS ONE OF THE BEST! PLEASE ENTER YOUR NAME...',s=1.5,l=txt.length;drawText(context,txt,30,63,s);context.stroke();context.restore();HighScores.setup(scores.score.value,wave);gameState=GS_HSINPUT;}
function highScoreInputFrame(dt){context.clearRect(0,80,SCREEN_WIDTH,SCREEN_HEIGHT);HighScores.update(context,dt);lastUpdate=enterTime;}
function resetAllScores(){scores.ship.reset();scores.saucer.reset();scores.balance.reset();scores.score.reset();scores.time.reset();}
function setupWave(w){var def=WAVE_DEFS[w];nSaucers=def[0];nAsteroids=def[1];waveAimError=def[2];singleShootingSaucer=def[3];saucerShotCooling=SHOT_LENGTH/Math.min(3,nSaucerShots);for(var i=0;i<nAsteroids;i++)asteroids[i].init(Math.random()*0.5+0.5);resetShip(true);ship.resetAngle();Sparks.reset();KeyManager.reset();gameDuration=0;waveDuration=def[4]||WAVE_DURATION;}
function setupAttractMode(){KeyManager.reset();Title.attract();gameDuration=0;gameState=GS_ATTRACT;}
function attractFrame(dt){if(KeyManager.getControls().fire){resetAllScores();wave=0;nSaucerShots=1;newWave();return;}
context.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);gameDuration+=dt;if(gameDuration>AUTOPLAY_DELAY){startAutoplay();return;}
Title.draw(context,dt);context.save();context.lineJoin='bevel';context.globalAlpha=0.8;labels.highScores.draw(context);labels.instructions.draw(context);context.globalAlpha=0.6;labels.signature.draw(context);context.restore();lastUpdate=enterTime;}
function newWave(){var bonus=(wave)?1000+scores.balance.value*wave*5:0;if(bonus)scores.score.add(bonus);wave++;var txt='WAVE '+wave,s=7;context.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);context.save();context.lineJoin='bevel';context.beginPath();drawText(context,txt,CENTER_X-s*txt.length*3.5,CENTER_Y-50,s);context.stroke();if(bonus){labels.bonus=new Label('BONUS +'+bonus,630,70,1.5);context.globalAlpha=0.8;labels.bonus.draw(context);scores.balance.setValue(Math.ceil(scores.balance.value*0.5));}
else{labels.bonus=null;}
context.restore();drawLabels(false);var saucer=saucers[0];saucer.x=0;saucer.y=CENTER_Y+100;saucer.dcnt=0;saucer.dc=20;saucer.dx=SCREEN_WIDTH/4.9;saucer.dy=0;saucer.state=S_ACTIVE;saucer.standalone=true;gameState=GS_NEWWAVE;bonusBlink=true;gameDuration=0.5;lastUpdate=now();}
function waveDisplayFrame(dt){var saucer=saucers[0],x0=saucer.x;context.clearRect(0,saucer.y-20,SCREEN_WIDTH,40);gameDuration-=dt;if(gameDuration<0&&labels.bonus){gameDuration=0.5;bonusBlink=!bonusBlink;if(bonusBlink){context.save();context.lineJoin='bevel';context.globalAlpha=0.8;labels.bonus.draw(context);context.restore();}
else{context.clearRect(625,65,SCREEN_WIDTH-625,20);}}
saucer.update(dt);saucer.draw(context);if(saucer.x>SCREEN_WIDTH||saucer.x<x0){if(wave<=WAVE_DEFS.length){if(wave==WAVE_DEFS.length)nSaucerShots++;setupWave(wave-1);}
else{var w=(wave-WAVE_DEFS.length)%WAVE_REPEAT_RANGE;if(w==0&&nSaucerShots<SAUCER_SHOTS_MAX-1)nSaucerShots++;setupWave(WAVE_DEFS.length-WAVE_REPEAT_OFFSET+w);}
gameState=GS_RUN;}
lastUpdate=enterTime;fxEvent('wave');}
function startAutoplay(){resetAllScores();wave=AUTOPLAY_WAVE;nSaucerShots=1;setupWave(AUTOPLAY_WAVE);Autopilot.reset();gameState=GS_AUTOPLAY;lastUpdate=now();}
function gameLoop(){if(!paused&&!suspended){enterTime=now();var dti=(enterTime-lastUpdate)%1000,dt=dti/1000;if(dti>=IFSLICE){context.save();context.globalAlpha=0.975+0.025*Math.random();switch(gameState){case GS_IDLE:setupAttractMode();case GS_ATTRACT:attractFrame(dt);break;case GS_NEWWAVE:waveDisplayFrame(dt);break;case GS_WAVEEND:case GS_RUN:gameFrame(dt);break;case GS_GAMEOVER:gameOverFrame(dt);break;case GS_HSINPUT:highScoreInputFrame(dt);break;case GS_AUTOPLAY:gameFrame(dt);break;}
context.restore();updateFX();}}
else{lastUpdate=now();}
if(hasAnimFrame){if(ECONOMY){timer=setTimeout(function(){reqAnimFrame(gameLoop);},10);}
else{reqAnimFrame(gameLoop);}}
else{timer=setTimeout(gameLoop,10);}}
function configureContext(ctx){ctx.lineWidth=1;ctx.strokeStyle='#33ccff';ctx.shadowColor='#99eeff';ctx.shadowBlur=3;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.lineJoin='miter';ctx.globalAlpha=0.95;}
function init(){if((/^((\w+\.)*masswerk\.at|127\.0\.0\.1|192\.168\.1\.[0-9]+)$/i).test(location.hostname)){self.location.href='https://www.masswerk.at/gravioroids/';return;}
var canvas=document.getElementById(CANVAS_ID);if(canvas)context=canvas.getContext('2d');if(!canvas||!context)return;configure();canvas.mozOpaque=true;canvas.width=SCREEN_WIDTH;canvas.height=SCREEN_HEIGHT;configureContext(context);asteroids=[];for(var i=0;i<ASTEROIDS_MAX;i++)asteroids.push(new Asteroid(Math.random()*0.5+0.5));ship=new Ship();shots=[];for(var i=0;i<SHIP_SHOTS_MAX;i++)shots.push(new Shot(SHIP_SHOT_ACCELERATION,3.5,true,true));saucerShots=[];for(var i=0;i<SAUCER_SHOTS_MAX;i++)saucerShots.push(new Shot(SAUCER_SHOT_ACCELERATION,5.5,false,false,'saucer'));saucers=[];for(var i=0;i<SAUCERS_MAX;i++){saucers.push(new Saucer(i));saucers[i].v=75+i*15;}
saucerCooling=SAUCER_COOLING;scores={'ship':new Score('ROCKET:',30,35,1.5,0,1000,0),'saucer':new Score('SAUCER:',180,35,1.5,0,1000,0),'balance':new Score('BALANCE:',330,35,1.5,0,1000,0,true),'time':new Score('TIME:',500,35,1.5,0,91,2),'score':new Score('SCORE:',650,35,1.5,0,0,0)};KeyManager.init();labels={'gravity':new Label('GRAVITY',620,37.1,1.2),'signature':new Label('Â© 2017 MASSWERK.AT',CENTER_X-75.6,SCREEN_HEIGHT-27,1.2)};HighScores.read();HighScores.init();setupInstructions();GravityMap.enable(true);resolveTouchAPI();generateButtons(document.getElementById('arcadebuttons'));setupUIActions();enableVisibilityChangeDetection();observeFullscreen()
lastUpdate=now();timer=setTimeout(gameLoop,10);centerDisplay();}
function setupInstructions(){var t1='CONTROLS ({order}): {p1},'.replace(/\{(.*?)\}/g,KeyManager.keyExpression),t2='CURSOR KEYS OR NUMPAD ({keypad}) OR {p2}.'.replace(/\{(.*?)\}/g,KeyManager.keyExpression),s=1.75,t3='STAY CLEAR OF ASTEROIDS, OUTSCORE SAUCERS.',t4='PUSH FIRE TO START, "P" TO PAUSE.',l=Math.max(t1.length,t2.length,t3.length,t4.length),x=CENTER_X-l*s*3.5,pad='\n\n';for(var i=Math.floor((l-t4.length)/2);i>0;i--)pad+=' ';labels.instructions=new Label(t1+'\n'+t2+'\n\n'+t3+pad+t4,x,440,s);}
function pause(){if(gameState==GS_RUN&&!paused){var t1='PAUSED',t2='PUSH FIRE TO RESUME.',s1=10,s2=2;context.save();context.lineJoin='bevel';context.globalAlpha=0.8;drawText(context,t1,CENTER_X-t1.length*3.5*s1,CENTER_Y-s1*7,s1);drawText(context,t2,CENTER_X-t2.length*3.5*s2,CENTER_Y+20,s2);context.stroke();context.restore();paused=true;pauseFX();}}
function resume(){KeyManager.reset();lastUpdate=now();paused=false;resumeFX();}
function configure(){function toBoolean(v){return(/^(true|t|1|on|y|yes)$/i).test(v);}
if(document.location.search.length>1){var pairs=document.location.search.substring(1).split('&');for(var i=0;i<pairs.length;i++){var parts=pairs[i].split(/=/),k=parts[0].toLowerCase(),v=parts[1];if(/^low?[_\-]?gravity$/.test(k)){GRAVITY=toBoolean(v)?GRAVITY_LO:GRAVITY_HI;}
else if(/^grav(ity)?$/.test(k)){GRAVITY=(/^low?$/i).test(v)?GRAVITY_LO:GRAVITY_HI;}
else if(/^eco(nomy)?(mode)?$/.test(k))ECONOMY=toBoolean(v);else if(k=='gforce'){var g=parseFloat(v);if(!isNaN(g)){GRAVITY=(g>0)?g:0.1;}}
else if(/^(guided|gs|guidedshots?)$/.test(k))GUIDED_SHOTS=toBoolean(v);else if(k=='debug')DEBUG=toBoolean(v);}}}
function centerDisplay(){var el=document.getElementById(CANVAS_ID);if(el){var y=el.offsetTop+el.offsetHeight*0.5,dy=y-window.innerHeight*0.5;if(dy>0)window.scrollTo(window.scrollX,dy);}}
var UIActions=[{'id':'gravitySlider','event':'change input','init':function(el){el.value=GRAVITY*10;updateGravityDisplay();},'action':function(el){GRAVITY=parseFloat(el.value)/10;updateGravityDisplay();}},{'id':'cbxGravityMap','event':'change','init':function(el){el.checked=GravityMap.enabled();},'action':function(el){GravityMap.enable(el.checked);}},{'id':'cbxSaucerShotDisable','event':'change','init':function(el){el.checked=SAUCER_SHOT_DISABLE;},'action':function(el){SAUCER_SHOT_DISABLE=el.checked;}},{'id':'cbxShowSaucerTargets','event':'change','init':function(el){el.checked=DEBUG;},'action':function(el){DEBUG=el.checked;}},{'id':'cbxLowGravity','event':'change','init':function(el){el.checked=(GRAVITY==GRAVITY_LO);},'action':function(el){GRAVITY=(el.checked)?GRAVITY_LO:GRAVITY_HI;}},{'id':'cbxGuidedShots','event':'change','init':function(el){el.checked=GUIDED_SHOTS;},'action':function(el){GUIDED_SHOTS=el.checked;}},{'id':'keyboardSelect','event':'change','init':function(el){var keymap=KeyManager.getLang(),idx=0;for(var i=0;i<el.options.length;i++){if(el.options[i].value==keymap){idx=i;break;}}
el.selectedIndex=idx;},'action':function(el){var idx=el.selectedIndex;if(idx>=0){KeyManager.setLang(el.options[idx].value);setupInstructions();}}},{'id':'cbxStoreHS','event':'change','init':function(el){el.checked=HighScores.stored();},'action':function(el){if(Sound.prototype.ctx)Sound.prototype.ctx.suspend();if(el.checked){var promptStr=typeof window.localStorage!=='undefind'?'High scores will be stored in local web storage on your computer. (You may clear and discard the storage anytime by unchecking this checkbox.) Are you ok with this?':'High scores will be stored in a coockie on your local computer. (You may clear and discard the cookie anytime by unchecking this checkbox.) Are you ok with this?';if(confirm(promptStr)){HighScores.write();}
else{el.checked=false;}}
else{if(confirm('Sure to permanently delete the stored high scores? All scores will be lost at the end of this session.')){HighScores.destroy();}
else{el.checked=HighScores.stored();}}
if(Sound.prototype.ctx)Sound.prototype.ctx.resume();Sound.prototype.initFlag=true;Sound.prototype.initFromUI();lastUpdate=now();}},{'id':'cbxFxEnable','event':'change','init':function(el){el.checked=true;fxEnable(true);},'action':function(el){fxEnable(el.checked);}},{'id':'fxVolume','event':'change','init':function(el){var vol=0.5;el.value=vol*100;AudioManager.setVolume(vol);},'action':function(el){setFXVolume(parseInt(el.value)/100);}},{'id':'fxVolume','event':'input','action':function(el){setFXVolume(parseInt(el.value)/100);},'noblur':true}];function setupUIActions(){for(var i=0;i<UIActions.length;i++){var item=UIActions[i],el=document.getElementById(item.id),events=item.event.split(/\s+/g);if(el){for(var j=0;j<events.length;j++){if(events[j])el.addEventListener(events[j],getUIHandler(item),false);}
if(typeof item.init=='function')item.init(el);}}}
function getUIHandler(item){return function(event){handleUIAction(event,item);};}
function handleUIAction(event,item){var el=document.getElementById(item.id);item.action(el);var target=event.target||event.srcElement||el;if(!item.noblur&&target&&target.blur)target.blur();}
function updateGravityDisplay(){var el=document.getElementById('gravityDisplay');if(el)el.innerHTML='('+GRAVITY.toFixed(1)+')';}
var buttonData=[['arcadeBtnLeft','LEFT',8],['arcadeBtnRight','RIGHT',4],['arcadeBtnThrust','THRUST',2],['arcadeBtnFire','FIRE',1]],isTouch,isPtrTouch,evntTouchStart,evntTouchEnd,evntTouchMove,evntTouchCancel,currButton=0,buttonRepeat=false,buttonRepeatTimer=null,hasMouseUpListener=false,buttonTouches;function resolveTouchAPI(){isTouch=Boolean(window.ontouchstart!==undefined||(document.documentElement&&document.documentElement.ontouchstart!==undefined));if(window.navigator.pointerEnabled||window.PointerEvent){if(navigator.maxTouchPoints>0){isTouch=true;isPtrTouch=true;evntTouchStart='pointerdown';evntTouchEnd='pointerup';evntTouchCancel='pointercancel';}
else{isTouch=false;}}
else{isPtrTouch=false;if(isTouch){evntTouchStart='touchstart';evntTouchEnd='touchend';evntTouchCancel='touchcancel';}}
if(isTouch)buttonTouches={};}
function buttonHandlerFactory(code){return function(event){buttonDownHandler(event,code);}}
function buttonTouchHandlerFactory(code){return function(event){buttonTouchHandler(event,code);}}
function generateButtons(parentEl){for(var i=0;i<buttonData.length;i++){var d=buttonData[i],box=document.createElement('div'),btn=document.createElement('div');box.id=d[0];box.className='buttonBox';btn.className='arcadeButton';if(isTouch){btn.addEventListener(evntTouchStart,new buttonTouchHandlerFactory(d[2]),false);}
else{btn.addEventListener('mousedown',new buttonHandlerFactory(d[2]),false);}
box.appendChild(btn);parentEl.appendChild(box);}
document.addEventListener(evntTouchEnd,buttonTouchEndHandler,false);document.addEventListener(evntTouchCancel,buttonTouchEndHandler,false);}
function buttonDownHandler(event,code){if(Sound.prototype.initFlag)Sound.prototype.initFromUI();if(event.button&&event.button!=1)return;if(currButton)KeyManager.setControls(currButton,false);KeyManager.setControls(code,true);currButton=code;if(!buttonRepeat||event.type){if(!hasMouseUpListener)document.addEventListener('mouseup',mouseUpHandler,false);if(buttonRepeat){buttonRepeatTimer=setInterval(function(){buttonDownHandler({},code);},(code<4)?120:400);}}
if(!buttonRepeat&&buttonRepeatTimer){clearInterval(buttonRepeatTimer);buttonRepeatTimer=null;}
if(event.preventDefault)event.preventDefault();if(event.stopPropagation)event.stopPropagation();event.returnValue=false;}
function mouseUpHandler(event){if(buttonRepeatTimer){clearInterval(buttonRepeatTimer);buttonRepeatTimer=null;}
document.removeEventListener('mouseup',mouseUpHandler);if(currButton)KeyManager.setControls(currButton,false);currButton=0;hasMouseUpListener=false;}
function buttonTouchHandler(event,code){var id,touchIds=new Array();if(isPtrTouch){id=event.pointerId;if(!buttonTouches[id])touchIds.push(id);}
else{for(var i=0;i<event.changedTouches.length;i++){id=event.changedTouches[i].identifier;if(!buttonTouches[id])touchIds.push(id);}}
if(touchIds.length)KeyManager.setControls(code,true);for(var i=0;i<touchIds.length;i++){var t=(buttonRepeat)?setInterval(function(){control|=code;},(code<4)?120:400):null;buttonTouches[touchIds[i]]={'code':code,'timer':t};}
if(event.type===evntTouchStart){if(event.preventManipulation)event.preventManipulation();if(event.preventDefault)event.preventDefault();if(event.stopPropagation)event.stopPropagation();}}
function buttonTouchEndHandler(event){var id,touchIds=new Array(),mask=0,buttonEvent=false;;if(isPtrTouch){id=event.pointerId;if(buttonTouches[id]){touchIds.push(id);buttonEvent=true;}}
else{for(var i=0;i<event.changedTouches.length;i++){id=event.changedTouches[i].identifier;if(buttonTouches[id]){touchIds.push(id);buttonEvent=true;}}}
for(var i=0;i<touchIds.length;i++){var td=buttonTouches[touchIds[i]];mask|=td.code;if(td.timer)clearInterval(td.timer);delete buttonTouches[touchIds[i]];}
KeyManager.setControls(mask,false);if(buttonEvent){if(event.preventManipulation)event.preventManipulation();if(event.preventDefault)event.preventDefault();if(event.stopPropagation)event.stopPropagation();}}
var fxData={'thrust':{'once':false,'sound':'RocketThrust','volume':0.25},'rotate':{'once':false,'sound':'RocketRotate','volume':0.15},'torpedo':{'once':true,'sound':'RocketTorpedo','volume':0.9},'screetch':{'once':true,'sound':'Screetch','volume':0.1},'asteroid':{'once':true,'sound':'AsteroidHit','volume':1.0},'explode':{'once':true,'sound':'ExplosionBig','volume':1.0},'sExplode':{'once':true,'sound':'ExplosionSmall','volume':0.9},'saucer':{'once':true,'sound':'SaucersShooting','volume':0.35},'wave':{'once':false,'sound':'Wave','volume':0.5}};var fxSoundList,fxActive=false,fxMuted=false;function fxEnable(v){fxActive=Boolean(v);if(fxActive){loadFXSounds();}
else{AudioManager.stopAllSounds();if(fxSoundList)resetSoundList();}}
function fxReset(softReset){if(fxActive){if(softReset){resetSoundList();}
else{AudioManager.stopAllSounds();fxSoundList={};}}}
function setFXVolume(v){if(v==0){fxMuted=true;AudioManager.stopAllSounds();for(var n in fxSoundList){var fx=fxSoundList[n];fx.playing=fx.playNow=false;}}
else{fxMuted=false;AudioManager.setVolume(v);}}
function resetSoundList(){for(var n in fxSoundList){var fx=fxSoundList[n];if(fx.playing&&fx.unique){AudioManager.stopSound(n);fx.playing=false;}
fx.playNow=false;}}
function initFX(){fxSoundList={};for(var id in fxData){var data=fxData[id];fxSoundList[data.sound]={'unique':!data.once,'playing':false,'playNow':false,'volume':data.volume};}
if(fxActive)loadFXSounds();}
function loadFXSounds(){if(fxSoundList&&AudioManager.active()){AudioManager.addIR(resetSoundList);for(var n in fxSoundList)AudioManager.load(n,fxSoundList[n].volume);}}
function fxEvent(soundId){if(fxActive&&!fxMuted&&gameState!=GS_AUTOPLAY)fxSoundList[fxData[soundId].sound].playNow=true;}
function updateFX(){var n,fx;for(n in fxSoundList){fx=fxSoundList[n];if(fx.playNow){if(fx.unique){if(!fx.playing){AudioManager.play(n,true);fx.playing=true;}}
else{AudioManager.play(n);}
fx.playNow=false;}
else if(fx.unique&&fx.playing){AudioManager.stopSound(n);fx.playing=false;}}}
function pauseFX(){AudioManager.suspend();}
function resumeFX(){AudioManager.resume();}
function Sound(name,type,volume,callback){this.createMasterGain();this.buffer=null;this.name=name;this.type=type;this.source=null;this.playing=false;this.load(callback);this.gainNode=(Sound.prototype.ctx.createGain)?Sound.prototype.ctx.createGain():Sound.prototype.ctx.createGainNode();this.gainNode.gain.value=Math.min(1,volume);this.gainNode.connect(Sound.prototype.inputNode);}
Sound.prototype={'filePath':'assets/sounds/','masterVolume':0.5,'startFromCallback':false,'ctx':null,'masterGain':null,'convolver':null,'inputNode':null,'outputNode':null,'compression':{'threshold':-20,'knee':40,'ratio':5,'attack':0,'release':0.1},'biquadFilter':{'type':'lowshelf','frequency':200,'gain':2},'initFlag':true,'initFromUI':function(){if(Sound.prototype.ctx){if(Sound.prototype.ctx.state==='suspended')Sound.prototype.ctx.resume();Sound.prototype.initFlag=false;}},'createMasterGain':function(){var context=Sound.prototype.ctx,cdata;if(Sound.prototype.masterGain&&context)return;if(!context)context=Sound.prototype.ctx=new AudioContext();if(context.createGain){Sound.prototype.masterGain=context.createGain();}
else{Sound.prototype.masterGain=context.createGainNode();}
Sound.prototype.inputNode=Sound.prototype.masterGain;cdata=Sound.prototype.compression;if(cdata){var compressor=context.createDynamicsCompressor();for(var p in cdata)compressor[p].value=cdata[p];Sound.prototype.outputNode=Sound.prototype.inputNode=compressor;}
cdata=Sound.prototype.biquadFilter;if(cdata){var f=context.createBiquadFilter();for(var p in cdata){if(p==='type'){f.type=cdata[p];}
else{f[p].value=cdata[p];}}
if(Sound.prototype.inputNode){Sound.prototype.inputNode.connect(f);}
else{Sound.prototype.inputNode=f;}
Sound.prototype.outputNode=f;}
if(Sound.prototype.outputNode)Sound.prototype.outputNode.connect(Sound.prototype.masterGain);Sound.prototype.masterGain.connect(context.destination);Sound.prototype.masterGain.gain.value=Sound.prototype.masterVolume;},'setMasterGain':function(v){Sound.prototype.masterVolume=v;if(!Sound.prototype.masterGain)Sound.prototype.createMasterGain();Sound.prototype.masterGain.gain.value=v;},'load':function(callback){if(!Sound.prototype.masterGain)Sound.prototype.createMasterGain();var context=Sound.prototype.ctx,ref=this;this.loadFile(this.filePath+this.name+this.type,function(request){if(ref.startFromCallback){ref.buffer=request.response;}
else{context.decodeAudioData(request.response,function(buffer){ref.buffer=buffer;},ref.log);}});},'loadFile':function(filepath,callback){var request=new XMLHttpRequest();request.open('GET',filepath,true);request.responseType='arraybuffer';request.send();if(request.complete){callback(request);}
else{request.onload=function(){callback(request);};}},'addIR':function(filename,filetype,irMix,AMcallback){if(Sound.prototype.convolver){if(AMcallback)AMcallback();return;}
if(!Sound.prototype.masterGain)Sound.prototype.createMasterGain();var context=Sound.prototype.ctx,ref=this;this.loadFile(this.filePath+filename+filetype,function(request){context.decodeAudioData(request.response,function(buffer){ref.convolver=context.createConvolver();ref.convolver.buffer=buffer;if(ref.outputNode){var wetGain,dryGain;if(typeof irMix==='object'){wetGain=(context.createGain)?context.createGain():context.createGainNode();wetGain.gain.value=irMix.wet||0;wetGain.connect(ref.masterGain);ref.convolver.connect(wetGain);dryGain=(context.createGain)?context.createGain():context.createGainNode();dryGain.gain.value=irMix.dry||0;dryGain.connect(ref.masterGain);}
else{ref.convolver.connect(ref.masterGain);}
ref.outputNode.disconnect();if(dryGain)ref.outputNode.connect(dryGain);ref.outputNode.connect(ref.convolver);}
else{ref.convolver.connect(ref.masterGain);ref.inputNode=ref.convolver;}
if(AMcallback)AMcallback();},ref.log);});},'play':function(loop){if(this.playing||!this.buffer)return;var context=Sound.prototype.ctx,source=context.createBufferSource();source.connect(this.gainNode);if(loop){source.loop=true;this.playing=true;}
if(this.startFromCallback){var ref=this;context.decodeAudioData(this.buffer.slice(0),function(buffer){source.buffer=buffer;if(source.start){source.start(0);}
else{source.noteOn(0);}},ref.log);}
else{source.buffer=this.buffer;if(source.start){source.start(0);}
else{source.noteOn(0);}}
this.source=source;var that=this;source.onended=function(){try{source.onended='';source.disconnect();}
catch(e){}
that.source=null;};},'stop':function(){if(this.source){try{if(this.source.stop){this.source.stop(0);}
else{this.source.noteOff(0);}}
catch(e){}
if(this.source.onended)this.source.onended();this.source=null;}
this.playing=false;},'suspend':function(){if(this.ctx){if(this.ctx.suspend){this.ctx.suspend();}
else if(this.masterGain){this.masterGain.disconnect(this.ctx.destination);}}},'resume':function(){if(this.ctx){if(this.ctx.resume){this.ctx.resume();}
else if(this.masterGain){this.masterGain.connect(this.ctx.destination);}}},'log':function(e){if(window.console)console.log('Audio Exception: ',e);}}
var AudioManager=new function(){var type,sounds={},volume=0,isActive=false,impulseResponseFile='IR-SmallDrumRoom',impulseResponseMix={'dry':0.4,'wet':0.6};function setup(){if(!window.AudioContext){var vendors=['webkit','moz','o','ms'];for(var i=0;i<vendors.length;i++){var api=window[vendors[i]+'AudioContext'];if(api){window.AudioContext=api;break;}}}
isActive=Boolean(window.AudioContext);if(!isActive)return;Sound.prototype.startFromCallback=false;var formats=[['audio/ogg','.ogg'],['audio/wav','.wav'],['audio/x-wav','.wav'],['audio/mpeg','.mp3']],a=document.createElement('audio');for(var i in formats){var f=formats[i];if(a.canPlayType(f[0])!=''){type=f[1];break;}}
if(!type)isActive=false;}
function load(name,baseVolume){if(!isActive)return;if(!sounds[name])sounds[name]=new Sound(name,type,baseVolume||1.0);}
function play(name,loop){if(!isActive)return;if(sounds[name])sounds[name].play(loop);}
function setVolume(v){if(!isActive)return;if(v!=volume){volume=v;Sound.prototype.setMasterGain(v);}}
function stopSound(name){if(!isActive)return;if(sounds[name])sounds[name].stop();}
function stopAllSounds(){if(!isActive)return;for(var i in sounds)sounds[i].stop();}
function destroy(){if(!isActive)return;stopAllSounds();sounds=null;}
function active(){return isActive;}
function suspend(){if(!isActive)return;Sound.prototype.suspend();}
function resume(){if(!isActive)return;Sound.prototype.resume();}
function addIR(callback){if(!isActive)return;Sound.prototype.addIR(impulseResponseFile,type,impulseResponseMix,callback);}
setup();return{'load':load,'play':play,'stopSound':stopSound,'stopAllSounds':stopAllSounds,'destroy':destroy,'setVolume':setVolume,'active':active,'suspend':suspend,'resume':resume,'addIR':addIR};}
initFX();function toggleFullscreen(){if(document.fullscreenElement===undefined&&document.mozFullScreen===undefined&&document.webkitIsFullScreen===undefined)return;var method;if(document.fullscreenElement!=null||document.mozFullScreen||document.webkitIsFullScreen){method=document.exitFullscreen||document.cancelFullscreen||document.webkitCancelFullScreen||document.mozCancelFullScreen||document.msCancelFullScreen;if(method)method.call(document);}
else{var el=document.documentElement||document.getElementsByTagName('body')[0];method=el.requestFullscreen||el.webkitRequestFullScreen||el.mozRequestFullScreen||el.msRequestFullScreen;if(method)method.call(el);}}
function observeFullscreen(){var el=document.getElementById('fullscreenToggle'),etypes=['fullscreenchange','webkitfullscreenchange','mozfullscreenchange'];function setScreenMode(){var isFullscreen=document.fullscreenElement!=null||document.mozFullScreen||document.webkitIsFullScreen;el.className=isFullscreen?'fullscreen':'';}
if(el){for(var i=0;i<etypes.length;i++){var et=etypes[i];if(typeof document['on'+et]!=='undefined'){document.addEventListener(et,function(event){setScreenMode();if(event.preventDefault)event.preventDefault();if(event.stopPropagation)event.stopPropagation();event.cancelBubble=true;event.returnValue=false;},false);setTimeout(setScreenMode,10);break;}}}}
var visibilityHidden,visibilityChangeEvent;function enableVisibilityChangeDetection(){if(visibilityHidden)return;if(typeof document.hidden!=='undefined'){visibilityHidden='hidden';visibilityChangeEvent='visibilitychange';}
else if(typeof document.mozHidden!=='undefined'){visibilityHidden='mozHidden';visibilityChangeEvent='mozvisibilitychange';}
else if(typeof document.msHidden!=='undefined'){visibilityHidden='msHidden';visibilityChangeEvent='msvisibilitychange';}
else if(typeof document.webkitHidden!=='undefined'){visibilityHidden='webkitHidden';visibilityChangeEvent='webkitvisibilitychange';}
if(visibilityHidden)document.addEventListener(visibilityChangeEvent,handleVisibilityChange,false);}
function disableVisibilityChangeDetection(){if(visibilityHidden)document.removeEventListener(visibilityChangeEvent,handleVisibilityChange);visibilityHidden='';}
function handleVisibilityChange(){if(document[visibilityHidden]){if(Sound.prototype.ctx)Sound.prototype.ctx.suspend();suspended=true;}
else{if(Sound.prototype.ctx)Sound.prototype.ctx.resume();Sound.prototype.initFlag=true;lastUpdate=now();suspended=false;}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init,false);}
else{init();}
return{'pause':pause,'toggleFullscreen':toggleFullscreen};})();