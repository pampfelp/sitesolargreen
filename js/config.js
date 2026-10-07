// Dados fixos da empresa e parâmetros do cálculo, num lugar só.
// O HTML estático (para o Google e para quem chega sem JavaScript) repete o
// telefone, o endereço e o horário: o verificar-site.mjs confere que os textos
// batem com o que está aqui.

export const EMPRESA = {
  nome: 'Solar Green Suporte',
  telefoneWhats: '5591987598592',
  telefoneTela: '(91) 98759-8592',
  email: 'solargreensuporte@gmail.com',
  instagram: 'solargreensuporte',
  endereco: {
    rua: 'R. Municipalidade, 985',
    bairro: 'Umarizal',
    cidade: 'Belém',
    uf: 'PA',
    cep: '66.050-350',
  },
  horario: {
    dias: [1, 2, 3, 4, 5],          // segunda a sexta (0 = domingo)
    abre: 8,
    fecha: 18,
    fusoHoras: -3,                  // Belém não tem horário de verão
    texto: 'Segunda a sexta, 8h às 18h',
  },
};

export const CALCULO = {
  PR: 0.80,                         // perdas normais do sistema, padrão da casa
  // Decisão do Felipe (2026-09-29): a fonte nova (Global Solar Atlas) dá irradiação maior
  // que a antiga (CRESESB) e ele quer o resultado como era. Este fator desfaz a diferença no
  // fim da conta: é a razão entre o total anual de Belém na fonte antiga (1788,4 kWh/m²) e na
  // nova (1992,2). Vale igual para todas as cidades. Se a fonte mudar de novo, recalcular.
  AJUSTE_FONTE: 0.8977,
  POTENCIA_PLACA_W: 585,            // média de mercado, preenchida de saída
  TARIFA_PADRAO: 0.98,              // R$/kWh, reserva até a config do ERP existir
};

// hipótese: curva plausível, não medida (pendência "Medir a curva real de perda")
export const TEMPO_SEM_LIMPEZA = [
  { valor: 0.97, rotulo: 'Nos últimos 3 meses' },
  { valor: 0.94, rotulo: 'Entre 3 e 6 meses' },
  { valor: 0.88, rotulo: 'Entre 6 meses e 1 ano' },
  { valor: 0.82, rotulo: 'Mais de 1 ano' },
  { valor: 0.78, rotulo: 'Nunca fiz, ou não sei' },
];

// Exemplo mostrado em cinza no gráfico, antes de a pessoa calcular a dela.
export const EXEMPLO = { placas: 12, potenciaW: 585, cidade: 'Belém', desempenho: 0.82 };

// Config PÚBLICA do projeto Firebase (não é segredo: a segurança fica nas
// firestore.rules do ERP). É o mesmo projeto do ERP, porque os contatos do site
// caem numa antessala (`leads_site`) que o ERP promove para o funil.
export const FIREBASE = {
  projectId: 'solargreen-21313',
  appId: '1:980826142154:web:a7d053312f2ad5c240cb33',
  apiKey: 'AIzaSyC50rNjz7cd_1_aWDBMuz84QqOFwPRV1aE',
  authDomain: 'solargreen-21313.firebaseapp.com',
};

export const LEADS = {
  colecao: 'leads_site',
  sdk: 'https://www.gstatic.com/firebasejs/10.14.1/',
  timeoutMs: 8000,                  // sem confirmação do servidor nesse tempo, a tela leva ao WhatsApp
  tempoMinimoMs: 1500,              // formulário preenchido mais rápido que isso é marcado como suspeito
  maxEnviosPorSessao: 3,
  janelaEnviosMs: 10 * 60 * 1000,
  privacidadeVersao: '2026-10-01',  // data da política aceita; tem que bater com privacidade.html
};

// Só o harness de teste troca isto (por 'host:porta' do emulador). Em produção é null,
// e o verificar-site.mjs recusa qualquer outro valor.
export const EMULADOR = null;

// Meta Pixel. Enquanto o ID for null, não aparece aviso de cookies e nada do Meta é
// carregado. O Pixel só liga depois que a pessoa aceita no aviso (rastreio.js).
// `versaoAviso` sobe quando o que se mede mudar: quem já escolheu vê o aviso de novo.
export const RASTREIO = {
  metaPixelId: null,
  versaoAviso: '2026-10-07',
};
