/**
 * 필터 패널 UI 클래스
 */

import { CSS_CLASSES, TIMEOUTS } from "../utils/Constants.js";
import { DOMUtils } from "../utils/DOMUtils.js";

export class FilterPanel {
  constructor(filterRegistry, onFilterChange) {
    this.filterRegistry = filterRegistry;
    this.onFilterChange = onFilterChange;
    this.element = null;
    this.isExpanded = false;
  }

  /**
   * 필터 패널 생성
   */
  create() {
    this.element = document.createElement("div");
    this.element.id = "naver-land-filter-panel";
    this.element.className = CSS_CLASSES.FILTER_PANEL;

    this.element.innerHTML = this.generateHTML();
    this.bindEvents();
    this.setupCheckboxVisibility();

    return this.element;
  }

  /**
   * HTML 생성
   */
  generateHTML() {
    const filters = this.filterRegistry.getAllFilters();

    const filterOptions = filters
      .map(
        (filter) => `
      <div class="${CSS_CLASSES.FILTER_OPTION}">
        <input type="checkbox" 
               id="${filter.id}" 
               value="${filter.id}" 
               ${filter.isEnabled() ? "checked" : ""}
               style="display: block !important; visibility: visible !important; opacity: 1 !important; width: 18px !important; height: 18px !important;">
        <label for="${filter.id}">${filter.name}</label>
      </div>
    `
      )
      .join("");

    return `
      <div class="filter-header">
        <h3>🔍추가 필터</h3>
        <button class="filter-toggle">펼치기</button>
      </div>
      <div class="${CSS_CLASSES.FILTER_CONTENT}">
        <div class="filter-section">
          <h4>숨길 옵션들</h4>
          <div class="nlf-floor-filter-options">
            ${filterOptions}
          </div>
        </div>
        <div class="filter-actions">
          <button id="reset-filters" class="reset-btn">초기화</button>
        </div>
      </div>
    `;
  }
  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    if (!this.element) return;

    // 토글 버튼
    const toggleBtn = this.element.querySelector(".filter-toggle");

    toggleBtn.addEventListener("click", () => {
      this.toggle();
    });

    // 외부 클릭 시 패널 접기
    document.addEventListener("click", (e) => {
      if (!this.element.contains(e.target) && this.isExpanded) {
        this.collapse();
      }
    });

    // 필터 옵션 이벤트
    this.bindFilterOptions();

    // 초기화 버튼
    const resetBtn = this.element.querySelector("#reset-filters");
    resetBtn.addEventListener("click", () => {
      this.resetFilters();
    });
  }

  /**
   * 필터 옵션 이벤트 바인딩
   */
  bindFilterOptions() {
    const filterOptions = this.element.querySelectorAll(
      `.${CSS_CLASSES.FILTER_OPTION}`
    );

    filterOptions.forEach((option) => {
      const checkbox = option.querySelector('input[type="checkbox"]');
      const label = option.querySelector("label");

      // 옵션 전체 클릭
      option.addEventListener("click", (e) => {
        if (e.target.type !== "checkbox" && e.target.tagName !== "LABEL") {
          this.toggleFilter(checkbox);
        }
      });

      // 라벨 클릭
      label.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleFilter(checkbox);
      });

      // 체크박스 직접 클릭
      checkbox.addEventListener("change", () => {
        this.toggleFilter(checkbox);
      });
    });
  }

  /**
   * 필터 토글
   */
  toggleFilter(checkbox) {
    const filter = this.filterRegistry.getFilter(checkbox.id);
    if (!filter) return;

    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
      filter.enable();
      checkbox
        .closest(`.${CSS_CLASSES.FILTER_OPTION}`)
        .classList.add(CSS_CLASSES.CHECKED);
    } else {
      filter.disable();
      checkbox
        .closest(`.${CSS_CLASSES.FILTER_OPTION}`)
        .classList.remove(CSS_CLASSES.CHECKED);
    }

    if (this.onFilterChange) {
      this.onFilterChange();
    }
  }
  /**
   * 패널 펼치기
   */
  expand() {
    if (!this.element) return;

    const content = this.element.querySelector(
      `.${CSS_CLASSES.FILTER_CONTENT}`
    );
    const toggleBtn = this.element.querySelector(".filter-toggle");

    content.classList.add(CSS_CLASSES.EXPANDED);
    toggleBtn.textContent = "접기";
    this.isExpanded = true;
  }

  /**
   * 패널 접기
   */
  collapse() {
    if (!this.element) return;

    const content = this.element.querySelector(
      `.${CSS_CLASSES.FILTER_CONTENT}`
    );
    const toggleBtn = this.element.querySelector(".filter-toggle");

    content.classList.remove(CSS_CLASSES.EXPANDED);
    toggleBtn.textContent = "펼치기";
    this.isExpanded = false;
  }

  /**
   * 패널 토글
   */
  toggle() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /**
   * 필터 초기화
   */
  resetFilters() {
    this.filterRegistry.resetAllFilters();

    // UI 업데이트
    const filterOptions = this.element.querySelectorAll(
      `.${CSS_CLASSES.FILTER_OPTION}`
    );
    filterOptions.forEach((option) => {
      const checkbox = option.querySelector('input[type="checkbox"]');
      checkbox.checked = false;
      option.classList.remove(CSS_CLASSES.CHECKED);
    });

    if (this.onFilterChange) {
      this.onFilterChange();
    }
  }

  /**
   * 체크박스 가시성 설정
   */
  setupCheckboxVisibility() {
    setTimeout(() => {
      const checkboxes = this.element.querySelectorAll(
        'input[type="checkbox"]'
      );
      checkboxes.forEach((checkbox) => {
        DOMUtils.forceCheckboxVisibility(checkbox);
      });
    }, TIMEOUTS.CHECKBOX_VISIBILITY);
  }

  /**
   * 저장된 필터 상태 복원
   */
  restoreFilterStates() {
    const filters = this.filterRegistry.getAllFilters();

    filters.forEach((filter) => {
      const checkbox = this.element.querySelector(`#${filter.id}`);
      const option = checkbox?.closest(`.${CSS_CLASSES.FILTER_OPTION}`);

      if (checkbox && option) {
        checkbox.checked = filter.isEnabled();
        if (filter.isEnabled()) {
          option.classList.add(CSS_CLASSES.CHECKED);
        }
      }
    });
  }
}
