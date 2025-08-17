# 🤖 Agent Rules for Chrome Extension Development

## 📋 프로젝트 개요

**프로젝트명**: Naver Land Filter Chrome Extension  
**목적**: 네이버 부동산 지도에서 추가 필터링 기능 제공  
**기술 스택**: JavaScript (ES6+), HTML5, CSS3, Chrome Extension API

## 🎯 주요 목표

1. **사용자 경험 향상**: 네이버 부동산 사용자들이 더 효율적으로 매물을 검색할 수 있도록 도움
2. **기능 확장**: 기존 네이버 부동산 서비스에 없는 추가 필터링 옵션 제공
3. **성능 최적화**: 가벼우면서도 효과적인 필터링 시스템 구현
4. **접근성**: 다양한 사용자 환경(데스크톱, 모바일, 다크모드) 지원

## 🛠️ 개발 원칙

### 1. 코드 품질
- **가독성**: 명확하고 이해하기 쉬운 코드 작성
- **유지보수성**: 모듈화된 구조로 코드 관리 용이성 확보
- **확장성**: 새로운 기능 추가가 쉬운 구조 설계
- **테스트 가능성**: 단위 테스트가 가능한 코드 구조

### 2. 사용자 중심 설계
- **직관적 UI**: 사용자가 쉽게 이해할 수 있는 인터페이스
- **반응형 디자인**: 다양한 화면 크기에서 최적화된 경험
- **접근성**: 키보드 네비게이션, 스크린 리더 등 지원
- **성능**: 빠른 응답 시간과 부드러운 애니메이션

### 3. 보안 및 개인정보
- **최소 권한**: 필요한 최소한의 권한만 요청
- **데이터 보호**: 사용자 데이터를 안전하게 처리
- **투명성**: 수집하는 데이터와 사용 목적을 명확히 안내

## 🔧 기술적 가이드라인

### 1. JavaScript 코딩 스타일
```javascript
// ✅ 권장사항
class NaverLandFilter {
  constructor() {
    this.filters = {};
    this.init();
  }

  async applyFilters() {
    try {
      const result = await this.processFilters();
      this.updateUI(result);
    } catch (error) {
      console.error('필터 적용 실패:', error);
      this.showError('필터를 적용할 수 없습니다.');
    }
  }
}

// ❌ 피해야 할 패턴
function applyFilters() {
  // 전역 함수 사용
  // 에러 처리 부족
  // 비동기 처리 부족
}
```

### 2. CSS 구조화
```css
/* ✅ 권장사항 */
.naver-land-filter-panel {
  /* 기본 스타일 */
  position: fixed;
  top: 80px;
  right: 20px;
  width: 300px;
  
  /* 테마 지원 */
  background: var(--bg-color, white);
  color: var(--text-color, #333);
  
  /* 반응형 */
  @media (max-width: 768px) {
    width: 280px;
    right: 10px;
  }
}

/* ❌ 피해야 할 패턴 */
.naver-land-filter-panel {
  /* 하드코딩된 값 */
  /* 반응형 고려 부족 */
  /* 테마 지원 부족 */
}
```

### 3. HTML 시맨틱
```html
<!-- ✅ 권장사항 -->
<div class="filter-panel" role="region" aria-label="부동산 필터">
  <header class="filter-header">
    <h3>🔍 추가 필터</h3>
    <button class="filter-toggle" aria-expanded="true">접기</button>
  </header>
  
  <form class="filter-form" role="search">
    <fieldset>
      <legend>필터 옵션</legend>
      <!-- 필터 입력 요소들 -->
    </fieldset>
  </form>
</div>

<!-- ❌ 피해야 할 패턴 -->
<div class="filter">
  <div class="title">필터</div>
  <div class="inputs">
    <!-- 시맨틱 구조 부족 -->
  </div>
</div>
```

## 📱 UI/UX 가이드라인

