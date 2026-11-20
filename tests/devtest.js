(()=>{
const T=EP.TY,OUT=[];let cur='';
const ok=(name,cond,det)=>OUT.push([cur,name,!!cond,det===undefined?'':String(det)]);
let P;
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
// coverage
const tested=new Set(OUT.map(o=>o[0]).join(' ').split(/[\s\/]+/));const miss=Object.keys(T).filter(k=>![...tested].some(t=>t===k));
return JSON.stringify({res:OUT,miss})})()
