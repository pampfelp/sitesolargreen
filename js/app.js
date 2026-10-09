// Solar Green Suporte, site institucional. Tudo que mexe na tela fica aqui;
// a conta e as regras ficam em calculo.js, os dados fixos em config.js.
import { EMPRESA, CALCULO, TEMPO_SEM_LIMPEZA, EXEMPLO, LEADS } from './config.js?v=2026-10-09b';
import {
  MESES, encontrarCidade, filtrarCidades, calcularPerda, estaAberto, linkWhats,
  moeda, kwhTexto, mensagemDiagnostico, mensagemServico, telefoneValido,
} from './calculo.js?v=2026-10-09b';
import { montarLead, enviarLead, buscarTarifa } from './enviar-lead.js?v=2026-10-09b';

const $ = id => document.getElementById(id);
const ehCampanha = document.body.classList.contains('campanha');
// Avisos para o rastreio.js (Pixel). Se ninguém escutar, não acontece nada.
const avisar = (nome, detalhe) => document.dispatchEvent(new CustomEvent(nome, { detail: detalhe }));
const semAnimacao = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Valores de saída dos campos e ano do rodapé ──────────────────────────
$('potPlaca').value = CALCULO.POTENCIA_PLACA_W;
$('tarifa').value = CALCULO.TARIFA_PADRAO;
$('ano').textContent = new Date().getFullYear();

// Tarifa de referência mantida no ERP (config_publica/site). Se a pessoa já mexeu no campo ou
// a leitura falhar, fica a tarifa de reserva da config.
let tarifaEditada = false;
$('tarifa').addEventListener('input', () => { tarifaEditada = true; });
buscarTarifa().then(t => {
  if (!t || tarifaEditada) return;
  $('tarifa').value = t.tarifa;
  const [ano, mes] = t.atualizadaEm.split('-');
  $('tarifaDica').textContent = 'Tarifa de referência da Equatorial, atualizada em ' + mes + '/' + ano + '. Confira na sua conta de luz.';
});

// Origem da visita (campanha), guardada na sessão para acompanhar o contato até o funil.
const utm = (() => {
  try {
    const p = new URLSearchParams(location.search);
    const u = { utmSource: p.get('utm_source'), utmMedium: p.get('utm_medium'), utmCampaign: p.get('utm_campaign') };
    if (u.utmSource || u.utmMedium || u.utmCampaign) { sessionStorage.setItem('sg_utm', JSON.stringify(u)); return u; }
    return JSON.parse(sessionStorage.getItem('sg_utm') || '{}');
  } catch (e) { return {}; }
})();
let ultimoCalculo = null;   // o diagnóstico que a pessoa viu, enviado junto com o contato

const selTempo = $('tempoLimpeza');
const opcaoVazia = document.createElement('option');
opcaoVazia.value = '';
opcaoVazia.textContent = 'Ex.: mais de 1 ano';
opcaoVazia.disabled = true;
opcaoVazia.selected = true;
selTempo.appendChild(opcaoVazia);
TEMPO_SEM_LIMPEZA.forEach(t => {
  const o = document.createElement('option');
  o.value = String(t.valor);
  o.textContent = t.rotulo;
  selTempo.appendChild(o);
});

// ── Horário de atendimento ───────────────────────────────────────────────
function atualizarHorario() {
  const aberto = estaAberto(new Date());
  const foraTxt = 'Fora do horário de atendimento (' + EMPRESA.horario.texto.toLowerCase() +
    '). Respondemos no próximo dia útil.';
  $('resCta').classList.toggle('fechado', !aberto);
  $('resHorario').textContent = aberto ? EMPRESA.horario.texto + '.' : foraTxt;
  $('barraHorario').textContent = aberto ? EMPRESA.horario.texto : 'Fora do horário. Respondemos no próximo dia útil.';
}
atualizarHorario();
setInterval(atualizarHorario, 60000);

// ── Links de WhatsApp por serviço ────────────────────────────────────────
document.querySelectorAll('[data-servico]').forEach(a => {
  a.href = linkWhats(mensagemServico(a.getAttribute('data-servico')));
});

