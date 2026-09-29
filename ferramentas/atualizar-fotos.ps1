# Le a pasta assets\fotos e gera o fotos.json que o carrossel do site usa.
# A ordem e a ordem alfabetica do nome do arquivo. A legenda e o nome do arquivo
# sem a extensao e sem um numero no comeco ("01 - Visita em Belem.jpg" vira
# "Visita em Belem"). O numero serve so para escolher a ordem.
$pasta = Join-Path $PSScriptRoot '..\assets\fotos'
$extensoes = '.jpg', '.jpeg', '.png', '.webp'
$arquivos = Get-ChildItem -LiteralPath $pasta -File |
  Where-Object { $extensoes -contains $_.Extension.ToLower() } |
  Sort-Object Name

$lista = @()
foreach ($f in $arquivos) {
  $legenda = [IO.Path]::GetFileNameWithoutExtension($f.Name)
  $legenda = ($legenda -replace '^\s*\d+\s*[-_.]\s*', '') -replace '_+', ' '
  $lista += [ordered]@{ arquivo = $f.Name; legenda = $legenda.Trim() }
}

$json = ConvertTo-Json -InputObject @($lista) -Depth 3
[IO.File]::WriteAllText((Join-Path $pasta 'fotos.json'), $json, (New-Object Text.UTF8Encoding($false)))

Write-Host ''
Write-Host ('Lista atualizada: ' + $lista.Count + ' foto(s) no carrossel.')
foreach ($f in $arquivos) {
  $kb = [math]::Round($f.Length / 1KB)
  $aviso = ''
  if ($kb -gt 400) { $aviso = '  <- pesada, reduza para uns 1200 px de largura' }
  Write-Host ('  ' + $f.Name + ' (' + $kb + ' KB)' + $aviso)
}
Write-Host ''
Write-Host 'Lembrete: use so foto sem cliente e sem fachada de casa.'
Write-Host 'Depois suba a pasta assets\fotos inteira, com o fotos.json.'
