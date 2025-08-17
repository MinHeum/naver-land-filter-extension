/**
 * 알림 관리 클래스
 */

import { CSS_CLASSES, TIMEOUTS } from '../utils/Constants.js';
import { DOMUtils } from '../utils/DOMUtils.js';

export class NotificationManager {
  constructor() {
    this.activeNotifications = new Set();
  }

  /**
   * 알림 표시
   */
  show(message, duration = TIMEOUTS.NOTIFICATION) {
    const notification = this.createNotificationElement(message);
    document.body.appendChild(notification);
    
    this.activeNotifications.add(notification);

    // 자동 제거
    setTimeout(() => {
      this.remove(notification);
    }, duration);

    return notification;
  }

  /**
   * 알림 요소 생성
   */
  createNotificationElement(message) {
    const notification = document.createElement('div');
    notification.className = CSS_CLASSES.NOTIFICATION;
    notification.textContent = message;
    
    // 기본 스타일 적용
    this.applyNotificationStyles(notification);
    
    return notification;
  }

  /**
   * 알림 스타일 적용
   */
  applyNotificationStyles(notification) {
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#2c3e50',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      zIndex: '10000',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      animation: 'slideInRight 0.3s ease-out'
    });
  }

  /**
   * 알림 제거
   */
  remove(notification) {
    if (this.activeNotifications.has(notification)) {
      this.activeNotifications.delete(notification);
      DOMUtils.safeRemoveElement(notification);
    }
  }

  /**
   * 모든 알림 제거
   */
  removeAll() {
    this.activeNotifications.forEach(notification => {
      DOMUtils.safeRemoveElement(notification);
    });
    this.activeNotifications.clear();
  }
}