### 1. 디자인 시스템
- **색상**: 네이버 브랜드 컬러 (#03c75a) 기반
- **타이포그래피**: 시스템 폰트 스택 사용
- **간격**: 8px 단위의 일관된 여백 시스템
- **그림자**: 계층 구조를 명확히 하는 그림자 효과

### 2. 상호작용 패턴
- **호버 효과**: 버튼과 링크에 적절한 호버 상태 제공
- **포커스 표시**: 키보드 네비게이션을 위한 명확한 포커스 표시
- **로딩 상태**: 비동기 작업 시 적절한 로딩 인디케이터
- **에러 처리**: 사용자 친화적인 에러 메시지와 복구 방법 제시

### 3. 접근성 요구사항
- **키보드 네비게이션**: 모든 기능을 키보드로 접근 가능
- **스크린 리더**: 적절한 ARIA 라벨과 역할 정의
- **색상 대비**: WCAG AA 기준 충족
- **텍스트 크기**: 최소 14px 이상의 가독성 있는 텍스트

## 🔍 필터링 시스템 설계

### 1. 필터 구조
```javascript
const filterStructure = {
  // 기본 정보
  basic: {
    transactionType: 'sale|rent|monthly|all',
    areaRange: 'small|medium|large|all',
    buildingAge: 'new|recent|old|all'
  },
  
  // 편의 시설
  amenities: {
    parking: boolean,
    elevator: boolean,
    airConditioning: boolean,
    heating: boolean
  },
  
  // 위치 기반
  location: {
    subwayDistance: 'walking|bus|car',
    schoolDistance: number, // km
    hospitalDistance: number // km
  },
  
  // 가격 정보
  price: {
    minPrice: number,
    maxPrice: number,
    deposit: number,
    monthlyRent: number
  }
};
```

### 2. 필터 적용 로직
```javascript
class FilterEngine {
  // 필터 조건 평가
  evaluateFilter(listing, filters) {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all') return true;
      return this.matchesCondition(listing[key], value);
    });
  }
  
  // 조건별 매칭 로직
  matchesCondition(listingValue, filterValue) {
    // 구현 세부사항
  }
  
  // 성능 최적화된 필터링
  batchFilter(listings, filters) {
    // 대량 데이터 처리 최적화
  }
}
```

## 🧪 테스트 전략

### 1. 단위 테스트
- **필터 로직**: 각 필터 조건의 정확성 검증
- **UI 컴포넌트**: 개별 컴포넌트의 동작 검증
- **유틸리티 함수**: 헬퍼 함수들의 정확성 검증

### 2. 통합 테스트
- **페이지 주입**: 네이버 부동산 페이지에서의 정상 동작
- **API 연동**: Chrome Extension API와의 상호작용
- **데이터 저장**: 로컬 스토리지 동작 검증

### 3. 사용자 테스트
- **사용성 테스트**: 실제 사용자들의 사용 경험 평가
- **성능 테스트**: 다양한 환경에서의 성능 측정
- **접근성 테스트**: 스크린 리더 등 보조 기술 지원 검증

## 🚀 배포 및 유지보수

### 1. 버전 관리
- **시맨틱 버저닝**: MAJOR.MINOR.PATCH 형식
- **릴리스 노트**: 각 버전별 변경사항 상세 기록
- **롤백 계획**: 문제 발생 시 이전 버전으로 복구 방안

### 2. 모니터링
- **에러 추적**: 사용자 환경에서 발생하는 오류 수집
- **사용 통계**: 기능별 사용률 및 성능 지표 수집
- **사용자 피드백**: 개선 요청 및 버그 리포트 수집

### 3. 업데이트 전략
- **자동 업데이트**: Chrome Web Store를 통한 자동 배포
- **점진적 배포**: 일부 사용자에게 먼저 배포하여 안정성 검증
- **사용자 알림**: 중요 업데이트 시 사용자에게 알림

## 📚 학습 리소스

### 1. 필수 지식
- **Chrome Extension API**: [공식 문서](https://developer.chrome.com/docs/extensions/)
- **Manifest V3**: 최신 확장 프로그램 표준
- **Service Workers**: 백그라운드 작업 처리
- **Content Scripts**: 웹 페이지 주입 및 조작

### 2. 참고 자료
- **네이버 부동산 API**: 서비스 구조 및 데이터 형식 이해
- **부동산 도메인**: 한국 부동산 시장의 특성과 용어
- **사용자 연구**: 실제 사용자들의 니즈와 행동 패턴

### 3. 개발 도구
- **Chrome DevTools**: 확장 프로그램 디버깅
- **Lighthouse**: 성능 및 접근성 측정
- **ESLint/Prettier**: 코드 품질 및 일관성 유지

## 🎯 성공 지표

### 1. 기술적 지표
- **성능**: 필터 적용 시간 100ms 이하
- **안정성**: 99.9% 이상의 오류 없는 동작
- **접근성**: WCAG AA 기준 100% 충족
- **호환성**: Chrome 88+ 버전에서 완벽 동작

### 2. 사용자 경험 지표
- **사용률**: 설치된 사용자의 80% 이상이 주간 사용
- **만족도**: 사용자 평점 4.5/5.0 이상
- **재사용률**: 첫 사용 후 7일 내 재사용률 60% 이상
- **피드백**: 긍정적 피드백 비율 80% 이상

### 3. 비즈니스 지표
- **설치 수**: Chrome Web Store 다운로드 1000+ 
- **활성 사용자**: 월간 활성 사용자 500+ 
- **평가**: Chrome Web Store 평점 4.0+ 
- **리뷰**: 사용자 리뷰 100+ 

---

이 Agent Rules는 Naver Land Filter Chrome Extension 개발의 모든 단계에서 참고해야 할 가이드라인입니다. 
프로젝트의 성공적인 완성을 위해 지속적으로 업데이트하고 개선해 나가겠습니다.
