// 네이버 부동산 필터 확장 프로그램
class NaverLandFilter {
  constructor() {
    this.filters = {};
    this.statusIndicator = null;
    this.mutationObserver = null; // MutationObserver 추가
    this.init();
  }

  init() {
    // 페이지 로드 완료 후 필터 UI 주입
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.injectFilterUI()
      );
    } else {
      this.injectFilterUI();
    }
  }

  injectFilterUI() {
    // 기존 필터 그룹을 찾고, 그 뒤에 커스텀 필터 그룹을 추가
    const filterGroup = document.querySelector("#complex_etc_type_filter");
    if (filterGroup) {
      this.createFilterPanel();
      this.createStatusIndicator();
      this.setupMutationObserver(); // MutationObserver 설정
    }
  }

  createFilterPanel() {
    console.log("[NLF] createFilterPanel 진입");
    const filterPanel = document.createElement("div");
    filterPanel.id = "naver-land-filter-panel";
    filterPanel.className = "naver-land-filter-panel";

    filterPanel.innerHTML = `
      <div class="filter-header">
        <h3>🔍추가 필터</h3>
        <button class="filter-toggle">펼치기</button>
      </div>
      <div class="filter-content">
        <div class="filter-section">
          <h4>숨길 옵션들</h4>
          <div class="nlf-floor-filter-options">
            <div class="nlf-floor-filter-option">
              <input type="checkbox" id="hide-basement" value="basement" style="display: block !important; visibility: visible !important; opacity: 1 !important; width: 18px !important; height: 18px !important;">
              <label for="hide-basement">반지하 및 지하층 (B1, 저층 등)</label>
            </div>
            <div class="nlf-floor-filter-option">
              <input type="checkbox" id="hide-high-floor" value="high-floor" style="display: block !important; visibility: visible !important; opacity: 1 !important; width: 18px !important; height: 18px !important;">
              <label for="hide-high-floor">고층 (고/층, 최상층 등)</label>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <button id="reset-filters" class="reset-btn">초기화</button>
        </div>
      </div>
    `;

    // DOM에 필터 패널 추가
    const filterGroup = document.querySelector("#complex_etc_type_filter");
    if (filterGroup && filterGroup.parentNode) {
      filterGroup.parentNode.insertBefore(filterPanel, filterGroup.nextSibling);
      console.log("[NLF] 필터 패널이 기존 필터 그룹 옆에 추가되었습니다.");
    } else {
      // 대체 위치들을 순서대로 시도
      const alternativeSelectors = [
        ".filter_area",
        ".complex_filter_wrap",
        ".filter_wrap",
        "#wrap",
        "body",
      ];

      let targetContainer = null;
      for (const selector of alternativeSelectors) {
        targetContainer = document.querySelector(selector);
        if (targetContainer) {
          console.log(`[NLF] 대체 위치 ${selector}에 필터 패널을 추가합니다.`);
          break;
        }
      }

      if (targetContainer) {
        targetContainer.appendChild(filterPanel);
      } else {
        console.error(
          "[NLF] 필터 패널을 추가할 적절한 위치를 찾을 수 없습니다."
        );
        return;
      }
    }

    // 체크박스 가시성 강제 보장
    setTimeout(() => {
      const basementCheckbox = document.getElementById("hide-basement");
      const highFloorCheckbox = document.getElementById("hide-high-floor");

      const checkboxStyle = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 18px !important;
        height: 18px !important;
        margin: 0 !important;
        position: relative !important;
        z-index: 10 !important;
        appearance: auto !important;
        -webkit-appearance: checkbox !important;
        -moz-appearance: checkbox !important;
        border: 2px solid #ccc !important;
        background-color: white !important;
      `;

      if (basementCheckbox) {
        basementCheckbox.style.cssText = checkboxStyle;
      }

      if (highFloorCheckbox) {
        highFloorCheckbox.style.cssText = checkboxStyle;
      }
    }, 100);

    this.bindEvents(filterPanel);
    this.loadSavedFilters();
  }

  createStatusIndicator() {
    this.statusIndicator = document.createElement("div");
    this.statusIndicator.className = "nlf-filter-status-indicator";
    document.body.appendChild(this.statusIndicator);
  }

  bindEvents(filterPanel) {
    // 필터 토글 버튼
    const toggleBtn = filterPanel.querySelector(".filter-toggle");
    const content = filterPanel.querySelector(".filter-content");

    toggleBtn.addEventListener("click", () => {
      const isExpanded = content.classList.contains("expanded");

      if (isExpanded) {
        content.classList.remove("expanded");
        toggleBtn.textContent = "펼치기";
      } else {
        content.classList.add("expanded");
        toggleBtn.textContent = "접기";
      }
    });

    // filter-content 외부 클릭 시 필터 접기
    document.addEventListener("click", (e) => {
      const isClickInsidePanel = filterPanel.contains(e.target);
      const isExpanded = content.classList.contains("expanded");

      if (!isClickInsidePanel && isExpanded) {
        content.classList.remove("expanded");
        toggleBtn.textContent = "펼치기";
      }
    });

    // 층수 필터 옵션 클릭 이벤트 - 실시간 적용 및 저장
    const floorOptions = filterPanel.querySelectorAll(
      ".nlf-floor-filter-option"
    );
    floorOptions.forEach((option) => {
      const checkbox = option.querySelector('input[type="checkbox"]');
      const label = option.querySelector("label");

      // 옵션 전체(div) 클릭 시 체크박스 토글
      option.addEventListener("click", (e) => {
        // 체크박스나 라벨을 직접 클릭한 경우가 아닐 때만 토글
        if (e.target.type !== "checkbox" && e.target.tagName !== "LABEL") {
          checkbox.checked = !checkbox.checked;
          this.updateOptionState(option, checkbox);
          this.applyFiltersRealtime();
          this.saveFilters();
        }
      });

      // 라벨 클릭 시 체크박스 토글 (명시적 처리)
      label.addEventListener("click", (e) => {
        e.preventDefault(); // 기본 라벨 동작 방지
        checkbox.checked = !checkbox.checked;
        this.updateOptionState(option, checkbox);
        this.applyFiltersRealtime();
        this.saveFilters();
      });

      // 체크박스 직접 클릭 시 처리
      checkbox.addEventListener("change", (e) => {
        this.updateOptionState(option, checkbox);
        this.applyFiltersRealtime();
        this.saveFilters();
      });
    });

    // 필터 초기화 버튼
    const resetBtn = filterPanel.querySelector("#reset-filters");
    resetBtn.addEventListener("click", () => this.resetFilters());
  }

  updateOptionState(option, checkbox) {
    if (checkbox.checked) {
      option.classList.add("checked");
    } else {
      option.classList.remove("checked");
    }
  }

  applyFiltersRealtime() {
    // 현재 필터 값들을 수집
    this.filters = {
      hideBasement: document.getElementById("hide-basement").checked,
      hideHighFloor: document.getElementById("hide-high-floor").checked,
    };

    // 필터 적용 로직
    this.filterListings();

    // 상태 표시 업데이트 (알림 없이)
    const activeFilters = [];
    if (this.filters.hideBasement) activeFilters.push("반지하 및 지하층");
    if (this.filters.hideHighFloor) activeFilters.push("고층");

    this.updateStatusIndicator(activeFilters);
    this.updateFilterCount(); // 필터 개수 업데이트 추가
  }

  applyFilters() {
    // 현재 필터 값들을 수집
    this.filters = {
      hideBasement: document.getElementById("hide-basement").checked,
      hideHighFloor: document.getElementById("hide-high-floor").checked,
    };

    // 필터 적용 로직
    this.filterListings();

    // 사용자에게 알림 및 상태 표시
    const activeFilters = [];
    if (this.filters.hideBasement) activeFilters.push("반지하 및 지하층");
    if (this.filters.hideHighFloor) activeFilters.push("고층");

    if (activeFilters.length > 0) {
      this.showNotification(
        `${activeFilters.join(", ")} 필터가 적용되었습니다!`
      );
      this.updateStatusIndicator(activeFilters);
    } else {
      this.showNotification("모든 필터가 해제되었습니다!");
      this.updateStatusIndicator([]);
    }
  }

  filterListings() {
    console.log("적용된 필터:", this.filters);

    // 네이버 부동산 매물 목록 요소들을 찾기 - 실제 구조에 맞게 수정
    const listings = document.querySelectorAll(".item_list .item");
    let hiddenCount = 0;
    let totalCount = listings.length;

    listings.forEach((listing) => {
      // 기존 필터 클래스 제거
      listing.classList.remove("naver-land-hidden");

      const floorInfo = this.extractFloorInfo(listing);

      // 디버깅용 층수 정보 표시
      if (floorInfo.floor !== null || floorInfo.isBasement) {
        console.log("매물 층수:", floorInfo);
      }

      if (this.shouldHideListing(listing, floorInfo)) {
        listing.classList.add("naver-land-hidden");
        hiddenCount++;
      }
    });

    console.log(`총 ${totalCount}개 매물 중 ${hiddenCount}개 숨김 처리`);
  }

  shouldHideListing(listing, floorInfo) {
    // 지하층 필터링
    if (this.filters.hideBasement && floorInfo.isBasement) {
      return true;
    }

    // 고층 필터링
    if (this.filters.hideHighFloor && floorInfo.isHighFloor) {
      return true;
    }

    return false;
  }

  extractFloorInfo(listing) {
    const floorInfo = {
      isBasement: false,
      isHighFloor: false,
      floor: null,
      rawText: "",
    };

    try {
      // 네이버 부동산의 실제 구조에서 층수 정보 추출
      const specElement = listing.querySelector(".spec");

      if (specElement) {
        const specText = specElement.textContent.trim();
        floorInfo.rawText = specText;

        // "B1/4층", "5/6층", "고/5층", "저/4층" 등의 패턴 분석
        const floorMatch = specText.match(/([B]?\d+|고|저|중)\/(\d+)층/);

        if (floorMatch) {
          const currentFloor = floorMatch[1];
          const totalFloors = parseInt(floorMatch[2]);

          // 지하층 체크 (B1, B2 등)
          if (currentFloor.startsWith("B")) {
            floorInfo.isBasement = true;
            floorInfo.floor = -parseInt(currentFloor.substring(1));
          }
          // 일반층 체크
          else if (/^\d+$/.test(currentFloor)) {
            const floor = parseInt(currentFloor);
            floorInfo.floor = floor;
            if (floor === totalFloors) {
              floorInfo.isHighFloor = true;
            }
          }
          // "저층" 표시
          else if (currentFloor === "저") {
            floorInfo.isBasement = true;
            floorInfo.floor = 1; // 대략적인 값
          }
          // "고층" 표시
          else if (currentFloor === "고") {
            floorInfo.isHighFloor = true;
            floorInfo.floor = totalFloors; // 대략적인 값
          }
        }

        // 추가 패턴들
        // "1층", "지하1층" 등의 단독 패턴
        const singleFloorMatch = specText.match(/(지하|B)(\d+)층?|(\d+)층/);
        if (singleFloorMatch && !floorMatch) {
          if (singleFloorMatch[1]) {
            // 지하층
            floorInfo.isBasement = true;
            floorInfo.floor = -parseInt(singleFloorMatch[2]);
          } else if (singleFloorMatch[3]) {
            // 일반층
            const floor = parseInt(singleFloorMatch[3]);
            floorInfo.floor = floor;
          }
        }
      }
    } catch (error) {
      console.error("[NLF] 층수 정보 추출 중 오류:", error);
    }

    return floorInfo;
  }

  updateStatusIndicator(activeFilters) {
    if (!this.statusIndicator) return;

    if (activeFilters.length > 0) {
      this.statusIndicator.textContent = `필터 적용중: ${activeFilters.join(
        ", "
      )}`;
      this.statusIndicator.classList.add("active");
    } else {
      this.statusIndicator.classList.remove("active");
    }
  }

  resetFilters() {
    // 모든 필터를 초기값으로 리셋
    document.getElementById("hide-basement").checked = false;
    document.getElementById("hide-high-floor").checked = false;

    // 체크박스 옵션들의 시각적 상태도 리셋
    const floorOptions = document.querySelectorAll(".nlf-floor-filter-option");
    floorOptions.forEach((option) => {
      option.classList.remove("checked");
    });

    this.filters = {};
    this.saveFilters();

    // 숨겨진 매물들을 다시 표시하고 필터 클래스 제거
    const listings = document.querySelectorAll(".item_list .item");
    listings.forEach((listing) => {
      listing.classList.remove("naver-land-hidden", "nlf-basement-floor");
    });

    this.updateStatusIndicator([]);
    this.updateFilterCount(); // 필터 개수 업데이트 추가
    this.showNotification("필터가 초기화되었습니다!");
  }

  saveFilters() {
    // 필터 설정을 로컬 스토리지에 저장
    const filtersToSave = {
      hideBasement: document.getElementById("hide-basement")
        ? document.getElementById("hide-basement").checked
        : false,
      hideHighFloor: document.getElementById("hide-high-floor")
        ? document.getElementById("hide-high-floor").checked
        : false,
    };

    // Chrome extension context 유효성 검사
    if (typeof chrome !== "undefined" && chrome.storage) {
      try {
        chrome.storage.local.set({ naverLandFilters: filtersToSave }, () => {
          if (chrome.runtime.lastError) {
            console.warn(
              "[NLF] 필터 저장 실패:",
              chrome.runtime.lastError.message
            );
            // 로컬 스토리지 대안 사용
            this.saveFiltersToLocalStorage(filtersToSave);
          } else {
            console.log("[NLF] 필터가 성공적으로 저장되었습니다.");
          }
        });
      } catch (error) {
        console.warn("[NLF] Chrome storage API 사용 불가:", error.message);
        // 로컬 스토리지 대안 사용
        this.saveFiltersToLocalStorage(filtersToSave);
      }
    } else {
      // Chrome extension이 비활성화된 경우 로컬 스토리지 사용
      this.saveFiltersToLocalStorage(filtersToSave);
    }
  }

  // 로컬 스토리지 대안 저장 방법
  saveFiltersToLocalStorage(filters) {
    try {
      localStorage.setItem("naverLandFilters", JSON.stringify(filters));
      console.log("[NLF] 필터가 로컬 스토리지에 저장되었습니다.");
    } catch (error) {
      console.error("[NLF] 로컬 스토리지 저장 실패:", error);
    }
  }

  loadSavedFilters() {
    // Chrome extension context 유효성 검사
    if (typeof chrome !== "undefined" && chrome.storage) {
      try {
        chrome.storage.local.get(["naverLandFilters"], (result) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "[NLF] 필터 불러오기 실패:",
              chrome.runtime.lastError.message
            );
            // 로컬 스토리지 대안 사용
            this.loadFiltersFromLocalStorage();
          } else {
            this.processLoadedFilters(result.naverLandFilters);
          }
        });
      } catch (error) {
        console.warn("[NLF] Chrome storage API 사용 불가:", error.message);
        // 로컬 스토리지 대안 사용
        this.loadFiltersFromLocalStorage();
      }
    } else {
      // Chrome extension이 비활성화된 경우 로컬 스토리지 사용
      this.loadFiltersFromLocalStorage();
    }
  }

  // 로컬 스토리지 대안 불러오기 방법
  loadFiltersFromLocalStorage() {
    try {
      const savedFilters = localStorage.getItem("naverLandFilters");
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        this.processLoadedFilters(filters);
        console.log("[NLF] 필터가 로컬 스토리지에서 불러와졌습니다.");
      }
    } catch (error) {
      console.error("[NLF] 로컬 스토리지 불러오기 실패:", error);
    }
  }

  // 불러온 필터 처리 공통 함수
  processLoadedFilters(filters) {
    if (filters) {
      if (filters.hideBasement) {
        const basementCheckbox = document.getElementById("hide-basement");
        const basementOption = basementCheckbox?.closest(
          ".nlf-floor-filter-option"
        );
        if (basementCheckbox && basementOption) {
          basementCheckbox.checked = true;
          basementOption.classList.add("checked");
        }
      }

      if (filters.hideHighFloor) {
        const highFloorCheckbox = document.getElementById("hide-high-floor");
        const highFloorOption = highFloorCheckbox?.closest(
          ".nlf-floor-filter-option"
        );
        if (highFloorCheckbox && highFloorOption) {
          highFloorCheckbox.checked = true;
          highFloorOption.classList.add("checked");
        }
      }

      this.filters = filters;

      // 저장된 필터가 있으면 자동으로 적용 (실시간 방식 사용)
      if (filters.hideBasement || filters.hideHighFloor) {
        setTimeout(() => this.applyFiltersRealtime(), 500);
      }
    }
  }

  showNotification(message) {
    // 사용자에게 알림을 표시
    const notification = document.createElement("div");
    notification.className = "naver-land-filter-notification";
    notification.textContent = message;

    document.body.appendChild(notification);

    // 3초 후 자동으로 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // MutationObserver 설정 - 새로 추가되는 매물 감지
  setupMutationObserver() {
    console.log("[NLF] MutationObserver 설정 중...");

    // 매물 리스트 컨테이너 찾기
    const listContainer =
      document.querySelector("#listContents1 > div > div > div:nth-child(1)") ||
      document.querySelector(".item_list") ||
      document.querySelector("#listContents1");

    if (!listContainer) {
      console.warn(
        "[NLF] 매물 리스트 컨테이너를 찾을 수 없습니다. 3초 후 재시도합니다."
      );
      setTimeout(() => this.setupMutationObserver(), 3000);
      return;
    }

    console.log("[NLF] 매물 리스트 컨테이너 발견:", listContainer);

    // MutationObserver 콜백 함수
    const observerCallback = (mutations) => {
      let hasNewListings = false;

      mutations.forEach((mutation) => {
        // 새로 추가된 노드들 확인
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            // 매물 항목인지 확인 (클래스명이 'item'인 요소)
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList && node.classList.contains("item")) {
                hasNewListings = true;
                console.log("[NLF] 새로운 매물 감지:", node);
              }
              // 또는 새로 추가된 노드 내부에 매물 항목이 있는지 확인
              else if (node.querySelectorAll) {
                const newItems = node.querySelectorAll(".item");
                if (newItems.length > 0) {
                  hasNewListings = true;
                  console.log(`[NLF] 새로운 매물 ${newItems.length}개 감지`);
                }
              }
            }
          });
        }
      });

      // 새로운 매물이 추가되었으면 필터 적용
      if (hasNewListings && this.hasActiveFilters()) {
        console.log("[NLF] 새로 추가된 매물에 필터 적용 중...");
        setTimeout(() => {
          this.filterListings();
          this.updateFilterCount();
        }, 100); // 짧은 지연으로 DOM 업데이트 완료 보장
      }
    };

    // MutationObserver 생성 및 시작
    this.mutationObserver = new MutationObserver(observerCallback);

    // 관찰 옵션: 자식 노드 추가/제거와 하위 트리 변경 감지
    const observerOptions = {
      childList: true, // 직접 자식 노드의 추가/제거 감지
      subtree: true, // 모든 하위 노드의 변경 감지
      attributes: false, // 속성 변경은 감지하지 않음
      characterData: false, // 텍스트 변경은 감지하지 않음
    };

    this.mutationObserver.observe(listContainer, observerOptions);
    console.log("[NLF] MutationObserver가 시작되었습니다.");
  }

  // 활성화된 필터가 있는지 확인
  hasActiveFilters() {
    return (
      this.filters && (this.filters.hideBasement || this.filters.hideHighFloor)
    );
  }

  // 필터 적용 후 숨겨진 매물 개수 업데이트
  updateFilterCount() {
    const totalListings = document.querySelectorAll(".item_list .item").length;
    const hiddenListings = document.querySelectorAll(
      ".item_list .item.naver-land-hidden"
    ).length;
    const visibleListings = totalListings - hiddenListings;

    console.log(
      `[NLF] 필터 결과: 전체 ${totalListings}개, 숨김 ${hiddenListings}개, 표시 ${visibleListings}개`
    );

    // 상태 표시기 업데이트
    const activeFilters = [];
    if (this.filters.hideBasement) activeFilters.push("반지하 및 지하층");
    if (this.filters.hideHighFloor) activeFilters.push("고층");

    if (activeFilters.length > 0 && this.statusIndicator) {
      this.statusIndicator.textContent = `필터 적용중: ${activeFilters.join(
        ", "
      )} (${visibleListings}/${totalListings}개 표시)`;
      this.statusIndicator.classList.add("active");
    }
  }

  // MutationObserver 정리 (페이지 언로드 시)
  cleanup() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      console.log("[NLF] MutationObserver가 정리되었습니다.");
    }
  }
}

// 확장 프로그램 초기화
const naverLandFilter = new NaverLandFilter();

// 팝업으로부터 메시지 수신 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[NLF] 메시지 수신:", message);

  try {
    switch (message.action) {
      case "toggleFilterPanel":
        // 필터 패널 토글
        const filterPanel = document.getElementById("naver-land-filter-panel");
        if (filterPanel) {
          const content = filterPanel.querySelector(".filter-content");
          const toggleBtn = filterPanel.querySelector(".filter-toggle");
          const wasExpanded = content.classList.contains("expanded");

          if (wasExpanded) {
            content.classList.remove("expanded");
            toggleBtn.textContent = "펼치기";
            sendResponse({
              success: true,
              message: "필터 패널이 접혔습니다.",
              action: "collapsed",
              isExpanded: false,
            });
          } else {
            content.classList.add("expanded");
            toggleBtn.textContent = "접기";
            sendResponse({
              success: true,
              message: "필터 패널이 펼쳐졌습니다.",
              action: "expanded",
              isExpanded: true,
            });
          }
        } else {
          sendResponse({
            success: false,
            message: "필터 패널을 찾을 수 없습니다.",
            action: "not_found",
            isExpanded: false,
          });
        }
        break;

      case "checkFilterStatus":
        // 필터 상태 확인
        const panel = document.getElementById("naver-land-filter-panel");
        const hasPanel = !!panel;
        const isExpanded = panel
          ? panel
              .querySelector(".filter-content")
              ?.classList.contains("expanded")
          : false;
        const activeFilters = naverLandFilter.filters || {};
        const filterCount = Object.values(activeFilters).filter(
          (v) => v === true
        ).length;

        sendResponse({
          success: hasPanel,
          data: {
            hasPanel,
            isExpanded,
            filterCount,
            activeFilters,
          },
        });
        break;

      case "reapplyFilters":
        // 필터 재적용
        if (naverLandFilter.hasActiveFilters()) {
          naverLandFilter.filterListings();
          sendResponse({ success: true, message: "필터가 재적용되었습니다." });
        } else {
          sendResponse({ success: true, message: "활성화된 필터가 없습니다." });
        }
        break;

      default:
        sendResponse({ success: false, message: "알 수 없는 액션입니다." });
    }
  } catch (error) {
    console.error("[NLF] 메시지 처리 중 오류:", error);
    sendResponse({ success: false, message: error.message });
  }

  return true; // 비동기 응답을 위해 true 반환
});

// 페이지 언로드 시 정리
window.addEventListener("beforeunload", () => {
  naverLandFilter.cleanup();
});
