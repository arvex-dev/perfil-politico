import {senDay} from './lib.mjs';
const [d,re]=process.argv.slice(2);
const j=await senDay(d)||[];
for(const v of j){ if(re && !new RegExp(re,'i').test(v.identificacao+' '+v.descricaoVotacao+' '+v.ementa)) continue;
 const c={};for(const x of v.votos||[])c[x.siglaVotoParlamentar]=(c[x.siglaVotoParlamentar]||0)+1;
 console.log(v.codigoSessaoVotacao,v.dataSessao,v.identificacao,v.votacaoSecreta,JSON.stringify(c),(v.descricaoVotacao||'').replace(/\s+/g,' ').slice(0,100),'|',(v.resultadoVotacao||'').slice(0,40));}
