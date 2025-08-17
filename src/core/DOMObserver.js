/**
 * DOM 변화 관찰 클래스
 */

import { TIMEOUTS } from "../utils/Constants.js";
import { DOMUtils } from "../utils/DOMUtils.js";

export class DOMObserver {
  constructor(onNewListings) {
    this.onNewListings = onNewListings;
    this.observer = null;
    this.listContainer = null;
  }

  /**
   * 관찰 시작
   */
  async start() {
    console.log("[NLF] DOMObserver 시작 중...");

    this.listContainer = DOMUtils.findListContainer();

    if (!this.listContainer) {
      console.warn(
        "[NLF] 매물 리스트 컨테이너를 찾을 수 없습니다. 재시도 중..."
      );
      setTimeout(() => this.start(), TIMEOUTS.RETRY_DELAY);
      return;
    }

    console.log("[NLF] 매물 리스트 컨테이너 발견:", this.listContainer);
    this.setupObserver();
  }

  /**
   * MutationObserver 설정
   */
  setupObserver() {
    const observerCallback = (mutations) => {
      this.handleMutations(mutations);
    };

    this.observer = new MutationObserver(observerCallback);

    const observerOptions = {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    };

    this.observer.observe(this.listContainer, observerOptions);
    console.log("[NLF] DOMObserver가 시작되었습니다.");
  }
  /**
   * 변화 처리
   */
  handleMutations(mutations) {
    let hasNewListings = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (this.isListingNode(node)) {
            hasNewListings = true;
            console.log("[NLF] 새로운 매물 감지:", node);
          } else if (this.hasListingNodes(node)) {
            hasNewListings = true;
            const newItems = node.querySelectorAll(".item");
            console.log(`[NLF] 새로운 매물 ${newItems.length}개 감지`);
          }
        });
      }
    });

    if (hasNewListings && this.onNewListings) {
      console.log("[NLF] 새로 추가된 매물에 대한 콜백 실행 중...");
      setTimeout(() => {
        this.onNewListings();
      }, TIMEOUTS.DOM_UPDATE);
    }
  }

  /**
   * 매물 노드인지 확인
   */
  isListingNode(node) {
    return (
      node.nodeType === Node.ELEMENT_NODE &&
      node.classList &&
      node.classList.contains("item")
    );
  }

  /**
   * 매물 노드를 포함하는지 확인
   */
  hasListingNodes(node) {
    return (
      node.nodeType === Node.ELEMENT_NODE &&
      node.querySelectorAll &&
      node.querySelectorAll(".item").length > 0
    );
  }

  /**
   * 관찰 중지
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      console.log("[NLF] DOMObserver가 중지되었습니다.");
    }
  }

  /**
   * 정리
   */
  cleanup() {
    this.stop();
    this.listContainer = null;
    this.onNewListings = null;
  }
}
