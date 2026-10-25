import {get,C} from './lib.mjs';
const [tipo,num,ano]=process.argv.slice(2);
const p=await get(`${C}proposicoes?siglaTipo=${tipo}&numero=${num}&ano=${ano}`);
for(const x of p.dados){console.log('PROP',x.id,x.siglaTipo,x.numero,x.ano,x.ementa.slice(0,100));
 const v=await get(`${C}proposicoes/${x.id}/votacoes?ordem=ASC&ordenarPor=dataHoraRegistro`);
 for(const y of (v?.dados||[])) if(y.siglaOrgao==='PLEN') console.log(' ',y.id,y.data,y.aprovacao,y.descricao.slice(0,110));}
