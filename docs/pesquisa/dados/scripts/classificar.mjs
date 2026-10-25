// Fase 3: classifica cada pergunta (euna = Europa/Am. do Norte, latam = Am. Latina/Brasil, universal),
// mede cobertura dos 12 temas brasileiros e a representacao latino-americana nos catalogos do 12axes.
import fs from 'node:fs'; import path from 'node:path';
const D = path.resolve(import.meta.dirname, '..'); const J = (...p) => JSON.parse(fs.readFileSync(path.join(D, ...p), 'utf8'));
const q12 = J('12axes', 'questions.json'), q8 = J('8values', 'questions.json'), q9 = J('9axes', 'questions.json'), qs = J('sapplyvalues', 'questions.json');
const items = {
  '12axes': q12.map(q => ({ id: q.id, text: q.text })),
  '8values': q8.map(q => ({ id: String(q.id), text: q.text })),
  '9axes': q9.map(q => ({ id: q.id, text: q.text })),
  sapplyvalues: qs.map(q => ({ id: 'S' + q.id, text: q.question })),
};
// --- regras (texto) + ids manuais; 'reason' registra o motivo
const RULES = {
  latam: [[/Brasil|brasileir|STF|Bolsa Fam[ií]lia|quilombola|venezuelan|haitian|Amaz[ôo]nia|Sul ou o Nordeste|reforma agr[aá]ria|governador|prefeitur|Estados e munic[ií]pios|servidores p[uú]blicos|cotas raciais|bancos p[uú]blicos|fac[cç][õo]es/i, 'referencia explicita ao Brasil / instituicao ou debate tipicamente brasileiro']],
  euna: [
    [/European Union|regional unions|single-payer|terroris|Mars\b|Religious clothing|Jury|Mandatory IDs|Churches should be taxed|Gun ownership|Physician-assisted|nothing to hide|Communism, if implemented|Whistleblowers|Testing products on animals|Police need more power/i, 'debate tipicamente anglo-europeu/norte-americano (UE, saude single-payer, antiterrorismo pos-11/9, armas, imposto sobre igrejas, veu, etc.)'],
  ],
};
const MANUAL = { // id -> [cat, motivo]
  '12axes:poder_01': ['latam', 'areas dominadas por faccoes (seguranca publica brasileira)'],
  '12axes:poder_09': ['universal', 'restricao de armas: debate brasileiro (Estatuto do Desarmamento) e global'],
  '8values:61': ['euna', 'posse de armas como tema central da politica dos EUA'],
  '8values:62': ['euna', 'single-payer: debate norte-americano'],
  '8values:13': ['euna', 'saude paga por capacidade de pagamento: enquadramento dos EUA'],
  '8values:16': ['universal', 'abolir a ONU: trope da direita dos EUA, mas tema universal'],
  '8values:33': ['euna', 'suicidio assistido: debate de EU/EUA/Canada; quase ausente no Brasil'],
  '8values:35': ['universal', 'vigilancia estatal: universal'],
};
function classify(test, it) {
  const k = `${test}:${it.id}`; if (MANUAL[k]) return { cat: MANUAL[k][0], reason: MANUAL[k][1], rule: 'manual' };
  for (const [re, why] of RULES.latam) if (re.test(it.text)) return { cat: 'latam', reason: why, rule: String(re) };
  if (test !== '12axes') for (const [re, why] of RULES.euna) if (re.test(it.text)) return { cat: 'euna', reason: why, rule: String(re) };
  return { cat: 'universal', reason: 'sem referencia geografica ou institucional especifica', rule: 'default' };
}
const out = { _doc: 'Classificacao automatica por regras + excecoes manuais (campo rule). Audite alterando RULES/MANUAL em classificar.mjs. Nota: "universal" inclui perguntas com enquadramento anglo-saxao implicito (nao detectavel por regra).', tests: {}, resumo: {} };
for (const [t, arr] of Object.entries(items)) {
  out.tests[t] = arr.map(it => ({ id: it.id, text: it.text, ...classify(t, it) }));
  const c = { euna: 0, latam: 0, universal: 0 }; out.tests[t].forEach(x => c[x.cat]++);
  const n = arr.length; out.resumo[t] = { n, ...c, pct: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, +(100 * v / n).toFixed(1)])) };
}
// --- cobertura de temas brasileiros: direct = formulacao especifica; generic = tangencia
const TOPICS = {
  'seguranca publica': { direct: /pol[ií]cia|policiais|fac[cç][õo]es|pena de morte|presíd|crime/i, generic: /police|law and order|death penalty|prison|crime|punish/i },
  'armas': { direct: /armas? de fogo|armas/i, generic: /\bgun/i },
  'drogas': { direct: /maconha|cocaína|drogas/i, generic: /drug|marijuana/i },
  'agro x ambiente': { direct: /agrot[óo]xico|transg[êe]nic|minera[çc][ãa]o|Amaz[ôo]nia|reforma agr[aá]ria|propriedades rurais|pecu[aá]ria|produ[çc][ãa]o nacional de alimentos/i, generic: /environmental regul|climate|genetic modification|farm|rural/i },
  'estatais / Petrobras': { direct: /estatais|estrat[ée]gic|bancos p[úu]blicos|empresas ... p[úu]blic|controle p[úu]blico/i, generic: /publicly owned|means of production|nationali[sz]ed|Government owned industry|public ownership/i },
  'tributacao e desigualdade': { direct: /imposto|tribut|desigualdade|fortunas|heran[çc]a/i, generic: /tax|inequality|inherit|the rich|wealth|wealthy/i },
  'corrupcao': { direct: /corrup/i, generic: /corrupt/i },
  'STF e instituicoes': { direct: /STF|cortes independentes|Banco Central|Congresso/i, generic: /courts|judiciar|checks and balances|separation of powers|constitution/i },
  'religiao na politica': { direct: /religi|igrejas|Deus|f[ée]\b/i, generic: /religio|church|theocra|\bGod\b|faith/i },
  'transferencia de renda (Bolsa Familia)': { direct: /Bolsa Fam[ií]lia|renda b[áa]sica|aux[ií]lios/i, generic: /welfare|social programs|basic income|single-payer|charity/i },
  'relacao com EUA e China': { direct: /China|chines|Estados Unidos|EUA\b/i, generic: /China|Chinese|United States|\bUSA?\b|American/ },
  'Mercosul / integracao regional': { direct: /Mercosul|Am[ée]rica do Sul|vizinhos|sul-americ|latino/i, generic: /regional union|European Union|Latin|South America/i },
};
out.cobertura = {};
for (const [t, arr] of Object.entries(items)) { out.cobertura[t] = {};
  for (const [topic, r] of Object.entries(TOPICS)) { const lang12 = t === '12axes';
    const hit = (re) => arr.filter(it => re.test(it.text)).map(it => it.id);
    // 12axes e PT (usa direct, que tambem e a unica regex PT); demais sao EN (usa generic)
    const ids = lang12 ? hit(r.direct) : hit(r.generic); out.cobertura[t][topic] = { n: ids.length, ids }; } }