// ── Combobox de cidade ───────────────────────────────────────────────────
const cidadeInput = $('cidadeInput');
const cidadeLista = $('cidadeLista');
const cidadeAviso = $('cidadeAviso');
let cidadeSelecionada = null;   // nome exato da lista, ou null quando a cidade está fora dela
let itemAtivo = -1;

function abrirLista(aberta) {
  cidadeLista.classList.toggle('on', aberta);
  cidadeInput.setAttribute('aria-expanded', aberta ? 'true' : 'false');
}

function renderLista(filtro) {
  const op = filtrarCidades(filtro || '');
  cidadeLista.textContent = '';
  itemAtivo = -1;
  if (!op.length) {
    const v = document.createElement('div');
    v.className = 'combo-vazio';
    v.textContent = 'Essa cidade não está na lista. Você ainda pode calcular com a média da região.';
    cidadeLista.appendChild(v);
  }
  op.forEach(c => {
    const d = document.createElement('div');
    d.className = 'combo-item';
    d.setAttribute('role', 'option');
    d.dataset.cidade = c;
    d.textContent = c;
    cidadeLista.appendChild(d);
  });
  abrirLista(true);
}

function escolherCidade(nome) {
  cidadeSelecionada = nome;
  cidadeInput.value = nome;
  cidadeAviso.classList.remove('on');
  abrirLista(false);
}

function marcarAtivo(novo) {
  const itens = cidadeLista.querySelectorAll('.combo-item');
  if (!itens.length) return;
  itemAtivo = (novo + itens.length) % itens.length;
  itens.forEach((el, i) => el.classList.toggle('ativo', i === itemAtivo));
}

cidadeInput.addEventListener('focus', () => renderLista(cidadeInput.value));
cidadeInput.addEventListener('input', () => {
  cidadeSelecionada = encontrarCidade(cidadeInput.value);
  cidadeAviso.classList.remove('on');
  renderLista(cidadeInput.value);
});
cidadeInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); marcarAtivo(itemAtivo + 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); marcarAtivo(itemAtivo - 1); }
  else if (e.key === 'Enter' && itemAtivo >= 0) {
    e.preventDefault();
    escolherCidade(cidadeLista.querySelectorAll('.combo-item')[itemAtivo].dataset.cidade);
  } else if (e.key === 'Escape') { abrirLista(false); }
});
cidadeLista.addEventListener('mousedown', e => {
  const item = e.target.closest('.combo-item');
  if (item) { e.preventDefault(); escolherCidade(item.dataset.cidade); }
});
cidadeInput.addEventListener('blur', () => {
  setTimeout(() => {
    abrirLista(false);
    const texto = cidadeInput.value.trim();
    cidadeSelecionada = encontrarCidade(texto);
    if (texto && !cidadeSelecionada) {
      cidadeAviso.textContent = 'Essa cidade não está na lista. Vamos usar a média das cidades que atendemos.';
      cidadeAviso.classList.add('on');
    } else if (cidadeSelecionada) {
      cidadeInput.value = cidadeSelecionada;
    }
  }, 150);
});

// ── Acordeão dos serviços ────────────────────────────────────────────────
document.querySelectorAll('.card-abrir').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    const abrindo = !card.classList.contains('aberto');
    card.classList.toggle('aberto', abrindo);
    btn.setAttribute('aria-expanded', abrindo ? 'true' : 'false');
    btn.childNodes[0].nodeValue = abrindo ? 'Fechar ' : 'Ver como funciona ';
    // a animação nunca decide se o conteúdo aparece: se a transição não rodar, mostra sem ela
    if (abrindo) setTimeout(() => {
      const alvo = card.querySelector('.card-mais');
      if (alvo && alvo.getBoundingClientRect().height < 4) card.classList.add('sem-transicao');
    }, 500);
  });
});

// ── Calculadora ──────────────────────────────────────────────────────────
let ultimo = null;   // dados do gráfico, para o balão do hover

