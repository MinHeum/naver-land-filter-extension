/**
 * 필터 기본 추상 클래스
 */

export class BaseFilter {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.enabled = false;
  }

  /**
   * 필터 초기화
   */
  init() {
    // 하위 클래스에서 구현
  }

  /**
   * 필터 적용 여부 확인
   */
  shouldFilter() {
    // 하위 클래스에서 구현
    throw new Error("shouldFilter method must be implemented");
  }

  /**
   * 필터 활성화
   */
  enable() {
    this.enabled = true;
  }

  /**
   * 필터 비활성화
   */
  disable() {
    this.enabled = false;
  }

  /**
   * 필터 토글
   */
  toggle() {
    this.enabled = !this.enabled;
  }

  /**
   * 필터 상태 반환
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 직렬화 (저장용)
   */
  serialize() {
    return {
      id: this.id,
      enabled: this.enabled,
    };
  }

  /**
   * 역직렬화 (불러오기용)
   */
  deserialize(data) {
    if (data && typeof data.enabled === "boolean") {
      this.enabled = data.enabled;
    }
  }
}
