// Lógica pura do site: conta da perda, busca de cidade, horário de atendimento
// e mensagens de WhatsApp. Não toca no DOM, então roda no Node (verificar-site.mjs).

import { EMPRESA, CALCULO } from './config.js?v=2026-10-07c';
import { IRRADIACAO } from './irradiacao.js?v=2026-10-07c';

export const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export function normaliza(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export const CIDADES = Object.keys(IRRADIACAO).sort((a, b) => a.localeCompare(b, 'pt-BR'));

export function encontrarCidade(texto) {
  const t = normaliza(texto).trim();
  if (!t) return null;
  return CIDADES.find(c => normaliza(c) === t) || null;
}

export function filtrarCidades(texto, limite = 8) {
  const t = normaliza(texto).trim();
  return CIDADES.filter(c => normaliza(c).includes(t)).slice(0, limite);
}

// Cidade fora da lista: média das cidades atendidas, mês a mês.
export function irradiacaoRegional() {
  return MESES.map((_, i) => CIDADES.reduce((soma, c) => soma + IRRADIACAO[c][i], 0) / CIDADES.length);
}

// Geração esperada no mês = kWp x irradiação do mês (kWh/m² no mês) x PR.
// A perda do ano é a SOMA dos 12 meses, nunca o mês corrente x 12.
export function calcularPerda({ placas, potenciaW, cidade, desempenho, tarifa }) {
  const kwp = (placas * potenciaW) / 1000;
  const doDataset = IRRADIACAO[cidade];
  const irr = doDataset || irradiacaoRegional();
  const perdaFrac = Math.max(0, 1 - desempenho);
  const esperado = irr.map(g => kwp * g * CALCULO.PR * CALCULO.AJUSTE_FONTE);
  const real = esperado.map(e => e * (1 - perdaFrac));
  const perdaMes = esperado.map((e, i) => e - real[i]);
  const perdaKwh = perdaMes.reduce((a, b) => a + b, 0);
  let piorIndice = 0;
  perdaMes.forEach((v, i) => { if (v > perdaMes[piorIndice]) piorIndice = i; });
  return {
    kwp,
    desempenho,
    tarifa,
    foraDaLista: !doDataset,
    esperado,
    real,
    perdaKwh,
    perdaReais: perdaKwh * tarifa,
    piorMes: { indice: piorIndice, reais: perdaMes[piorIndice] * tarifa },
  };
}

// Relação entre o mês de maior e o de menor irradiação numa cidade, em %.
export function variacaoSazonal(cidade, mesAlto, mesBaixo) {
  const v = IRRADIACAO[cidade];
  return (v[mesAlto] / v[mesBaixo] - 1) * 100;
}

// Horário de atendimento. O cálculo usa o fuso de Belém, não o do visitante.
export function estaAberto(agora = new Date()) {
  const h = EMPRESA.horario;
  const b = new Date(agora.getTime() + h.fusoHoras * 3600000);
  const hora = b.getUTCHours() + b.getUTCMinutes() / 60;
  return h.dias.includes(b.getUTCDay()) && hora >= h.abre && hora < h.fecha;
}

export function linkWhats(mensagem) {
  const base = 'https://wa.me/' + EMPRESA.telefoneWhats;
  return mensagem ? base + '?text=' + encodeURIComponent(mensagem) : base;
}

export function moeda(v) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function kwhTexto(v) {
  return Math.round(v).toLocaleString('pt-BR') + ' kWh';
}

export function mensagemDiagnostico({ placas, potenciaW, kwp, cidade, foraDaLista, desempenho, perdaReais }) {
  const local = foraDaLista ? cidade + ' (cidade fora da lista do site)' : cidade;
  return 'Olá! Fiz o cálculo no site. Minha usina tem ' + placas + ' placas de ' + potenciaW + 'W (' +
    kwp.toFixed(2).replace('.', ',') + ' kWp) em ' + local + ', desempenho estimado de ' +
    Math.round(desempenho * 100) + '%, e apareceu uma perda de ' + moeda(perdaReais) +
    ' por ano. Queria entender melhor.';
}

export function mensagemServico(servico) {
  return 'Olá! Quero saber mais sobre ' + servico + '.';
}

export function apenasDigitos(s) {
  return String(s || '').replace(/\D/g, '');
}

// DDD + 8 ou 9 dígitos, com ou sem o 55 na frente.
export function telefoneValido(s) {
  let d = apenasDigitos(s);
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  return d.length === 10 || d.length === 11;
}