function lerCampos() {
  const placas = parseFloat($('placas').value);
  const potenciaW = parseFloat($('potPlaca').value);
  const tarifa = parseFloat($('tarifa').value);
  const real = parseFloat($('desempReal').value);
  const tempo = parseFloat(selTempo.value);
  const cidadeTexto = cidadeInput.value.trim();
  const faltando = [];
  if (!(placas > 0)) faltando.push('a quantidade de placas');
  if (!(potenciaW > 0)) faltando.push('a potência da placa');
  if (!cidadeTexto) faltando.push('a cidade');
  if (!(real > 0) && !(tempo > 0)) faltando.push('há quanto tempo não faz limpeza');
  if (!(tarifa > 0)) faltando.push('a tarifa');
  const desempenho = real > 0 ? real / 100 : tempo;
  return { placas, potenciaW, tarifa, desempenho, cidadeTexto, faltando };
}

function listaEm(itens) {
  if (itens.length === 1) return itens[0];
  return itens.slice(0, -1).join(', ') + ' e ' + itens[itens.length - 1];
}

$('calcForm').addEventListener('submit', e => {
  e.preventDefault();
  const c = lerCampos();
  const erro = $('calcErro');
  if (c.faltando.length) {
    erro.textContent = 'Falta informar ' + listaEm(c.faltando) + '.';
    erro.classList.add('on');
    return;
  }
  erro.classList.remove('on');
  const cidade = encontrarCidade(c.cidadeTexto);
  const r = calcularPerda({
    placas: c.placas, potenciaW: c.potenciaW, cidade, desempenho: c.desempenho, tarifa: c.tarifa,
  });

  $('resDesemp').textContent = Math.round(c.desempenho * 100) + '%';
  $('resAno').textContent = moeda(r.perdaReais);
  $('resMes').textContent = moeda(r.perdaReais / 12);
  $('resKwh').textContent = kwhTexto(r.perdaKwh);
  $('resPior').textContent = MESES[r.piorMes.indice] + ', ' + moeda(r.piorMes.reais);

  const msg = mensagemDiagnostico({
    placas: c.placas, potenciaW: c.potenciaW, kwp: r.kwp, cidade: cidade || c.cidadeTexto,
    foraDaLista: r.foraDaLista, desempenho: c.desempenho, perdaReais: r.perdaReais,
  });
  $('ctaZap').href = linkWhats(msg);

  ultimoCalculo = {
    placas: c.placas, potenciaW: c.potenciaW, kwp: r.kwp, cidade: cidade || c.cidadeTexto,
    foraDaLista: r.foraDaLista, desempenho: c.desempenho, tarifa: c.tarifa, perdaAno: r.perdaReais,
  };
  if (!$('fCidade').value) $('fCidade').value = c.cidadeTexto;

  ultimo = { esp: r.esperado, real: r.real, tarifa: c.tarifa };
  $('grafico').classList.remove('exemplo');
  desenhar();
  if (ehCampanha) {
    moverResumoParaSlot();
    mrResumo.scrollIntoView({ behavior: semAnimacao ? 'instant' : 'smooth', block: 'start' });
  } else {
    moverResumoParaModal();
    mostrarPasso('mrResumo');
    abrirModal();
  }
  avisar('sg:calculo', { perdaAno: r.perdaReais, cidade: cidade || c.cidadeTexto });
});

// ── Modal do resultado ───────────────────────────────────────────────────
// #mrResumo é um nó só, que se move entre o modal (no cálculo, "salta na
// cara") e o slot dentro da calculadora (depois de fechar, fica aberto ali
// com os mesmos botões — pedido dele).
const modalResultado = $('modalResultado');
const mrCaixa = document.querySelector('#modalResultado .mr-caixa');
const mrResumo = $('mrResumo');
const calcResultadoSlot = $('calcResultadoSlot');
let focoAntesModal = null;

function mostrarPasso(idPasso) {
  modalResultado.querySelectorAll('.mr-passo').forEach(p => p.classList.toggle('on', p.id === idPasso));
  mrCaixa.scrollTop = 0;
}

function moverResumoParaModal() {
  if (mrResumo.parentElement !== mrCaixa) mrCaixa.insertBefore(mrResumo, $('mrDuvidas'));
}

function moverResumoParaSlot() {
  mrResumo.classList.add('on');
  calcResultadoSlot.appendChild(mrResumo);
}

function abrirModal() {
  focoAntesModal = document.activeElement;
  modalResultado.classList.add('on');
  modalResultado.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('mrFechar').focus();
}

