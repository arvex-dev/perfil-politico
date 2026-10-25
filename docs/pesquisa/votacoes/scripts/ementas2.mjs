import {get,C} from './lib2.mjs';
import fs from 'fs';
const o=JSON.parse(fs.readFileSync('../cache/sweepC.json'));
const T={'Projeto de Lei':'PL','Projeto de Lei Complementar':'PLP','Proposta de Emenda à Constituição':'PEC','Projeto de Decreto Legislativo':'PDL','Medida Provisória':'MPV','Projeto de Resolução':'PRC'};
const seen=new Set();
for(const v of o){const mi=Math.min(v.sim,v.nao)/(v.sim+v.nao);if(mi<0.1||v.data<'2023-04-01')continue;
 const m=/(Projeto de Lei Complementar|Projeto de Lei|Proposta de Emenda à Constituição|Projeto de Decreto Legislativo|Medida Provisória) n[ºo°.]\s*([\d.]+)[-A-Z]*,? de (\d{4})/i.exec(v.desc);
 if(!m||/Requerimento|Recurso|Emenda de (Plen|Comiss|Reda)/i.test(v.desc.slice(0,60)))continue;
 const k=T[m[1]]+m[2]+m[3]; if(seen.has(k))continue;seen.add(k);
 const j=await get(`${C}proposicoes?siglaTipo=${T[m[1]]}&numero=${m[2].replace('.','')}&ano=${m[3]}`);const d=j&&j.dados&&j.dados[0];
 console.log(v.id,v.data,v.sim+'/'+v.nao,`${T[m[1]]} ${m[2]}/${m[3]}`,(d?d.ementa:'?').replace(/\s+/g,' ').slice(0,110));}
