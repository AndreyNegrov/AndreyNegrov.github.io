@echo off
rem Starts the game on http://localhost:4717/ so the browser remembers the microphone permission.
title Iney
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\serve.ps1"
if errorlevel 1 pause
