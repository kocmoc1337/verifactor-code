@echo off
rem Запуск verifactor-code из любой папки: добавь G:\projects\verifactor-code\bin в PATH.
rem Аргументы передаются как есть, например: verifactor -s <id сессии>
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\run.ps1" %*
