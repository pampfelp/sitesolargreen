import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = readFileSync(join(raiz, 'conta-alta-energia-solar.html'), 'utf8');
const style = base.match(/<style>([\s\S]*?)<\/style>/)?.[1];
const header = base.match(/<header>[\s\S]*?<\/header>/)?.[0];
const end = base.match(/<footer>[\s\S]*?<\/body>[\s\S]*$/)?.[0];
const version = base.match(/css\/style\.css\?v=([0-9a-z-]+)/)?.[1];
if (!style || !header || !end || !version) throw new Error('Modelo de conta alta incompleto');

const area = '<a class="ca-link" href="index.html#cobertura">lista de cidades atendidas</a>';
const conta = '<a class="ca-link" href="conta-alta-energia-solar.html">análise de conta alta</a>';

const paginas = [
  {
    file: 'manutencao-limpeza-energia-solar.html', event: 'manutencao_limpeza',
    title: 'Manutenção e limpeza de energia solar em Belém | Solar Green Suporte',
    description: 'Manutenção e limpeza de energia solar em Belém, inclusive em usinas instaladas por terceiros. A Solar Green faz vistoria diagnóstica antes de intervir.',
    kicker: 'Cuidado com a sua usina', h1: 'Manutenção e limpeza de <em>energia solar</em> em Belém',
    lede: 'Atendemos também usinas instaladas por outras empresas. Antes de qualquer intervenção, fazemos uma vistoria diagnóstica para avaliar a condição e a geração do sistema.',
    cta: 'Quero avaliar minha usina', whatsapp: 'Olá! Quero avaliar a geração e a necessidade de manutenção ou limpeza da minha usina solar.',
    checksTitle: 'O que avaliamos', checks: ['Geração e alarmes', 'Placas e conexões', 'Inversor e cabos', 'Relatório fotográfico'],
    stepsTitle: 'Toda intervenção começa pela vistoria diagnóstica', steps: [
      ['Entendemos o histórico', 'Reunimos os dados de geração disponíveis, verificamos quedas de produção e possíveis alarmes.'],
      ['Fazemos a vistoria diagnóstica', 'Avaliamos módulos, conexões, inversor e demais componentes pertinentes, inclusive em usinas instaladas por terceiros.'],
      ['Combinamos a intervenção', 'Explicamos o que foi encontrado e definimos com o cliente a limpeza, a correção ou uma investigação adicional antes de executar.'],
    ],
    cardsKicker: 'Sinais de atenção', cardsTitle: 'Quando vale investigar a usina?', cards: [
      ['Geração caiu', 'Uma queda persistente no aplicativo do inversor merece comparação com o histórico e a época do ano.'],
      ['Há alarmes ou desligamentos', 'Mensagens do inversor ou interrupções repetidas podem indicar uma falha que a limpeza não resolve.'],
      ['Sujeira se acumulou', 'Poeira, folhas e outras condições locais podem pedir limpeza técnica. A aparência sozinha não mede a perda de geração.'],
      ['A conta voltou a subir', `Pode haver aumento de consumo, menos geração ou diferença na compensação. Veja também nossa ${conta}.`],
    ],
    prepKicker: 'Antes da visita', prepTitle: 'O que enviar na primeira conversa', prep: [
      'Histórico de geração do aplicativo do inversor, se disponível.',
      'Foto ou descrição dos alarmes e da sujeira observada, sem subir no telhado para isso.',
      'Data aproximada da última limpeza ou manutenção, se souber.',
      'Faturas recentes, se o motivo do contato for aumento da conta.',
    ],
    prepNote: 'A Solar Green registra o trabalho de limpeza e manutenção em relatório fotográfico conforme o escopo contratado. Correções adicionais são combinadas antes da execução. Não há promessa de economia específica sem medir o caso.',
    photo: { src: 'assets/fotos/Antes e depois da limpeza.jpg', alt: 'Registro de módulos antes e depois de limpeza da Solar Green', caption: 'Registro de antes e depois de limpeza do acervo da Solar Green.' },
    faqs: [
      ['Vocês atendem usinas instaladas por outra empresa?', 'Sim. Fazemos primeiro uma vistoria diagnóstica para avaliar a instalação e seu desempenho. Só depois indicamos e combinamos qualquer intervenção.'],
      ['De quanto em quanto tempo devo limpar as placas?', 'A necessidade varia com o local, a chuva, a sujeira e o histórico de geração. Avaliar o desempenho é mais útil do que aplicar o mesmo prazo a todo telhado.'],
      ['A limpeza resolve toda conta alta?', `Não. Consumo maior, falha da usina e compensação na fatura são causas diferentes. Comece pela ${conta}.`],
      ['Toda manutenção inclui reparos?', 'O diagnóstico aponta o que precisa ser feito. O escopo da limpeza e de eventuais correções é combinado antes da execução.'],
      ['Atendem minha cidade?', `Atendemos Belém e as cidades da ${area}.`],
    ],
    endTitle: 'Sua usina merece uma avaliação antes de qualquer intervenção', endText: 'Conte quando começou a queda de geração ou o aumento da conta. Se tiver, envie o histórico do aplicativo do inversor e faturas recentes.',
  },
  {
    file: 'monitoramento-energia-solar.html', event: 'monitoramento_solar',
    title: 'Monitoramento de energia solar em Belém | Solar Green Suporte',
    description: 'Acompanhe a geração da sua usina solar em Belém. A Solar Green compara o esperado com o realizado, observa alarmes e orienta quando há queda de desempenho.',
    kicker: 'Acompanhe sua usina', h1: 'Monitoramento de <em>energia solar</em> em Belém',
    lede: 'Uma usina pode perder geração sem mudar de aparência. Acompanhamos os dados para identificar sinais de queda e orientar a próxima ação.',
    cta: 'Quero monitorar minha usina', whatsapp: 'Olá! Quero saber como funciona o monitoramento da minha usina solar.',
    checksTitle: 'O que acompanhamos', checks: ['Geração registrada', 'Esperado e realizado', 'Alarmes do inversor', 'Histórico da usina'],
    stepsTitle: 'Como começa o acompanhamento', steps: [
      ['Conferimos o acesso', 'Verificamos os dados disponíveis na plataforma do fabricante do inversor.'],
      ['Comparamos a geração', 'Observamos o realizado em relação ao esperado, considerando o histórico e a época do ano.'],
      ['Orientamos a ação', 'Se houver sinal de anomalia, indicamos a investigação ou visita necessária.'],
    ],
    cardsKicker: 'Desempenho', cardsTitle: 'O que o monitoramento ajuda a perceber', cards: [
      ['Queda gradual de produção', 'O histórico pode revelar perda de geração antes que a diferença fique clara na fatura.'],
      ['Alarme ou inversor offline', 'Sem dados recentes, é preciso verificar conexão e operação antes de concluir que a usina parou.'],
      ['Diferença entre meses', 'A comparação leva em conta a sazonalidade. Um mês isolado não basta para atribuir a queda a uma falha.'],
      ['Necessidade de visita', 'A triagem remota ajuda a priorizar, mas não substitui inspeção e medições presenciais quando necessárias.'],
    ],
    prepKicker: 'Primeiro contato', prepTitle: 'O que ajuda a iniciar o monitoramento', prep: [
      'Marca e modelo do inversor, se souber.',
      'Acesso atual ao aplicativo ou portal de geração, se existir.',
      'Potência instalada e data aproximada de instalação, se disponíveis.',
      'Relato de queda de geração ou de fatura alta que motivou o contato.',
    ],
    prepNote: `O acompanhamento é definido conforme o plano contratado e os dados disponíveis. Se a preocupação principal for a cobrança, veja também a ${conta}.`,
    faqs: [
      ['Preciso ter internet na usina?', 'A disponibilidade de dados remotos depende da comunicação do inversor. Se ela estiver indisponível, a causa deve ser verificada antes de prometer acompanhamento remoto.'],
      ['Monitoramento substitui manutenção presencial?', 'Não. Ele ajuda a identificar sinais e priorizar a visita, mas não confirma sozinho o estado de cabos, conexões e telhado.'],
      ['Uma queda em um único mês significa defeito?', 'Não necessariamente. Clima, sazonalidade e consumo precisam ser considerados junto do histórico de geração.'],
      ['Atendem minha cidade?', `A base é Belém; confira a ${area}.`],
    ],
    endTitle: 'Quer saber se sua usina está gerando como deveria?', endText: 'Conte qual inversor você usa e o que mudou na geração. A Solar Green orienta a forma de acompanhar o sistema.',
  },
  {
    file: 'fatura-equatorial-energia-solar.html', event: 'fatura_equatorial',
    title: 'Problema na fatura da Equatorial com energia solar? | Solar Green',
    description: 'Entenda como conferir geração, consumo e créditos na fatura da Equatorial quando a conta sobe mesmo com energia solar. Atendimento da Solar Green em Belém.',
    kicker: 'Fatura e compensação', h1: 'Problema na fatura da <em>Equatorial</em> com energia solar?',
    lede: 'Antes de atribuir a alta à distribuidora, comparamos a geração da usina, o consumo e os créditos lançados na fatura.',
    cta: 'Quero entender minha fatura', whatsapp: 'Olá! Tenho uma dúvida sobre a fatura da Equatorial e minha usina solar. Quero analisar os dados.',
    checksTitle: 'O que comparar', checks: ['Energia consumida', 'Energia injetada', 'Créditos e saldo', 'Histórico de geração'],
    stepsTitle: 'Um caminho para conferir a cobrança', steps: [
      ['Reunimos as faturas', 'Comparamos ciclos recentes, unidades beneficiárias e lançamentos de energia e créditos.'],
      ['Conferimos a usina', 'Verificamos se a geração registrada é compatível com a dúvida apresentada.'],
      ['Orientamos o próximo passo', 'Se persistir uma divergência, organizamos os dados para que o titular peça esclarecimento à distribuidora.'],
    ],
    cardsKicker: 'Possíveis causas', cardsTitle: 'A conta subiu: onde pode estar a diferença?', cards: [
      ['Geração menor', 'Falha ou queda de produção reduz a energia disponível para compensação. Compare o aplicativo do inversor com meses anteriores.'],
      ['Consumo maior', 'Mudança de rotina ou novos aparelhos podem elevar o consumo mesmo com a usina funcionando.'],
      ['Créditos e beneficiárias', 'Vale conferir energia injetada, créditos usados, saldo e a alocação entre unidades beneficiárias.'],
      ['Outras cobranças', 'Custo de disponibilidade para unidades do Grupo B e contribuição de iluminação pública podem permanecer. A situação exata depende da unidade e da fatura.'],
    ],
    prepKicker: 'Documentos', prepTitle: 'Separe estes dados antes de questionar a cobrança', prep: [
      'Faturas recentes, incluindo meses antes e depois da diferença.',
      'Histórico de geração do aplicativo do inversor, se disponível.',
      'Faturas das demais unidades beneficiárias, se houver.',
      'Protocolos anteriores da Equatorial relacionados ao caso, se existirem.',
    ],
    prepNote: 'A análise técnica ajuda a formular a pergunta correta. Somente a distribuidora pode explicar ou retificar seus próprios lançamentos; nenhuma correção ou prazo é garantido pela Solar Green. Consulte também as orientações da <a class="ca-link" href="https://www.gov.br/aneel/pt-br/assuntos/geracao-distribuida/" target="_blank" rel="noopener">ANEEL sobre geração distribuída</a>.',
    faqs: [
      ['Toda conta alta é erro da Equatorial?', 'Não. Primeiro é preciso separar aumento de consumo, menor geração, regras de cobrança e possível divergência de faturamento.'],
      ['Energia solar zera a fatura?', 'Não necessariamente. Algumas cobranças podem permanecer, e a compensação depende dos dados e das regras aplicáveis à unidade.'],
      ['A Solar Green consegue corrigir a fatura?', 'A Solar Green pode ajudar a analisar geração e faturas e orientar a documentação do caso. A decisão e eventual correção dos lançamentos cabem à distribuidora.'],
      ['E se minha usina não estiver regularizada?', 'Regularização e homologação são serviços distintos da análise de uma cobrança. O primeiro passo é verificar a situação da conexão e os documentos existentes.'],
    ],
    endTitle: 'Quer separar problema da usina de problema da fatura?', endText: 'Envie as contas e o histórico de geração que tiver. A primeira análise indica quais dados faltam e qual caminho seguir.',
  },
  {
    file: 'goteira-telhado-energia-solar.html', event: 'goteira_solar',
    title: 'Goteira no telhado com energia solar em Belém | Solar Green',
    description: 'Goteira depois da instalação de placas solares? A Solar Green diagnostica a origem da infiltração e repara problemas ligados ao sistema em Belém e cidades atendidas.',
    kicker: 'Telhado e energia solar', h1: 'Goteira no telhado com <em>energia solar</em>?',
    lede: 'A infiltração pode ter mais de uma origem. Inspecionamos a área, identificamos a causa e combinamos o reparo adequado ao caso.',
    cta: 'Quero avaliar a goteira', whatsapp: 'Olá! Tenho uma goteira em telhado com placas solares e quero avaliar a causa e o reparo.',
    checksTitle: 'O que investigamos', checks: ['Ponto de entrada da água', 'Fixações da estrutura', 'Vedação e telhas', 'Relação com a instalação'],
    stepsTitle: 'Como tratamos uma infiltração', steps: [
      ['Ouvimos o histórico', 'Perguntamos quando a goteira apareceu e em quais condições ela ocorre.'],
      ['Inspecionamos a origem', 'Avaliamos telhas, vedação, fixações e outros pontos relacionados ao sistema solar.'],
      ['Combinamos o reparo', 'Depois de identificar a causa, definimos o serviço e o orçamento antes da execução.'],
    ],
    cardsKicker: 'Diagnóstico', cardsTitle: 'Por que olhar antes de vedar?', cards: [
      ['A água pode percorrer o telhado', 'A mancha interna nem sempre está exatamente abaixo do ponto de entrada.'],
      ['A fixação precisa ser avaliada', 'É importante verificar a relação entre suportes, telhas e vedação sem presumir que toda goteira veio das placas.'],
      ['Pode haver telha danificada', 'Danos e encaixes do telhado também podem permitir entrada de água.'],
      ['O reparo depende da causa', 'A intervenção necessária é definida após a inspeção. Escopo e materiais entram no orçamento do caso.'],
    ],
    prepKicker: 'Antes da visita', prepTitle: 'O que ajuda a localizar o problema', prep: [
      'Fotos da mancha ou da água dentro do imóvel, sem subir no telhado.',
      'Data aproximada em que a goteira começou.',
      'Informação sobre chuvas e direção do vento quando o problema aparece.',
      'Dados da instalação solar, se estiverem disponíveis.',
    ],
    prepNote: 'Diagnosticamos a origem e realizamos o reparo de goteiras ligadas à instalação solar. A causa, os materiais e os limites do serviço são definidos no atendimento e no orçamento.',
    faqs: [
      ['Toda goteira após instalar placas é causada pela usina?', 'Não. Telhas, vedação e outros pontos do telhado também precisam ser considerados. A inspeção identifica a origem.'],
      ['Precisa retirar os módulos?', 'Depende do acesso ao ponto de infiltração e do reparo necessário. Isso é decidido após a avaliação.'],
      ['Vocês fazem o reparo?', 'Sim, quando o problema é ligado à instalação solar e o reparo é definido no escopo do atendimento.'],
      ['Atendem minha cidade?', `Confira a ${area} antes de solicitar visita.`],
    ],
    endTitle: 'Não deixe a goteira sem diagnóstico', endText: 'Conte quando ela aparece e envie fotos internas do local afetado. A Solar Green avalia a origem e o reparo possível.',
  },
  {
    file: 'diagnostico-rede-eletrica-consultoria.html', event: 'diagnostico_eletrico',
    title: 'Diagnóstico de rede elétrica e consultoria em Belém | Solar Green',
    description: 'Problemas elétricos ou dúvidas sobre consumo e energia solar? A Solar Green faz diagnóstico de rede elétrica e orienta os próximos passos em Belém e cidades atendidas.',
    kicker: 'Engenharia e diagnóstico', h1: 'Diagnóstico de <em>rede elétrica</em> e consultoria em Belém',
    lede: 'Investigamos os sinais e dados da instalação para orientar a solução técnica, com visita e medições quando o caso exigir.',
    cta: 'Quero explicar meu problema', whatsapp: 'Olá! Preciso de diagnóstico de rede elétrica ou consultoria de energia. Quero explicar o problema.',
    checksTitle: 'O que começamos a avaliar', checks: ['Sintomas relatados', 'Histórico de consumo', 'Quadros e circuitos', 'Usina solar, se houver'],
    stepsTitle: 'Como começa o diagnóstico elétrico', steps: [
      ['Entendemos o problema', 'Reunimos relatos, faturas, fotos e dados da instalação disponíveis.'],
      ['Definimos a vistoria', 'A visita e as medições necessárias são definidas conforme os sinais encontrados e o escopo contratado.'],
      ['Explicamos os próximos passos', 'O diagnóstico orienta correção, adequação ou análise adicional, sem presumir a causa antes da inspeção.'],
    ],
    cardsKicker: 'Quando procurar ajuda', cardsTitle: 'Situações que merecem avaliação', cards: [
      ['Desarmes ou oscilações', 'Interrupções recorrentes podem ter causas diferentes. O histórico ajuda a localizar o problema.'],
      ['Consumo inesperado', `Uma conta alta pede comparação entre uso do imóvel, geração solar e cobrança. Veja também a ${conta}.`],
      ['Ampliação de carga', 'Mudanças no imóvel podem exigir avaliação da instalação e, em certos casos, regularização com a distribuidora.'],
      ['Dúvida sobre a usina', 'A análise pode separar falha do sistema solar de questões da rede elétrica do imóvel.'],
    ],
    prepKicker: 'Primeira conversa', prepTitle: 'Informações úteis para orientar o atendimento', prep: [
      'Descrição do que acontece, quando começou e com que frequência.',
      'Faturas recentes e informação sobre novos equipamentos, se a dúvida for consumo.',
      'Fotos externas e seguras do quadro ou equipamento envolvido, sem abrir partes energizadas.',
      'Dados da usina solar e mensagens do inversor, se houver.',
    ],
    prepNote: 'O escopo de medições, relatório técnico e eventual ART deve ser definido no orçamento de cada caso. Não faça intervenções em partes energizadas por conta própria.',
    faqs: [
      ['O diagnóstico pode ser feito só por mensagem?', 'A primeira conversa organiza os dados, mas a causa pode exigir vistoria e medições presenciais.'],
      ['Vocês emitem laudo ou ART?', 'A necessidade e a entrega desses documentos dependem do serviço contratado e são definidas antes da execução.'],
      ['Consultoria e reparo são a mesma coisa?', 'A consultoria ajuda a definir o problema e o próximo passo. Uma correção física precisa de escopo e orçamento próprios.'],
      ['Atendem minha cidade?', `Atendemos Belém e as cidades da ${area}.`],
    ],
    endTitle: 'Explique o sintoma antes de escolher o serviço', endText: 'Envie as informações que tiver. A Solar Green orienta a primeira avaliação e informa quando uma visita é necessária.',
  },
];

