# Gera reajuste.html a partir do index.html.
# A página de campanha (post do reajuste de 6,7% da Equatorial) é a mesma home, com
# outra recepção: topo, um bloco explicando o reajuste e o título do contato.
# Calculadora, gráfico, serviços, formulários e envio de lead são os mesmos, porque
# usam o mesmo app.js, calculo.js e style.css. O index.html não é alterado.
#
# Uso, na pasta do site:  python ferramentas/gerar-reajuste.py
# Rodar de novo sempre que o index.html mudar, pra campanha não ficar com texto velho.
# Se algum trecho do index mudou e não for mais encontrado, o script para e diz qual.

from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
html = (RAIZ / 'index.html').read_text(encoding='utf-8')


def troca(antigo, novo):
    global html
    n = html.count(antigo)
    if n != 1:
        raise SystemExit('Trecho encontrado %d vezes no index.html (esperado 1):\n%s' % (n, antigo[:120]))
    html = html.replace(antigo, novo)


def troca_bloco(inicio, fim, novo):
    """Troca de `inicio` (único no arquivo) até a primeira ocorrência de `fim` depois dele."""
    global html
    if html.count(inicio) != 1:
        raise SystemExit('Trecho encontrado %d vezes no index.html (esperado 1):\n%s' % (html.count(inicio), inicio[:120]))
    a = html.index(inicio)
    if html.find(fim, a) < 0:
        raise SystemExit('Fim do trecho não encontrado depois de:\n%s' % inicio[:120])
    b = html.index(fim, a) + len(fim)
    html = html[:a] + novo + html[b:]


# ── Cabeçalho da página ──────────────────────────────────────────────────
troca('<title>Manutenção de Energia Solar em Belém | Solar Green Suporte</title>',
      '<title>Conta de luz subiu 6,7% no Pará | Solar Green Suporte</title>')
troca('<meta name="description" content="Limpeza, manutenção, monitoramento e regularização de usinas de energia solar já instaladas em Belém e no Norte do Pará. Descubra quanto a sua deixa de gerar.">',
      '<meta name="description" content="A Aneel aprovou reajuste de 6,7% na conta de luz residencial da Equatorial Pará. Calcule quanto a sua usina solar está perdendo.">\n'
      # Página de campanha: fora do Google pra não competir com a home.
      '<meta name="robots" content="noindex">')
troca('<link rel="canonical" href="https://solargreensuporte.com.br/">\n', '')
troca('<meta property="og:title" content="Manutenção de Energia Solar em Belém | Solar Green Suporte">',
      '<meta property="og:title" content="Conta de luz subiu 6,7% no Pará | Solar Green Suporte">')
troca('<meta property="og:description" content="Descubra quanto a sua usina está deixando de gerar. Limpeza, manutenção, monitoramento e regularização em Belém e no Norte do Pará.">',
      '<meta property="og:description" content="Calcule quanto a sua usina solar está perdendo agora que cada kWh comprado da rede ficou mais caro.">')
troca('<meta property="og:url" content="https://solargreensuporte.com.br/">',
      '<meta property="og:url" content="https://solargreensuporte.com.br/reajuste.html">')
# O LocalBusiness fica só na home: é ela que o Google deve associar à empresa.
troca_bloco('<script type="application/ld+json">', '</script>\n', '')
troca('<link rel="preload" as="image" href="assets/hero-usina-mobile.webp" media="(max-width:700px)">\n'
      '<link rel="preload" as="image" href="assets/hero-usina.webp" media="(min-width:701px)">',
      '<link rel="preload" as="image" href="assets/hero-reajuste-mobile.webp" media="(max-width:700px)">\n'
      '<link rel="preload" as="image" href="assets/hero-reajuste.webp" media="(min-width:701px)">')

