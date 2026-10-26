/**
 * CleanRoom Writer V2 | Micro-Interaction & Calibration Script
 * 
 * Protocols:
 * 1. Sensor Stabilization: Unstable values settle down to 0 over 0.8s~1.1s, then absolute stillness.
 * 2. Abstract / QC Report Modal: Cleanroom COA data display on record row selection.
 * 3. Accessibility: Honors prefers-reduced-motion.
 */

// ==========================================
// 1. QC Report / Abstract Archive Data
// ==========================================
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
    "observation": "제약 HPLC 컬럼 열화와 이���단수의 과학 \"내가 이 일만 10년째인데, 굳이 새 툴을 배우거나 공부할 필요가 있습니까?\" \"대충 봐도 견적 나옵니다. 늘 하던 대로 처리하면 큰 문제없어요.\" 연차가 쌓... (현업 19년 QC 렌즈로 관측 및 입증)",
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
  // ==========================================
  // 2. Sensor Stabilization Sequence
  // ==========================================
  const seq1 = document.getElementById("seq1");
  const seq2 = document.getElementById("seq2");
  const seq3 = document.getElementById("seq3");
  const seq4 = document.getElementById("seq4");
  const seq5 = document.getElementById("seq5");

  const numParticle = document.getElementById("numParticle");
  const numNoise = document.getElementById("numNoise");
  const numUnnecessary = document.getElementById("numUnnecessary");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    // Skip animation immediately
    if (numParticle) numParticle.textContent = "0";
    if (numNoise) numNoise.textContent = "0";
    if (numUnnecessary) numUnnecessary.textContent = "0";
    [seq1, seq2, seq3, seq4, seq5].forEach((el) => {
      if (el) el.classList.add("seq-visible");
    });
  } else {
    // Step countdown function
    function stabilizeNumber(element, steps, intervalMs, callback) {
      let stepIdx = 0;
      const timer = setInterval(() => {
        if (stepIdx < steps.length) {
          element.textContent = steps[stepIdx];
          stepIdx++;
        } else {
          clearInterval(timer);
          element.textContent = "0";
          if (callback) callback();
        }
      }, intervalMs);
    }

    // Sequence Execution: 0.8s ~ 1.1s total
    setTimeout(() => {
      if (seq1) seq1.classList.add("seq-visible");
      stabilizeNumber(numParticle, [83, 62, 38, 19, 7, 2, 0], 65, () => {
        setTimeout(() => {
          if (seq2) seq2.classList.add("seq-visible");
          stabilizeNumber(numNoise, [41, 28, 14, 6, 1, 0], 60, () => {
            setTimeout(() => {
              if (seq3) seq3.classList.add("seq-visible");
              stabilizeNumber(numUnnecessary, [27, 16, 8, 3, 0], 55, () => {
                // Calibrated to 0. Absolute stillness reached.
                setTimeout(() => {
                  if (seq4) seq4.classList.add("seq-visible");
                }, 350);

                setTimeout(() => {
                  if (seq5) seq5.classList.add("seq-visible");
                }, 850);
              });
            }, 120);
          });
        }, 120);
      });
    }, 280);
  }

  // ==========================================
  // 3. Smooth Scroll for Enter
  // ==========================================
  const enterBtn = document.querySelector(".enter-btn");
  if (enterBtn) {
    enterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("manifesto");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // ==========================================
  // 4. Abstract / QC Report Modal Logic
  // ==========================================
  const qcModal = document.getElementById("qcModal");
  const qcBackdrop = document.getElementById("qcBackdrop");
  const qcCloseBtn = document.getElementById("qcCloseBtn");

  const modalRecId = document.getElementById("modalRecId");
  const modalTitle = document.getElementById("modalTitle");
  const modalAbstract = document.getElementById("modalAbstract");
  const modalHypothesis = document.getElementById("modalHypothesis");
  const modalObservation = document.getElementById("modalObservation");
  const modalExternalLink = document.getElementById("modalExternalLink");

  function openQcModal(recordId) {
    const data = qcArchive[recordId];
    if (!data || !qcModal) return;

    modalRecId.textContent = data.recId;
    modalTitle.textContent = data.title;
    modalAbstract.textContent = data.abstract;
    modalHypothesis.textContent = data.hypothesis;
    modalObservation.textContent = data.observation;
    modalExternalLink.href = data.link;

    qcModal.classList.add("active");
    qcModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeQcModal() {
    if (!qcModal) return;
    qcModal.classList.remove("active");
    qcModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Attach click listener to each record row
  const recordRows = document.querySelectorAll(".record-row");
  recordRows.forEach((row) => {
    row.addEventListener("click", () => {
      const recordId = row.getAttribute("data-record-id");
      openQcModal(recordId);
    });
  });

  // Modal dismiss handlers
  if (qcCloseBtn) qcCloseBtn.addEventListener("click", closeQcModal);
  if (qcBackdrop) qcBackdrop.addEventListener("click", closeQcModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && qcModal && qcModal.classList.contains("active")) {
      closeQcModal();
    }
  });
});
