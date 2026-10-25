import {get,C,S} from './lib2.mjs';
import fs from 'fs';
const base=JSON.parse(fs.readFileSync('../votacoes.json','utf8'));
const EXCL=new Set(['C:2310837-8','C:2270789-73','S:6377','C:2487436-169','C:2233802-424','S:6818','S:7106']);
const R=[]; // rollcalls
for(const v of base){ if(EXCL.has(v.id)) continue;
  R.push({id:v.id,casa:v.casa,data:v.data,proposicao:v.proposicao,ementa_curta:v.ementa_curta,axis:v.axis,voto_sim_equivale_polo:v.voto_sim_equivale_polo,url_oficial:v.url_oficial,origem:'existente'});}
const N=(id,casa,data,prop,em,axis,pole,url,just)=>R.push({id,casa,data,proposicao:prop,ementa_curta:em,axis,voto_sim_equivale_polo:pole,url_oficial:url,justificativa:just,origem:'novo'});
const cf=id=>`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${id}`;
N('C:2355135-49','Câmara','2023-05-03','PDL 98/2023','Susta decreto do marco do saneamento (abre espaço à iniciativa privada)','economia','B',cf(2355135),'Sim derruba o decreto que restringia contratos privados no saneamento: mais mercado.');
N('C:2383287-43','Câmara','2023-10-25','PL 4173/2023','Tributação de fundos exclusivos e offshores','distribuicao','A',cf(2383287),'Sim cria tributação sobre rendas de alta renda (fundos exclusivos/offshore): redistribuição.');
N('C:2515648-44','Câmara','2025-06-25','PDL 214/2025','Susta decreto do aumento do IOF','distribuicao','B',cf(2515648),'Sim derruba aumento de imposto (IOF): menos tributação.');
N('C:575585-92','Câmara','2023-11-21','PL 5228/2019','Lei do Primeiro Emprego (contrato de primeiro emprego e recolocação)','trabalho','B',cf(575585),'Sim cria contratos mais flexíveis na CLT: flexibilização.');
N('C:2579832-62','Câmara','2025-11-18','PL 5582/2025','PL Antifacção (substitutivo)','seguranca','B',cf(2579832),'Sim endurece penas e poderes de combate a facções: rigor penal.');
N('C:2482078-57','Câmara','2025-11-05','PDL 3/2025','Susta resolução do CONANDA sobre atendimento a meninas vítimas de violência sexual (aborto legal)','costumes','B',cf(2482078),'Sim derruba protocolo que ampara o aborto legal de menores: posição conservadora.');
N('C:2439779-55','Câmara','2024-11-19','PL 1958/2021','Cotas raciais em concursos (30%, texto principal)','diversidade','A',cf(2439779),'Sim aprova reserva de vagas por raça: ação afirmativa.');
N('S:6248','Senado','2020-11-03','PLP 19/2019','Autonomia do Banco Central (substitutivo)','economia','B','https://www25.senado.leg.br/web/atividade/materias/-/materia/139460','Sim dá autonomia ao BC (mesmo mapeamento da Câmara).');
N('S:7032','Senado','2025-12-09','PEC 48/2023','PEC do marco temporal das terras indígenas (1º turno)','ambiente','B','https://www25.senado.leg.br/web/atividade/materias/-/materia/158436','Sim constitucionaliza o marco temporal: menos demarcação, mais produção.');
N('S:6782','Senado','2023-11-22','PEC 8/2021','PEC que limita decisões monocráticas do STF','instituicoes','B','https://www25.senado.leg.br/web/atividade/materias/-/materia/148606','Sim restringe poderes do STF; mapeado como desconfiança institucional (discutível: também há apoio centrista).');
fs.writeFileSync('../cache/rollcalls.json',JSON.stringify(R));
// fetch votes
const V={}; // id -> {memberKey: voto}
for(const r of R){
  const m={};
  if(r.casa==='Câmara'){
    const id=r.id.slice(2);
    const j=await get(`${C}votacoes/${id}/votos`);
    for(const x of (j&&j.dados)||[])m['camara:'+x.deputado_.id]=x.tipoVoto;
  } else {
    const code=+r.id.slice(2);
    const j=await get(`${S}votacao?dataInicio=${r.data}&dataFim=${r.data}`)||[];
    const s=j.find(x=>x.codigoSessaoVotacao===code);
    if(!s||s.votacaoSecreta==='S'){console.error('MISSING',r.id);continue;}
    for(const x of s.votos||[])m['senado:'+x.codigoParlamentar]=x.siglaVotoParlamentar;
  }
  V[r.id]=m;
  const c={};for(const k in m)c[m[k]]=(c[m[k]]||0)+1;
  console.error(r.id,r.data,JSON.stringify(c));
}
fs.writeFileSync('../cache/votes.json',JSON.stringify(V));
