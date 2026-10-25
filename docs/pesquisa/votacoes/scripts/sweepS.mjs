import {get,S} from './lib2.mjs';
import fs from 'fs';
const out=[];
let d=new Date('2023-02-01');const end=new Date('2026-10-25');
while(d<end){const e=new Date(Math.min(+new Date(+d+30*864e5),+end));
 const f=x=>x.toISOString().slice(0,10);
 const j=await get(`${S}votacao?dataInicio=${f(d)}&dataFim=${f(e)}`)||[];
 for(const v of j){const c={};for(const x of v.votos||[])c[x.siglaVotoParlamentar]=(c[x.siglaVotoParlamentar]||0)+1;
  if((c.Sim||0)+(c['Não']||0)<30||v.votacaoSecreta==='S')continue;
  out.push({id:v.codigoSessaoVotacao,data:v.dataSessao,ident:v.identificacao,sim:c.Sim||0,nao:c['Não']||0,desc:(v.descricaoVotacao||'').replace(/\s+/g,' ').slice(0,120),ement:(v.ementa||'').replace(/\s+/g,' ').slice(0,120),res:(v.resultadoVotacao||'').slice(0,20)});}
 console.error(f(d),out.length);
 d=new Date(+e+864e5);}
fs.writeFileSync('../cache/sweepS.json',JSON.stringify(out));
