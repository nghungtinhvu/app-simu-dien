(()=>{
const T=EP.TY,OUT=[];let cur='';
const ok=(name,cond,det)=>OUT.push([cur,name,!!cond,det===undefined?'':String(det)]);
let P;
// mở ví dụ theo tên (không phụ thuộc thứ tự trong danh sách)
const exi=name=>{const i=EP.EX.findIndex(x=>x.name===name);if(i<0)throw new Error('không có ví dụ: '+name);return i};
function mk(build){EP.openEx(0);P=EP.P;P.comps=[];P.wires=[];const C=(t,l,pr,st)=>{if(!T[t])throw new Error('no type '+t);const c={id:l,type:t,x:0,y:0,label:l,params:Object.assign({},T[t].params,pr||{}),st:Object.assign({},T[t].st||{},st||{})};P.comps.push(c);return c};
 const W=(a,ta,b,tb)=>{for(const[c,t]of[[a,ta],[b,tb]])if(!T[c.type].terms.some(x=>x.id===t))throw new Error(`no term ${c.type}.${t}`);P.wires.push({id:Math.random()+'',a:{c:a.id,t:ta},b:{c:b.id,t:tb},pts:[],color:'đỏ',v3:1})};build(C,W);EP.startSim()}
const run=s=>{for(let i=0;i<Math.round(s*20);i++)EP.tick(.05)};
const r=l=>EP.rt(l);const dn=l=>EP.press(l,1),up=l=>EP.press(l,0),tap=l=>{dn(l);up(l)};
const V=(l1,t1,l2,t2)=>EP.vb(l1,t1,l2,t2).v;const cn=(l1,t1,l2,t2)=>EP.conn(l1,t1,l2,t2);
const log=()=>EP.sim.log.map(x=>x.m).join(' | ');
const stop=()=>EP.stopSim();
// helper: 230V L/N supply
const L1N=(C,W)=>C('mains1','X');
function T_(name,fn){cur=name;try{fn()}catch(e){OUT.push([name,'EXCEPTION',false,e.message])}try{stop()}catch(e){}}

T_('mains3',()=>{mk((C,W)=>{C('mains3','X')});ok('L1-L2 400',V('X','L1','X','L2')===400);ok('L1-N 230',V('X','L1','X','N')===230);ok('L3-PE 230',V('X','L3','X','PE')===230);ok('N-PE 0',V('X','N','X','PE')===0)});
T_('mains1',()=>{mk((C,W)=>{C('mains1','X')});ok('L-N 230',V('X','L','X','N')===230)});
T_('psu',()=>{mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G');W(m,'L',g,'L');W(m,'N',g,'N')});ok('+/- 24VDC',V('G','+','G','-')===24);stop();
 mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',g,'-')});ok('short output -> PSU trips',r('G').trip===1,log());stop();
 mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G')});ok('no input -> no output',V('G','+','G','-')===0)});
T_('xfmr',()=>{mk((C,W)=>{const m=C('mains3','X'),t=C('xfmr','T');W(m,'L1',t,'P1');W(m,'L2',t,'P2')});ok('400 primary -> 230 sec',V('T','S1','T','S2')===230);ok('isolated: S1 vs N = 0',V('T','S1','X','N')===0);stop();
 mk((C,W)=>{const m=C('mains3','X'),t=C('xfmr','T');W(m,'L1',t,'P1');W(m,'N',t,'P2')});ok('230 on 400V primary -> off',V('T','S1','T','S2')===0);stop();
 mk((C,W)=>{const m=C('mains3','X'),t=C('xfmr','T',{vp:'230'});W(m,'L1',t,'P1');W(m,'N',t,'P2')});ok('230 primary setting works',V('T','S1','T','S2')===230);stop();
 mk((C,W)=>{const m=C('mains3','X'),t=C('xfmr','T');W(m,'L1',t,'P1');W(m,'L2',t,'P2');W(t,'S1',t,'S2')});ok('secondary short -> trip',r('T').trip===1,log())});
for(const k of ['xterm','xterm4','dist4','barN','barPE'])T_(k,()=>{mk((C,W)=>{const m=C('mains1','X'),d=C(k,'D');const ts=T[k].terms.map(t=>t.id);W(m,'L',d,ts[0])});const ts=T[k].terms.map(t=>t.id);const same=k==='dist4'?['N','N.1','N.2','N.3']:ts;ok('all linked terminals same net',same.every(t=>cn('D',same[0],'D',t)));if(k==='dist4')ok('poles isolated',!cn('D','N','D','L1'))});
const brk=(k,pin,pout,pole2)=>T_(k,()=>{mk((C,W)=>{const m=C('mains3','X'),q=C(k,'Q'),h=C('lamp','H');W(m,'L1',q,pin);W(q,pout,h,'X1');W(h,'X2',m,'N')});run(.1);ok('on: lamp lit',r('H').lit);tap('Q');run(.1);ok('off: lamp dark',!r('H').lit);tap('Q');run(.1);ok('on again',r('H').lit);stop();
 mk((C,W)=>{const m=C('mains3','X'),q=C(k,'Q');W(m,'L1',q,pin);W(q,pout,m,'N')});ok('short -> trips',r('Q').trip===1,log());tap('Q');ok('click resets to off',!r('Q').trip&&!r('Q').on)});
brk('mcb1','1','2');brk('mcb2','1','2');brk('mcb3','1','2');brk('mcb4','1','2');brk('mpcb','1','2');brk('rcbo','1','2');
T_('mpcb aux',()=>{mk((C,W)=>{C('mains3','X');C('mpcb','Q')});ok('13-14 closed when on',cn('Q','13','Q','14'));tap('Q');ok('13-14 open when off',!cn('Q','13','Q','14'))});
T_('mcb4 N pole',()=>{mk((C,W)=>{C('mains3','X');C('mcb4','Q')});ok("N-N' closed",cn('Q','N','Q',"N'"))});
for(const k of['fuse1','fuse3'])T_(k,()=>{mk((C,W)=>{const m=C('mains3','X'),f=C(k,'F'),h=C('lamp','H');W(m,'L1',f,'1');W(f,'2',h,'X1');W(h,'X2',m,'N')});run(.1);ok('conducts',r('H').lit);stop();
 mk((C,W)=>{const m=C('mains3','X'),f=C(k,'F');W(m,'L1',f,'1');W(f,'2',m,'N')});ok('short -> blows',r('F').trip===1);tap('F');ok('replace on shorted circuit blows again',r('F').trip===1);stop();
 mk((C,W)=>{C('mains3','X');C(k,'F',{},{trip:1})});ok('blown fuse open',!cn('F','1','F','2'));tap('F');ok('click replaces',!r('F').trip&&cn('F','1','F','2'))});
T_('rccb',()=>{mk((C,W)=>{const m=C('mains1','X'),q=C('rccb','RC'),h=C('lamp','H');W(m,'L',q,'1');W(m,'N',q,'N');W(q,'2',h,'X1');W(h,'X2',q,"N'")});run(.1);ok('normal load works',r('H').lit);tap('RC');run(.1);ok('click switches off',!r('RC').on&&!r('H').lit);stop();
 mk((C,W)=>{const m=C('mains1','X'),q=C('rccb','RC'),b=C('mcb1','Q1');W(m,'L',q,'1');W(m,'N',q,'N');W(q,'2',b,'1');W(b,'2',m,'PE')});ok('earth fault -> RCCB trips, MCB stays',r('RC').trip===1&&!r('Q1').trip,log());stop();
 mk((C,W)=>{const m=C('mains1','X'),q=C('rccb','RC'),b=C('mcb1','Q1');W(m,'L',q,'1');W(m,'N',q,'N');W(q,'2',b,'1');W(b,'2',q,"N'")});ok('L-N short -> MCB trips, RCCB stays',!r('RC').trip&&r('Q1').trip===1)});
T_('iso3',()=>{mk((C,W)=>{C('mains3','X');C('iso3','Q')});ok('on: 1-2',cn('Q','1','Q','2'));tap('Q');ok('off: open',!cn('Q','1','Q','2'))});
T_('cos3',()=>{mk((C,W)=>{C('mains3','X');C('cos3','Q')});const st=()=>[cn('Q','1','Q','A2'),cn('Q','1','Q','B2')].map(Number).join('');ok('pos0 none',st()==='00');tap('Q');ok('pos1 A',st()==='10');tap('Q');ok('pos2 B',st()==='01');tap('Q');ok('back 0',st()==='00')});
T_('ol',()=>{mk((C,W)=>{C('mains3','X');C('ol','F')});ok('poles pass',cn('F','1','F','2')&&cn('F','5','F','6'));ok('95-96 closed',cn('F','95','F','96'));ok('97-98 open',!cn('F','97','F','98'));tap('F');ok('tripped: 95-96 open, 97-98 closed',!cn('F','95','F','96')&&cn('F','97','F','98'));tap('F');ok('reset',cn('F','95','F','96'))});
T_('phr',()=>{for(const[seq,exp,st]of[[['L1','L2','L3'],true,'OK'],[['L1','L3','L2'],false,'ĐẢO PHA'],[['L1','L2',null],false,'MẤT PHA']]){mk((C,W)=>{const m=C('mains3','X'),f=C('phr','F');seq.forEach((p,i)=>p&&W(m,p,f,'L'+(i+1)))});ok(st,r('F').ok===exp&&r('F').st===st,r('F').st);ok(st+' contact',cn('F','11','F',exp?'14':'12'));stop()}});
// contactor & coils
T_('contactor',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('sel','S'),k=C('contactor','K');W(m,'L',s,'13');W(s,'14',k,'A1');W(k,'A2',m,'N')});ok('off: NO open, NC closed',!cn('K','1','K','2')&&cn('K','21','K','22'));tap('S');ok('on: main+13-14 closed, 21-22 open',r('K').on&&cn('K','1','K','2')&&cn('K','5','K','6')&&cn('K','13','K','14')&&!cn('K','21','K','22'));stop();
 mk((C,W)=>{const m=C('mains3','X'),k=C('contactor','K');W(m,'L1',k,'A1');W(k,'A2',m,'L2')});ok('230V coil on 400V -> burnt',r('K').burnt===1);stop();
 mk((C,W)=>{const m=C('mains1','X'),k=C('contactor','K',{coil:'24VDC'});W(m,'L',k,'A1');W(k,'A2',m,'N')});ok('24VDC coil on 230VAC -> burnt',r('K').burnt===1);stop();
 mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),k=C('contactor','K',{coil:'24VDC'});W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',k,'A1');W(k,'A2',g,'-')});ok('24VDC coil on 24VDC -> on',r('K').on===true)});
T_('auxblk/tmrblk',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('sel','S'),k=C('contactor','KM');C('auxblk','A',{km:'KM'});C('tmrblk','B',{km:'KM',t:'1'});W(m,'L',s,'13');W(s,'14',k,'A1');W(k,'A2',m,'N')});
 ok('aux idle: 61-62 closed',cn('A','61','A','62')&&!cn('A','53','A','54'));tap('S');run(.1);ok('aux follows KM',cn('A','53','A','54')&&!cn('A','61','A','62'));ok('timer block not yet',cn('B','55','B','56'));run(1.1);ok('timer block after 1s',cn('B','67','B','68')&&!cn('B','55','B','56'));tap('S');run(.1);ok('timer block resets',cn('B','55','B','56'))});
