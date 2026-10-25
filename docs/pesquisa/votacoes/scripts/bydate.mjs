import {get,C} from './lib.mjs';
const [a,b,re]=process.argv.slice(2);
for(let pg=1;pg<30;pg++){
 const r=await get(`${C}votacoes?dataInicio=${a}&dataFim=${b}&itens=200&pagina=${pg}&ordem=ASC&ordenarPor=dataHoraRegistro`);
 const d=r?.dados||[]; if(!d.length)break;
 for(const y of d) if(y.siglaOrgao==='PLEN' && new RegExp(re||'.','i').test(y.descricao+' '+(y.proposicaoObjeto||''))) console.log(y.id,y.data,y.aprovacao,y.proposicaoObjeto||'',y.descricao.replace(/\s+/g,' ').slice(0,140));
 if(d.length<200)break;}
