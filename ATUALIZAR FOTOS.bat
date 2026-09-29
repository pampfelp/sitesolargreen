@echo off
setlocal
title ATUALIZAR FOTOS - Site Solar Green
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0ferramentas\atualizar-fotos.ps1"
echo.
pause
endlocal