# Estilo só desta página. Fica aqui dentro pra não mexer no style.css da home.
ESTILO = '''<style>
/* Foto do próprio post que trouxe a pessoa até aqui. */
.hero-bg{background-image:url('assets/hero-reajuste.webp');background-position:center 45%;}
@media (max-width:700px){ .hero-bg{background-image:url('assets/hero-reajuste-mobile.webp');} }

/* Selo e faixa de quatro cores, iguais ao card do Instagram. */
.selo-noticia{display:inline-flex;align-items:center;gap:10px;font-size:.72rem;font-weight:800;
  letter-spacing:.14em;text-transform:uppercase;color:var(--escuro-ink);margin-bottom:18px;}
.selo-noticia::before{content:"";width:4px;height:18px;background:#2662aa;border-radius:1px;}
.faixa-noticia{height:5px;margin-top:22px;max-width:420px;border-radius:2px;
  background:linear-gradient(90deg,#2662aa 0 21%,#9cb034 21% 50%,#d7232c 50% 79%,#f3b729 79% 100%);}
.hero h1 .alta{color:var(--perda-texto);white-space:nowrap;}
/* No celular, quem veio do post precisa ver a calculadora logo: os pontos saem. */
@media (max-width:700px){ .hero-bg .hero-pontos{display:none;} .faixa-noticia{margin-top:20px;} }

/* O botão do bloco leva até a calculadora sem ela ficar atrás do topo fixo. */
#calc{scroll-margin-top:90px;}

/* Bloco "por que pesa mais pra quem tem usina". */
.reaj-fatos{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;margin-bottom:38px;}
.reaj-fato{background:var(--branco);border:1px solid var(--claro-linha);border-radius:14px;padding:20px 22px;}
.reaj-fato .n{font-family:var(--display);font-weight:900;font-size:clamp(1.7rem,4vw,2.3rem);line-height:1;letter-spacing:-.02em;color:var(--claro-ink);}
.reaj-fato .n.alta{color:var(--perda-claro);}
.reaj-fato .l{font-size:.86rem;color:var(--claro-soft);margin-top:8px;}
.reaj-cadeia{display:grid;grid-template-columns:1fr;gap:12px;}
@media (min-width:860px){ .reaj-cadeia{grid-template-columns:1fr auto 1fr auto 1fr;align-items:stretch;} }
.reaj-elo{background:var(--branco);border:1px solid var(--claro-linha);border-radius:14px;padding:20px 22px;}
.reaj-elo h3{margin-bottom:6px;}
.reaj-elo p{font-size:.92rem;color:var(--claro-soft);line-height:1.55;}
.reaj-elo.fim{border-color:rgba(192,52,42,.45);}
.reaj-elo.fim h3{color:var(--perda-claro);}
.reaj-seta{display:flex;align-items:center;justify-content:center;color:var(--claro-faint);}
.reaj-seta svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transform:rotate(90deg);}
@media (min-width:860px){ .reaj-seta svg{transform:none;} }
.reaj-exemplo{margin-top:26px;font-size:.95rem;color:var(--claro-soft);max-width:70ch;}
.reaj-exemplo b{color:var(--claro-ink);}
.reaj-cta{margin-top:22px;display:inline-flex;align-items:center;gap:8px;background:var(--verde-texto);color:#fff;
  font-weight:800;font-size:.92rem;padding:12px 20px;border-radius:10px;text-decoration:none;}
.reaj-cta svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transform:rotate(-90deg);}
</style>
</head>'''
troca('</head>', ESTILO)

# ── Topo: a mesma notícia do post, e a pergunta que a pessoa trouxe ──────
troca_bloco('<h1>Sua usina está gerando <em>o que deveria</em>?</h1>',
            '</ul>',
            '''<span class="selo-noticia">Conta de luz | Pará</span>
        <h1>A conta de luz subiu <span class="alta">6,7%</span>. Quanto a sua usina <em>está perdendo</em>?</h1>
        <p>A Aneel aprovou o reajuste da Equatorial para cerca de 3,12 milhões de unidades consumidoras no Pará. Quem tem energia solar também sente, porque a usina gerando abaixo do esperado faz a casa comprar mais energia da rede, e cada kWh comprado ficou mais caro.</p>
        <div class="faixa-noticia" aria-hidden="true"></div>
        <ul class="hero-pontos">
          <li><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg><span>Resultado na hora, em reais, sem precisar deixar contato</span></li>
          <li><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg><span>Cálculo com a irradiação solar real da sua cidade, mês a mês</span></li>
          <li><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg><span>Basta saber quantas placas tem, a cidade e há quanto tempo não faz limpeza. O resto já vem preenchido</span></li>
        </ul>''')
