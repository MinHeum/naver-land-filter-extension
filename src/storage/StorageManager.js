/**
 * 저장소 관리 클래스
 * Chrome Extension Storage와 LocalStorage를 지원
 */

import { STORAGE_KEYS } from '../utils/Constants.js';

export class StorageManager {
  constructor() {
    this.isExtensionContext = this.checkExtensionContext();
  }

  /**
   * Chrome Extension 컨텍스트 확인
   */
  checkExtensionContext() {
    return typeof chrome !== 'undefined' && 
           chrome.storage && 
           chrome.storage.local;
  }

  /**
   * 필터 설정 저장
   */
  async saveFilters(filters) {
    try {
      if (this.isExtensionContext) {
        return await this.saveToExtensionStorage(filters);
      } else {
        return this.saveToLocalStorage(filters);
      }
    } catch (error) {
      console.warn('[NLF] Primary storage failed, trying fallback:', error.message);
      return this.saveToLocalStorage(filters);
    }
  }

  /**
   * 필터 설정 불러오기
   */
  async loadFilters() {
    try {
      if (this.isExtensionContext) {
        return await this.loadFromExtensionStorage();
      } else {
        return this.loadFromLocalStorage();
      }
    } catch (error) {
      console.warn('[NLF] Primary storage failed, trying fallback:', error.message);
      return this.loadFromLocalStorage();
    }
  }  /**
   * Chrome Extension Storage에 저장
   */
  saveToExtensionStorage(filters) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEYS.FILTERS]: filters }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('[NLF] 필터가 Extension Storage에 저장되었습니다.');
          resolve(true);
        }
      });
    });
  }

  /**
   * Chrome Extension Storage에서 불러오기
   */
  loadFromExtensionStorage() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([STORAGE_KEYS.FILTERS], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('[NLF] 필터가 Extension Storage에서 불러와졌습니다.');
          resolve(result[STORAGE_KEYS.FILTERS] || null);
        }
      });
    });
  }

  /**
   * LocalStorage에 저장 (대체 방법)
   */
  saveToLocalStorage(filters) {
    try {
      localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
      console.log('[NLF] 필터가 LocalStorage에 저장되었습니다.');
      return true;
    } catch (error) {
      console.error('[NLF] LocalStorage 저장 실패:', error);
      return false;
    }
  }

  /**
   * LocalStorage에서 불러오기 (대체 방법)
   */
  loadFromLocalStorage() {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS);
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        console.log('[NLF] 필터가 LocalStorage에서 불러와졌습니다.');
        return filters;
      }
      return null;
    } catch (error) {
      console.error('[NLF] LocalStorage 불러오기 실패:', error);
      return null;
    }
  }
}