T_('relay',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('sel','S'),k=C('relay','K');W(m,'L',s,'13');W(s,'14',k,'A1');W(k,'A2',m,'N')});ok('off 11-12, 21-22',cn('K','11','K','12')&&cn('K','21','K','22'));tap('S');ok('on 11-14, 21-24',cn('K','11','K','14')&&cn('K','21','K','24')&&!cn('K','11','K','12'))});
T_('timer_on',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('sel','S'),k=C('timer_on','K',{t:'2'});W(m,'L',s,'13');W(s,'14',k,'A1');W(k,'A2',m,'N')});tap('S');run(1.5);ok('before t: 15-16',cn('K','15','K','16'));run(.7);ok('after t: 15-18',cn('K','15','K','18'));tap('S');run(.1);ok('de-energise resets',cn('K','15','K','16'))});
T_('timer_off',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('sel','S'),k=C('timer_off','K',{t:'2'});W(m,'L',s,'13');W(s,'14',k,'A1');W(k,'A2',m,'N')});ok('idle 15-16',cn('K','15','K','16'));tap('S');run(.1);ok('energised -> 15-18 at once',cn('K','15','K','18'));tap('S');run(1.5);ok('still 15-18 within t',cn('K','15','K','18'));run(.7);ok('after t back to 15-16',cn('K','15','K','16'))});
T_('ydtimer',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('sel','S'),k=C('ydtimer','K',{t:'1'});W(m,'L',s,'13');W(s,'14',k,'A1');W(k,'A2',m,'N')});tap('S');run(.2);ok('star 17-18',cn('K','17','K','18')&&!cn('K','17','K','28'));run(.85);ok('dead time: both open',!cn('K','17','K','18')&&!cn('K','17','K','28'));run(.2);ok('delta 17-28',cn('K','17','K','28'));tap('S');run(.1);ok('off resets',!cn('K','17','K','28'))});
T_('impulse',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('pb_no','S'),k=C('impulse','K');W(m,'L',s,'3');W(s,'4',k,'A1');W(k,'A2',m,'N')});tap('S');ok('1st pulse closes',cn('K','11','K','14'));dn('S');run(.5);up('S');ok('holding does not toggle twice',!cn('K','11','K','14'));tap('S');ok('3rd closes',cn('K','11','K','14'))});
T_('flasher',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('sel','S'),k=C('flasher','K',{t:'0.5'});W(m,'L',s,'13');W(s,'14',k,'A1');W(k,'A2',m,'N')});ok('idle open',!cn('K','15','K','18'));tap('S');run(.1);const a=cn('K','15','K','18');run(.5);const b=cn('K','15','K','18');run(.5);const c=cn('K','15','K','18');ok('toggles every 0.5s',a&&!b&&c,[a,b,c]);tap('S');run(.1);ok('off -> open',!cn('K','15','K','18'))});
T_('lvl61f',()=>{for(const mode of['Cấp nước','Xả nước']){mk((C,W)=>{const m=C('mains1','X'),k=C('lvl61f','K',{mode}),t=C('tank','TK',{low:'20',high:'80',fill:'0',drain:'0'},{lv:10,dr:0});W(m,'L',k,'A1');W(m,'N',k,'A2');W(k,'E1',t,'E1');W(k,'E2',t,'E2');W(k,'E3',t,'E3')});
  const fill=mode==='Cấp nước';ok(mode+': empty -> '+(fill?'ON':'OFF'),!!r('K').out===fill);r('TK').lv=50;run(.1);ok(mode+': middle keeps state',!!r('K').out===fill);r('TK').lv=85;run(.1);ok(mode+': full -> '+(fill?'OFF':'ON'),!!r('K').out===!fill);r('TK').lv=50;run(.1);ok(mode+': middle keeps',!!r('K').out===!fill);r('TK').lv=10;run(.1);ok(mode+': empty again',!!r('K').out===fill);ok('contact matches',cn('K','Tc','K',r('K').out?'Ta':'Tb'));stop()}
 mk((C,W)=>{const k=C('lvl61f','K');C('mains1','X')});ok('no power -> off',!r('K').out)});
// pilot
T_('pb_no/pb_nc/pb2',()=>{mk((C,W)=>{C('mains1','X');C('pb_no','A');C('pb_nc','B');C('pb2','D')});ok('idle',!cn('A','3','A','4')&&cn('B','1','B','2')&&!cn('D','13','D','14')&&cn('D','21','D','22'));dn('A');dn('B');dn('D');ok('pressed',cn('A','3','A','4')&&!cn('B','1','B','2')&&cn('D','13','D','14')&&!cn('D','21','D','22'));up('A');up('B');up('D');ok('released (momentary)',!cn('A','3','A','4')&&cn('B','1','B','2'))});
T_('estop/sel/sel3',()=>{mk((C,W)=>{C('mains1','X');C('estop','E');C('sel','S');C('sel3','S3')});ok('estop idle closed',cn('E','1','E','2'));dn('E');up('E');ok('estop latches open',!cn('E','1','E','2'));tap('E');ok('estop reset',cn('E','1','E','2'));tap('S');ok('sel on',cn('S','13','S','14'));tap('S');ok('sel off',!cn('S','13','S','14'));tap('S3');ok('sel3 pos1',cn('S3','13','S3','14')&&!cn('S3','23','S3','24'));tap('S3');ok('sel3 pos2',cn('S3','23','S3','24')&&!cn('S3','13','S3','14'));tap('S3');ok('sel3 pos0',!cn('S3','13','S3','14')&&!cn('S3','23','S3','24'))});
// signalling
T_('lamp/buzzer',()=>{mk((C,W)=>{const m=C('mains1','X'),h=C('lamp','H'),b=C('buzzer','B'),h2=C('lamp','H2',{v:'24VDC'});W(m,'L',h,'X1');W(h,'X2',m,'N');W(m,'L',b,'X1');W(b,'X2',m,'N');W(m,'L',h2,'X1');W(h2,'X2',m,'N')});run(.1);ok('lamp 230 lit',r('H').lit);ok('buzzer on',r('B').lit);ok('24V lamp on 230 burns',r('H2').burnt===1)});
T_('tower',()=>{mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),t=C('tower','H');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',t,'R');W(g,'+',t,'G');W(g,'-',t,'COM')});run(.1);ok('R and G lit, Y dark',r('H').R&&r('H').G&&!r('H').Y)});
// actuators
T_('motor3',()=>{mk((C,W)=>{const m=C('mains3','X'),M=C('motor3','M');W(m,'L1',M,'U');W(m,'L2',M,'V');W(m,'L3',M,'W')});run(.1);ok('forward',r('M').run&&r('M').dir===1,r('M').msg);stop();
 mk((C,W)=>{const m=C('mains3','X'),M=C('motor3','M');W(m,'L1',M,'U');W(m,'L3',M,'V');W(m,'L2',M,'W')});run(.1);ok('reverse',r('M').run&&r('M').dir===-1,r('M').msg);stop();
 mk((C,W)=>{const m=C('mains3','X'),f=C('ol','F'),M=C('motor3','M');W(m,'L1',f,'1');W(m,'L2',f,'3');W(f,'2',M,'U');W(f,'4',M,'V');W(f,'6',M,'W')});run(3.5);ok('single phase -> OL trips >3s',r('F').trip===1&&!r('M').run,log());stop();
 mk((C,W)=>{const m=C('mains3','X'),M=C('motor3','M');W(m,'L1',M,'U');W(m,'L2',M,'V')});run(6.5);ok('single phase no OL -> burnt',r('M').burnt===1)});
T_('motor6',()=>{const base=(C,W)=>{const m=C('mains3','X'),M=C('motor6','M');W(m,'L1',M,'U1');W(m,'L2',M,'V1');W(m,'L3',M,'W1');return[m,M]};
 mk((C,W)=>{const[m,M]=base(C,W);W(M,'U2',M,'V2');W(M,'V2',M,'W2')});run(.1);ok('star',r('M').mode==='Y',r('M').msg);stop();
 mk((C,W)=>{const[m,M]=base(C,W);W(m,'L3',M,'U2');W(m,'L1',M,'V2');W(m,'L2',M,'W2')});run(.1);ok('delta',r('M').mode==='Δ',r('M').msg);stop();
 mk((C,W)=>{base(C,W)});run(.1);ok('open star point -> not running',!r('M').run,r('M').msg);stop();
 mk((C,W)=>{const[m,M]=base(C,W);W(m,'L1',M,'U2');W(m,'L2',M,'V2');W(m,'L3',M,'W2')});run(.1);ok('wrong delta (same phase each end) -> not running',!r('M').run,r('M').msg)});
T_('motor1/fan/heater',()=>{mk((C,W)=>{const m=C('mains1','X'),M=C('motor1','M'),f=C('fan','E'),h=C('heater','R');for(const c of[M,f,h]){W(m,'L',c,'L');W(c,'N',m,'N')}});run(.2);ok('motor1 runs',r('M').run);ok('fan runs',r('E').run);ok('heater on',r('R').on);stop();
 mk((C,W)=>{const m=C('mains3','X'),M=C('motor1','M');W(m,'L1',M,'L');W(M,'N',m,'L2')});run(.1);ok('motor1 on 400V burns',r('M').burnt===1)});
T_('motordc',()=>{mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),M=C('motordc','M');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',M,'+');W(g,'-',M,'-')});run(.1);ok('forward',r('M').run&&r('M').dir===1);stop();
 mk((C,W)=>{const m=C('mains1','X'),M=C('motordc','M');W(m,'L',M,'+');W(m,'N',M,'-')});run(.1);ok('AC -> burnt',r('M').burnt===1)});
