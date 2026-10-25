import {get,C,S} from './lib2.mjs';
import fs from 'fs';
const m=[];
for(let p=1;;p++){const j=await get(`${C}deputados?itens=100&pagina=${p}&ordem=ASC&ordenarPor=nome`);if(!j||!j.dados.length)break;
 for(const d of j.dados)m.push({id:'camara:'+d.id,nome:d.nome,partido:d.siglaPartido,uf:d.siglaUf,casa:'Câmara',foto:d.urlFoto,url:'https://www.camara.leg.br/deputado/'+d.id});
 if(j.dados.length<100)break;}
const s=await get(`${S}senador/lista/atual`);
for(const x of s.ListaParlamentarEmExercicio.Parlamentares.Parlamentar){const i=x.IdentificacaoParlamentar;
 m.push({id:'senado:'+i.CodigoParlamentar,nome:i.NomeParlamentar,partido:i.SiglaPartidoParlamentar,uf:i.UfParlamentar,casa:'Senado',foto:i.UrlFotoParlamentar,url:i.UrlPaginaParlamentar});}
fs.writeFileSync('../cache/members.json',JSON.stringify(m));
console.log(m.length,m.filter(x=>x.casa=='Câmara').length);
