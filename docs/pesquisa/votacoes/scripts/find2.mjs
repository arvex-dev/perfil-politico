import {get,C} from './lib.mjs';
const [tipo,num,ano]=process.argv.slice(2);
const p=await get(`${C}proposicoes?siglaTipo=${tipo}&numero=${num}&ano=${ano}`);
for(const x of (p?.dados||[])){console.log('PROP',x.id,x.siglaTipo,x.numero,x.ano,x.ementa.slice(0,90));
 const v=await get(`${C}proposicoes/${x.id}/votacoes`);
 for(const y of (v?.dados||[])) if(y.siglaOrgao==='PLEN' && (process.env.ALL||/Sim:|sim:/.test(y.descricao)) && !/^(Aprovado|Rejeitado)(a)? o Requerimento\./.test(y.descricao) ) console.log(' ',y.id,y.data,y.aprovacao,y.descricao.replace(/\s+/g,' ').slice(0,130));}
