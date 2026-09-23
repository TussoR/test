@echo off
title Portfolyo Paneli
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0panel\server.ps1"
if errorlevel 1 pause
