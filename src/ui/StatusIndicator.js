/**
 * 필터 상태 표시기 클래스
 */

import { CSS_CLASSES } from '../utils/Constants.js';

export class StatusIndicator {
  constructor() {
    this.element = null;
    this.create();
  }

  /**
   * 상태 표시기 생성
   */
  create() {
    this.element = document.createElement('div');
    this.element.className = CSS_CLASSES.STATUS_INDICATOR;
    this.applyStyles();
    document.body.appendChild(this.element);
  }

  /**
   * 기본 스타일 적용
   */
  applyStyles() {
    Object.assign(this.element.style, {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(52, 73, 94, 0.9)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      zIndex: '9999',
      transition: 'all 0.3s ease',
      opacity: '0',
      transform: 'translateY(10px)',
      pointerEvents: 'none'
    });
  }

  /**
   * 상태 업데이트
   */
  update(activeFilters, visibleCount = null, totalCount = null) {
    if (!this.element) return;

    if (activeFilters.length > 0) {
      let text = `필터 적용중: ${activeFilters.join(', ')}`;
      
      if (visibleCount !== null && totalCount !== null) {
        text += ` (${visibleCount}/${totalCount}개 표시)`;
      }
      
      this.element.textContent = text;
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * 표시기 보이기
   */
  show() {
    if (!this.element) return;
    
    this.element.style.opacity = '1';
    this.element.style.transform = 'translateY(0)';
  }

  /**
   * 표시기 숨기기
   */
  hide() {
    if (!this.element) return;
    
    this.element.style.opacity = '0';
    this.element.style.transform = 'translateY(10px)';
  }

  /**
   * 상태 표시기 제거
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}