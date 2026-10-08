// Confere o site antes de publicar: estrutura, textos fixos, links, contraste e a lógica da calculadora.
// Uso, na pasta do site: node ferramentas/verificar-site.mjs
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = p => readFileSync(join(raiz, p), 'utf8');
let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? 'ok     ' : 'FALHOU ') + msg); if (!cond) falhas++; };

const { EMPRESA } = await import(pathToFileURL(join(raiz, 'js/config.js')).href);
const calc = await import(pathToFileURL(join(raiz, 'js/calculo.js')).href);

const paginas = ['index.html', 'conta-alta-energia-solar.html', 'obrigado.html', 'privacidade.html', '404.html'];
const html = Object.fromEntries(paginas.map(p => [p, ler(p)]));
const idx = html['index.html'];

// ── Estrutura ────────────────────────────────────────────────────────────
for (const arq of [...paginas, 'robots.txt', 'sitemap.xml', 'llms.txt', 'favicon.ico', 'css/style.css',
  'js/app.js', 'js/config.js', 'js/calculo.js', 'js/irradiacao.js', 'assets/og-home.png',
  'assets/apple-touch-icon.png', 'assets/logo-branca.svg', 'assets/hero-usina.webp', 'assets/hero-usina-mobile.webp']) {
  ok(existsSync(join(raiz, arq)), 'existe ' + arq);
}
for (const p of paginas) {
  ok(/^<!doctype html>/i.test(html[p]), p + ': começa com doctype');
  ok(/<html lang="pt-BR">/.test(html[p]), p + ': lang pt-BR');
}
ok((idx.match(/<h1[ >]/g) || []).length === 1, 'index: um h1 só');
ok(!/noindex/i.test(idx) && !/noindex/i.test(html['privacidade.html']), 'index e privacidade sem noindex');
ok(/noindex/.test(html['obrigado.html']) && /noindex/.test(html['404.html']), 'obrigado e 404 com noindex');
ok(/<link rel="canonical" href="https:\/\/solargreensuporte\.com\.br\/">/.test(idx), 'index: canonical');
ok(/<link rel="canonical" href="https:\/\/solargreensuporte\.com\.br\/conta-alta-energia-solar\.html">/.test(html['conta-alta-energia-solar.html']), 'conta alta: canonical');
ok((html['conta-alta-energia-solar.html'].match(/<h1\b/g) || []).length === 1, 'conta alta: um h1 só');
ok(idx.includes('href="conta-alta-energia-solar.html"'), 'home: link para conta alta');
const desc = (idx.match(/name="description" content="([^"]+)"/) || [])[1] || '';
ok(desc.length > 70 && desc.length <= 165, 'index: descrição com ' + desc.length + ' caracteres');
const titulo = (idx.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
ok(titulo.length <= 62, 'index: título com ' + titulo.length + ' caracteres');
ok(!/robots.*Disallow: \//s.test(ler('robots.txt')), 'robots.txt não bloqueia o site');

// imagens com alt, e arquivos que existem
for (const p of paginas) {
  for (const tag of html[p].match(/<img\b[^>]*>/g) || []) {
    ok(/\balt="/.test(tag), p + ': img com alt -> ' + (tag.match(/src="([^"]+)"/) || [])[1]);
  }
}

// ── Versão nas URLs (crença 7 e gatilho B8) ─────────────────────────────
const todos = [...paginas.map(p => html[p]), ler('js/app.js'), ler('js/calculo.js')].join('\n');
const versoes = new Set((todos.match(/\?v=[0-9a-z-]+/g) || []));
ok(versoes.size === 1, 'toda URL local usa a mesma versão: ' + [...versoes].join(', '));

// ── Links e anchors locais ───────────────────────────────────────────────
for (const p of paginas) {
  for (const m of html[p].matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|data:|#)/.test(u)) continue;
    const arquivo = u.split('?')[0].split('#')[0].replace(/^\//, '');
    if (!arquivo) continue;
    ok(existsSync(join(raiz, arquivo)), p + ': ' + u + ' existe');
  }
}
for (const m of idx.matchAll(/href="#([^"]+)"/g)) ok(new RegExp('id="' + m[1] + '"').test(idx), 'index: âncora #' + m[1]);
for (const m of ler('sitemap.xml').matchAll(/<loc>https:\/\/solargreensuporte\.com\.br\/([^<]*)<\/loc>/g)) {
  ok(existsSync(join(raiz, m[1] || 'index.html')), 'sitemap: ' + (m[1] || '/') + ' existe');
}

// ── Dados fixos batem com config.js (gatilho C1) ─────────────────────────
for (const p of paginas) {
  const nums = [...html[p].matchAll(/wa\.me\/(\d+)/g)].map(m => m[1]);
  ok(nums.every(n => n === EMPRESA.telefoneWhats), p + ': todo link wa.me usa o telefone da config (' + nums.length + ')');
}
ok(idx.includes(EMPRESA.telefoneTela), 'index mostra ' + EMPRESA.telefoneTela);
ok(idx.includes(EMPRESA.email), 'index mostra o e-mail');
ok(idx.includes(EMPRESA.endereco.rua) && idx.includes(EMPRESA.endereco.cep), 'index mostra rua e CEP da config');
ok(idx.includes(EMPRESA.horario.texto), 'index mostra o horário da config');
const ld = JSON.parse(idx.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
ok(ld.telephone === '+' + EMPRESA.telefoneWhats, 'JSON-LD: telefone');
ok(ld.address.streetAddress === EMPRESA.endereco.rua && ld.address.postalCode === EMPRESA.endereco.cep.replace('.', ''), 'JSON-LD: endereço');
ok(!('aggregateRating' in ld) && !('priceRange' in ld), 'JSON-LD: sem avaliação nem faixa de preço inventadas');

// ── Cidades: cobertura visível = cidades do cálculo ──────────────────────
const chips = [...idx.matchAll(/<span class="cidade">([^<]+)<\/span>/g)].map(m => m[1]).sort();
ok(JSON.stringify(chips) === JSON.stringify([...calc.CIDADES].sort()), 'cobertura visível = ' + calc.CIDADES.length + ' cidades do cálculo');

// ── Número público no texto tem que bater com o dado (crença 20) ─────────
const dito = parseInt((idx.match(/Em agosto a irradiação em Belém é (\d+)% maior do que em março/) || [])[1], 10);
ok(dito === Math.round(calc.variacaoSazonal('Belém', 7, 2)), 'texto "agosto ' + dito + '% maior que março" bate com o dado (' + calc.variacaoSazonal('Belém', 7, 2).toFixed(1) + '%)');

// ── Escrita (crenças 5 e 18) ─────────────────────────────────────────────
for (const p of paginas) {
  const texto = html[p].replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, '');
  ok(!/[—–]/.test(texto), p + ': sem travessão no texto');
  ok(!/\p{Extended_Pictographic}/u.test(texto), p + ': sem emoji');
}

// ── Contraste dos pares de cor do CSS (mínimo 4,5 para texto) ────────────
const css = ler('css/style.css');
const v = n => (css.match(new RegExp('--' + n + ':(#[0-9a-fA-F]{6})')) || [])[1];
const lum = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
  .map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
for (const [fg, bg] of [['verde-texto', 'nevoa'], ['verde-texto', 'branco'], ['branco', 'verde-texto'],
  ['claro-soft', 'nevoa'], ['claro-soft', 'branco'], ['claro-faint', 'branco'], ['escuro-faint', 'escuro-surface'],
  ['escuro-faint', 'breu'], ['escuro-soft', 'breu'], ['escuro-soft', 'escuro-surface'], ['perda-texto', 'escuro-surface'],
  ['breu', 'verde']]) {
  const c = contraste(v(fg), v(bg));
  ok(c >= 4.5, 'contraste ' + fg + ' sobre ' + bg + ' = ' + c.toFixed(2));
}

// ── Fotos ────────────────────────────────────────────────────────────────
const fotos = JSON.parse(ler('assets/fotos/fotos.json'));
ok(Array.isArray(fotos), 'fotos.json é uma lista (' + fotos.length + ' foto)');
for (const f of fotos) ok(existsSync(join(raiz, 'assets/fotos', f.arquivo)), 'foto existe: ' + f.arquivo);
const soltas = readdirSync(join(raiz, 'assets/fotos')).filter(n => /\.(jpe?g|png|webp)$/i.test(n) && !fotos.some(f => f.arquivo === n));
ok(soltas.length === 0, 'nenhuma foto fora do fotos.json (rode ATUALIZAR FOTOS.bat)' + (soltas.length ? ': ' + soltas.join(', ') : ''));
for (const arq of ['assets/hero-usina.webp', 'assets/hero-usina-mobile.webp']) {
  ok(statSync(join(raiz, arq)).size < 300 * 1024, arq + ' com menos de 300 KB');
}

// ── Lógica da calculadora ────────────────────────────────────────────────
const base = { placas: 12, potenciaW: 585, cidade: 'Belém', desempenho: 0.82, tarifa: 0.98 };
const r = calc.calcularPerda(base);
const somaMeses = r.esperado.reduce((a, e) => a + e * 0.18, 0);
ok(Math.abs(r.perdaKwh - somaMeses) < 1e-6, 'perda do ano = soma dos 12 meses');
ok(Math.abs(r.perdaReais - r.perdaKwh * 0.98) < 1e-6 && r.kwp === 7.02, 'kWp = 7,02 e perda em reais = kWh x tarifa');
ok(Math.abs(r.perdaKwh - 1808) < 20 && !r.foraDaLista, 'Belém, 12 x 585 W, 82%: ' + Math.round(r.perdaKwh) + ' kWh perdidos no ano (o mesmo de antes da troca de fonte: 1808)');
ok(r.piorMes.indice === 7, 'pior mês em Belém é agosto');
ok(calc.calcularPerda({ ...base, desempenho: 1.05 }).perdaKwh === 0, 'desempenho acima de 100%: perda zero, nunca negativa');
const fora = calc.calcularPerda({ ...base, cidade: null });
ok(fora.foraDaLista && fora.perdaKwh > 1600 && fora.perdaKwh < 2000, 'cidade fora da lista usa a média da região: ' + Math.round(fora.perdaKwh) + ' kWh');
ok(calc.encontrarCidade(' belem ') === 'Belém' && calc.encontrarCidade('CASTANHAL') === 'Castanhal' && calc.encontrarCidade('Marabá') === null, 'busca de cidade ignora acento, caixa e espaço');
ok(calc.filtrarCidades('cast').includes('Castanhal'), 'filtro "cast" acha Castanhal');
ok(calc.telefoneValido('(91) 98759-8592') && calc.telefoneValido('5591987598592') && !calc.telefoneValido('9198759') && !calc.telefoneValido(''), 'validação de telefone');
ok(calc.linkWhats('Oi') === 'https://wa.me/5591987598592?text=Oi', 'link do WhatsApp');

// horário: as datas são UTC e o cálculo usa o fuso de Belém (UTC-3), então independe do fuso da máquina
const h = (dia, hh, mm = 0) => new Date(Date.UTC(2026, 8, dia, hh + 3, mm));   // setembro de 2026: 28 = segunda
ok(calc.estaAberto(h(28, 10)) === true, 'segunda 10h: aberto');
ok(calc.estaAberto(h(28, 7, 59)) === false, 'segunda 7h59: fechado');
ok(calc.estaAberto(h(28, 8)) === true, 'segunda 8h: aberto');
ok(calc.estaAberto(h(28, 17, 59)) === true, 'segunda 17h59: aberto');
ok(calc.estaAberto(h(28, 18)) === false, 'segunda 18h: fechado');
ok(calc.estaAberto(h(26, 10)) === false, 'sábado 10h: fechado');
ok(calc.estaAberto(h(27, 10)) === false, 'domingo 10h: fechado');
ok(calc.estaAberto(new Date(Date.UTC(2026, 8, 29, 1, 30))) === false, 'terça 01h30 UTC (segunda 22h30 em Belém): fechado');

// ── Envio do contato (fase 2) ────────────────────────────────────────────
const cfg = await import(pathToFileURL(join(raiz, 'js/config.js')).href);
const envio = await import(pathToFileURL(join(raiz, 'js/enviar-lead.js')).href);
ok(cfg.EMULADOR === null, 'config: EMULADOR é null (só o harness de teste troca)');
ok(/^AIza/.test(cfg.FIREBASE.apiKey) && cfg.FIREBASE.projectId === 'solargreen-21313', 'config: Firebase público do mesmo projeto do ERP');
const meses = { janeiro: '01', fevereiro: '02', março: '03', abril: '04', maio: '05', junho: '06', julho: '07', agosto: '08', setembro: '09', outubro: '10', novembro: '11', dezembro: '12' };
const dp = html['privacidade.html'].match(/Última atualização: (\d+) de (\S+) de (\d{4})/);
ok(dp && dp[3] + '-' + meses[dp[2]] + '-' + dp[1].padStart(2, '0') === cfg.LEADS.privacidadeVersao, 'versão da política em config = data escrita em privacidade.html (' + cfg.LEADS.privacidadeVersao + ')');
// campos que as firestore.rules do ERP aceitam em leads_site (hasOnly); se mudar lá, muda aqui
const PERMITIDOS = new Set(['id', 'nome', 'whatsapp', 'whatsappFim8', 'cidade', 'servico', 'consentimento', 'consentimentoVersao', 'origem', 'status', 'criadoEm', 'pagina',
  'utmSource', 'utmMedium', 'utmCampaign', 'tempoPreenchimentoMs', 'suspeito', 'calcPlacas', 'calcPotenciaW', 'calcKwp', 'calcCidade', 'calcForaDaLista', 'calcDesempenho', 'calcTarifa', 'calcPerdaAno']);
const calcOk = { placas: 12, potenciaW: 585, kwp: 7.02, cidade: 'Belém', foraDaLista: false, desempenho: 0.82, tarifa: 0.98, perdaAno: 1974.3 };
const ctx = { pagina: '/', utmSource: 'instagram', tempoPreenchimentoMs: 9000, suspeito: false };
const lead = envio.montarLead({ nome: 'Maria', zap: '(91) 98759-8592', cidade: 'Belém', servico: 'Limpeza e manutenção' }, calcOk, ctx);
ok(Object.keys(lead).every(k => PERMITIDOS.has(k)), 'contato só usa campos que as regras do ERP aceitam');
ok(lead.whatsapp === '91987598592' && lead.whatsappFim8 === '87598592' && lead.origem === 'Site' && lead.status === 'novo' && lead.consentimento === true, 'contato: telefone só com dígitos, fim8, origem, status e consentimento');
ok(lead.calcPlacas === 12 && lead.calcKwp === 7.02 && lead.calcPerdaAno === 1974.3, 'contato leva o diagnóstico da calculadora');
ok(envio.montarLead({ nome: 'Ana', zap: '5591987598592', servico: 'Monitoramento' }, null, null).whatsapp === '91987598592', 'telefone com 55 na frente vira nacional');
ok(!Object.keys(envio.montarLead({ nome: 'Ana', zap: '91987598592', servico: 'x' }, { ...calcOk, placas: 20000 }, null)).some(k => k.startsWith('calc')), 'diagnóstico fora do intervalo é omitido em vez de derrubar o contato');
ok(!Object.keys(envio.montarLead({ nome: 'Ana', zap: '91987598592', servico: 'x' }, { ...calcOk, desempenho: 7 }, null)).some(k => k.startsWith('calc')), 'desempenho absurdo também é omitido');
ok(envio.montarLead({ nome: 'x'.repeat(200), zap: '91987598592', cidade: 'c'.repeat(200), servico: 'x' }, null, null).nome.length === 120, 'nome longo é cortado em 120');
ok(!('cidade' in envio.montarLead({ nome: 'Ana', zap: '91987598592', cidade: '  ', servico: 'x' }, null, null)), 'cidade vazia não vai no documento');
ok(!/site_url/.test(JSON.stringify(lead)), 'campo armadilha nunca vai no documento');
ok(/id="fSite"/.test(idx) && /class="hp"/.test(idx), 'formulário tem o campo armadilha');

console.log(falhas ? '\n' + falhas + ' verificação(ões) falharam.' : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
