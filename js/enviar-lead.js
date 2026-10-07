// Envio do contato do site para o ERP e leitura da tarifa pública.
// O Firebase SDK só é baixado quando a pessoa envia o formulário (não pesa na
// abertura da página). O site NUNCA grava em `funil` nem em `clientes`: grava na
// antessala `leads_site`, que só aceita criação e nunca leitura; o ERP promove.
import { FIREBASE, LEADS, EMULADOR } from './config.js?v=2026-10-07a';
import { apenasDigitos } from './calculo.js?v=2026-10-07a';

const corta = (s, n) => String(s || '').trim().slice(0, n);
const numeroEntre = (v, min, max) => typeof v === 'number' && isFinite(v) && v >= min && v <= max;

// Monta o documento no formato que as firestore.rules aceitam. Campo fora do
// intervalo é omitido, nunca enviado: uma regra que recusa o documento inteiro
// custa o contato, e o diagnóstico da calculadora é só um complemento.
export function montarLead({ nome, zap, cidade, servico }, calculo, contexto) {
  let d = apenasDigitos(zap);
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  const lead = {
    nome: corta(nome, 120),
    whatsapp: d,
    whatsappFim8: d.slice(-8),
    servico: corta(servico, 60),
    consentimento: true,
    consentimentoVersao: LEADS.privacidadeVersao,
    origem: 'Site',
    status: 'novo',
  };
  const c = corta(cidade, 80);
  if (c) lead.cidade = c;
  if (contexto) {
    if (contexto.pagina) lead.pagina = corta(contexto.pagina, 200);
    if (contexto.utmSource) lead.utmSource = corta(contexto.utmSource, 80);
    if (contexto.utmMedium) lead.utmMedium = corta(contexto.utmMedium, 80);
    if (contexto.utmCampaign) lead.utmCampaign = corta(contexto.utmCampaign, 120);
    if (Number.isInteger(contexto.tempoPreenchimentoMs) && contexto.tempoPreenchimentoMs >= 0) lead.tempoPreenchimentoMs = contexto.tempoPreenchimentoMs;
    if (typeof contexto.suspeito === 'boolean') lead.suspeito = contexto.suspeito;
  }
  if (calculo) {
    const placas = Math.round(calculo.placas);
    const ok = Number.isInteger(placas) && placas >= 1 && placas <= 10000
      && numeroEntre(calculo.potenciaW, 50, 2000) && numeroEntre(calculo.kwp, 0.001, 100000)
      && numeroEntre(calculo.desempenho, 0.001, 1.2) && numeroEntre(calculo.tarifa, 0.001, 20)
      && numeroEntre(calculo.perdaAno, 0, 100000000);
    if (ok) {
      lead.calcPlacas = placas;
      lead.calcPotenciaW = calculo.potenciaW;
      lead.calcKwp = Math.round(calculo.kwp * 100) / 100;
      lead.calcCidade = corta(calculo.cidade, 80);
      lead.calcForaDaLista = !!calculo.foraDaLista;
      lead.calcDesempenho = calculo.desempenho;
      lead.calcTarifa = calculo.tarifa;
      lead.calcPerdaAno = Math.round(calculo.perdaAno * 100) / 100;
    }
  }
  return lead;
}

export async function enviarLead(lead) {
  const [app, fs] = await Promise.all([
    import(LEADS.sdk + 'firebase-app.js'),
    import(LEADS.sdk + 'firebase-firestore.js'),
  ]);
  const inst = app.getApps().length ? app.getApp() : app.initializeApp(FIREBASE);
  const db = fs.getFirestore(inst);
  if (EMULADOR) {
    const [host, porta] = EMULADOR.split(':');
    fs.connectFirestoreEmulator(db, host, Number(porta));
  }
  const ref = fs.doc(fs.collection(db, LEADS.colecao));
  const gravacao = fs.setDoc(ref, { ...lead, id: ref.id, criadoEm: fs.serverTimestamp() });
  // Sem confirmação do servidor no prazo (sem sinal, por exemplo), rejeita: a tela
  // leva a pessoa ao WhatsApp em vez de dizer que o contato foi recebido.
  // A gravação pendente pode ainda chegar depois; o ERP não duplica (mesmo telefone
  // e serviço em 24 h viram "duplicado").
  const tempo = new Promise((_, rejeita) => setTimeout(() => rejeita(new Error('sem confirmação do servidor')), LEADS.timeoutMs));
  await Promise.race([gravacao, tempo]);
  return ref.id;
}

// Tarifa de referência mantida pelo ERP (config_publica/site). Leitura por REST, sem
// baixar o SDK. Qualquer falha devolve null e o site segue com a tarifa de reserva.
export async function buscarTarifa() {
  try {
    const em = sessionStorage.getItem('sg_tarifa');
    if (em) {
      const c = JSON.parse(em);
      if (Date.now() - c.em < 3600000) return c.dado;
    }
  } catch (e) { /* sem sessionStorage: segue */ }
  const base = EMULADOR ? 'http://' + EMULADOR + '/v1' : 'https://firestore.googleapis.com/v1';
  const url = base + '/projects/' + FIREBASE.projectId + '/databases/(default)/documents/config_publica/site?key=' + FIREBASE.apiKey;
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return null;
    const f = (await r.json()).fields || {};
    const tarifa = f.tarifa ? Number(f.tarifa.doubleValue !== undefined ? f.tarifa.doubleValue : f.tarifa.integerValue) : NaN;
    const mes = f.atualizadaEm ? f.atualizadaEm.stringValue : '';
    if (!numeroEntre(tarifa, 0.1, 20) || !/^\d{4}-\d{2}$/.test(mes)) return null;
    const dado = { tarifa, atualizadaEm: mes };
    try { sessionStorage.setItem('sg_tarifa', JSON.stringify({ em: Date.now(), dado })); } catch (e) { /* segue */ }
    return dado;
  } catch (e) {
    return null;
  }
}
