import fs from 'fs';
const R=JSON.parse(fs.readFileSync('../cache/rollcalls.json'));
const V=JSON.parse(fs.readFileSync('../cache/votes.json'));
const M=JSON.parse(fs.readFileSync('../cache/members.json'));
const AX=['economia','distribuicao','trabalho','costumes','religiao','seguranca','liberdades','ambiente','soberania','geopolitica','instituicoes','diversidade'];
const rc=R.filter(r=>V[r.id]);
const members=[],detail={};
for(const m of M){
  const acc={},d={};let tot=0;
  for(const r of rc){const v=V[r.id][m.id]; if(!v)continue;
    if(v!=='Sim'&&v!=='Não'){continue;}
    const toB=(v==='Sim')===(r.voto_sim_equivale_polo==='B');
    (acc[r.axis]??=[]).push(toB?100:-100); d[r.id]=v; tot++;}
  const axes={};
  for(const a of AX)if(acc[a])axes[a]={score:Math.round(acc[a].reduce((x,y)=>x+y,0)/acc[a].length*10)/10,n:acc[a].length};
  members.push({...m,axes,votos_total:tot}); if(tot)detail[m.id]=d;
}
const out={generated_at:new Date().toISOString(),
 nota:'score: -100 = polo A, +100 = polo B (data/axes.json); média de votos Sim/Não úteis; n = nº de votos no eixo. Ausência, abstenção, obstrução e voto do presidente não contam.',
 rollcalls:rc.map(r=>({id:r.id,casa:r.casa,data:r.data,proposicao:r.proposicao,ementa_curta:r.ementa_curta,axis:r.axis,voto_sim_equivale_polo:r.voto_sim_equivale_polo,url_oficial:r.url_oficial,...(r.justificativa?{justificativa:r.justificativa}:{})})),
 members};
fs.writeFileSync('../parlamentares.json',JSON.stringify(out));
fs.writeFileSync('../votos_parlamentares.json',JSON.stringify({rollcalls:rc.map(r=>r.id),votos:detail}));
// stats
const per={};for(const r of rc)per[r.axis]=(per[r.axis]||0)+1;
console.log('rollcalls',rc.length,JSON.stringify(per));
const stat=(f)=>{const s=members.filter(f);const t=s.map(x=>x.votos_total).sort((a,b)=>a-b);
 const med=t[t.length>>1];const na=s.map(x=>Object.keys(x.axes).length);
 return {n:s.length,mediana_votos:med,zero_votos:t.filter(x=>x===0).length,ge3_eixos:(na.filter(x=>x>=3).length/s.length*100).toFixed(0)+'%',ge1_eixo:(na.filter(x=>x>=1).length/s.length*100).toFixed(0)+'%',mediana_eixos:na.sort((a,b)=>a-b)[na.length>>1],n_ge3_por_eixo_pct:null}};
console.log('todos',JSON.stringify(stat(()=>true)));
console.log('camara',JSON.stringify(stat(x=>x.casa==='Câmara')));
console.log('senado',JSON.stringify(stat(x=>x.casa==='Senado')));
for(const a of AX){const c=members.filter(x=>x.axes[a]),c3=c.filter(x=>x.axes[a].n>=3);console.log(a,'>=1:',c.length,'>=3:',c3.length)}
console.log('size',fs.statSync('../parlamentares.json').size);
