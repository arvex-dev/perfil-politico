import fs from 'fs';
const D='..';
const vot=JSON.parse(fs.readFileSync(D+'/votacoes.json')), votos=JSON.parse(fs.readFileSync(D+'/votos.json'));
const figs=JSON.parse(fs.readFileSync(new URL('../../../../data/figures.json', import.meta.url))).figures;
const byName=Object.fromEntries(figs.map(f=>[f.name,f]));
const vm=Object.fromEntries(vot.map(v=>[v.id,v]));
const K=3;
const pos={},prop={},resumo={};
for(const [name,vs] of Object.entries(votos)){
 const acc={}; let tot=0; const detalhe=[];
 for(const [id,v] of Object.entries(vs)){
  const r=vm[id]; if(!r||!r.nominal||r.ambigua||r.consenso) continue;
  if(v!=='Sim'&&v!=='Não') continue;
  const toB=(v==='Sim')===(r.voto_sim_equivale_polo==='B');
  const s=toB?100:-100; tot++;
  (acc[r.axis]??={sum:0,n:0}); acc[r.axis].sum+=s; acc[r.axis].n++;
  detalhe.push(`${r.ementa_curta} (${r.data}): ${v} -> ${s>0?'B':'A'}`);
 }
 resumo[name]={votos_Sim_Nao_usados:tot};
 if(tot<3) continue;
 pos[name]={}; prop[name]={};
 for(const [ax,a] of Object.entries(acc)){
  const score=Math.round(a.sum/a.n); pos[name][ax]={score,n:a.n};
  const atual=byName[name]?.coords?.[ax];
  if(atual==null){prop[name][ax]={atual:null,por_votos:score,n:a.n,sugerido:null,obs:'sem coordenada atual'};continue;}
  const diff=score-atual; let sug=atual,obs='';
  if(Math.abs(diff)>30){
    if(a.n>=2){sug=Math.round((K*atual+a.n*score)/(K+a.n));obs=`divergência de ${diff>0?'+':''}${diff}; sugerido = média ponderada (atual com peso ${K}, cada voto peso 1)`;}
    else obs=`divergência de ${diff>0?'+':''}${diff} mas n=1: apenas indicativo, mantido`;
  } else obs='consistente (|dif|<=30)';
  prop[name][ax]={atual,por_votos:score,n:a.n,sugerido:sug,obs};
 }
}
fs.writeFileSync(D+'/posicoes.json',JSON.stringify(pos,null,1));
fs.writeFileSync(D+'/propostas.json',JSON.stringify(prop,null,1));
fs.writeFileSync(D+'/resumo_cobertura.json',JSON.stringify(resumo,null,1));
console.log(JSON.stringify(resumo));
for(const [n,p] of Object.entries(prop)){console.log('\n'+n);for(const [ax,x] of Object.entries(p))console.log(' ',ax.padEnd(13),'atual',String(x.atual).padStart(4),'votos',String(x.por_votos).padStart(5),'n',x.n,'->',x.sugerido,Math.abs(x.por_votos-x.atual)>30?'  <<<':'');}