const wa = text => `https://wa.me/5591987598592?text=${encodeURIComponent(text)}`;
const cards = items => items.map(([title, body]) => `<article class="ca-cause"><h3>${title}</h3><p>${body}</p></article>`).join('\n        ');
const checks = items => items.map(x => `<li>${x}</li>`).join('\n          ');
const steps = items => items.map(([title, body], i) => `<div class="ca-step"><span class="ca-step-n" aria-hidden="true">${i + 1}</span><div><h3>${title}</h3><p>${body}</p></div></div>`).join('\n        ');
const lis = items => items.map(x => `<li>${x}</li>`).join('\n        ');
const faqs = items => items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n        ');

for (const d of paginas) {
  const url = `https://solargreensuporte.com.br/${d.file}`;
  const image = d.photo ? `\n      <figure style="max-width:760px;margin:32px 0 0"><img src="${d.photo.src}" alt="${d.photo.alt}" loading="lazy" style="display:block;width:100%;height:auto;border-radius:16px"><figcaption style="margin-top:10px;color:var(--claro-soft);font-size:.85rem">${d.photo.caption}</figcaption></figure>` : '';
  const h = header.replaceAll('conta_alta', d.event);
  const f = end.replaceAll('conta_alta', d.event);
  const page = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${d.title}</title>
<meta name="description" content="${d.description}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#06241a">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<meta property="og:type" content="article">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Solar Green Suporte">
<meta property="og:title" content="${d.title}">
<meta property="og:description" content="${d.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://solargreensuporte.com.br/assets/og-home.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="css/style.css?v=${version}">
<link rel="preload" as="image" href="assets/hero-usina-mobile.webp" media="(max-width:700px)">
<link rel="preload" as="image" href="assets/hero-usina.webp" media="(min-width:701px)">
<script type="module" src="js/rastreio.js?v=${version}"></script>
<style>${style}</style>
</head>
<body>
<a class="pular" href="#principal">Pular para o conteúdo</a>
${h}
<main id="principal">
  <section class="ca-hero" id="topo" aria-labelledby="servico-titulo"><div class="wrap ca-grid"><div>
    <span class="ca-kicker">${d.kicker}</span><h1 id="servico-titulo">${d.h1}</h1>
    <p class="ca-lede">${d.lede}</p>
    <a class="ca-button" href="${wa(d.whatsapp)}" data-evento="whatsapp_${d.event}_hero" target="_blank" rel="noopener">${d.cta}</a>
  </div><div class="ca-check-card"><h2>${d.checksTitle}</h2><ul class="ca-check-list">${checks(d.checks)}</ul></div></div></section>
  <section class="branco ca-section" aria-labelledby="passos"><div class="wrap"><h2 id="passos">${d.stepsTitle}</h2><div class="ca-steps">${steps(d.steps)}</div></div></section>
  <section class="claro ca-section" aria-labelledby="situacoes"><div class="wrap"><span class="eyebrow">${d.cardsKicker}</span><h2 id="situacoes">${d.cardsTitle}</h2><div class="ca-causes">${cards(d.cards)}</div></div></section>
  <section class="branco ca-section" aria-labelledby="preparar"><div class="wrap ca-prose"><span class="eyebrow">${d.prepKicker}</span><h2 id="preparar">${d.prepTitle}</h2><ul>${lis(d.prep)}</ul><p>${d.prepNote}</p>${image}</div></section>
  <section class="claro ca-section" aria-labelledby="perguntas"><div class="wrap"><span class="eyebrow">Dúvidas comuns</span><h2 id="perguntas">Perguntas frequentes</h2><div class="ca-faq">${faqs(d.faqs)}</div></div></section>
  <section class="branco ca-section" aria-labelledby="area"><div class="wrap ca-area"><div><span class="eyebrow">Onde atendemos</span><h2 id="area">Belém e cidades atendidas pela Solar Green</h2><p>Atendemos em Belém e nas cidades da nossa área atual. Confira a ${area} antes de solicitar o atendimento.</p></div></div></section>
  <section class="ca-section ca-end" aria-labelledby="contato"><div class="wrap"><div><h2 id="contato">${d.endTitle}</h2><p>${d.endText}</p></div><a class="ca-button" href="${wa(d.whatsapp)}" data-evento="whatsapp_${d.event}_final" target="_blank" rel="noopener">Conversar pelo WhatsApp</a></div></section>
</main>
${f}`;
  writeFileSync(join(raiz, d.file), page, 'utf8');
  console.log(`gerada: ${d.file}`);
}