T_('valve',()=>{mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),v=C('valve','Y');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',v,'A1');W(v,'A2',g,'-')});run(.1);ok('24V valve opens',r('Y').lit)});
T_('pump1',()=>{mk((C,W)=>{const m=C('mains1','X'),M=C('pump1','M',{q:'3'});W(m,'L',M,'L');W(M,'N',m,'N')});run(.2);ok('runs with flow 3',r('M').run&&r('M').flow===3);tap('M');run(.1);ok('dry -> flow 0, still running',r('M').run&&r('M').flow===0)});
T_('pump3',()=>{mk((C,W)=>{const m=C('mains3','X'),M=C('pump3','M',{q:'10'});W(m,'L1',M,'U');W(m,'L3',M,'V');W(m,'L2',M,'W')});run(.2);ok('reverse -> 30% flow',Math.abs(r('M').flow-3)<1e-9,r('M').flow)});
T_('cyl',()=>{mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),s=C('sel','S'),y=C('cyl','Y',{t:'1'});W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',s,'13');W(s,'14',y,'A1');W(y,'A2',g,'-')});run(.1);ok('retracted: a closed',cn('Y','a1','Y','a2')&&!cn('Y','b1','Y','b2'));tap('S');run(.5);ok('mid-stroke: both open',!cn('Y','a1','Y','a2')&&!cn('Y','b1','Y','b2'));run(.6);ok('extended: b closed',cn('Y','b1','Y','b2'));tap('S');run(1.1);ok('retracts back',cn('Y','a1','Y','a2'))});
// sensors
T_('limit/float/thermo/press',()=>{mk((C,W)=>{C('mains1','X');for(const k of['limit','float','thermo','press'])C(k,k)});for(const k of['limit','float','thermo','press']){ok(k+' idle 11-12',cn(k,'11',k,'12')&&!cn(k,'11',k,'14'));tap(k);ok(k+' actuated 11-14',cn(k,'11',k,'14')&&!cn(k,'11',k,'12'))}});
T_('proxpnp/proxnpn',()=>{mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),p=C('proxpnp','P'),n=C('proxnpn','N'),h1=C('lamp','H1',{v:'24VDC'}),h2=C('lamp','H2',{v:'24VDC'});W(m,'L',g,'L');W(m,'N',g,'N');
  for(const s of[p,n]){W(g,'+',s,'BN');W(g,'-',s,'BU')}W(p,'BK',h1,'X1');W(h1,'X2',g,'-');W(g,'+',h2,'X1');W(h2,'X2',n,'BK')});run(.1);ok('no object: both off',!r('H1').lit&&!r('H2').lit);tap('P');tap('N');run(.1);ok('PNP sources +24',r('H1').lit);ok('NPN sinks 0V',r('H2').lit);stop();
 mk((C,W)=>{C('proxpnp','P')});tap('P');run(.1);ok('unpowered sensor gives nothing',!r('P').pw)});
T_('flowsw',()=>{mk((C,W)=>{const m=C('mains1','X'),M=C('pump1','M'),s=C('sel','S'),f=C('flowsw','B',{pump:'M',t:'1'});W(m,'L',s,'13');W(s,'14',M,'L');W(M,'N',m,'N')});ok('no flow 11-12',cn('B','11','B','12'));tap('S');run(.5);ok('within delay still 11-12',cn('B','11','B','12'));run(.7);ok('after delay 11-14',cn('B','11','B','14'));tap('M');run(.2);ok('dry run -> back to 11-12',cn('B','11','B','12'),log())});
// measurement
T_('vmeter',()=>{mk((C,W)=>{const m=C('mains3','X'),v=C('vmeter','P');W(m,'L1',v,'a');W(m,'L2',v,'b')});run(.1);ok('reads 400 AC',r('P').v.v===400&&r('P').v.k==='AC')});
T_('hourm',()=>{mk((C,W)=>{const m=C('mains1','X'),h=C('hourm','P');W(m,'L',h,'A1');W(h,'A2',m,'N')});run(2);ok('counts ~2s',Math.abs(r('P').s-2)<.11,r('P').s)});
T_('phseq',()=>{mk((C,W)=>{const m=C('mains3','X'),p=C('phseq','P');W(m,'L1',p,'L1');W(m,'L3',p,'L2');W(m,'L2',p,'L3')});run(.1);ok('detects reverse',r('P').seq==='ngược')});
// vfd
T_('vfd',()=>{mk((C,W)=>{const m=C('mains3','X'),u=C('vfd','U',{f:'50',ramp:'2'}),M=C('motor3','M'),s=C('sel3','S');W(m,'L1',u,'L1');W(m,'L2',u,'L2');W(m,'L3',u,'L3');W(u,'U',M,'U');W(u,'V',M,'V');W(u,'W',M,'W');W(u,'+24',s,'13');W(u,'+24',s,'23');W(s,'14',u,'DI1');W(s,'24',u,'DI2')});
 run(.1);ok('idle 0 Hz, motor stopped',!r('U').f&&!r('M').run);tap('S');run(1);ok('ramping ~25Hz',Math.abs(r('U').f-25)<3,r('U').f);run(1.2);ok('50Hz forward',r('U').f===50&&r('M').dir===1);ok('RA-RC closed while running',cn('U','RA','U','RC'));tap('S');run(1.5);ok('reverse cmd: decelerating',r('U').f<50&&r('U').dir===1);run(2.5);ok('then reverse running',r('U').dir===-1&&r('M').dir===-1&&r('M').run);tap('S');run(2.2);ok('pos0 -> stops',r('U').f===0&&!r('M').run);stop();
 mk((C,W)=>{const m=C('mains3','X'),u=C('vfd','U');W(m,'L1',u,'L1');W(m,'L2',u,'L2')});run(.1);ok('missing phase -> no power',!r('U').pw)});
// PLC
T_('plc',()=>{const build=prog=>mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),p=C('plc','PLC',{prog});const s=['S0','S1','S2'].map((l,i)=>C('pb_no',l));W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',p,'L+');W(g,'-',p,'M');s.forEach((b,i)=>{W(g,'+',b,'3');W(b,'4',p,'I'+i)});W(g,'+',p,'1L');W(g,'+',p,'2L')});
 const Q=i=>!!r('PLC').q[i];
 build('Q0 = I0 & I1\nQ1 = I0 | I1\nQ2 = !I0\nQ3 = (I0 | I1) & !I2');ok('AND/OR/NOT idle',!Q(0)&&!Q(1)&&Q(2)&&!Q(3));dn('S0');ok('I0',!Q(0)&&Q(1)&&!Q(2)&&Q(3));dn('S1');ok('I0&I1',Q(0));dn('S2');ok('!I2 blocks',!Q(3));ok('output contact closes 1L-Q0',cn('PLC','1L','PLC','Q0'));stop();
 build('S Q0 = I0\nR Q0 = I1');tap('S0');ok('SET latches',Q(0));tap('S1');ok('RESET clears',!Q(0));stop();
 build('M0 = (I0 | M0) & !I1\nQ0 = M0');tap('S0');ok('self-hold via M',Q(0));tap('S1');ok('stop',!Q(0));stop();
 build('T0 = TON(I0, 1)\nQ0 = T0');dn('S0');run(.8);ok('TON not yet',!Q(0));run(.3);ok('TON done',Q(0));up('S0');run(.1);ok('TON resets',!Q(0));stop();
 build('T1 = TOF(I0, 1)\nQ0 = T1');tap('S0');run(.1);ok('TOF on immediately',Q(0));run(.8);ok('TOF holds',Q(0));run(.3);ok('TOF off after 1s',!Q(0));stop();
 build('C0 = CTU(I0, I1, 3)\nQ0 = C0');for(let i=0;i<2;i++){tap('S0');run(.1)}ok('CTU 2 < 3',!Q(0));tap('S0');run(.1);ok('CTU reaches 3',Q(0));tap('S1');run(.1);ok('CTU reset',!Q(0)&&r('PLC').C.C0.n===0);stop();
 build('Q0 = I0 &');dn('S0');ok('compile error -> outputs off + err',!Q(0)&&!!r('PLC').err);stop();
 build('Q0 = 1');ok('RUN: Q0 on',Q(0));tap('PLC');ok('STOP via click -> outputs off',!Q(0));stop();
 mk((C,W)=>{C('plc','PLC',{prog:'Q0 = 1'})});ok('no 24V -> outputs off',!r('PLC').q[0])});
// process
T_('tank',()=>{mk((C,W)=>{const m=C('mains1','X'),M=C('pump1','M'),s=C('sel','S');C('tank','TK',{pump:'M',low:'20',high:'80',fill:'10',drain:'0'},{lv:10,dr:0});W(m,'L',s,'13');W(s,'14',M,'L');W(M,'N',m,'N')});
 ok('low: L1-L2 closed, H1-H2 closed, probes dry',cn('TK','L1','TK','L2')&&cn('TK','H1','TK','H2')&&!cn('TK','E3','TK','E2'));run(1);ok('no pump -> level unchanged',Math.abs(r('TK').lv-10)<1e-9);tap('S');run(2);ok('pump fills 10%/s',Math.abs(r('TK').lv-30)<1.01,r('TK').lv);ok('mid: L open, E2 wet',!cn('TK','L1','TK','L2')&&cn('TK','E3','TK','E2'));run(6);ok('full: H open, E1 wet, capped 100',!cn('TK','H1','TK','H2')&&cn('TK','E3','TK','E1')&&r('TK').lv<=100);
 tap('M');const lv=r('TK').lv;run(1);ok('dry pump -> no filling',r('TK').lv===lv);stop();
 mk((C,W)=>{C('mains1','X');C('tank','TK',{drain:'5',fill:'0'},{lv:50,dr:1})});run(2);ok('manual drain 5%/s',Math.abs(r('TK').lv-40)<.6,r('TK').lv);tap('TK');const l2=r('TK').lv;run(1);ok('click closes drain',r('TK').lv===l2);stop();
 mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),v=C('valve','Y');C('tank','TK',{out:'Y',drain:'5',fill:'0'},{lv:50,dr:1});W(m,'L',g,'L');W(m,'N',g,'N')});run(1);ok('linked drain valve closed -> no drain',r('TK').lv===50)});
