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
    "title": "「신호가 없다고 해서 문제가 없는 것은 아니다」제약 배지 성능 시험(Growth Promotion Test)이 알려주는 피드백 감도와 조직의 건강성",
    "abstract": "[GMP in Your Area] 공감 데이터 10건 입증 기록",
    "hypothesis": "“「신호가 없다고 해서 문제가 없는 것은 아니다」제약 배지 성능 시험(Growth Promotion Test)이 알려주는 피드백 감도와 조직의 건강성”",
    "observation": "\"요즘 팀원들이 별다른 이견이나 불만을 제기하지 않는 걸 보니, 프로젝트가 안정적으로 잘 굴러가고 있나 봅니다.\" \"문제점이 보고되지 않았으니 이번 기획은 특별히 보완할 점 없이 계획대로 추진하면 되겠죠?\"... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224417049052"
  },
  "2": {
    "recId": "REC. 02",
    "title": "「문서만 넘긴다고 인수인계가 끝나는 것은 아니다」 제약 시험법 이전(AMT) 원칙을 통해 본 효과적인 업무 인수인계와 지식 전달 방안",
    "abstract": "[GMP in Your Area] 공감 데이터 9건 입증 기록",
    "hypothesis": "“「문서만 넘긴다고 인수인계가 끝나는 것은 아니다」 제약 시험법 이전(AMT) 원칙을 통해 본 효과적인 업무 인수인계와 지식 전달 방안”",
    "observation": "“인수인계 자료는 공유 폴더에 다 넣어두었으니, 문서 보시면서 차근차근 따라 하시면 됩니다.” “매뉴얼에 다 적어뒀는데, 왜 결과를 똑같이 내지 못하는 건가요?” 부서 이동이 있거나 프로젝트를 넘겨받을 때,... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224417696828"
  },
  "3": {
    "recId": "REC. 03",
    "title": "「돈을 줬다고 책임까지 넘어가지 않는다」",
    "abstract": "[GMP in Your Area] 공감 데이터 8건 입증 기록",
    "hypothesis": "“「돈을 줬다고 책임까지 넘어가지 않는다」”",
    "observation": "제약 품질협약(Quality Agreement)과 책임의 거버넌스 \"우리가 전문 업체에 턴키(Turn-key)로 외주시킨 일인데, 왜 우리 회사에 책임을 묻습니까?\" \"용역 계약서에 &#x27;하자 발생 시... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224427171988"
  },
  "4": {
    "recId": "REC. 04",
    "title": "「본게임을 뛰기 전에 장비의 자격부터 증명하라」",
    "abstract": "[GMP in Your Area] 공감 데이터 8건 입증 기록",
    "hypothesis": "“「본게임을 뛰기 전에 장비의 자격부터 증명하라」”",
    "observation": "제약 시스템 적합성 시험(SST)과 시작 전 컨디션의 과학 \"분명 평소 하던 방식대로 최선을 다했는데, 왜 이번 프로젝트 결과는 이렇게 어그러졌을까요?\" \"매뉴얼에 적힌 절차를 하나도 빠뜨리지 않고 똑같이 ... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224422977152"
  },
  "5": {
    "recId": "REC. 05",
    "title": "「물로 대충 헹구고 새 약을 만든다고요?」 제약회사 세척 밸리데이션으로 보는 조직의 ‘악습 교차오염’",
    "abstract": "[GMP in Your Area] 공감 데이터 8건 입증 기록",
    "hypothesis": "“「물로 대충 헹구고 새 약을 만든다고요?」 제약회사 세척 밸리데이션으로 보는 조직의 ‘악습 교차오염’”",
    "observation": "새해가 되거나 조직 개편이 있을 때마다 회사들은 늘 화려한 &#x27;혁신&#x27;을 선언합니다. 새로운 프로젝트를 시작하고, 새로운 리더를 영입하며 \"이제부터 완전히 달라질 것\"이라고 호언장담하죠. 하지... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224378347716"
  },
  "6": {
    "recId": "REC. 06",
    "title": "「진짜 신호를 보기 전에, 아무것도 없는 것을 먼저 본다」",
    "abstract": "[GMP in Your Area] 공감 데이터 7건 입증 기록",
    "hypothesis": "“「진짜 신호를 보기 전에, 아무것도 없는 것을 먼저 본다」”",
    "observation": "제약 분석화학의 Blank와 조직의 Ghost Peak \"내가 지난 10년 동안 이 바닥에서 굴러먹은 짬밥이 얼만데, 딱 보면 견적 나오는 거지.\" \"그 팀이 올린 보고서는 안 봐도 뻔해. 원래 숫자 부풀리... (현업 19년 QC 렌즈로 관측 및 입증)",
    "link": "https://blog.naver.com/humi09/224426114674"
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
