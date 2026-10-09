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

a, b = intervalo('<!-- ══ CALCULADORA ══ -->', '<!-- ══ DE ONDE VEM O NÚMERO ══ -->')
secao_calc = html[a:b]
calc_inicio = secao_calc.index('      <div class="calc" id="calc">')
calc_fim = secao_calc.index('\n    </section>', calc_inicio)
calc = secao_calc[calc_inicio:calc_fim]
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
troca('<body>', '<body class="campanha">')
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
retirar('<!-- ══ SERVIÇOS ══ -->', '<!-- ══ CALCULADORA ══ -->')
retirar('<!-- ══ CALCULADORA ══ -->', '<!-- ══ DE ONDE VEM O NÚMERO ══ -->')
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
        <p>A tarifa residencial da Equatorial Pará subiu em setembro de 2026. Se a sua usina gera menos, você compra mais energia da rede. E cada kWh comprado ficou mais caro.</p>
        <p class="noticia-fonte">Fonte: <a href="https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/aprovadas-as-novas-tarifas-da-equatorial-para" target="_blank" rel="noopener">ANEEL, reajuste da Equatorial Pará</a>.</p>
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

troca('</head>', '''<style>
.campanha .hero-bg{background-image:url('assets/hero-reajuste.webp');}
.campanha .hero{padding-top:32px;}
.campanha-nav{font-size:.8rem;font-weight:700;color:var(--escuro-ink);text-underline-offset:4px;}
.selo-noticia{display:block;font-size:.7rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--escuro-soft);margin-bottom:16px;}
.campanha h1 .alta{color:var(--perda-texto);white-space:nowrap;}
.hero p.noticia-fonte{font-size:.72rem;margin-top:12px;line-height:1.5;}
.noticia-fonte a{color:var(--escuro-ink);}
@media(max-width:700px){
  .campanha .hero-bg{background-image:url('assets/hero-reajuste-mobile.webp');}
  .campanha .hero h1{font-size:1.7rem;}
  .campanha .hero p{font-size:.94rem;line-height:1.55;}
  .campanha .hero-grid{gap:24px;}
}
</style>
</head>''')

(RAIZ / 'reajuste.html').write_text(html, encoding='utf-8')
print('reajuste.html gerado')
