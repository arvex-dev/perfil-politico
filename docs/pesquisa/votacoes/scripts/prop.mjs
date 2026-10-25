import {get,C} from './lib2.mjs';
const [t,n,a]=process.argv.slice(2);
const j=await get(`${C}proposicoes?siglaTipo=${t}&numero=${n}&ano=${a}`);const d=j&&j.dados&&j.dados[0];
if(!d){console.log('no');process.exit()}
console.log(d.id,d.ementa.slice(0,100));
const v=await get(`${C}proposicoes/${d.id}/votacoes?ordem=ASC&ordenarPor=dataHoraRegistro&itens=100`);
for(const x of v.dados){const mm=/[Ss]im: (\d+);\s*n[ãa]o: (\d+)/i.exec(x.descricao||'');if(mm&&+mm[1]+ +mm[2]>=200)console.log(x.id,x.data.slice(0,10),mm[1]+'/'+mm[2],x.descricao.slice(0,90))}
