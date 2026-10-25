import {get,C} from './lib2.mjs';
import fs from 'fs';
const out=[];
for(let y=2023;y<=2026;y++)for(let m=1;m<=12;m++){
  const a=`${y}-${String(m).padStart(2,'0')}-01`; const b=new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);
  if(a>'2026-10-25')continue;
  for(let p=1;p<20;p++){
    const j=await get(`${C}votacoes?dataInicio=${a}&dataFim=${b}&itens=100&pagina=${p}&ordem=ASC&ordenarPor=dataHoraRegistro`);
    if(!j||!j.dados.length)break;
    for(const v of j.dados){const mm=/[Ss]im: (\d+);\s*n[ãa]o: (\d+)/i.exec(v.descricao||'');
      if(mm&&+mm[1]+ +mm[2]>=250)out.push({id:v.id,data:v.data,sim:+mm[1],nao:+mm[2],desc:v.descricao.slice(0,260),prop:v.uriProposicaoObjeto||v.uriEvento});}
    if(j.dados.length<100)break;
  }
  console.error(a,out.length);
}
fs.writeFileSync('../cache/sweepC.json',JSON.stringify(out));