function fecharModalResultado() {
  modalResultado.classList.remove('on');
  modalResultado.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  moverResumoParaSlot();
  if (focoAntesModal && focoAntesModal.focus) focoAntesModal.focus();
}

$('mrFechar').addEventListener('click', fecharModalResultado);
$('mrFecharSucesso').addEventListener('click', fecharModalResultado);
$('mrVoltar').addEventListener('click', () => {
  // Se o resumo já está aberto fora do modal, "voltar" é só fechar.
  if (mrResumo.parentElement === mrCaixa) mostrarPasso('mrResumo');
  else fecharModalResultado();
});
$('ctaZap').addEventListener('click', fecharModalResultado);
$('ctaDuvidas').addEventListener('click', () => {
  if (ultimoCalculo && (ehCampanha || !$('mCidade').value)) $('mCidade').value = ultimoCalculo.cidade;
  mostrarPasso('mrDuvidas');
  if (!modalResultado.classList.contains('on')) abrirModal();
  $('mNome').focus();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalResultado.classList.contains('on')) fecharModalResultado();
});

// ── Gráfico esperado x realizado ─────────────────────────────────────────
const barras = $('barras');
const tip = $('grTip');
let ultimaAnimacaoGrafico = 0;
let animandoGrafico = false;
const INTERVALO_MIN_ANIMACAO = 1600;

function desenhar() {
  if (!ultimo) return;
  const max = Math.max.apply(null, ultimo.esp) || 1;
  barras.textContent = '';
  for (let i = 0; i < 12; i++) {
    const he = ultimo.esp[i] / max * 100;
    const hr = ultimo.real[i] / max * 100;
    const b = document.createElement('div');
    b.className = 'b';
    b.dataset.i = i;
    b.dataset.hr = hr.toFixed(2);
    b.style.setProperty('--he', he.toFixed(2) + '%');
    b.style.setProperty('--hr', hr.toFixed(2) + '%');
    b.innerHTML = '<div class="b-st"><div class="b-esp"></div><div class="b-real"></div></div><span class="b-m">' + MESES[i] + '</span>';
    barras.appendChild(b);
  }
  if (!semAnimacao) requestAnimationFrame(() => reiniciarGrafico(true));
}

// A altura final é o padrão; a animação só recolhe e refaz as barras. Se o
// observador falhar, o gráfico aparece completo em vez de sumir.
function reiniciarGrafico(forcar) {
  if (!ultimo || semAnimacao || animandoGrafico) return;
  const agora = Date.now();
  if (!forcar && agora - ultimaAnimacaoGrafico < INTERVALO_MIN_ANIMACAO) return;
  ultimaAnimacaoGrafico = agora;
  animandoGrafico = true;
  barras.classList.add('sem-transicao', 'aguardando');
  barras.querySelectorAll('.b').forEach((b, i) => b.style.setProperty('--atraso', (i * 55) + 'ms'));
  void barras.offsetWidth;
  barras.classList.remove('sem-transicao');
  requestAnimationFrame(() => barras.classList.remove('aguardando'));
  setTimeout(() => { animandoGrafico = false; }, 1450);
}

if ('IntersectionObserver' in window) {
  new IntersectionObserver(entradas => {
    entradas.forEach(ent => { if (ent.isIntersecting) reiniciarGrafico(false); });
  }, { threshold: .3 }).observe(barras);
}

function esconderTip() {
  tip.classList.remove('on');
  barras.querySelectorAll('.b').forEach(x => x.classList.remove('hl-real', 'hl-perda'));
}

barras.addEventListener('mousemove', e => {
  const b = e.target.closest('.b');
  if (!b || !ultimo) { esconderTip(); return; }
  const st = b.querySelector('.b-st').getBoundingClientRect();
  const topoVerde = st.bottom - st.height * parseFloat(b.dataset.hr) / 100;
  barras.querySelectorAll('.b').forEach(x => x.classList.remove('hl-real', 'hl-perda'));
  b.classList.add(e.clientY >= topoVerde ? 'hl-real' : 'hl-perda');
  const i = +b.dataset.i, esp = ultimo.esp[i], real = ultimo.real[i], perda = esp - real;
  tip.innerHTML = '<b>' + MESES[i] + '</b><br>Esperado: ' + kwhTexto(esp) +
    '<br><span class="tv">Gerado: ' + kwhTexto(real) + '</span><br><span class="tp">Perdido: ' +
    kwhTexto(perda) + ' · ' + moeda(perda * ultimo.tarifa) + '</span>';
  const caixa = barras.parentElement.getBoundingClientRect();
  tip.style.left = (st.left - caixa.left + st.width / 2) + 'px';
  tip.style.top = (st.top - caixa.top - 10) + 'px';
  tip.classList.add('on');
});
barras.addEventListener('mouseleave', esconderTip);