T_('conv',()=>{mk((C,W)=>{const m=C('mains3','X'),s=C('sel','S'),k=C('contactor','K'),M=C('motor3','M');C('conv','CV',{motor:'M',spawn:'0',speed:'20'});W(m,'L1',s,'13');W(s,'14',k,'A1');W(k,'A2',m,'N');W(m,'L1',k,'1');W(m,'L2',k,'3');W(m,'L3',k,'5');W(k,'2',M,'U');W(k,'4',M,'V');W(k,'6',M,'W')});
 tap('CV');run(.1);ok('manual box -> start sensor',cn('CV','P1','CV','P2'));run(1);ok('motor off -> box stays',r('CV').b[0]===0);tap('S');run(2.5);ok('moves 20%/s',Math.abs(r('CV').b[0]-50)<2,r('CV').b[0]);run(1.8);ok('end sensor',cn('CV','S1','CV','S2'),r('CV').b[0]);run(1.2);ok('box exits, counted',r('CV').b.length===0&&r('CV').n===1);stop();
 mk((C,W)=>{const m=C('mains3','X'),M=C('motor3','M');C('conv','CV',{motor:'M',spawn:'1'});W(m,'L1',M,'U');W(m,'L2',M,'V');W(m,'L3',M,'W')});run(3.05);ok('auto spawn every 1s',r('CV').b.length>=2,r('CV').b.length)});
T_('short without protection',()=>{mk((C,W)=>{const m=C('mains3','X');W(m,'L1',m,'L2')});ok('sim pauses with fault',EP.sim.paused===1&&EP.sim.fault&&EP.sim.fault.length>0)});
T_('oscillation guard',()=>{mk((C,W)=>{const m=C('mains1','X'),k=C('relay','K');W(m,'L',k,'11');W(k,'12',k,'A1');W(k,'A2',m,'N')});run(.2);ok('buzzing relay detected',/dao động/.test(log()),log())});
// ---- dòng điện & bảo vệ quá dòng
T_('ameter',()=>{mk((C,W)=>{const m=C('mains1','X'),a=C('ameter','A'),h=C('heater','R',{P:'2300'});W(m,'L',a,'1');W(a,'2',h,'L');W(h,'N',m,'N')});run(.2);ok('heater 2300W ≈ 10 A',Math.abs(r('A').I-10)<.01,r('A').I);stop();
 mk((C,W)=>{const m=C('mains3','X'),a=C('ameter','A'),M=C('motor3','M');W(m,'L1',a,'1');W(a,'2',M,'U');W(m,'L2',M,'V');W(m,'L3',M,'W')});run(.1);const i0=r('A').I;run(3);ok('DOL inrush ~6×In then In',i0>15&&Math.abs(r('A').I-3.5)<.05,[i0,r('A').I]);stop();
 mk((C,W)=>{const m=C('mains1','X'),a=C('ameter','A'),h=C('heater','R');W(m,'L',a,'1');W(a,'2',h,'L')});run(.1);ok('open circuit -> 0 A',r('A').I===0)});
T_('mcb thermal/magnetic',()=>{mk((C,W)=>{const m=C('mains1','X'),q=C('mcb1','Q',{In:'6A'}),h=C('heater','R',{P:'2300'});W(m,'L',q,'1');W(q,'2',h,'L');W(h,'N',m,'N')});run(15);ok('1.67×In: not yet at 15 s',!r('Q').trip&&r('Q').th>.4,r('Q').th);run(10);ok('1.67×In: trips ~22 s',r('Q').trip===1&&/quá tải/.test(log()),log());tap('Q');ok('hot: cannot reset yet',r('Q').trip===1);run(10);tap('Q');ok('after cooling: resets to off',!r('Q').trip&&!r('Q').on,r('Q').th);stop();
 mk((C,W)=>{const m=C('mains1','X'),q=C('mcb1','Q',{In:'2A',cur:'B'}),M=C('motor1','M');W(m,'L',q,'1');W(q,'2',M,'L');W(M,'N',m,'N')});run(.1);ok('B2 + motor 4 A start 24 A -> instant trip',r('Q').trip===1&&/tức thời/.test(log()),log());stop();
 mk((C,W)=>{const m=C('mains1','X'),q=C('mcb1','Q',{In:'6A',cur:'C'}),M=C('motor1','M');W(m,'L',q,'1');W(q,'2',M,'L');W(M,'N',m,'N')});run(5);ok('C6 + motor 4 A: no trip',!r('Q').trip&&r('M').run,r('Q').th);ok('MCB shows current',Math.abs(r('Q').I-4)<.05,r('Q').I)});
T_('ol class 10',()=>{const b=(Ir,load)=>mk((C,W)=>{const m=C('mains3','X'),s=C('sel','S'),k=C('contactor','K'),f=C('ol','F',{Ir}),M=C('motor3','M',{load});W(m,'L1',s,'13');W(s,'14',f,'95');W(f,'96',k,'A1');W(k,'A2',m,'N');
  W(m,'L1',k,'1');W(m,'L2',k,'3');W(m,'L3',k,'5');W(k,'2',f,'1');W(k,'4',f,'3');W(k,'6',f,'5');W(f,'2',M,'U');W(f,'4',M,'V');W(f,'6',M,'W')});
 b('4','100');tap('S');run(10);ok('rated load: no trip',!r('F').trip&&r('M').run);tap('M');run(2);ok('jam: not instant',!r('F').trip);run(9);ok('jam 5,25×Ir: class 10 trips ≈10 s',r('F').trip===1,log());run(.1);ok('KM drops, motor stops, I=0',!r('K').on&&!r('M').run&&r('M').I===0);tap('F');ok('hot OL cannot reset',r('F').trip===1);tap('M');run(8);tap('F');ok('cooled OL resets',!r('F').trip);stop();
 b('4','200');tap('S');run(60);ok('200% load: not before 60 s',!r('F').trip,r('F').th);run(20);ok('200% load: trips ~73 s',r('F').trip===1,r('F').th)});
T_('motor burns without protection',()=>{mk((C,W)=>{const m=C('mains3','X'),M=C('motor3','M');W(m,'L1',M,'U');W(m,'L2',M,'V');W(m,'L3',M,'W')});run(1);tap('M');run(8);ok('jammed 8 s: still ok',!r('M').burnt);run(5);ok('jammed ~11 s: burnt',r('M').burnt===1,log())});
T_('mpcb magnetic',()=>{mk((C,W)=>{const m=C('mains3','X'),q=C('mpcb','Q',{Ir:'0.5'}),M=C('motor3','M');W(m,'L1',q,'1');W(m,'L2',q,'3');W(m,'L3',q,'5');W(q,'2',M,'U');W(q,'4',M,'V');W(q,'6',M,'W')});run(.1);ok('start 21 A ≥ 13×0.5 -> trips',r('Q').trip===1,log());stop();
 mk((C,W)=>{const m=C('mains3','X'),q=C('mpcb','Q',{Ir:'4'}),M=C('motor3','M');W(m,'L1',q,'1');W(m,'L2',q,'3');W(m,'L3',q,'5');W(q,'2',M,'U');W(q,'4',M,'V');W(q,'6',M,'W')});run(5);ok('Ir 4 A: runs',!r('Q').trip&&r('M').run);tap('M');run(9);ok('jam -> thermal trip',r('Q').trip===1&&!r('M').run,log())});
T_('fuse overload',()=>{mk((C,W)=>{const m=C('mains1','X'),f=C('fuse1','F',{In:'4A'}),h=C('heater','R',{P:'2300'});W(m,'L',f,'1');W(f,'2',h,'L');W(h,'N',m,'N')});run(9);ok('2.5×In: holds 9 s',!r('F').trip);run(4);ok('2.5×In: blows ~11 s',r('F').trip===1);tap('F');ok('new fuse cold',r('F').th===0)});
T_('vfd current',()=>{mk((C,W)=>{const m=C('mains3','X'),u=C('vfd','U',{f:'50',ramp:'1'}),a=C('ameter','A'),M=C('motor3','M'),s=C('sel','S');W(m,'L1',u,'L1');W(m,'L2',u,'L2');W(m,'L3',u,'L3');W(u,'U',a,'1');W(a,'2',M,'U');W(u,'V',M,'V');W(u,'W',M,'W');W(u,'+24',s,'13');W(s,'14',u,'DI1')});
 tap('S');run(.3);ok('no inrush via VFD',r('A').I<=3.6,r('A').I);run(2);ok('motor current via ammeter',Math.abs(r('A').I-3.5)<.05,r('A').I);ok('VFD input ≈ output',Math.abs(r('U').Iin-3.525)<.05,r('U').Iin)});
T_('examples smoke',()=>{for(let i=0;i<EP.EX.length;i++){EP.openEx(i);EP.startSim();run(4);const bad=EP.P.comps.filter(c=>{const q=EP.sim.rt[c.id];return q.trip||q.burnt||(q.weld||[]).length});ok('ex '+i+' idle 4 s: no trips, no welded contacts',!bad.length&&!EP.sim.paused,bad.map(c=>c.label)+' '+log());EP.stopSim()}
 EP.openEx(0);EP.startSim();tap('-S2');run(5);ok('DOL runs without trip',r('-M1').run&&!r('-F1').trip,log());tap('-M1');run(12);ok('DOL jam -> F1 trips, H2 lit',r('-F1').trip===1&&r('-H2').lit&&!r('-M1').run,log());EP.stopSim();
 EP.openEx(2);EP.startSim();tap('-S1');run(9);ok('Y/Δ reaches delta, no trips',r('-M1').mode==='Δ'&&!r('-F1').trip&&!r('-Q1').trip,r('-M1').msg+' '+log());EP.stopSim()});
