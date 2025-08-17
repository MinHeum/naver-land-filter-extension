/**
 * 층수 필터 클래스
 */

import { BaseFilter } from './BaseFilter.js';
import { SELECTORS, FLOOR_PATTERNS } from '../utils/Constants.js';

export class FloorFilter extends BaseFilter {
  constructor(id, name, filterType) {
    super(id, name);
    this.filterType = filterType; // 'basement' 또는 'high-floor'
  }

  /**
   * 매물에서 층수 정보 추출
   */
  extractFloorInfo(listing) {
    const floorInfo = {
      isBasement: false,
      isHighFloor: false,
      floor: null,
      rawText: ''
    };

    try {
      const specElement = listing.querySelector(SELECTORS.FLOOR_SPEC);
      if (!specElement) return floorInfo;

      const specText = specElement.textContent.trim();
      floorInfo.rawText = specText;

      // "B1/4층", "5/6층", "고/5층", "저/4층" 등의 패턴 분석
      const floorMatch = specText.match(FLOOR_PATTERNS.FLOOR_WITH_TOTAL);
      
      if (floorMatch) {
        const currentFloor = floorMatch[1];
        const totalFloors = parseInt(floorMatch[2]);

        this.analyzeFloorWithTotal(floorInfo, currentFloor, totalFloors);
      } else {
        // 단독 패턴 분석
        this.analyzeSingleFloor(floorInfo, specText);
      }
    } catch (error) {
      console.error('[NLF] 층수 정보 추출 중 오류:', error);
    }

    return floorInfo;
  }  /**
   * 총 층수와 함께 표시된 층수 분석
   */
  analyzeFloorWithTotal(floorInfo, currentFloor, totalFloors) {
    // 지하층 체크 (B1, B2 등)
    if (currentFloor.startsWith('B')) {
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
    else if (currentFloor === '저') {
      floorInfo.isBasement = true;
      floorInfo.floor = 1;
    }
    // "고층" 표시
    else if (currentFloor === '고') {
      floorInfo.isHighFloor = true;
      floorInfo.floor = totalFloors;
    }
  }

  /**
   * 단독 층수 패턴 분석
   */
  analyzeSingleFloor(floorInfo, specText) {
    const singleFloorMatch = specText.match(FLOOR_PATTERNS.SINGLE_FLOOR);
    if (singleFloorMatch) {
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

  /**
   * 필터 적용 여부 결정
   */
  shouldFilter(listing) {
    if (!this.enabled) return false;

    const floorInfo = this.extractFloorInfo(listing);
    
    switch (this.filterType) {
    case 'basement':
      return floorInfo.isBasement;
    case 'high-floor':
      return floorInfo.isHighFloor;
    default:
      return false;
    }
  }
}