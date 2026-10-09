# Gera a campanha com os mesmos cálculos e formulários da home.
# Uso: python ferramentas/gerar-reajuste.py
from pathlib import Path
import re

RAIZ = Path(__file__).resolve().parent.parent
html = (RAIZ / 'index.html').read_text(encoding='utf-8')

def troca(antigo, novo):
    global html
    n = html.count(antigo)
    if n != 1:
        raise SystemExit('Trecho encontrado %d vezes (esperado 1): %s' % (n, antigo[:100]))
    html = html.replace(antigo, novo)

def intervalo(inicio, fim):
    if html.count(inicio) != 1:
        raise SystemExit('Marcador ausente ou duplicado: ' + inicio)
    a = html.index(inicio)
    b = html.index(fim, a)
    return a, b

def retirar(inicio, fim):
    global html
    a, b = intervalo(inicio, fim)
    html = html[:a] + html[b:]

# Extrai a calculadora original da home e adapta apenas a campanha.
a = html.index('      <div class="calc" id="calc">')
b = html.index('\n    </div>\n  </div>\n</div>', a)
calc = html[a:b]
pot = re.search(r'            <div class="campo">\n              <label for="potPlaca">[\s\S]*?            </div>', calc).group()
tarifa = re.search(r'            <div class="campo full">\n              <label for="tarifa">[\s\S]*?            </div>', calc).group()
calc = calc.replace(pot + '\n', '').replace(tarifa + '\n', '')
calc = calc.replace('<div class="campo">\n              <label for="placas">', '<div class="campo full">\n              <label for="placas">')
needle = '            <div class="campo full">\n              <details class="opcional">'
opcoes = '            <div class="campo full"><details class="opcional ajustes-calculo"><summary>Conferir potência das placas e tarifa</summary>\n' + pot + '\n' + tarifa + '\n            </details></div>\n'
calc = calc.replace(needle, opcoes + needle)
calc = calc.replace('Quanto sua usina está deixando de gerar', 'Calcule quanto a sua usina está perdendo')

troca('<title>Manutenção de Energia Solar em Belém | Solar Green Suporte</title>',
      '<title>Conta de luz subiu 6,7% no Pará | Solar Green Suporte</title>')
troca('<meta name="description" content="Limpeza, manutenção, monitoramento e regularização de usinas de energia solar já instaladas em Belém e no Norte do Pará. Descubra quanto a sua deixa de gerar.">',
      '<meta name="description" content="A Aneel aprovou reajuste de 6,7% na conta de luz residencial da Equatorial Pará. Calcule quanto a sua usina solar está perdendo.">\n<meta name="robots" content="noindex">')
troca('<link rel="canonical" href="https://solargreensuporte.com.br/">\n', '')
troca('<meta property="og:title" content="Manutenção de Energia Solar em Belém | Solar Green Suporte">',
      '<meta property="og:title" content="Conta de luz subiu 6,7% no Pará | Solar Green Suporte">')
troca('<meta property="og:description" content="Descubra quanto a sua usina está deixando de gerar. Limpeza, manutenção, monitoramento e regularização em Belém e no Norte do Pará.">',
      '<meta property="og:description" content="Calcule quanto a sua usina solar está perdendo agora que cada kWh comprado da rede ficou mais caro.">')
troca('<meta property="og:url" content="https://solargreensuporte.com.br/">',
      '<meta property="og:url" content="https://solargreensuporte.com.br/reajuste.html">')
html = re.sub(r'<script type="application/ld\+json">[\s\S]*?</script>\n', '', html, count=1)
html = html.replace('assets/hero-usina', 'assets/hero-reajuste')
troca('<body class="home">', '<body class="campanha">')
troca('<a href="#servicos">Expansão</a>', '<a href="index.html#servicos">Expansão</a>')
a, b = intervalo('<header>', '\n<main id="principal">')
html = html[:a] + '''<header class="pagina-header">
  <div class="wrap topbar">
    <a class="logo" href="index.html" aria-label="Solar Green Suporte, voltar ao início"><img src="assets/logo-branca.svg" alt="Solar Green Suporte" width="118" height="44"></a>
    <a class="campanha-nav" href="#calc">Calcular minha perda</a>
  </div>
</header>
''' + html[b:]