// Gráfico de exemplo, em cinza, até a pessoa calcular a usina dela.
(function desenharExemplo() {
  const r = calcularPerda({
    placas: EXEMPLO.placas, potenciaW: EXEMPLO.potenciaW, cidade: EXEMPLO.cidade,
    desempenho: EXEMPLO.desempenho, tarifa: CALCULO.TARIFA_PADRAO,
  });
  ultimo = { esp: r.esperado, real: r.real, tarifa: CALCULO.TARIFA_PADRAO };
  desenhar();
  ultimo = null;
})();

// ── Carrossel de fotos ───────────────────────────────────────────────────
// A lista vem de assets/fotos/fotos.json, gerado pelo ATUALIZAR FOTOS.bat.
// Sem foto nenhuma, o bloco inteiro some em vez de mostrar aviso a visitante.
const trilho = $('carTrilho');
const pontos = $('carPontos');
const car = $('carrossel');
let slideAtual = 0, totalSlides = 0, timerCar = null, fotosCar = [];

function esconderCarrossel() {
  car.hidden = true;
  pontos.hidden = true;
}

function montarCarrossel(lista) {
  fotosCar = lista;
  totalSlides = lista.length;
  trilho.classList.toggle('unico', totalSlides === 1);
  const varias = totalSlides > 1;
  car.querySelector('.car-prev').style.display = varias ? 'flex' : 'none';
  car.querySelector('.car-next').style.display = varias ? 'flex' : 'none';
  pontos.textContent = '';
  if (varias) lista.forEach((_, i) => {
    const p = document.createElement('button');
    p.className = 'car-ponto' + (i === 0 ? ' on' : '');
    p.type = 'button';
    p.dataset.i = i;
    p.setAttribute('aria-label', 'Foto ' + (i + 1));
    pontos.appendChild(p);
  });
  irPara(0, '');
  if (!semAnimacao && varias) reiniciarTimer();
}

function slideFoto(f, classe, principal, indice) {
  const d = document.createElement('div');
  d.className = 'car-slide ' + classe;
  d.dataset.i = indice;
  const img = document.createElement('img');
  img.src = 'assets/fotos/' + encodeURIComponent(f.arquivo);
  img.alt = principal ? (f.legenda || 'Foto de atendimento da Solar Green') : '';
  if (!principal) img.setAttribute('aria-hidden', 'true');
  img.loading = 'lazy';
  img.decoding = 'async';
  d.appendChild(img);
  if (principal && f.legenda) {
    const l = document.createElement('div');
    l.className = 'car-legenda';
    l.textContent = f.legenda;
    d.appendChild(l);
  }
  return d;
}

function irPara(i, direcao) {
  if (!totalSlides) return;
  slideAtual = (i + totalSlides) % totalSlides;
  trilho.textContent = '';
  if (totalSlides === 1) {
    trilho.appendChild(slideFoto(fotosCar[0], 'car-principal', true, 0));
  } else {
    const ant = (slideAtual - 1 + totalSlides) % totalSlides;
    const prox = (slideAtual + 1) % totalSlides;
    trilho.appendChild(slideFoto(fotosCar[ant], 'car-lateral', false, ant));
    trilho.appendChild(slideFoto(fotosCar[slideAtual], 'car-principal', true, slideAtual));
    trilho.appendChild(slideFoto(fotosCar[prox], 'car-lateral', false, prox));
  }
  pontos.querySelectorAll('.car-ponto').forEach((p, k) => p.classList.toggle('on', k === slideAtual));
  car.classList.remove('mov-proximo', 'mov-anterior');
  if (direcao && !semAnimacao) {
    void car.offsetWidth;
    car.classList.add(direcao === 'anterior' ? 'mov-anterior' : 'mov-proximo');
  }
}

