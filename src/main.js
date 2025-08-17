/**
 * 네이버 부동산 필터 확장 프로그램 메인 클래스
 */

import { FilterManager } from './core/FilterManager.js';
import { FilterPanel } from './ui/FilterPanel.js';
import { StatusIndicator } from './ui/StatusIndicator.js';
import { NotificationManager } from './ui/NotificationManager.js';
import { DOMUtils } from './utils/DOMUtils.js';
import { MESSAGES, TIMEOUTS } from './utils/Constants.js';

export class NaverLandFilter {
  constructor() {
    this.filterManager = new FilterManager();
    this.filterPanel = null;
    this.statusIndicator = null;
    this.notificationManager = new NotificationManager();

    this.init();
  }

  /**
   * 초기화
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * 설정
   */
  async setup() {
    await this.loadSavedFilters();
    await this.createUI();
    this.startObserving();
    this.bindMessageListener();
  }

  /**
   * UI 생성
   */
  async createUI() {
    // 필터 그룹이 존재할 때까지 대기
    const filterGroup = await DOMUtils.waitForElement(
      '#complex_etc_type_filter'
    );

    if (filterGroup) {
      this.createFilterPanel();
      this.createStatusIndicator();
    } else {
      console.warn('[NLF] 필터 그룹을 찾을 수 없습니다.');
    }
  }

  /**
   * 필터 패널 생성
   */
  createFilterPanel() {
    this.filterPanel = new FilterPanel(
      this.filterManager.getFilterRegistry(),
      () => this.onFilterChange()
    );

    const panelElement = this.filterPanel.create();
    const location = DOMUtils.findFilterInsertLocation();

    if (DOMUtils.insertElement(panelElement, location)) {
      console.log('[NLF] 필터 패널이 성공적으로 추가되었습니다.');
    } else {
      console.error('[NLF] 필터 패널을 추가할 수 없습니다.');
    }
  }

  /**
   * 상태 표시기 생성
   */
  createStatusIndicator() {
    this.statusIndicator = new StatusIndicator();
  }

  /**
   * 필터 변경 시 처리
   */
  onFilterChange() {
    const result = this.filterManager.filterListings();
    const activeFilters = this.filterManager.getActiveFilterNames();

    this.updateStatusIndicator(activeFilters, result);
    this.filterManager.saveFilters();
  }

  /**
   * 상태 표시기 업데이트
   */
  updateStatusIndicator(activeFilters, result = null) {
    if (!this.statusIndicator) return;

    if (!result) {
      result = this.filterManager.getListingCounts();
    }

    this.statusIndicator.update(activeFilters, result.visible, result.total);
  }

  /**
   * 저장된 필터 불러오기
   */
  async loadSavedFilters() {
    const loaded = await this.filterManager.loadFilters();

    if (loaded) {
      // 필터가 로드되면 잠시 후 적용
      setTimeout(() => {
        const result = this.filterManager.filterListings();
        const activeFilters = this.filterManager.getActiveFilterNames();
        this.updateStatusIndicator(activeFilters, result);
      }, TIMEOUTS.DOM_UPDATE);
    }
  }

  /**
   * DOM 관찰 시작
   */
  startObserving() {
    this.filterManager.startObserving();
  }

  /**
   * 메시지 리스너 바인딩
   */
  bindMessageListener() {
    if (
      typeof chrome !== 'undefined' &&
      chrome.runtime &&
      chrome.runtime.onMessage
    ) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sendResponse);
        return true; // 비동기 응답
      });
    }
  }

  /**
   * 메시지 처리
   */
  handleMessage(message, sendResponse) {
    console.log('[NLF] 메시지 수신:', message);

    try {
      switch (message.action) {
      case 'toggleFilterPanel':
        this.handleToggleFilterPanel(sendResponse);
        break;

      case 'checkFilterStatus':
        this.handleCheckFilterStatus(sendResponse);
        break;

      case 'reapplyFilters':
        this.handleReapplyFilters(sendResponse);
        break;

      default:
        sendResponse({
          success: false,
          message: MESSAGES.UNKNOWN_ACTION,
        });
      }
    } catch (error) {
      console.error('[NLF] 메시지 처리 중 오류:', error);
      sendResponse({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * 필터 패널 토글 처리
   */
  handleToggleFilterPanel(sendResponse) {
    if (!this.filterPanel || !this.filterPanel.element) {
      sendResponse({
        success: false,
        message: MESSAGES.PANEL_NOT_FOUND,
        action: 'not_found',
        isExpanded: false,
      });
      return;
    }

    if (this.filterPanel.isExpanded) {
      this.filterPanel.collapse();
      sendResponse({
        success: true,
        message: MESSAGES.PANEL_COLLAPSED,
        action: 'collapsed',
        isExpanded: false,
      });
    } else {
      this.filterPanel.expand();
      sendResponse({
        success: true,
        message: MESSAGES.PANEL_EXPANDED,
        action: 'expanded',
        isExpanded: true,
      });
    }
  }

  /**
   * 필터 상태 확인 처리
   */
  handleCheckFilterStatus(sendResponse) {
    const hasPanel = !!(this.filterPanel && this.filterPanel.element);
    const isExpanded = hasPanel ? this.filterPanel.isExpanded : false;
    const activeFilters = this.filterManager.getActiveFilterNames();
    const filterCount = activeFilters.length;

    sendResponse({
      success: hasPanel,
      data: {
        hasPanel,
        isExpanded,
        filterCount,
        activeFilters,
      },
    });
  }

  /**
   * 필터 재적용 처리
   */
  handleReapplyFilters(sendResponse) {
    if (this.filterManager.hasActiveFilters()) {
      const result = this.filterManager.filterListings();
      const activeFilters = this.filterManager.getActiveFilterNames();
      this.updateStatusIndicator(activeFilters, result);

      sendResponse({
        success: true,
        message: MESSAGES.FILTER_REAPPLIED,
      });
    } else {
      sendResponse({
        success: true,
        message: MESSAGES.NO_ACTIVE_FILTERS,
      });
    }
  }

  /**
   * 정리
   */
  cleanup() {
    this.filterManager.cleanup();

    if (this.statusIndicator) {
      this.statusIndicator.destroy();
    }

    if (this.notificationManager) {
      this.notificationManager.removeAll();
    }
  }
}

// 확장 프로그램 초기화
const naverLandFilter = new NaverLandFilter();

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  naverLandFilter.cleanup();
});
