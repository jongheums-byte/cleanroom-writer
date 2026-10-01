@echo off
chcp 65001 > nul
title CleanRoom Writer Auto Sync
echo [CleanRoom Writer] Naver Blog Sympathy-Ranked Auto Sync Starting...
node "%~dp0scripts\sync-and-build.js"
echo.
pause
