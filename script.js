/**
 * CleanRoom Writer | VEA Architecture Interactive Engine
 * 
 * Top-level qcArchive matches GitHub Actions regex:
 * /const qcArchive = \{[\s\S]*?\n\};/
 */

const qcArchive = {
  "1": {
    "recId": "REC. 01",
    "title": "「까다로운 대상을 다룰 때는 끝까지 밀어붙이지 않는다」",
    "abstract": "[GMP in Your Area] 공감 데이터 10건 입증 기록",
    "hypothesis": "“「까다로운 대상을 다룰 때는 끝까지 밀어붙이지 않는다」”",
    "observation": "제약 정밀 분주(Reverse Pipetting)와 유체의 과학 마이크로피펫(Micropipette, 마이크로리터 단위의 미량 액체를 정밀하게 옮기는 실험 기구)을 처음 손에 쥐는 신입 연구원들이 시험대 앞... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224451234580"
  },
  "2": {
    "recId": "REC. 02",
    "title": "「문제가 생겼다고 판을 엎을 필요는 없다」",
    "abstract": "[GMP in Your Area] 공감 데이터 10건 입증 기록",
    "hypothesis": "“「문제가 생겼다고 판을 엎을 필요는 없다」”",
    "observation": "제약 정치세척·정치멸균(CIP·SIP)과 자체 정화의 과학 \"이번 프로젝트에서 품질 문제가 터졌으니, 관련 팀을 전면 해체하고 조직을 원점에서 다시 짭시다.\" \"시스템이 삐걱거리면 사람을 교체하고 판을 새로... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224438944516"
  },
  "3": {
    "recId": "REC. 03",
    "title": "「신호가 없다고 해서 문제가 없는 것은 아니다」제약 배지 성능 시험(Growth Promotion Test)이 알려주는 피드백 감도와 조직의 건강성",
    "abstract": "[GMP in Your Area] 공감 데이터 10건 입증 기록",
    "hypothesis": "“「신호가 없다고 해서 문제가 없는 것은 아니다」제약 배지 성능 시험(Growth Promotion Test)이 알려주는 피드백 감도와 조직의 건강성”",
    "observation": "\"요즘 팀원들이 별다른 이견이나 불만을 제기하지 않는 걸 보니, 프로젝트가 안정적으로 잘 굴러가고 있나 봅니다.\" \"문제점이 보고되지 않았으니 이번 기획은 특별히 보완할 점 없이 계획대로 추진하면 되겠죠?\"... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224417049052"
  },
  "4": {
    "recId": "REC. 04",
    "title": "「매일 조금씩 무뎌지는 칼날」",
    "abstract": "[GMP in Your Area] 공감 데이터 9건 입증 기록",
    "hypothesis": "“「매일 조금씩 무뎌지는 칼날」”",
    "observation": "제약 HPLC 컬럼 열화와 이론단수의 과학 \"내가 이 일만 10년째인데, 굳이 새 툴을 배우거나 공부할 필요가 있습니까?\" \"대충 봐도 견적 나옵니다. 늘 하던 대로 처리하면 큰 문제없어요.\" 연차가 쌓이고... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224440276934"
  },
  "5": {
    "recId": "REC. 05",
    "title": "「모두가 대세라 환호할 때 멈춰 설 수 있는가」",
    "abstract": "[GMP in Your Area] 공감 데이터 9건 입증 기록",
    "hypothesis": "“「모두가 대세라 환호할 때 멈춰 설 수 있는가」”",
    "observation": "제약 탈리도마이드 사건과 현대 GMP의 탄생 \"업계 1등 기업도 이미 쓰고 있고, 해외 시장에서도 다들 난리입니다.\" \"경쟁사들은 이미 치고 나가는데, 왜 우리만 데이터 타령하면서 일정을 지체합니까? 일단 ... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224437839858"
  },
  "6": {
    "recId": "REC. 06",
    "title": "「돈을 줬다고 책임까지 넘어가지 않는다」",
    "abstract": "[GMP in Your Area] 공감 데이터 9건 입증 기록",
    "hypothesis": "“「돈을 줬다고 책임까지 넘어가지 않는다」”",
    "observation": "제약 품질협약(Quality Agreement)과 책임의 거버넌스 \"우리가 전문 업체에 턴키(Turn-key)로 외주시킨 일인데, 왜 우리 회사에 책임을 묻습니까?\" \"용역 계약서에 &#x27;하자 발생 시... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224427171988"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ========================================================
  // 01. Audio System Integration
  // ========================================================
  const sndToggle = document.getElementById("sndToggle");
  const sndStateText = document.getElementById("sndStateText");

  if (sndToggle && window.CleanRoomAudio) {
    sndToggle.addEventListener("click", () => {
      const active = window.CleanRoomAudio.toggle();
      sndStateText.textContent = active ? "ON" : "OFF";
      sndToggle.classList.toggle("active", active);
    });
  }

  // Attach hover acoustic cues to high-interaction targets
  const interactiveTargets = document.querySelectorAll(
    "a, button, .dossier-row, .record-row, .channel-btn, .matrix-cell"
  );
  interactiveTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      if (window.CleanRoomAudio) window.CleanRoomAudio.hover();
    });
  });

  // ========================================================
  // 02. Telemetry HUD Calibration Sequence
  // ========================================================
  const hudParticle = document.getElementById("hudParticle");
  const hudNoise = document.getElementById("hudNoise");
  const hudIntegrity = document.getElementById("hudIntegrity");

  function calibrateSensor(element, targetVal, duration, decimals = 2) {
    if (!element) return;
    const startVal = parseFloat(element.textContent) || 98.4;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * ease;
      element.textContent = current.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetVal.toFixed(decimals);
      }
    }
    requestAnimationFrame(update);
  }

  setTimeout(() => {
    calibrateSensor(hudParticle, 0.00, 1400, 2);
    calibrateSensor(hudNoise, 0.00, 1600, 2);
    calibrateSensor(hudIntegrity, 99.98, 1200, 2);
  }, 400);

  // ========================================================
  // 03. Sliding Inspection Drawer (COA Spec Sheet)
  // ========================================================
  const drawer = document.getElementById("inspectionDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");

  const drawerRecId = document.getElementById("drawerRecId");
  const drawerTitle = document.getElementById("drawerTitle");
  const drawerMetric = document.getElementById("drawerMetric");
  const drawerMethod = document.getElementById("drawerMethod");
  const drawerHypothesis = document.getElementById("drawerHypothesis");
  const drawerObservation = document.getElementById("drawerObservation");
  const drawerExternalLink = document.getElementById("drawerExternalLink");

  function openDrawer(recordId) {
    const data = qcArchive[recordId];
    if (!data || !drawer) return;

    if (window.CleanRoomAudio) {
      window.CleanRoomAudio.inspect();
    }

    drawerRecId.textContent = data.recId;
    drawerTitle.textContent = data.title;
    drawerMetric.textContent = data.abstract || data.metric || "AUDIT TRAIL";
    drawerMethod.textContent = data.method || "제약 밸리데이션 및 데이터 완전성 분석";
    drawerHypothesis.textContent = data.hypothesis;
    drawerObservation.textContent = data.observation;
    drawerExternalLink.href = data.link;

    drawer.classList.add("active");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("active");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");

    if (window.CleanRoomAudio) {
      window.CleanRoomAudio.click(420);
    }
  }

  // Handle both .dossier-row and .record-row clicks
  function attachRowListeners() {
    const rows = document.querySelectorAll(".dossier-row, .record-row");
    rows.forEach((row) => {
      row.onclick = () => {
        const id = row.getAttribute("data-id") || row.getAttribute("data-record-id");
        if (id) openDrawer(id);
      };
    });
  }
  attachRowListeners();

  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && drawer.classList.contains("active")) {
      closeDrawer();
    }
  });

  // Smooth scroll for hero cue
  const scrollCue = document.querySelector(".scroll-cue-btn");
  if (scrollCue) {
    scrollCue.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("records");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        if (window.CleanRoomAudio) window.CleanRoomAudio.click(600);
      }
    });
  }
});