troca('<h2 class="calc-t">Quanto sua usina está deixando de gerar</h2>',
      '<h2 class="calc-t">Calcule quanto a sua usina está perdendo</h2>')

# ── Bloco novo logo depois do topo: o reajuste e a usina ─────────────────
SETA = '<div class="reaj-seta" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>'
BLOCO = '''<!-- ══ O REAJUSTE E A SUA USINA (só nesta página) ══ -->
<div class="claro" id="reajuste">
  <div class="wrap">
    <section aria-labelledby="t-reajuste">
      <div class="sec-head">
        <span class="eyebrow">O reajuste e a sua usina</span>
        <h2 id="t-reajuste">Por que quem tem energia solar também sente o aumento</h2>
        <p class="lede">A usina abate da conta a energia que ela gera. Tudo o que ela deixa de gerar, a casa compra da Equatorial, e é nessa parte que o reajuste aparece.</p>
      </div>
      <div class="reaj-fatos">
        <div class="reaj-fato"><div class="n alta">6,7%</div><div class="l">de reajuste na tarifa residencial da Equatorial Pará</div></div>
        <div class="reaj-fato"><div class="n">3,12 mi</div><div class="l">de unidades consumidoras atingidas no estado</div></div>
        <div class="reaj-fato"><div class="n">Aneel</div><div class="l">aprovou o novo valor em setembro de 2026</div></div>
      </div>
      <div class="reaj-cadeia">
        <div class="reaj-elo"><h3>A usina gera menos</h3><p>Sujeira nas placas, conexão frouxa ou inversor com falha. Vista do chão, a usina parece igual a uma que está funcionando bem.</p></div>
        ''' + SETA + '''
        <div class="reaj-elo"><h3>A casa compra mais da rede</h3><p>A energia que faltou na geração vem da Equatorial e entra na conta no fim do mês.</p></div>
        ''' + SETA + '''
        <div class="reaj-elo fim"><h3>Cada kWh comprado custa mais</h3><p>Com o reajuste, a mesma perda de geração passa a pesar mais no bolso do que pesava antes.</p></div>
      </div>
      <p class="reaj-exemplo">Exemplo: uma usina de <b>12 placas em Belém</b>, há mais de um ano sem limpeza, deixa de gerar cerca de <b>1.800 kWh por ano</b>. É energia que a casa acaba comprando da rede, agora com a tarifa nova.</p>
      <a class="reaj-cta" href="#calc">Calcular a perda da minha usina <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </section>
  </div>
</div>

<!-- ══ DE ONDE VEM O NÚMERO ══ -->'''
troca('<!-- ══ DE ONDE VEM O NÚMERO ══ -->', BLOCO)

# ── Contato: fecha com o mesmo assunto ───────────────────────────────────
troca('<h2 id="t-contato" style="margin-top:12px;">Fale com a gente</h2>',
      '<h2 id="t-contato" style="margin-top:12px;">Quer parar de pagar pela energia que a usina deixa de gerar?</h2>')
troca('<p class="lede" style="margin-top:14px;">No WhatsApp a resposta é mais rápida, de segunda a sexta das 8h às 18h. Fora desse horário, deixe seu contato que a gente responde no próximo dia útil.</p>',
      '<p class="lede" style="margin-top:14px;">Um consultor olha a sua conta e a geração dos últimos meses e diz se existe perda. No WhatsApp a resposta é mais rápida, de segunda a sexta das 8h às 18h. Fora desse horário, deixe seu contato que a gente responde no próximo dia útil.</p>')

(RAIZ / 'reajuste.html').write_text(html, encoding='utf-8')
print('reajuste.html gerado')
