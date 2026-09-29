@echo off
setlocal
title TESTAR - Site Solar Green
set "PORTA=8743"
set "PASTA=%~dp0"
if "%PASTA:~-1%"=="\" set "PASTA=%PASTA:~0,-1%"
set "PAGINA=index.html"

where python >nul 2>&1
if errorlevel 1 (
  echo Python nao foi encontrado neste computador.
  echo Instale o Python e tente novamente.
  pause
  exit /b 1
)

echo Iniciando servidor local em "%PASTA%" ...
start "ServidorTeste_SolarGreen_%PORTA%" /D "%PASTA%" /min cmd /k "python -m http.server %PORTA% --bind 127.0.0.1"

timeout /t 2 /nobreak >nul
start "" http://localhost:%PORTA%/%PAGINA%

echo.
echo Site aberto em http://localhost:%PORTA%/%PAGINA%
echo Pressione qualquer tecla nesta janela para PARAR o servidor e fechar.
pause >nul

taskkill /FI "WINDOWTITLE eq ServidorTeste_SolarGreen_%PORTA%*" /T /F >nul 2>&1
echo Servidor parado.
timeout /t 1 /nobreak >nul
endlocal
