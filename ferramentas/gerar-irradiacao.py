# Gera js/irradiacao.js a partir do Global Solar Atlas (Banco Mundial / Solargis,
# CC BY 4.0). Rodar de novo só se a fonte ou a lista de cidades mudar.
# Para cada cidade: coordenada (Nominatim/OpenStreetMap) e irradiacao mensal no
# plano inclinado no angulo otimo (camada GTI_opta, kWh/m2 por mes).
# Uso: python ferramentas/gerar-irradiacao.py
import json, time, urllib.parse, urllib.request, io, os

CIDADES = [
    "Abaetetuba", "Acará", "Ananindeua", "Barcarena", "Belém", "Benevides",
    "Bragança", "Breves", "Bujaru", "Cametá", "Capanema", "Castanhal",
    "Igarapé-Miri", "Marituba", "Moju", "Muaná", "Ponta de Pedras",
    "Salinópolis", "Salvaterra", "Santa Bárbara do Pará", "Santa Izabel do Pará",
    "Santo Antônio do Tauá", "São Miguel do Guamá", "Soure", "Tomé-Açu", "Vigia",
]
UA = {"User-Agent": "solargreensuporte-site/1.0 (solargreensuporte@gmail.com)"}

def get(url):
    req = urllib.request.Request(url, headers=UA)
    return json.load(urllib.request.urlopen(req, timeout=40))

saida, log = {}, []
for nome in CIDADES:
    q = urllib.parse.urlencode({"q": nome + ", Pará, Brasil", "format": "json", "limit": 1})
    geo = get("https://nominatim.openstreetmap.org/search?" + q)
    lat, lon = float(geo[0]["lat"]), float(geo[0]["lon"])
    time.sleep(1.2)
    d = get("https://api.globalsolaratlas.info/data/lta?loc=%.5f,%.5f" % (lat, lon))
    mensal = [round(v, 1) for v in d["monthly"]["data"]["GTI_opta"]]
    saida[nome] = mensal
    log.append("%-24s %8.4f %9.4f  ano=%7.1f  opta=%s" % (nome, lat, lon, sum(mensal), d["annual"]["data"].get("OPTA")))
    time.sleep(1.2)

print("\n".join(log))
aqui = os.path.dirname(os.path.abspath(__file__))
corpo = ",\n".join('  %s: [%s]' % (json.dumps(n, ensure_ascii=False), ", ".join(str(v) for v in m)) for n, m in saida.items())
js = (
    "// Irradiação mensal no plano inclinado no ângulo ideal, em kWh/m² por mês.\n"
    "// Fonte: Global Solar Atlas 2.0 (Banco Mundial, fornecido por Solargis), CC BY 4.0.\n"
    "// Gerado por ferramentas/gerar-irradiacao.py. É o único arquivo que guarda o dado:\n"
    "// trocar a fonte é trocar este arquivo.\n"
    "export const FONTE = {\n"
    "  nome: 'Global Solar Atlas',\n"
    "  atribuicao: 'Global Solar Atlas 2.0, Banco Mundial, fornecido por Solargis (CC BY 4.0)',\n"
    "  camada: 'GTI_opta',\n"
    "};\n\n"
    "export const IRRADIACAO = {\n" + corpo + "\n};\n"
)
io.open(os.path.join(aqui, "..", "js", "irradiacao.js"), "w", encoding="utf-8", newline="\n").write(js)
