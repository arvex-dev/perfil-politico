import fs from 'fs';
import {get,C,senDay} from './lib.mjs';
import {camara,senado,figs} from './manifest.mjs';
const out='..';
const votacoes=[], votos={}; for(const n in figs) votos[n]={};
const norm=v=>({'Sim':'Sim','Não':'Não','Abstenção':'Abstenção','Obstrução':'Obstrução','Art. 17':'Presidente'}[v]||(/Presidente/.test(v)?'Presidente':(v==='Sim'||v==='Não'?v:'Ausente')));
const inMandate=(f,casa,data)=>figs[f].m.some(([c,a,b])=>c===casa&&data>=a&&data<=b);
for(const r of camara){
 const d=(await get(`${C}votacoes/${r.id}`))?.dados; const vs=(await get(`${C}votacoes/${r.id}/votos`))?.dados||[];
 if(!d){console.error('NO DETAIL',r.id);continue;}
 const nominal=vs.length>=100;
 const rec={id:'C:'+r.id,casa:'Câmara',data:d.data,proposicao:r.prop,ementa_curta:r.nome,descricao_oficial:d.descricao.replace(/\s+/g,' ').trim(),
  url_oficial:`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${r.propId}`,url_api:`${C}votacoes/${r.id}`,url_votos_api:`${C}votacoes/${r.id}/votos`,
  nominal,total_votos_registrados:vs.length,sim:vs.filter(v=>v.tipoVoto==='Sim').length,nao:vs.filter(v=>v.tipoVoto==='Não').length,abstencoes:vs.filter(v=>v.tipoVoto==='Abstenção').length,axis:r.axis,voto_sim_equivale_polo:r.sim,...(r.ambigua?{ambigua:true}:{})};
 votacoes.push(rec); console.error(rec.id,nominal,vs.length,d.data,d.descricao.slice(0,70));
 if(!nominal) continue;
 for(const f in figs){ if(!figs[f].m.some(m=>m[0]==='C'))continue;
  const x=vs.find(v=>v.deputado_?.id===figs[f].c);
  votos[f][rec.id]=x?norm(x.tipoVoto):(inMandate(f,'C',d.data)?'Ausente':'Sem mandato');}
}
for(const r of senado){
 const day=await senDay(r.data); const v=(day||[]).find(x=>x.codigoSessaoVotacao===r.id);
 if(!v){console.error('NO SEN',r.id);continue;}
 const vs=v.votos||[]; const c={}; for(const x of vs)c[x.siglaVotoParlamentar]=(c[x.siglaVotoParlamentar]||0)+1;
 const rec={id:'S:'+r.id,casa:'Senado',data:v.dataSessao,proposicao:v.identificacao,ementa_curta:r.nome,descricao_oficial:(v.descricaoVotacao||'').replace(/\s+/g,' ').trim(),
  resultado:v.resultadoVotacao,
  url_oficial:`https://www25.senado.leg.br/web/atividade/materias/-/materia/${v.codigoMateria}`,url_api:`https://legis.senado.leg.br/dadosabertos/votacao?dataInicio=${v.dataSessao}&dataFim=${v.dataSessao}`,
  nominal:v.votacaoSecreta!=='S'&&((c.Sim||0)+(c['Não']||0))>=30,sim:c.Sim||0,nao:c['Não']||0,abstencoes:c['Abstenção']||0,
  axis:r.axis,voto_sim_equivale_polo:r.sim,...(r.ambigua?{ambigua:true}:{})};
 votacoes.push(rec); console.error(rec.id,rec.nominal,c.Sim,c['Não'],v.dataSessao,rec.descricao_oficial.slice(0,70));
 for(const f in figs){ if(!figs[f].s)continue;
  const x=vs.find(y=>figs[f].s.test(y.nomeParlamentar));
  votos[f][rec.id]=x?norm(x.siglaVotoParlamentar):(inMandate(f,'S',v.dataSessao)?'Ausente (não consta na lista)':'Sem mandato');}
}
for(const r of votacoes){const m=Math.min(r.sim,r.nao)/Math.max(1,r.sim+r.nao);r.minoria_pct=Math.round(m*100);r.consenso=m<0.10;}
fs.writeFileSync(out+'/votacoes.json',JSON.stringify(votacoes,null,1));
fs.writeFileSync(out+'/votos.json',JSON.stringify(votos,null,1));