// ---- analog
const vfdB=(C,W,ref)=>{const m=C('mains3','X'),u=C('vfd','U',{f:'50',ramp:'0.5',ref}),M=C('motor3','M'),s=C('sel','S');W(m,'L1',u,'L1');W(m,'L2',u,'L2');W(m,'L3',u,'L3');W(u,'U',M,'U');W(u,'V',M,'V');W(u,'W',M,'W');W(u,'+24',s,'13');W(s,'14',u,'DI1');return u};
T_('pot',()=>{mk((C,W)=>{const u=vfdB(C,W,'AI 0–10 V'),p=C('pot','R');W(u,'+10',p,'1');W(p,'2',u,'AI');W(p,'3',u,'COM')});tap('S');run(1.5);ok('50 % -> 5 V -> 25 Hz',Math.abs(r('U').f-25)<.01&&Math.abs(r('U').ai.v-5)<1e-9,r('U').f);tap('R');run(1);ok('60 % -> 30 Hz',Math.abs(r('U').f-30)<.01,r('U').f);ok('+10 V across pot ends',V('R','1','R','3')===10);stop();
 mk((C,W)=>{const u=vfdB(C,W,'AI 0–10 V'),p=C('pot','R',{},{pos:20});W(u,'+10',p,'3');W(p,'2',u,'AI');W(p,'1',u,'COM')});tap('S');run(1.5);ok('reversed ends -> inverted (80 %)',Math.abs(r('U').f-40)<.01,r('U').f);stop();
 mk((C,W)=>{const u=vfdB(C,W,'AI 0–10 V'),p=C('pot','R');W(p,'2',u,'AI')});tap('S');run(1);ok('pot without +10 V -> 0 Hz',r('U').f===0&&!r('M').run);stop();
 mk((C,W)=>{const u=vfdB(C,W,'AI 0–10 V');W(u,'+10',u,'COM')});ok('+10 V shorted to COM -> fault',EP.sim.paused===1)});
T_('atx',()=>{mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),b=C('atx','B');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',b,'BN');W(g,'-',b,'BU')});run(.1);ok('powered: 50 % -> 12 mA',r('B').pw&&EP.sim.sig.size===1);tap('B');run(.1);ok('click +10 %',r('B').pv===60);stop();
 mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),b=C('atx','B'),u=vfdB(C,W,'AI 4–20 mA');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',b,'BN');W(g,'-',b,'BU');W(b,'OUT',u,'AI')});tap('S');run(1.5);ok('4–20 mA 12 mA -> 25 Hz',Math.abs(r('U').f-25)<.01&&r('U').ai.u==='mA',r('U').f);stop();
 mk((C,W)=>{const b=C('atx','B'),u=vfdB(C,W,'AI 4–20 mA');W(b,'OUT',u,'AI')});tap('S');run(1);ok('unpowered sensor -> no signal, 0 Hz',r('U').f===0);stop();
 mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),b=C('atx','B',{tank:'TK'});C('tank','TK',{fill:'0',drain:'0'},{lv:25,dr:0});const u=vfdB(C,W,'AI 4–20 mA');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',b,'BN');W(g,'-',b,'BU');W(b,'OUT',u,'AI')});tap('S');run(1.5);ok('linked to tank level 25 % -> 12.5 Hz',Math.abs(r('U').f-12.5)<.01,r('U').f)});
T_('plc analog',()=>{const prog='Q0 = AI0 > 60\nQ1 = AI0 <= 40\nAQ0 = AI0';mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),b=C('atx','B'),p=C('plc','PLC',{prog}),u=vfdB(C,W,'AI 4–20 mA');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',p,'L+');W(g,'-',p,'M');W(g,'+',b,'BN');W(g,'-',b,'BU');W(b,'OUT',p,'AI0');W(p,'AQ0',u,'AI')});
 const Q=i=>!!r('PLC').q[i];run(.1);ok('AI0 = 50 %',Math.abs(r('PLC').ai[0]-50)<1e-9&&!Q(0)&&!Q(1),r('PLC').ai);tap('B');run(.1);ok('60 > 60 false',!Q(0));tap('B');run(.1);ok('70 > 60 true',Q(0));ok('AQ0 follows AI0',Math.abs(r('PLC').aq-70)<1e-9);tap('S');run(1.5);ok('AQ0 4–20 mA drives VFD 35 Hz',Math.abs(r('U').f-35)<.01,r('U').f);
 for(let k=0;k<4;k++)tap('B');run(.1);ok('AI0 = 0 % -> Q1',r('PLC').ai[0]===0&&Q(1));ok('AI1 not wired -> null',r('PLC').ai[1]===null);stop();
 ok('compile: bare AI is error',!!EP.plcCompile('Q0 = AI0').err);ok('compile: AQ0 bad source',!!EP.plcCompile('AQ0 = I0').err);ok('compile: >= works',!EP.plcCompile('Q0 = AI1 >= 12.5 & I0').err)});
T_('analog examples',()=>{EP.openEx(9);EP.startSim();tap('-S1');run(4);ok('ex9: pot 50 % -> 25 Hz',Math.abs(r('-U1').f-25)<.01,r('-U1').f);ok('ex9: ammeter ≈ motor In',Math.abs(r('-P1').I-3.5)<.05,r('-P1').I);tap('-R1');run(2);ok('ex9: 60 % -> 30 Hz',Math.abs(r('-U1').f-30)<.01);EP.stopSim();
 EP.openEx(10);EP.startSim();run(1);ok('ex10: low level -> pump on',r('-KM1').on&&r('-M1').run);run(13.5);ok('ex10: reaches 85 % -> stops',!r('-KM1').on&&r('-TK1').lv>=82,r('-TK1').lv);run(20);ok('ex10: drains below 30 % -> restarts',r('-KM1').on,r('-TK1').lv);EP.stopSim()});
// ---- timer 8 chân
T_('tmr8',()=>{const b=(mode,t)=>mk((C,W)=>{const m=C('mains1','X'),s=C('sel','S'),k=C('tmr8','K',{mode,t});W(m,'L',s,'13');W(s,'14',k,'2');W(k,'7',m,'N')});const st=()=>[cn('K','1','K','3'),cn('K','8','K','6'),cn('K','1','K','4'),cn('K','8','K','5')].map(Number).join('');
 const M=T.tmr8.pdef[0][2];
 b(M[0],'2');ok('idle: 1-4, 8-5 closed (NC)',st()==='0011');tap('S');run(1.5);ok('A: before t still NC',st()==='0011');run(.6);ok('A: after t 1-3, 8-6 closed',st()==='1100');tap('S');run(.1);ok('A: power off resets',st()==='0011');stop();
 b(M[1],'1');tap('S');run(.5);const a1=st();run(1);const a2=st();run(1);const a3=st();ok('B: off-on-off',a1==='0011'&&a2==='1100'&&a3==='0011',[a1,a2,a3]);stop();
 b(M[2],'1');tap('S');run(.5);const b1=st();run(1);const b2=st();ok('B2: starts on',b1==='1100'&&b2==='0011',[b1,b2]);stop();
 b(M[3],'1');tap('S');run(.5);ok('E: on immediately',st()==='1100');run(.6);ok('E: off after t',st()==='0011');stop();
 b(M[4],'2');tap('S');run(.1);ok('H: on with power',st()==='1100');tap('S');run(1.5);ok('H: holds after power off',st()==='1100');run(.6);ok('H: off after t',st()==='0011');stop();
 mk((C,W)=>{const m=C('mains3','X'),k=C('tmr8','K');W(m,'L1',k,'2');W(k,'7',m,'L2')});ok('230V timer on 400V burns',r('K').burnt===1);stop();
 mk((C,W)=>{const m=C('mains3','X'),k=C('tmr8','K',{coil:'400VAC'});W(m,'L1',k,'2');W(k,'7',m,'L2')});ok('400VAC supply works',r('K').on&&!r('K').burnt)});
// ---- logic: cấp sai điện áp, ngõ vào PLC
T_('wrong voltage',()=>{mk((C,W)=>{const m=C('mains3','X'),f=C('fan','E'),h=C('heater','R'),b=C('buzzer','B'),g=C('psu','G');for(const c of[f,h]){W(m,'L1',c,'L');W(c,'N',m,'L2')}W(m,'L1',b,'X1');W(b,'X2',m,'L2');W(m,'L1',g,'L');W(g,'N',m,'L2')});run(.1);
 ok('fan/heater/buzzer on 400V burn',r('E').burnt&&r('R').burnt&&r('B').burnt&&!r('E').run);ok('PSU on 400V burns, no output',r('G').burnt===1&&V('G','+','G','-')===0);stop();
 mk((C,W)=>{const m=C('mains1','X'),p=C('proxpnp','P'),t=C('tower','H');W(m,'L',p,'BN');W(p,'BU',m,'N');W(m,'L',t,'R');W(t,'COM',m,'N')});run(.1);ok('24V sensor/tower on 230V AC burn',r('P').burnt&&r('H').burnt&&!r('H').R);stop();
 mk((C,W)=>{const m=C('mains3','X'),k=C('contactor','K',{coil:'400VAC'});W(m,'L1',k,'A1');W(k,'A2',m,'L2')});ok('400VAC coil on 400V pulls in',r('K').on&&!r('K').burnt);stop();
 mk((C,W)=>{const m=C('mains1','X'),k=C('contactor','K',{coil:'400VAC'});W(m,'L',k,'A1');W(k,'A2',m,'N')});ok('400VAC coil on 230V does not pull',!r('K').on&&!r('K').burnt)});
T_('plc inputs sink/source',()=>{mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),g2=C('psu','G2'),p=C('plc','PLC',{prog:'Q0 = I0'}),n=C('proxnpn','B');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',p,'L+');W(g,'-',p,'M');W(m,'L',g2,'L');W(m,'N',g2,'N');
  W(g2,'+',n,'BN');W(g2,'-',n,'BU');W(n,'BK',p,'I0');W(g2,'+',p,'I1')});run(.1);ok('source input (+24 to I1) on',r('PLC').i[1]);stop();
 mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),p=C('plc','PLC',{prog:'Q0 = 1'}),s=C('sel','S');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',p,'L+');W(g,'-',p,'M');W(m,'L',s,'13');W(s,'14',p,'I3')});run(.1);ok('PLC running',r('PLC').q[0]===1);tap('S');run(.1);ok('230V AC into input -> PLC burnt, outputs off',r('PLC').burnt===1&&!r('PLC').q[0],log())});