// --- representacao latino-americana nos catalogos do 12axes
const ctry = J('12axes', 'countries.json'), ideo = J('12axes', 'ideologies.json'), pers = J('12axes', 'personalities.json');
const reC = /brasil|argentin|chile|m[eé]xic|venezuel|cuba|col[oô]mbia|peru\b|bol[ií]via|equador|uruguai|paragua|nicar[aá]gua|el salvador|guatemal|hondur|costa rica|panam[aá]|haiti|gr[ãa]-col[oô]mbia/i;
const cl = ctry.filter(c => reC.test(c.name)); const cBrStates = cl.filter(c => /\(Brasil\)/.test(c.name));
const reP = /brasileir|argentin|mexican|chilen|cuban|venezuel|colombian|peruan|bolivian|uruguai|equatorian|paraguai|nicaraguens|latino-american|salvadorenh|guatemalt|hondur|panamenh|haitian|dominican|costarriquenh/i;
const EXC = new Set(['Tomás de Aquino', 'Marco Rubio']);
const pl = pers.filter(p => !EXC.has(p.name) && reP.test((p.role + ' ' + p.description).slice(0, 220)));
const ideoStrict = ['Integralismo Brasileiro', 'Socialismo Bolivariano', 'Zapatismo', 'Nacionalismo Peronista', 'Nacionalismo Varguista', 'Social-Democracia Brasileira', 'Indigenismo'];
const ideoBroad = ['Desenvolvimentismo', 'Nacional-Desenvolvimentismo', 'Liberal-Desenvolvimentismo', 'Social-Desenvolvimentismo', 'Desenvolvimentismo de Estado', 'Trabalhismo', 'Trabalhismo Cristão'];
out.representacaoLatam = { '12axes': {
  paises: { total: ctry.length, latam: cl.length, pct: +(100 * cl.length / ctry.length).toFixed(1), subnacionais_brasil: cBrStates.length, historicos: cl.filter(c => String(c.historical) === 'true' || c.historical === true).length, lista: cl.map(c => c.name) },
  personalidades: { total: pers.length, latam_heuristica: pl.length, pct: +(100 * pl.length / pers.length).toFixed(1), nota: 'heuristica de nacionalidade nos 220 primeiros caracteres de role+description; revisar manualmente', lista: pl.map(p => p.name) },
  ideologias: { total: ideo.length, estrito: ideoStrict.filter(n => ideo.some(i => i.name === n)), amplo: ideoBroad.filter(n => ideo.some(i => i.name === n)) },
}, '8values': { ideologias: J('8values', 'ideologies.json').length, latam: 0, paises: 0, figuras: 0, nota: 'nenhum pais/figura; ideologias genericas (sem Peronismo, Varguismo, Bolivarianismo etc.)' },
  '9axes': { ideologias: J('9axes', 'ideologies.json').length, latam: 0, paises: 0, figuras: 0, nota: 'mesma lista de 8values' }, sapplyvalues: { ideologias: 0, paises: 0, figuras: 0, nota: 'so bussola 3D, sem referencias' } };
out.representacaoLatam['8values'].lista = J('8values', 'ideologies.json').map(i => i.name);
fs.writeFileSync(path.join(D, 'classificacao-perguntas.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.resumo)); console.log(JSON.stringify(Object.fromEntries(Object.entries(out.cobertura).map(([t, v]) => [t, Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.n]))])))); const r = out.representacaoLatam['12axes']; console.log(r.paises.total, r.paises.latam, r.paises.subnacionais_brasil, r.paises.historicos, r.personalidades.latam_heuristica, r.ideologias.estrito.length, r.ideologias.amplo.length);
