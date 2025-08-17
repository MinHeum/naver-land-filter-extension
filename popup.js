// 팝업 UI 제어 스크립트
class PopupController {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkPageStatus();
    this.loadFilterInfo();

    // 주기적으로 상태 업데이트 (30초마다)
    setInterval(() => {
      this.loadFilterInfo();
    }, 30000);
  }

  bindEvents() {
    // 새로고침 버튼
    document.getElementById("refresh-btn").addEventListener("click", () => {
      this.refreshStatus();
    });

    // 설정 버튼
    document.getElementById("settings-btn").addEventListener("click", () => {
      this.openSettings();
    });

    // 도움말 링크
    document.getElementById("help-link").addEventListener("click", (e) => {
      e.preventDefault();
      this.openHelp();
    });

    // 피드백 링크
    document.getElementById("feedback-link").addEventListener("click", (e) => {
      e.preventDefault();
      this.openFeedback();
    });
  }

  async checkPageStatus() {
    try {
      // 현재 활성 탭에서 네이버 부동산 페이지 상태 확인
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab.url && tab.url.includes("new.land.naver.com")) {
        // 페이지가 완전히 로드되었는지 확인
        try {
          const response = await chrome.tabs.sendMessage(tab.id, {
            action: "checkFilterStatus",
          });

          if (response && response.success) {
            this.updateStatus(
              "active",
              "✅ 활성화됨",
              `네이버 부동산 페이지에서 작동 중입니다 (${
                response.data?.filterCount || 0
              }개 필터 활성)`
            );

            // 버튼 텍스트 업데이트
            this.updateSettingsButtonText(response.data?.isExpanded || false);
          } else {
            this.updateStatus(
              "active",
              "⚠️ 로딩 중",
              "페이지가 로딩 중입니다. 잠시 후 다시 시도해주세요"
            );
          }
        } catch (messageError) {
          console.log("Content script 통신 실패:", messageError);
          // content script가 아직 로드되지 않은 경우
          this.updateStatus(
            "active",
            "⚠️ 준비 중",
            "확장 프로그램이 초기화 중입니다"
          );
        }

        this.loadFilterInfo();
      } else {
        this.updateStatus(
          "inactive",
          "❌ 비활성화됨",
          "네이버 부동산 페이지에서만 사용 가능합니다"
        );

        // 비활성화된 경우 버튼 텍스트 초기화
        this.updateSettingsButtonText(false);
      }
    } catch (error) {
      console.error("페이지 상태 확인 실패:", error);
      this.updateStatus(
        "inactive",
        "❌ 오류 발생",
        "상태를 확인할 수 없습니다"
      );
    }
  }

  updateStatus(type, text, description) {
    const statusElement = document.getElementById("status");
    const statusText = statusElement.querySelector(".status-text");
    const statusDesc = statusElement.querySelector(".status-desc");
    const statusIcon = statusElement.querySelector(".status-icon");

    // 기존 클래스 제거
    statusElement.className = "status";

    // 새 상태에 따른 클래스 추가
    if (type === "active") {
      statusElement.classList.add("active");
      statusIcon.textContent = "✅";
    } else if (type === "inactive") {
      statusElement.classList.add("inactive");
      statusIcon.textContent = "❌";
    }

    statusText.textContent = text;
    statusDesc.textContent = description;
  }

  updateSettingsButtonText(isExpanded) {
    const settingsBtn = document.getElementById("settings-btn");
    if (settingsBtn) {
      if (isExpanded) {
        settingsBtn.textContent = "필터 작업 중";
        settingsBtn.title =
          "필터 패널이 열려있습니다. 클릭하면 팝업만 닫힙니다.";
      } else {
        settingsBtn.textContent = "필터 열기";
        settingsBtn.title = "필터 패널 열기";
      }
    }
  }

  async loadFilterInfo() {
    try {
      // 저장된 필터 설정 불러오기
      const result = await chrome.storage.local.get([
        "naverLandFilters",
        "lastUpdateDate",
      ]);

      if (result.naverLandFilters) {
        const filters = result.naverLandFilters;
        const activeCount = Object.values(filters).filter(
          (value) =>
            value !== "" &&
            value !== false &&
            value !== null &&
            value !== undefined
        ).length;

        document.getElementById(
          "active-filters"
        ).textContent = `${activeCount}개`;
        document.getElementById("saved-settings").textContent =
          activeCount > 0 ? "있음" : "없음";
      } else {
        document.getElementById("active-filters").textContent = "0개";
        document.getElementById("saved-settings").textContent = "없음";
      }

      if (result.lastUpdateDate) {
        const date = new Date(result.lastUpdateDate);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));

        let timeText;
        if (diffMinutes < 1) {
          timeText = "방금 전";
        } else if (diffMinutes < 60) {
          timeText = `${diffMinutes}분 전`;
        } else if (diffMinutes < 1440) {
          timeText = `${Math.floor(diffMinutes / 60)}시간 전`;
        } else {
          timeText = date.toLocaleDateString("ko-KR");
        }
        console.log("마지막 업데이트 시간:", timeText);
        document.getElementById("last-update").textContent = timeText;
      } else {
        document.getElementById("last-update").textContent = "없음";
      }
    } catch (error) {
      console.error("필터 정보 로드 실패:", error);
      document.getElementById("active-filters").textContent = "오류";
      document.getElementById("saved-settings").textContent = "오류";
      document.getElementById("last-update").textContent = "오류";
    }
  }

  async refreshStatus() {
    // 상태 새로고침
    this.updateStatus(
      "inactive",
      "⏳ 확인 중...",
      "페이지 상태를 다시 확인하고 있습니다"
    );

    // 현재 탭이 네이버 부동산인 경우 필터 재적용 시도
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab.url && tab.url.includes("new.land.naver.com")) {
        // content script에 필터 재적용 요청
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: "reapplyFilters",
          });
        } catch (messageError) {
          console.log("필터 재적용 메시지 전송 실패 (정상적일 수 있음)");
        }
      }
    } catch (error) {
      console.error("새로고침 중 오류:", error);
    }

    // 잠시 대기 후 상태 재확인
    setTimeout(() => {
      this.checkPageStatus();
      this.loadFilterInfo();
    }, 1000);
  }

  openSettings() {
    // 네이버 부동산 페이지에서 필터 패널 열기 시도
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];

      if (currentTab.url && currentTab.url.includes("new.land.naver.com")) {
        try {
          // 먼저 현재 패널 상태 확인
          const statusResponse = await chrome.tabs.sendMessage(currentTab.id, {
            action: "checkFilterStatus",
          });

          if (statusResponse && statusResponse.success) {
            const isExpanded = statusResponse.data?.isExpanded || false;

            // 이미 열려있으면 팝업만 닫기 (패널은 그대로 유지)
            if (isExpanded) {
              console.log("필터 패널이 이미 열려있습니다. 팝업만 닫습니다.");
              window.close();
              return;
            }
          }

          // 패널이 닫혀있거나 상태 확인 실패 시 토글 실행
          const response = await chrome.tabs.sendMessage(currentTab.id, {
            action: "toggleFilterPanel",
          });

          if (response && response.success) {
            console.log("필터 패널 토글 성공:", response.message);
            // 팝업 닫기
            window.close();
          } else {
            console.error(
              "필터 패널 토글 실패:",
              response?.message || "알 수 없는 오류"
            );
            // 실패 시 확장 프로그램 관리 페이지로 이동
            this.openExtensionPage();
          }
        } catch (error) {
          console.error("메시지 전송 실패:", error);
          // 메시지 전송 실패 시 확장 프로그램 관리 페이지로 이동
          this.openExtensionPage();
        }
      } else {
        // 다른 페이지인 경우 확장 프로그램 관리 페이지로 이동
        this.openExtensionPage();
      }
    });
  }

  openExtensionPage() {
    // 확장 프로그램 관리 페이지 열기
    chrome.tabs.create({
      url: "chrome://extensions/?id=" + chrome.runtime.id,
    });
  }

  openHelp() {
    // 도움말 페이지 열기
    chrome.tabs.create({
      url: "https://github.com/MinHeum/naver-land-filter-extension#readme",
    });
  }

  openFeedback() {
    // 피드백 페이지 열기
    chrome.tabs.create({
      url: "https://github.com/MinHeum/naver-land-filter-extension/issues",
    });
  }
}

// 팝업 컨트롤러 초기화
document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});

// 메시지 리스너 추가 (content script로부터 상태 업데이트 받기)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updatePopupStatus") {
    const popup = document.querySelector(".status");
    if (popup && message.data) {
      // 상태 업데이트 로직
      console.log("팝업 상태 업데이트:", message.data);
    }
  }

  sendResponse({ success: true });
});