T_('wire colours',()=>{EP.openEx(0);const n=EP.recolorAll();const P=EP.P,L=l=>P.comps.find(c=>c.label===l).id;const col=(a,ta)=>P.wires.find(w=>(w.a.c===L(a)&&w.a.t===ta)||(w.b.c===L(a)&&w.b.t===ta)).color;
 ok('recolour changed wires',n>0,n);ok('L1 from mains -> đỏ',col('-X1','L1')==='đỏ');ok('N -> xanh',col('-X1','N')==='xanh');ok('PE -> vàng-xanh',col('-X1','PE')==='vàngxanh');ok('control after Q2 -> đỏ',col('-Q2','2')==='đỏ');ok('coil A2 (N) -> xanh',col('-KM1','A2')==='xanh');
 EP.openEx(3);EP.recolorAll();const P2=EP.P,id=l=>P2.comps.find(c=>c.label===l).id;ok('+24 -> đỏ, 0V -> xanh đậm',P2.wires.find(w=>w.a.c===id('-G1')&&w.a.t==='-').color==='xanhđậm'&&P2.wires.find(w=>w.a.c===id('-G1')&&w.a.t==='+').color==='đỏ')});
// ---- thiết bị theo datasheet
T_('ol trip classes IEC 60947-4-1',()=>{for(const[cls,lo,hi]of[['10A',2,10],['10',4,10],['20',6,20],['30',9,30]]){mk((C,W)=>{const m=C('mains1','X'),f=C('ol','F',{Ir:'1',cls}),h=C('heater','R',{P:String(7.2*230)});W(m,'L',f,'1');W(f,'2',h,'L');W(h,'N',m,'N')});
  run(lo-.1);ok(`class ${cls}: 7,2×Ir not before ${lo} s`,!r('F').trip,r('F').th);run(hi-lo+.1);ok(`class ${cls}: trips before ${hi} s`,r('F').trip===1,r('F').th);stop()}
 mk((C,W)=>{const m=C('mains1','X'),f=C('ol','F',{Ir:'2'}),h=C('heater','R',{P:String(1.5*2*230)});W(m,'L',f,'1');W(f,'2',h,'L');W(h,'N',m,'N')});run(119);ok('class 10: 1,5×Ir trips < 2 min',r('F').trip===1,r('F').th);stop();
 mk((C,W)=>{const m=C('mains1','X'),f=C('ol','F',{Ir:'2'}),h=C('heater','R',{P:String(1.05*2*230)});W(m,'L',f,'1');W(f,'2',h,'L');W(h,'N',m,'N')});run(600);ok('1,05×Ir: no trip',!r('F').trip)});
T_('estop2',()=>{mk((C,W)=>{C('mains1','X');C('estop2','S')});ok('idle both NC closed',cn('S','11','S','12')&&cn('S','21','S','22'));tap('S');ok('pressed both open',!cn('S','11','S','12')&&!cn('S','21','S','22'));tap('S');ok('released',cn('S','11','S','12'))});
T_('tmr11',()=>{const M=T.tmr11.pdef[0][2];const b=(mode,t,ext)=>mk((C,W)=>{const m=C('mains1','X'),q=C('sel','P'),k=C('tmr11','K',{mode,t}),s=C('pb_no','ST'),rs=C('pb_no','RS'),g=C('sel','G');W(m,'L',q,'13');W(q,'14',k,'2');W(k,'10',m,'N');
  W(k,'2',s,'3');W(s,'4',k,'6');W(k,'2',rs,'3');W(rs,'4',k,'7');W(k,'2',g,'13');W(g,'14',k,'5');if(ext)ext(C,W,k)});const st=()=>[cn('K','1','K','3'),cn('K','11','K','9'),cn('K','1','K','4'),cn('K','11','K','8')].map(Number).join('');
 b(M[0],'2');tap('P');run(3);ok('A: power only, no start -> stays NC',st()==='0011');tap('ST');run(1.5);ok('A: signal start timing',st()==='0011');run(.6);ok('A: after t 1-3, 11-9',st()==='1100');run(2);ok('A: holds after start released',st()==='1100');tap('RS');run(.1);ok('A: reset input clears',st()==='0011');
 tap('ST');run(1);tap('G');run(3);ok('A: gate pauses timing',st()==='0011');tap('G');run(1.1);ok('A: resumes after gate',st()==='1100');stop();
 b(M[0],'1',(C,W,k)=>W(k,'2',k,'6'));tap('P');run(1.1);ok('A: power-ON start (2-6 bridged)',st()==='1100');tap('P');run(.1);ok('A: power-OFF reset',st()==='0011');stop();
 b(M[3],'1');tap('P');dn('ST');run(.5);ok('D: on while start',st()==='1100');up('ST');run(.6);ok('D: holds t after start off',st()==='1100');run(.5);ok('D: off after t',st()==='0011');stop();
 b(M[4],'1');tap('P');tap('ST');run(.5);ok('E: on at start',st()==='1100');run(.6);ok('E: off after t',st()==='0011');stop();
 b(M[2],'1');tap('P');tap('ST');run(.5);const x1=st();run(1);ok('B2: flicker starts on',x1==='1100'&&st()==='0011')});
T_('my2/my4',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('sel','S'),a=C('my2','A'),b=C('my4','B',{coil:'24VDC'}),g=C('psu','G'),s2=C('sel','S2');W(m,'L',s,'13');W(s,'14',a,'13');W(a,'14',m,'N');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',s2,'13');W(s2,'14',b,'14');W(b,'13',g,'-')});
 ok('MY2 off: 9-1, 12-4 (NC)',cn('A','9','A','1')&&cn('A','12','A','4')&&!cn('A','9','A','5'));tap('S');ok('MY2 on: 9-5, 12-8 (NO)',cn('A','9','A','5')&&cn('A','12','A','8')&&!cn('A','9','A','1'));
 ok('MY4 off: 9..12 to 1..4',[1,2,3,4].every(i=>cn('B',String(8+i),'B',String(i))));tap('S2');ok('MY4 24VDC on: 9..12 to 5..8',[1,2,3,4].every(i=>cn('B',String(8+i),'B',String(4+i))))});
const pnB=(rst,ext)=>mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),k=C('pnoz','K',{rst}),e=C('estop2','E'),b=C('pb_no','R');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',k,'A1');W(g,'-',k,'A2');
  W(k,'S11',e,'11');W(e,'12',k,'S12');W(k,'S21',e,'21');W(e,'22',k,'S22');W(k,'S33',b,'3');W(b,'4',k,'S34');if(ext)ext(C,W,k)});
T_('pnoz',()=>{const on=()=>cn('K','13','K','14')&&cn('K','23','K','24')&&cn('K','33','K','34')&&!cn('K','41','K','42');
 pnB('Bằng tay (nút ở S33-S34)');run(.1);ok('manual: waits for reset',!on()&&cn('K','41','K','42'));tap('R');run(.1);ok('reset -> safety contacts closed',on());tap('E');run(.1);ok('E-stop -> all open, 41-42 closed',!on()&&cn('K','41','K','42'));tap('R');run(.1);ok('cannot reset while E-stop pressed',!on());tap('E');run(.1);ok('E-stop released: still off (no auto restart)',!on());tap('R');run(.1);ok('reset again -> on',on());stop();
 pnB('Tự động (nối tắt S33-S34)',(C,W,k)=>W(k,'S33',k,'S34'));run(.1);ok('auto reset: on at power-up',on());tap('E');run(.1);tap('E');run(.1);ok('auto: restarts after release',on());stop();
 mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),k=C('pnoz','K',{rst:'Tự động (nối tắt S33-S34)'}),a=C('sel','A'),b=C('sel','B',{},{p:1});W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',k,'A1');W(g,'-',k,'A2');W(k,'S11',k,'S12');W(k,'S21',b,'13');W(b,'14',k,'S22');W(k,'S33',k,'S34')});
 run(.1);ok('2 channels closed -> on',on());tap('B');run(.1);ok('one channel opens -> off',!on());tap('B');run(.1);ok('channel back but other never opened -> locked',!on()&&r('K').lock===1,log());stop();
 pnB('Bằng tay (nút ở S33-S34)',(C,W,k)=>{});run(.1);tap('R');ok('feedback ok',on());stop();
 mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),k=C('pnoz','K'),b=C('pb_no','R'),km=C('contactor','KM');W(m,'L',g,'L');W(m,'N',g,'N');W(g,'+',k,'A1');W(g,'-',k,'A2');W(k,'S11',k,'S12');W(k,'S21',k,'S22');
  W(k,'S33',km,'21');W(km,'22',b,'3');W(b,'4',k,'S34');W(m,'L',km,'A1');W(km,'A2',m,'N')});run(.1);tap('R');run(.1);ok('feedback loop: contactor NC open (stuck on) blocks reset',!on())});
T_('ptcrel',()=>{const b=(pr,ext)=>mk((C,W)=>{const m=C('mains3','X'),k=C('ptcrel','F'),M=C('motor3','M',pr);W(m,'L1',k,'A1');W(k,'A2',m,'N');W(m,'L1',M,'U');W(m,'L2',M,'V');W(m,'L3',M,'W');if(ext)ext(C,W,k,M);else{W(k,'T1',M,'TP1');W(k,'T2',M,'TP2')}});
 b();run(.1);ok('cold motor: READY, 13-14 closed',r('F').ok&&cn('F','13','F','14')&&!cn('F','11','F','12'));tap('M');run(6);ok('jam 6 s: not yet',r('F').ok);run(4);ok('jam: PTC trips before motor burns',!r('F').ok&&!r('M').burnt&&cn('F','11','F','12'),r('M').thm);stop();
 b({cool:'Kém (quạt hỏng)'});run(30);ok('poor cooling: ok at 30 s',r('F').ok&&!r('M').burnt,r('M').thm);run(40);ok('poor cooling at rated current: PTC trips (OL could not)',!r('F').ok&&r('M').I<=3.6,r('M').thm);stop();
 b({},(C,W,k,M)=>{W(k,'T1',M,'TP1')});run(.1);ok('open sensor wire -> tripped',!r('F').ok&&r('F').st==='HỞ CẢM BIẾN');stop();
 b({},(C,W,k,M)=>{W(k,'T1',k,'T2')});run(.1);ok('shorted sensor -> tripped',!r('F').ok&&r('F').st==='CHẬP CẢM BIẾN');stop();
 mk((C,W)=>{C('mains1','X');C('ptcrel','F')});ok('no supply -> 11-12 closed (fail-safe)',cn('F','11','F','12'))});
