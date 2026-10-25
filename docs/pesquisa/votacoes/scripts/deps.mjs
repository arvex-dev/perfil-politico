import {get,C} from './lib.mjs';
const names=["Boulos","Erika Hilton","Gleisi","Tabata","Kim Kataguiri","Marcel van Hattem","Nikolas","Arthur Lira","Jair Bolsonaro","Marina Silva","Flávio Dino","Eduardo Leite","Ratinho","Sergio Moro","Damares","Ciro Gomes","Haddad","Michel Temer","Tarcísio","Caiado","Zema","Alckmin","Marçal","Pacheco","Tebet"];
for(const n of names){const r=await get(`${C}deputados?nome=${encodeURIComponent(n)}&dataInicio=2015-01-01`);
console.log(n,'=>',(r?.dados||[]).map(d=>d.id+':'+d.nome+'/'+d.siglaPartido+'/leg'+d.idLegislatura).join(' ; '));}
