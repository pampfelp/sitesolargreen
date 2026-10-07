// Aviso de cookies e Meta Pixel. Roda em todas as páginas que carregam este arquivo.
// Nada do Meta é baixado antes de a pessoa clicar em "Aceitar". Recusar não muda nada
// no uso do site. A escolha fica no localStorage do navegador (sg_cookies).
//
// Eventos enviados ao Meta, só com aceite:
//   PageView      ao abrir qualquer página
//   CalculoPerda  quando a calculadora mostra o resultado (evento próprio)
//   Contact       clique em qualquer botão de WhatsApp
//   Lead          contato gravado no ERP; o eventID é o id do documento em leads_site,
//                 o mesmo que a API de Conversões deve usar depois pra não contar em dobro
import { RASTREIO } from './config.js?v=2026-10-07c';

const CHAVE = 'sg_cookies';
const LEAD_PENDENTE = 'sg_lead_pendente';   // formulário de baixo sai da página antes do envio

function lerEscolha() {
  try {
    const e = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    return e && e.versao === RASTREIO.versaoAviso ? e.escolha : null;
  } catch (err) { return null; }
}

function salvarEscolha(escolha) {
  try { localStorage.setItem(CHAVE, JSON.stringify({ escolha, versao: RASTREIO.versaoAviso, em: new Date().toISOString() })); } catch (err) { /* segue sem lembrar */ }
}

// ── Pixel ────────────────────────────────────────────────────────────────
let pixelLigado = false;

function ligarPixel() {
  if (pixelLigado || !RASTREIO.metaPixelId) return;
  pixelLigado = true;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', RASTREIO.metaPixelId);
  window.fbq('track', 'PageView');
  dispararLeadPendente();
}

function enviar(tipo, evento, dados, opcoes) {
  if (!pixelLigado || !window.fbq) return;
  window.fbq(tipo, evento, dados || {}, opcoes || {});
}

function dispararLeadPendente() {
  let id = null;
  try { id = sessionStorage.getItem(LEAD_PENDENTE); sessionStorage.removeItem(LEAD_PENDENTE); } catch (err) { /* segue */ }
  if (id) enviar('track', 'Lead', { content_name: 'formulario_site' }, { eventID: id });
}

document.addEventListener('sg:calculo', () => {
  enviar('trackCustom', 'CalculoPerda');
});

document.addEventListener('sg:lead', e => {
  const { id, saiDaPagina } = e.detail || {};
  if (!id) return;
  // O formulário de baixo troca de página na hora; o Lead sai na página de obrigado.
  if (saiDaPagina) {
    if (lerEscolha() === 'aceito') { try { sessionStorage.setItem(LEAD_PENDENTE, id); } catch (err) { /* segue */ } }
    return;
  }
  enviar('track', 'Lead', { content_name: 'formulario_resultado' }, { eventID: id });
});

document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
  if (a) enviar('track', 'Contact', { content_name: a.getAttribute('data-evento') || 'whatsapp' });
});

// ── Aviso ────────────────────────────────────────────────────────────────
let aviso = null;

function fecharAviso() {
  if (aviso && aviso.open) aviso.close();
  document.body.classList.remove('banner-aberto');
}

function abrirAviso() {
  if (!aviso) {
    aviso = document.createElement('dialog');
    aviso.className = 'aviso-cookies';
    aviso.setAttribute('aria-labelledby', 'titulo-cookies');
    aviso.innerHTML =
      '<h2 id="titulo-cookies" tabindex="-1">Deseja seguir para o site?</h2>' +
      '<p>Ao selecionar “Seguir para o Site”, você aceita os cookies do Meta para medir anúncios e mostrar a Solar Green a quem já visitou o site. Você pode continuar sem cookies. ' +
      '<a href="privacidade.html#cookies">Política de privacidade</a></p>' +
      '<div class="ac-botoes"><button type="button" class="ac-aceitar">Seguir para o Site</button>' +
      '<button type="button" class="ac-recusar">Continuar sem cookies</button></div>';
    aviso.querySelector('.ac-aceitar').addEventListener('click', () => { salvarEscolha('aceito'); fecharAviso(); ligarPixel(); });
    const recusar = () => {
      const tinhaAceitado = pixelLigado;
      salvarEscolha('recusado');
      fecharAviso();
      // O script do Meta já carregado não sai da memória; recarregar garante que para de medir.
      if (tinhaAceitado) location.reload();
    };
    aviso.querySelector('.ac-recusar').addEventListener('click', recusar);
    aviso.addEventListener('cancel', e => { e.preventDefault(); recusar(); });
    document.body.appendChild(aviso);
  }
  if (aviso.open) return;
  aviso.showModal();
  aviso.querySelector('h2').focus();
  document.body.classList.add('banner-aberto');
}

// Link pra mudar a escolha: no rodapé (se existir) e em qualquer elemento [data-preferencias-cookies].
function ligarLinksPreferencia() {
  const fim = document.querySelector('.f-fim');
  if (fim && !fim.querySelector('.pref-cookies')) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pref-cookies';
    b.textContent = 'Preferências de cookies';
    fim.appendChild(b);
  }
  document.querySelectorAll('.pref-cookies, [data-preferencias-cookies]').forEach(el => {
    el.hidden = false;
    el.addEventListener('click', abrirAviso);
  });
}

if (RASTREIO.metaPixelId) {
  ligarLinksPreferencia();
  const escolha = lerEscolha();
  if (escolha === 'aceito') ligarPixel();
  else if (escolha !== 'recusado' && !(location.pathname.endsWith('/privacidade.html') && location.hash === '#cookies')) abrirAviso();
}
