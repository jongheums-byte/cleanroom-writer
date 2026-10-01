@echo off
chcp 65001 > nul
echo ========================================================
echo   CleanRoom Writer 사이트 1초 무료 배포 스크립트
echo ========================================================
echo.
echo [1/2] 최신 파일 압축 중...
powershell -Command "Compress-Archive -Path 'index.html', 'style.css', 'script.js', 'README.md' -DestinationPath 'cleanroom-writer.zip' -Force"

echo [2/2] 무료 웹 서버로 전송 및 배포 중...
powershell -Command "curl.exe -X POST https://ship.page/deploy -H 'Content-Type: application/zip' --data-binary @cleanroom-writer.zip"

echo.
echo ========================================================
echo   배포가 완료되었습니다! 출력된 url로 접속하세요.
echo ========================================================
pause