T_('kwh1/kwh3',()=>{mk((C,W)=>{const m=C('mains1','X'),k=C('kwh1','E'),h=C('heater','R',{P:'2300'});W(m,'L',k,'1');W(m,'N',k,'3');W(k,'2',h,'L');W(k,'4',h,'N')});run(10);ok('1P: P = 230×10×0,9',Math.abs(r('E').P-2070)<1,r('E').P);ok('1P: energy integrates',Math.abs(r('E').E-2070*10/3.6e6)<1e-4,r('E').E);stop();
 mk((C,W)=>{const m=C('mains3','X'),k=C('kwh3','E'),M=C('motor3','M');W(m,'L1',k,'1');W(m,'L2',k,'3');W(m,'L3',k,'5');W(m,'N',k,'7');W(k,'2',M,'U');W(k,'4',M,'V');W(k,'6',M,'W')});run(5);ok('3P: P = 3×230×3,5×0,9',Math.abs(r('E').P-2173.5)<2,r('E').P)});
T_('ats01',()=>{const b=(ctl,ext)=>mk((C,W)=>{const m=C('mains3','X'),u=C('ats01','U',{ts:'4',td:'2',ctl}),M=C('motor3','M'),s1=C('pb_nc','S1'),s2=C('pb_no','S2'),a=C('ameter','A');W(m,'L1',u,'L1');W(m,'L2',u,'L2');W(m,'L3',u,'L3');W(u,'T1',a,'1');W(a,'2',M,'U');W(u,'T2',M,'V');W(u,'T3',M,'W');
  W(u,'LI+',s1,'1');W(s1,'2',u,'LI1');W(u,'LI+',s2,'3');W(s2,'4',u,'LI2')});
 b('3 dây (LI1 dừng NC, LI2 chạy)');run(.5);ok('idle: no output',!r('M').run&&r('U').k===0);tap('S2');run(.2);const i0=r('A').I;ok('start pulse latches, ramp begins',r('M').run&&r('U').k>0&&r('U').k<.1);ok('soft start current ≈3×In (not 6×)',i0<11&&i0>8,i0);
 ok('R1A-R1C closed while running',cn('U','R1A','U','R1C'));run(2);ok('half ramp ~50 %',Math.abs(r('U').k-.55)<.06,r('U').k);ok('LO1 off during start',V('U','LO1','U','COM')===0);run(2.2);ok('end of start: LO1 = 24 V',r('U').st==='run'&&V('U','LO1','U','COM')===24);
 tap('S1');run(1);ok('stop: decelerating, motor still turning',r('U').st==='stop'&&r('M').run);run(1.2);ok('after decel: off, R1 open',!r('M').run&&!cn('U','R1A','U','R1C'));stop();
 b('2 dây (LI2 = chạy)');tap('S2');run(1);ok('2-wire: pulse does not latch',r('U').st!=='start'||r('U').k<.3);stop();
 mk((C,W)=>{const m=C('mains3','X'),u=C('ats01','U'),M=C('motor3','M');W(m,'L1',u,'L1');W(m,'L2',u,'L2');W(u,'T1',M,'U')});run(.1);ok('missing phase -> no power',!r('U').pw)});
T_('datasheet examples',()=>{EP.openEx(exi('Dừng khẩn an toàn 2 kênh bằng rơ le an toàn'));EP.startSim();run(.5);ok('safety ex: waits for reset',!r('-K1').on);tap('-S1');run(.2);ok('start blocked before reset',!r('-KM1').on);tap('-S3');run(.1);tap('-S1');run(.3);ok('reset then start: KM1+KM2 on, motor runs',r('-KM1').on&&r('-KM2').on&&r('-M1').run,log());
 tap('-S0');run(.2);ok('E-stop: both contactors drop, H1 lit',!r('-KM1').on&&!r('-KM2').on&&r('-H1').lit);EP.stopSim();
 EP.openEx(exi('Khởi động mềm 3 dây (soft starter)'));EP.startSim();tap('-S2');run(2.5);ok('soft-start ex: ramping',r('-U1').st==='start'&&r('-M1').run);run(3);ok('soft-start ex: LO1 lamp lit',r('-H1').lit,log());tap('-S1');run(4);ok('soft-start ex: stopped softly',!r('-M1').run&&!r('-Q1').trip);EP.stopSim()});
T_('phaodien',()=>{mk((C,W)=>{C('mains1','X');C('tank','TK',{fill:'0',drain:'0'},{lv:10,dr:0});C('phaodien','B',{tank:'TK',low:'25',high:'85'})});run(.1);
 const st=()=>[cn('B','BK','B','BN'),cn('B','BK','B','BU')].map(Number).join('');ok('cạn: đen–nâu đóng',st()==='10');r('TK').lv=50;run(.1);ok('giữa (đang lên): giữ trạng thái cạn',st()==='10');r('TK').lv=86;run(.1);ok('đầy: đen–xanh đóng',st()==='01');
 r('TK').lv=50;run(.1);ok('giữa (đang xuống): giữ trạng thái đầy',st()==='01');r('TK').lv=24;run(.1);ok('cạn lại: đen–nâu',st()==='10');stop();
 mk((C,W)=>{C('mains1','X');C('phaodien','B')});ok('chưa thả vào bồn: mặc định cạn',cn('B','BK','B','BN'));tap('B');ok('bấm để đổi',cn('B','BK','B','BU'));stop();
 EP.openEx(exi('Bơm cấp nước bằng phao điện (1 phao, 2 mức)'));EP.startSim();run(1);ok('ex: mức 40 % lúc đầu → bơm chạy',r('-KM1').on&&r('-M1').run);run(15.5);ok('ex: lên 85 % → bơm dừng',!r('-KM1').on&&r('-TK1').lv>=80,r('-TK1').lv);run(8);ok('ex: đang xuống nhưng trên 25 % → vẫn dừng',!r('-KM1').on,r('-TK1').lv);run(14);ok('ex: xuống 25 % → bơm chạy lại',r('-KM1').on,r('-TK1').lv);EP.stopSim()});
T_('pb latch + lamp voltage',()=>{mk((C,W)=>{const m=C('mains1','X'),s=C('pb_no','S',{act:T.pb_no.pdef[1][2][1]}),h=C('lamp','H'),h2=C('lamp','H2');W(m,'L',s,'3');W(s,'4',h,'X1');W(h,'X2',m,'N');W(m,'L',h2,'X1')});run(.1);
 ok('nhấn giữ: chưa nhấn → đèn tắt, 0 V',!r('H').lit&&r('H').vv==='0 V');dn('S');up('S');run(.1);ok('nhấn giữ: thả tay vẫn đóng → đèn sáng 230 V',r('S').p===1&&r('H').lit&&r('H').vv==='230 V AC');tap('S');run(.1);ok('bấm lần nữa → nhả',!r('S').p&&!r('H').lit);
 ok('đèn chỉ có 1 đầu có điện: không sáng, 0 V',!r('H2').lit&&r('H2').vv==='0 V')});
// ---- bơm PSC 3 dây + tụ, diode, Sonoff, nút có đèn (21/11/2026) ----
T_('pumpc cap',()=>{const psc=(capW,pr,cp)=>mk((C,W)=>{const m=C('mains1','X'),M=C('pumpc','M',Object.assign({In:'8'},pr||{})),k=C('cap','C',cp);W(m,'L',M,'C');W(m,'N',M,'R');if(capW)capW(W,M,k,m)});
 psc((W,M,k)=>{W(k,'1',M,'R');W(k,'2',M,'S')});run(3);ok('tụ R–S: chạy, lưu lượng 3, dòng ≈ In',r('M').run&&!r('M').warn&&Math.abs(r('M').flow-3)<1e-6&&Math.abs(r('M').I-8)<.2,r('M').I);stop();
 psc(null);run(.5);ok('không tụ: không quay, kêu ù, ~5×In',!r('M').run&&r('M').hum&&r('M').flow===0&&r('M').I>39&&/KHÔNG CÓ TỤ/.test(r('M').warn),r('M').I);stop();
 psc((W,M,k)=>{W(k,'1',M,'C');W(k,'2',M,'S')});run(3);ok('tụ đấu vào C: quay yếu, dòng 1,6×',r('M').run&&/VÀO C/.test(r('M').warn)&&Math.abs(r('M').I-12.8)<.3&&r('M').flow<3,r('M').I);stop();
 psc((W,M,k)=>{W(k,'1',M,'R');W(k,'2',M,'S')},null,{uF:'30'});run(3);ok('tụ hụt 30/50 µF: yếu, dòng 1,35×',r('M').run&&/HỤT/.test(r('M').warn)&&Math.abs(r('M').I-10.8)<.3,r('M').I);stop();
 mk((C,W)=>{const m=C('mains1','X'),M=C('pumpc','M',{In:'8'}),k=C('cap','C');W(m,'L',M,'C');W(m,'N',M,'S');W(k,'1',M,'R');W(k,'2',M,'S')});run(.5);ok('điện vào C–S: sai đấu dây, ù',!r('M').run&&r('M').hum&&/SAI ĐẤU/.test(r('M').warn));stop();
 mk((C,W)=>{const m=C('mains3','X'),M=C('pumpc','M');W(m,'L1',M,'C');W(m,'L2',M,'R')});run(.2);ok('400V → cháy bơm',r('M').burnt===1);stop();
 mk((C,W)=>{const m=C('mains3','X'),k=C('cap','C',{V:'250'});W(m,'L1',k,'1');W(m,'L2',k,'2')});run(.2);ok('tụ 250V ở 400V → nổ',r('C').burnt===1);stop();
 mk((C,W)=>{const m=C('mains1','X'),f=C('ol','F',{Ir:'8'}),M=C('pumpc','M',{In:'8'});W(m,'L',f,'1');W(f,'2',M,'C');W(M,'R',m,'N')});run(20);ok('không tụ: rơ le nhiệt tác động',r('F').trip===1,log());stop();
 mk((C,W)=>{const m=C('mains1','X'),M=C('pumpc','M'),k=C('cap','C'),b=C('flowsw','B',{pump:'M',t:'1'});W(m,'L',M,'C');W(m,'N',M,'R');W(k,'1',M,'R');W(k,'2',M,'S')});run(1.3);ok('flow switch đọc được bơm PSC',cn('B','11','B','14'));tap('M');run(.2);ok('giếng cạn → mất dòng chảy',cn('B','11','B','12'))});