# A campanha mantém prova real, metodologia, cobertura e contato.
retirar('<!-- ══ SERVIÇOS ══ -->', '<!-- ══ ATENDIMENTO ══ -->')
retirar('<!-- ══ ATENDIMENTO ══ -->', '<!-- ══ PROVA ══ -->')
retirar('<!-- ══ PROVA ══ -->', '<!-- ══ COBERTURA ══ -->')
retirar('<!-- ══ GARANTIA ══ -->', '<!-- ══ CONTATO ══ -->')

a,b = intervalo('<!-- ══ HERO + CALCULADORA ══ -->', '<!-- ══ DE ONDE VEM O NÚMERO ══ -->')
hero = '''<!-- ══ NOTÍCIA + CALCULADORA ══ -->
<div class="escuro hero-bg" id="topo">
  <div class="wrap hero">
    <div class="hero-grid">
      <div>
        <span class="selo-noticia">Conta de luz | Pará</span>
        <h1>A conta de luz subiu <span class="alta">6,7%</span>. Quanto a sua usina <em>está perdendo</em>?</h1>
        <p>Se a sua usina gera menos, você compra mais energia da rede. Com o reajuste de 6,7% da tarifa residencial no Pará, essa diferença pesa ainda mais na conta.</p>
        <p class="noticia-teste"><strong>Faça o teste abaixo</strong> e veja a perda estimada da sua usina por mês e por ano.</p>
        <p class="noticia-fonte">Fonte: <a href="https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/aprovadas-as-novas-tarifas-da-equatorial-para" target="_blank" rel="noopener">ANEEL, reajuste da Equatorial Pará</a>, setembro de 2026.</p>
      </div>
''' + calc + '''
    </div>
  </div>
</div>

'''
html = html[:a] + hero + html[b:]

# Registros da operação entram depois do cálculo.
a,b = intervalo('<!-- ══ QUEM SOMOS ══ -->', '<!-- ══ COBERTURA ══ -->')
quem = html[a:b]
html = html[:a] + html[b:]
troca('<!-- ══ DE ONDE VEM O NÚMERO ══ -->', quem + '<!-- ══ DE ONDE VEM O NÚMERO ══ -->')
troca('<h2 id="t-contato" style="margin-top:12px;">Fale com a gente</h2>',
      '<h2 id="t-contato" style="margin-top:12px;">Vamos conversar sobre a sua usina?</h2>')

# Contato e rodapé específicos da campanha; home mantém a versão original.
troca('aria-label="Resultado do cálculo"', 'aria-label="Contato sobre o resultado"')
troca('<h2 id="t-quem">Uma equipe que nasceu para cuidar da sua usina de verdade</h2>', '<h2 id="t-quem">Quem cuida da sua usina</h2>')
for id_campo in ['mCidade', 'mServico']:
    troca('<div class="campo"><label for="' + id_campo + '">', '<div class="campo" hidden><label for="' + id_campo + '">')
cta = re.search(r'        <a class="btn-zap" id="ctaZap"[\s\S]*?        </a>', html).group()
botao = '<button class="btn-form" id="ctaDuvidas" type="button">Quero conversar sobre meu resultado</button>'
html = html.replace(cta + '\n        <button class="btn-form" id="ctaDuvidas" type="button">Tirar dúvidas</button>', '        ' + botao + '\n' + cta.replace('Resolver a perda agora', 'Prefiro falar agora no WhatsApp'))
for texto, destino in [('Monitoramento', 'monitoramento-energia-solar.html'), ('Limpeza e manutenção', 'manutencao-limpeza-energia-solar.html'), ('Regularização', 'fatura-equatorial-energia-solar.html')]:
    troca('<a href="#servicos">' + texto + '</a>', '<a href="' + destino + '">' + texto + '</a>')
troca('</head>', '<link rel="stylesheet" href="css/campanha.css?v=2026-10-09c">\n</head>')

(RAIZ / 'reajuste.html').write_text(html, encoding='utf-8')
print('reajuste.html gerado')
