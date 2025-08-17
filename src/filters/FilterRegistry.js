/**
 * 필터 등록 및 관리 클래스
 */

import { FloorFilter } from './FloorFilter.js';
import { FILTER_TYPES } from '../utils/Constants.js';

export class FilterRegistry {
  constructor() {
    this.filters = new Map();
    this.initializeDefaultFilters();
  }

  /**
   * 기본 필터들 초기화
   */
  initializeDefaultFilters() {
    // 반지하 및 지하층 필터
    const basementFilter = new FloorFilter(
      'hide-basement',
      '반지하 및 지하층',
      FILTER_TYPES.BASEMENT
    );

    // 고층 필터
    const highFloorFilter = new FloorFilter(
      'hide-high-floor',
      '고층',
      FILTER_TYPES.HIGH_FLOOR
    );

    this.registerFilter(basementFilter);
    this.registerFilter(highFloorFilter);
  }

  /**
   * 필터 등록
   */
  registerFilter(filter) {
    this.filters.set(filter.id, filter);
  }

  /**
   * 필터 조회
   */
  getFilter(id) {
    return this.filters.get(id);
  }

  /**
   * 모든 필터 조회
   */
  getAllFilters() {
    return Array.from(this.filters.values());
  }

  /**
   * 활성화된 필터들 조회
   */
  getActiveFilters() {
    return this.getAllFilters().filter(filter => filter.isEnabled());
  }

  /**
   * 매물이 필터링되어야 하는지 확인
   */
  shouldFilterListing(listing) {
    return this.getActiveFilters().some(filter => filter.shouldFilter(listing));
  }

  /**
   * 모든 필터 초기화
   */
  resetAllFilters() {
    this.filters.forEach(filter => filter.disable());
  }

  /**
   * 필터 상태 직렬화
   */
  serialize() {
    const data = {};
    this.filters.forEach((filter, id) => {
      data[id] = filter.serialize();
    });
    return data;
  }

  /**
   * 필터 상태 역직렬화
   */
  deserialize(data) {
    if (!data) return;

    this.filters.forEach((filter, id) => {
      if (data[id]) {
        filter.deserialize(data[id]);
      }
    });
  }
}