function reiniciarTimer() {
  if (ehCampanha) return;
  clearInterval(timerCar);
  timerCar = setInterval(() => irPara(slideAtual + 1, 'proximo'), 5200);
}

$('carPrev').addEventListener('click', () => { irPara(slideAtual - 1, 'anterior'); reiniciarTimer(); });
$('carNext').addEventListener('click', () => { irPara(slideAtual + 1, 'proximo'); reiniciarTimer(); });
pontos.addEventListener('click', e => {
  const p = e.target.closest('.car-ponto');
  if (!p) return;
  const i = +p.dataset.i;
  irPara(i, i < slideAtual ? 'anterior' : 'proximo');
  reiniciarTimer();
});
car.addEventListener('mouseenter', () => clearInterval(timerCar));
car.addEventListener('mouseleave', () => { if (totalSlides > 1 && !semAnimacao) reiniciarTimer(); });

// ── Lightbox: clicar numa foto abre ela inteira ──────────────────────────
const lightbox = $('lightbox');
const lbImg = $('lbImg');
const lbLegenda = $('lbLegenda');
let focoAntes = null;

function abrirLightbox(i) {
  const f = fotosCar[i];
  if (!f) return;
  focoAntes = document.activeElement;
  lbImg.src = 'assets/fotos/' + encodeURIComponent(f.arquivo);
  lbImg.alt = f.legenda || '';
  lbLegenda.textContent = f.legenda || '';
  lightbox.classList.add('on');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  clearInterval(timerCar);
  $('lbFechar').focus();
}

function fecharLightbox() {
  lightbox.classList.remove('on');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (totalSlides > 1 && !semAnimacao) reiniciarTimer();
  if (focoAntes && focoAntes.focus) focoAntes.focus();
}

trilho.addEventListener('click', e => {
  const slide = e.target.closest('.car-slide');
  if (!slide) return;
  const i = parseInt(slide.dataset.i, 10);
  if (!isNaN(i)) abrirLightbox(i);
});
$('lbFechar').addEventListener('click', fecharLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) fecharLightbox(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox.classList.contains('on')) fecharLightbox();
});

fetch(ehCampanha ? 'assets/fotos/campanha/fotos.json' : 'assets/fotos/fotos.json', { cache: 'no-cache' })   // revalida a cada visita: a lista muda sem trocar a URL
  .then(r => { if (!r.ok) throw new Error('sem lista'); return r.json(); })
  .then(lista => { if (Array.isArray(lista) && lista.length) montarCarrossel(lista); else esconderCarrossel(); })
  .catch(esconderCarrossel);

// ── Formulário de contato ────────────────────────────────────────────────
// Grava na antessala do ERP (js/enviar-lead.js). Nada de "recebido" antes de o
// servidor confirmar: sem confirmação em 8 s, a tela leva a pessoa ao WhatsApp.
const formulario = $('form');
let inicioFormulario = 0;   // primeira digitação, para medir quanto tempo levou o preenchimento
formulario.addEventListener('input', () => { if (!inicioFormulario) inicioFormulario = Date.now(); });

function enviosRecentes() {
  try {
    const lista = JSON.parse(sessionStorage.getItem('sg_envios') || '[]');
    return lista.filter(t => Date.now() - t < LEADS.janelaEnviosMs);
  } catch (e) { return []; }
}
function registrarEnvio() {
  try { sessionStorage.setItem('sg_envios', JSON.stringify(enviosRecentes().concat([Date.now()]))); } catch (e) { /* segue */ }
}

