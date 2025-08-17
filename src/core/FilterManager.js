/**
 * 필터 관리 핵심 클래스
 */

import { SELECTORS, CSS_CLASSES } from "../utils/Constants.js";
import { FilterRegistry } from "../filters/FilterRegistry.js";
import { StorageManager } from "../storage/StorageManager.js";
import { DOMObserver } from "./DOMObserver.js";

export class FilterManager {
  constructor() {
    this.filterRegistry = new FilterRegistry();
    this.storageManager = new StorageManager();
    this.domObserver = new DOMObserver(() => this.handleNewListings());
  }

  /**
   * 매물 필터링 실행
   */
  filterListings() {
    console.log("[NLF] 매물 필터링 시작...");

    const listings = document.querySelectorAll(SELECTORS.LISTINGS);
    let hiddenCount = 0;
    const totalCount = listings.length;

    listings.forEach((listing) => {
      // 기존 필터 클래스 제거
      listing.classList.remove(CSS_CLASSES.HIDDEN);

      // 필터 적용 여부 확인
      if (this.filterRegistry.shouldFilterListing(listing)) {
        listing.classList.add(CSS_CLASSES.HIDDEN);
        hiddenCount++;
      }
    });

    console.log(`[NLF] 총 ${totalCount}개 매물 중 ${hiddenCount}개 숨김 처리`);

    return {
      total: totalCount,
      hidden: hiddenCount,
      visible: totalCount - hiddenCount,
    };
  }

  /**
   * 새로운 매물 추가 시 처리
   */
  handleNewListings() {
    if (this.hasActiveFilters()) {
      console.log("[NLF] 새로 추가된 매물에 필터 적용 중...");
      return this.filterListings();
    } else {
      console.log("[NLF] 새로운 매물 감지, 개수 업데이트 중...");
      return this.getListingCounts();
    }
  }

  /**
   * 활성화된 필터 확인
   */
  hasActiveFilters() {
    return this.filterRegistry.getActiveFilters().length > 0;
  }
  /**
   * 현재 매물 개수 정보 반환
   */
  getListingCounts() {
    const totalListings = document.querySelectorAll(SELECTORS.LISTINGS).length;
    const hiddenListings = document.querySelectorAll(
      `${SELECTORS.LISTINGS}.${CSS_CLASSES.HIDDEN}`
    ).length;

    return {
      total: totalListings,
      hidden: hiddenListings,
      visible: totalListings - hiddenListings,
    };
  }

  /**
   * 활성화된 필터 이름 목록 반환
   */
  getActiveFilterNames() {
    return this.filterRegistry.getActiveFilters().map((filter) => filter.name);
  }

  /**
   * 모든 필터 초기화
   */
  resetAllFilters() {
    this.filterRegistry.resetAllFilters();

    // 숨겨진 매물들 다시 표시
    const hiddenListings = document.querySelectorAll(
      `${SELECTORS.LISTINGS}.${CSS_CLASSES.HIDDEN}`
    );
    hiddenListings.forEach((listing) => {
      listing.classList.remove(CSS_CLASSES.HIDDEN);
    });

    return this.getListingCounts();
  }

  /**
   * 필터 설정 저장
   */
  async saveFilters() {
    const filterData = this.filterRegistry.serialize();
    await this.storageManager.saveFilters(filterData);
  }

  /**
   * 필터 설정 불러오기
   */
  async loadFilters() {
    const filterData = await this.storageManager.loadFilters();
    if (filterData) {
      this.filterRegistry.deserialize(filterData);
      return true;
    }
    return false;
  }

  /**
   * DOM 관찰 시작
   */
  startObserving() {
    this.domObserver.start();
  }

  /**
   * 정리
   */
  cleanup() {
    this.domObserver.cleanup();
  }

  /**
   * 필터 레지스트리 반환 (UI에서 사용)
   */
  getFilterRegistry() {
    return this.filterRegistry;
  }
}
