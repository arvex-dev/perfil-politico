import fs from 'fs';
const CACHE='/private/tmp/claude-501/-Users-albertoromanholmoreira-repos-perfil-politico/757abd68-e4b6-4d1c-9d88-1fb817e1e405/scratchpad/cache';
fs.mkdirSync(CACHE,{recursive:true});
let last=0;
export async function get(url){
  const k=CACHE+'/'+Buffer.from(url).toString('base64url').slice(-150)+'.json';
  if(fs.existsSync(k)) return JSON.parse(fs.readFileSync(k,'utf8'));
  const w=1000-(Date.now()-last); if(w>0) await new Promise(r=>setTimeout(r,w));
  last=Date.now();
  for(let i=0;i<3;i++){
    const r=await fetch(url,{headers:{accept:"application/json"}});
    if(r.ok){const j=await r.json();fs.writeFileSync(k,JSON.stringify(j));return j;}
    if(r.status==404) return null;
    await new Promise(r=>setTimeout(r,2000));
  }
  return null;
}
export const C='https://dadosabertos.camara.leg.br/api/v2/';
export const S='https://legis.senado.leg.br/dadosabertos/';
export async function senDay(d){ // d = YYYY-MM-DD
  return await get(`${S}votacao?dataInicio=${d}&dataFim=${d}`);
}
