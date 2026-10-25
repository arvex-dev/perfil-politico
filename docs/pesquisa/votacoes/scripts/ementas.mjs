import {get,C} from './lib2.mjs';
import fs from 'fs';
const o=JSON.parse(fs.readFileSync('../cache/sweepC.json'));
const seen=new Map();
for(const v of o){const mi=Math.min(v.sim,v.nao)/(v.sim+v.nao);if(mi<0.1||v.data<'2023-04-01')continue;
 if(!/^(Aprovad[oa]|Rejeitad[oa])[^.]*(Projeto|Substitutivo|Medida Provisória|Proposta de Emenda|Subemenda|Texto|Parecer da Comiss)/i.test(v.desc)||/Emenda de (Plen|Comiss|Reda)|Requerimento|Recurso|sustação/i.test(v.desc))continue;
 const id=(v.prop||'').split('/').pop(); if(!/^\d+$/.test(id))continue;
 if(!seen.has(id))seen.set(id,v);}
for(const [id,v] of seen){const p=await get(`${C}proposicoes/${id}`);const d=p&&p.dados;
 console.log(v.id,v.data,v.sim+'/'+v.nao,d?`${d.siglaTipo} ${d.numero}/${d.ano}`:'?',(d?d.ementa:'').replace(/\s+/g,' ').slice(0,105));}
