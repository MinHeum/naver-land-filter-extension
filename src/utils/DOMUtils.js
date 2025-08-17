/**
 * DOM 관련 유틸리티 함수들
 */

import { SELECTORS } from "./Constants.js";

export class DOMUtils {
  /**
   * 요소가 존재할 때까지 대기
   */
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * 필터 패널을 삽입할 위치 찾기
   */
  static findFilterInsertLocation() {
    // 기본 위치
    const filterGroup = document.querySelector(SELECTORS.FILTER_GROUP);
    if (filterGroup && filterGroup.parentNode) {
      return {
        container: filterGroup.parentNode,
        insertMethod: "insertAfter",
        reference: filterGroup,
      };
    }

    // 대체 위치들 시도
    for (const selector of SELECTORS.ALTERNATIVE_SELECTORS) {
      const container = document.querySelector(selector);
      if (container) {
        return {
          container,
          insertMethod: "appendChild",
          reference: null,
        };
      }
    }

    return null;
  }
  /**
   * 매물 리스트 컨테이너 찾기
   */
  static findListContainer() {
    for (const selector of SELECTORS.LIST_CONTAINERS) {
      const container = document.querySelector(selector);
      if (container) {
        return container;
      }
    }
    return null;
  }

  /**
   * 체크박스 가시성 강제 설정
   */
  static forceCheckboxVisibility(checkbox) {
    if (!checkbox) return;

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

    checkbox.style.cssText = checkboxStyle;
  }

  /**
   * 요소 삽입 헬퍼
   */
  static insertElement(element, location) {
    if (!location) return false;

    const { container, insertMethod, reference } = location;

    switch (insertMethod) {
      case "insertAfter":
        container.insertBefore(element, reference.nextSibling);
        break;
      case "appendChild":
        container.appendChild(element);
        break;
      default:
        return false;
    }

    return true;
  }

  /**
   * 안전한 요소 제거
   */
  static safeRemoveElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}
