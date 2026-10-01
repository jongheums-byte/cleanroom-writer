@echo off
chcp 65001 > nul
title CleanRoom Writer - GitHub Auto Connect

set "PATH=%PATH%;C:\Users\선종흠\AppData\Local\Programs\MinGit\cmd;C:\Users\선종흠\AppData\Local\Programs\gh"

echo ========================================================
echo   CleanRoom Writer ^| GitHub 무인 자동 배포 원클릭 연결
echo ========================================================
echo.
echo 1. 잠시 후 브라우저(크롬)가 열리고 8자리 인증 코드가 터미널에 뜹니다.
echo 2. 엔터를 누르면 브라우저 인증 페이지가 열립니다.
echo 3. 화면의 일회용 코드를 확인 후 [Authorize github] 초록 버튼을 눌러주세요.
echo.
pause

"C:\Users\선종흠\AppData\Local\Programs\gh\gh.exe" auth login -h github.com -p https -w

echo.
echo [1/2] Git 인증 헬퍼 자동 구성 중...
"C:\Users\선종흠\AppData\Local\Programs\gh\gh.exe" auth setup-git

echo.
echo [2/2] GitHub 저장소(cleanroom-writer) 생성 및 코드 자동 업로드 중...
cd /d "C:\Users\선종흠\.gemini\antigravity\scratch\cleanroom-writer"
"C:\Users\선종흠\AppData\Local\Programs\gh\gh.exe" repo create cleanroom-writer --public --source=. --push

echo.
echo ========================================================
echo   ★ 축하합니다! GitHub 무인 자동화 배포 파이프라인 탑재 완료!
echo   https://github.com/jongheums-byte/cleanroom-writer
echo.
echo   이제 Netlify에서 이 저장소만 연결해주시면 끝납니다.
echo ========================================================
echo.
pause
