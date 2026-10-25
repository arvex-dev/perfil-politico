import {get,S} from './lib.mjs';
const [a,b,re]=process.argv.slice(2);
// chunk by 3 months to keep payloads manageable
let d=new Date(a);const end=new Date(b);
while(d<end){const e=new Date(Math.min(+new Date(+d+90*864e5),+end));
 const f=x=>x.toISOString().slice(0,10);
 const j=await get(`${S}votacao?dataInicio=${f(d)}&dataFim=${f(e)}`)||[];
 for(const v of j){ if(!new RegExp(re,'i').test(v.identificacao+' '+v.descricaoVotacao+' '+v.ementa))continue;
  const c={};for(const x of v.votos||[])c[x.siglaVotoParlamentar]=(c[x.siglaVotoParlamentar]||0)+1;
  if((c.Sim||0)+(c['Não']||0)<30)continue;
  console.log(v.codigoSessaoVotacao,v.dataSessao,v.identificacao,'S'+(c.Sim||0)+' N'+(c['Não']||0),(v.descricaoVotacao||'').replace(/\s+/g,' ').slice(0,95),'|',(v.resultadoVotacao||'').slice(0,20));}
 d=new Date(+e+864e5);}