// Lógica compartilhada pelo formulário de baixo e pelo formulário do modal:
// valida, barra robô e limite de envios, grava o lead. Quem chama decide como
// mostrar o erro (cada formulário tem seu próprio elemento) e o que fazer com 'ok'/'robo'.
async function tentarEnviarLead(dados, ui) {
  const { nome, zap, cidade, servico, site, consentimento, inicio } = dados;
  const { botao, textoOcioso, mostrarErro } = ui;
  if (nome.length < 2) { mostrarErro('Falta informar o seu nome.'); return null; }
  if (!telefoneValido(zap)) { mostrarErro('Confira o WhatsApp: precisa do DDD e do número, por exemplo (91) 98759-8592.'); return null; }
  if (!consentimento) { mostrarErro('Para enviar, marque a autorização de uso dos dados.'); return null; }

  // Campo escondido que só robô preenche: finge que deu certo e não grava nada.
  if (site) return 'robo';
  if (enviosRecentes().length >= LEADS.maxEnviosPorSessao) {
    mostrarErro('Já recebemos o seu contato. Para falar agora, use o WhatsApp.', true);
    return null;
  }

  mostrarErro('');
  botao.disabled = true;
  botao.textContent = 'Enviando';
  const tempo = inicio ? Date.now() - inicio : 0;
  try {
    const idLead = await enviarLead(montarLead({ nome, zap, cidade, servico }, ultimoCalculo, {
      pagina: location.pathname, ...utm, tempoPreenchimentoMs: tempo, suspeito: tempo < LEADS.tempoMinimoMs,
    }));
    registrarEnvio();
    avisar('sg:lead', { id: idLead, saiDaPagina: !!ui.saiDaPagina });
    return 'ok';
  } catch (err) {
    botao.disabled = false;
    botao.textContent = textoOcioso;
    mostrarErro('Não conseguimos enviar agora. O melhor caminho é o WhatsApp.', true);
    return null;
  }
}

formulario.addEventListener('submit', async e => {
  e.preventDefault();
  const erro = $('formErro');
  const nome = $('fNome').value.trim();
  const zap = $('fZap').value.trim();
  const cidade = $('fCidade').value.trim();
  const servico = $('fServico').value;
  const mostrarErro = (texto, comLink) => {
    if (!texto) { erro.style.display = 'none'; return; }
    erro.textContent = texto;
    if (comLink) {
      erro.appendChild(document.createTextNode(' '));
      const a = document.createElement('a');
      a.href = linkWhats('Olá! Meu nome é ' + nome + (cidade ? ', sou de ' + cidade : '') + '. Preciso de: ' + servico + '.');
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Falar no WhatsApp';
      erro.appendChild(a);
    }
    erro.style.display = 'block';
  };
  const resultado = await tentarEnviarLead(
    { nome, zap, cidade, servico, site: $('fSite').value, consentimento: $('fOk').checked, inicio: inicioFormulario },
    { botao: $('btnForm'), textoOcioso: 'Quero ser chamado', mostrarErro, saiDaPagina: true },
  );
  if (resultado === 'ok' || resultado === 'robo') window.location.href = 'obrigado.html';
});

// ── Formulário "Tirar dúvidas" dentro do modal do resultado ─────────────
const mrForm = $('mrForm');
let inicioModal = 0;
mrForm.addEventListener('input', () => { if (!inicioModal) inicioModal = Date.now(); });

mrForm.addEventListener('submit', async e => {
  e.preventDefault();
  const mrErro = $('mrErro');
  const nome = $('mNome').value.trim();
  const zap = $('mZap').value.trim();
  const cidade = $('mCidade').value.trim();
  const servico = $('mServico').value;
  const mostrarErro = (texto, comLink) => {
    if (!texto) { mrErro.classList.remove('on'); mrErro.textContent = ''; return; }
    mrErro.textContent = texto;
    if (comLink) {
      mrErro.appendChild(document.createTextNode(' '));
      const a = document.createElement('a');
      a.href = linkWhats('Olá! Meu nome é ' + nome + (cidade ? ', sou de ' + cidade : '') + '. Preciso de: ' + servico + '.');
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Falar no WhatsApp';
      mrErro.appendChild(a);
    }
    mrErro.classList.add('on');
  };
  const resultado = await tentarEnviarLead(
    { nome, zap, cidade, servico, site: $('mSite').value, consentimento: $('mOk').checked, inicio: inicioModal },
    { botao: $('mrBtn'), textoOcioso: 'Quero ser chamado', mostrarErro },
  );
  if (resultado === 'ok' || resultado === 'robo') {
    $('mrZapSucesso').href = $('ctaZap').href;
    mostrarPasso('mrSucesso');
  }
});
