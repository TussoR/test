@echo off
title Portfolio Edit Panel
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0panel\server.ps1"
if errorlevel 1 pause
