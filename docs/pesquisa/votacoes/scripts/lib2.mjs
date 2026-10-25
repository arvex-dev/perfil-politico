import fs from 'fs';
import {fileURLToPath} from 'url';
import path from 'path';
const CACHE=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../cache');
fs.mkdirSync(CACHE,{recursive:true});
let last=0;
export async function get(url){
  const k=CACHE+'/'+Buffer.from(url).toString('base64url').slice(-160)+'.json';
  if(fs.existsSync(k)) return JSON.parse(fs.readFileSync(k,'utf8'));
  const w=1000-(Date.now()-last); if(w>0) await new Promise(r=>setTimeout(r,w));
  last=Date.now();
  for(let i=0;i<4;i++){
    try{
    const r=await fetch(url,{headers:{accept:"application/json"}});
    if(r.ok){const j=await r.json();fs.writeFileSync(k,JSON.stringify(j));return j;}
    if(r.status==404) return null;
    }catch(e){}
    await new Promise(r=>setTimeout(r,2000));
  }
  return null;
}
export const C='https://dadosabertos.camara.leg.br/api/v2/';
export const S='https://legis.senado.leg.br/dadosabertos/';
