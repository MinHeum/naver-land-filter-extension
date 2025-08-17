/**
 * 네이버 부동산 필터 확장 프로그램 상수 정의
 */

export const SELECTORS = {
  // 기본 필터 그룹
  FILTER_GROUP: '#complex_etc_type_filter',
  
  // 대체 필터 위치들
  ALTERNATIVE_SELECTORS: [
    '.filter_area',
    '.complex_filter_wrap',
    '.filter_wrap',
    '#wrap',
    'body'
  ],
  
  // 매물 리스트
  LISTINGS: '.item_list .item',
  LIST_CONTAINERS: [
    '#listContents1 > div > div > div:nth-child(1)',
    '.item_list',
    '#listContents1'
  ],
  
  // 매물 정보
  FLOOR_SPEC: '.spec'
};

export const FILTER_TYPES = {
  BASEMENT: 'basement',
  HIGH_FLOOR: 'high-floor'
};

export const CSS_CLASSES = {
  FILTER_PANEL: 'naver-land-filter-panel',
  FILTER_CONTENT: 'filter-content',
  FILTER_OPTION: 'nlf-floor-filter-option',
  CHECKED: 'checked',
  EXPANDED: 'expanded',
  HIDDEN: 'naver-land-hidden',
  STATUS_INDICATOR: 'nlf-filter-status-indicator',
  NOTIFICATION: 'naver-land-filter-notification'
};

export const STORAGE_KEYS = {
  FILTERS: 'naverLandFilters'
};

export const TIMEOUTS = {
  NOTIFICATION: 3000,
  DOM_UPDATE: 100,
  RETRY_DELAY: 3000,
  CHECKBOX_VISIBILITY: 100
};

export const FLOOR_PATTERNS = {
  FLOOR_WITH_TOTAL: /([B]?\d+|고|저|중)\/(\d+)층/,
  SINGLE_FLOOR: /(지하|B)(\d+)층?|(\d+)층/
};

export const MESSAGES = {
  FILTER_APPLIED: '필터가 적용되었습니다!',
  FILTER_RESET: '필터가 초기화되었습니다!',
  ALL_FILTERS_DISABLED: '모든 필터가 해제되었습니다!',
  PANEL_EXPANDED: '필터 패널이 펼쳐졌습니다.',
  PANEL_COLLAPSED: '필터 패널이 접혔습니다.',
  PANEL_NOT_FOUND: '필터 패널을 찾을 수 없습니다.',
  FILTER_REAPPLIED: '필터가 재적용되었습니다.',
  NO_ACTIVE_FILTERS: '활성화된 필터가 없습니다.',
  UNKNOWN_ACTION: '알 수 없는 액션입니다.'
};