T_('diode',()=>{const dd=(a,k)=>mk((C,W)=>{const m=C('mains1','X'),g=C('psu','G'),d=C('diode','V');W(m,'L',g,'L');W(m,'N',g,'N');W(d,'A',g,a);W(d,'K',g,k)});
 dd('-','+');run(.2);ok('vạch K về +: chặn, nguồn vẫn 24V',!r('V').on&&r('V').rev&&V('G','+','G','-')===24&&!r('G').trip);stop();
 dd('+','-');run(.2);ok('đặt ngược: dẫn thẳng → nguồn 24V cắt',r('V').on===1&&r('G').trip===1,log());stop();
 mk((C,W)=>{const m=C('mains1','X'),q=C('mcb1','Q'),d=C('diode','V');W(m,'L',q,'1');W(q,'2',d,'K');W(d,'A',m,'N')});run(.2);ok('nối vào AC → chập, CB nhảy',r('V').on===1&&r('V').ac&&r('Q').trip===1)});
T_('sonoff',()=>{const so=(pr,noPw)=>mk((C,W)=>{const m=C('mains1','X'),u=C('sonoff','U',pr),s=C('sel','S');if(!noPw){W(m,'L',u,'L');W(m,'N',u,'N')}W(s,'13',u,'S1');W(s,'14',u,'S2')});
 so();run(.2);ok('có điện, chưa báo',r('U').pw&&!r('U').sw&&!r('U').n&&!cn('U','L','U','O'));tap('S');run(.2);ok('S1-S2 đóng → báo 1 lần, detach không đóng ngõ ra',r('U').sw&&r('U').n===1&&!cn('U','L','U','O'),log());run(1);ok('không báo lặp',r('U').n===1);
 tap('S');run(.2);tap('S');run(.2);ok('đóng lại → lần 2',r('U').n===2);tap('U');run(.1);ok('bật từ app → L–O đóng',cn('U','L','U','O'));stop();
 so({mode:'Thường: S1-S2 bật / tắt ngõ ra'});tap('S');run(.1);ok('chế độ thường: S1-S2 đóng ngõ ra',cn('U','L','U','O'));stop();
 so(null,1);tap('S');run(.2);ok('mất điện: không báo',!r('U').n);stop();
 mk((C,W)=>{const m=C('mains1','X'),u=C('sonoff','U');W(m,'L',u,'L');W(m,'N',u,'N');W(m,'L',u,'S1')});run(.1);ok('S1 nối vào pha → cháy',r('U').burnt===1)});
for(const[k,a,b,nc]of[['pbl_nc','1','2',1],['pbl_no','3','4',0]])T_(k,()=>{mk((C,W)=>{const m=C('mains1','X'),s=C(k,'S'),h=C('lamp','H');W(m,'L',s,a);W(s,b,h,'X1');W(h,'X2',m,'N');W(m,'L',s,'X1');W(s,'X2',m,'N')});run(.1);
 ok('LED nút sáng 230V',r('S').lit);ok(nc?'NC: thường đóng':'NO: thường hở',!!r('H').lit===!!nc);dn('S');run(.1);ok('nhấn: đổi trạng thái',!!r('H').lit===!nc);up('S');run(.1);ok('thả: trở về',!!r('H').lit===!!nc);stop();
 mk((C,W)=>{const m=C('mains1','X'),s=C(k,'S',{v:'24VDC'});W(m,'L',s,'X1');W(s,'X2',m,'N')});run(.1);ok('LED 24V cấp 230V AC → cháy',r('S').burnt===1)});
T_('ex tủ bơm bản 7',()=>{const EXB=exi('Tủ bơm giếng 2 HP – bản 7 (19/11/2026)');EP.openEx(EXB);EP.startSim();run(3);ok('nghỉ: H1 sáng, K1 nhả, Sonoff có điện',r('-H1').lit&&!r('-K1').on&&r('-U1').pw&&!r('-U1').n);
 ok('diode không dẫn',!r('-V1').on&&!r('-V2').on);tap('-S1');run(3);ok('MAN: K1, H2, KF; bơm PSC chạy đủ tụ',r('-K1').on&&r('-H2').lit&&r('-KF').on&&r('-M1').run&&!r('-M1').warn&&r('-V2').rev&&!r('-V2').on,r('-M1').warn+log());
 run(20);ok('MAN có nước 23 s: không chốt, không nhảy, không dính tiếp điểm',r('-M1').run&&!r('-KA').on&&!r('-F1').trip&&!EP.P.comps.some(c=>(r(c.label).weld||[]).length));ok('F1 = LRD16, Ir 11 A',EP.rating(EP.P.comps.find(c=>c.label==='-F1'))===11);tap('-M1');run(2.5);ok('mất nước: KA chốt, K1 nhả, KB + LED RESET, Sonoff báo',r('-KA').on&&!r('-K1').on&&r('-KB').on&&r('-S2').lit&&r('-U1').n===1,log());
 tap('-M1');tap('-S2');run(2);ok('RESET: hết lỗi, chạy lại',!r('-KA').on&&r('-K1').on&&!r('-S2').lit);tap('-F1');run(.5);ok('F1 nhảy: K1 nhả, Sonoff báo lần 2',!r('-K1').on&&r('-U1').n===2);tap('-F1');run(.5);stop();
 EP.openEx(EXB);EP.P.comps.find(c=>c.label==='-F1').params.Ir='9.5';const cid=EP.P.comps.find(c=>c.label==='-C1').id;EP.P.wires=EP.P.wires.filter(w=>w.a.c!==cid&&w.b.c!==cid);EP.startSim();tap('-S1');run(1);ok('bỏ tụ: bơm ù, không quay',r('-M1').hum&&!r('-M1').run);run(25);ok('bỏ tụ, F1 đặt 9,5 A: F1 cắt trước khi bơm cháy, Sonoff báo',r('-F1').trip===1&&!r('-M1').burnt&&r('-U1').n>=1,log())});
T_('định mức tiếp điểm',()=>{const rt=lab=>EP.rating(EP.P.comps.find(c=>c.label===lab));
 // rơ le 5 A đóng thẳng bơm 7,9 A: dòng khởi động ~47 A → dính ngay, nhả cuộn hút bơm vẫn chạy
 mk((C,W)=>{const m=C('mains1','X'),k=C('relay','K'),M=C('pump1','M',{In:'7.9'}),s=C('sel','S');W(m,'L',s,'13');W(s,'14',k,'A1');W(k,'A2',m,'N');W(m,'L',k,'11');W(k,'14',M,'L');W(M,'N',m,'N')});
 tap('S');run(.3);ok('rơ le 5 A đóng bơm 7,9 A → dính 11-14',(r('K').weld||[]).some(p=>p.join()==='11,14'),log());tap('S');run(.3);ok('nhả cuộn hút, bơm vẫn chạy (tiếp điểm dính)',!r('K').on&&r('M').run);stop();
 // contactor đúng cỡ: không dính, kể cả lúc khởi động 6×In
 mk((C,W)=>{const m=C('mains3','X'),k=C('contactor','K',{Ie:'9 A'}),M=C('motor3','M',{In:'7.5'});W(m,'L1',k,'A1');W(k,'A2',m,'N');W(m,'L1',k,'1');W(m,'L2',k,'3');W(m,'L3',k,'5');W(k,'2',M,'U');W(k,'4',M,'V');W(k,'6',M,'W')});
 run(5);ok('LC1D09 + động cơ 7,5 A: không dính',!(r('K').weld||[]).length&&r('M').run);stop();
 // contactor nhỏ hơn tải điện trở 30 A: nóng dần rồi dính
 mk((C,W)=>{const m=C('mains1','X'),k=C('contactor','K',{Ie:'9 A'}),h=C('heater','E',{P:'6900'});W(m,'L',k,'A1');W(k,'A2',m,'N');W(m,'L',k,'1');W(k,'2',h,'L');W(h,'N',m,'N')});
 run(10);ok('9 A mang 30 A: đang nóng, chưa dính',r('K').ct>.1&&!(r('K').weld||[]).length,r('K').ct);run(55);ok('sau ~1 phút: dính 1-2',(r('K').weld||[]).some(p=>p.join()==='1,2'),log());stop();
 // dự án cũ: contactor chưa có cỡ AC-3 → không xét định mức
 mk((C,W)=>{const m=C('mains1','X'),k=C('contactor','K',{Ie:''}),h=C('heater','E',{P:'6900'});W(m,'L',k,'A1');W(k,'A2',m,'N');W(m,'L',k,'1');W(k,'2',h,'L');W(h,'N',m,'N')});run(5);ok('chưa chọn cỡ: không xét',!(r('K').ct>0));stop();
 // RCCB chỉ cảnh báo quá dòng, không tự cắt
 mk((C,W)=>{const m=C('mains1','X'),q=C('rccb','Q',{In:'25A'}),h=C('heater','E',{P:'9200'});W(m,'L',q,'1');W(m,'N',q,'N');W(q,'2',h,'L');W(h,'N',q,"N'")});run(1);ok('RCCB 25 A mang 40 A: báo quá, vẫn đóng',r('Q').cx>1.5&&r('Q').on&&!(r('Q').weld||[]).length)});
T_('dải chỉnh Ir',()=>{const rt=lab=>EP.rating(EP.P.comps.find(c=>c.label===lab));
 mk((C,W)=>{C('ol','F1',{Ir:'11'});C('ol','F2',{rg:'LRD08 (2,5–4 A)',Ir:'11'});C('ol','F3',{Ir:'50'});C('mpcb','Q1',{Ir:'4'});C('mpcb','Q2',{rg:'GV2ME14 (6–10 A)',Ir:'3'});C('mains1','X')});
 ok('tự chọn: Ir 11 → LRD16, dùng 11 A',rt('F1')===11);ok('LRD08 mà đặt 11 A → bị giới hạn 4 A',rt('F2')===4);ok('Ir 50 vượt LRD35 → 38 A',rt('F3')===38);
 ok('GV2 tự chọn Ir 4',rt('Q1')===4);ok('GV2ME14 đặt 3 A → 6 A',rt('Q2')===6)});
// coverage
const tested=new Set(OUT.map(o=>o[0]).join(' ').split(/[\s\/]+/));const miss=Object.keys(T).filter(k=>![...tested].some(t=>t===k));
return JSON.stringify({res:OUT,miss})})()
