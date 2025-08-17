# 네이버 부동산 필터 확장 프로그램 - 구조화된 버전

## 📁 프로젝트 구조

```
├── src/                          # 소스 코드
│   ├── core/                     # 핵심 로직
│   │   ├── FilterManager.js      # 필터 관리 핵심 클래스
│   │   └── DOMObserver.js        # DOM 변화 감지
│   ├── ui/                       # UI 컴포넌트
│   │   ├── FilterPanel.js        # 필터 패널 UI
│   │   ├── StatusIndicator.js    # 상태 표시기
│   │   └── NotificationManager.js # 알림 관리
│   ├── filters/                  # 필터 관련
│   │   ├── BaseFilter.js         # 필터 기본 추상 클래스
│   │   ├── FloorFilter.js        # 층수 필터 구현
│   │   └── FilterRegistry.js     # 필터 등록/관리
│   ├── storage/                  # 저장소 관리
│   │   └── StorageManager.js     # Chrome Storage + LocalStorage
│   ├── utils/                    # 유틸리티
│   │   ├── Constants.js          # 상수 정의
│   │   └── DOMUtils.js          # DOM 관련 유틸리티
│   └── main.js                   # 메인 애플리케이션 클래스
├── content-new.js                # 새로운 진입점 (ES6 모듈)
├── content.js                    # 기존 진입점 (백업)
├── background.js                 # 백그라운드 스크립트
├── popup.html                    # 팝업 HTML
├── popup.js                      # 팝업 스크립트
├── styles.css                    # 스타일시트
└── manifest.json                 # 확장 프로그램 매니페스트
```

## 🏗️ 아키텍처 개선사항

### 1. 모듈화된 구조

- **관심사 분리**: UI, 로직, 저장소, 유틸리티가 명확히 분리
- **재사용성**: 각 모듈이 독립적으로 테스트 및 재사용 가능
- **확장성**: 새로운 필터나 기능 추가가 용이

### 2. 객체지향 설계

- **추상화**: BaseFilter를 통한 일관된 필터 인터페이스
- **다형성**: 다양한 필터 타입을 동일한 방식으로 처리
- **캡슐화**: 각 클래스의 책임이 명확히 정의

### 3. 이벤트 기반 아키텍처

- **느슨한 결합**: 컴포넌트 간 직접 의존성 최소화
- **콜백 패턴**: UI 변경 시 적절한 콜백 실행

## 📋 주요 클래스 설명

### FilterManager (핵심)

- 모든 필터링 로직을 관리
- DOM 관찰 및 새로운 매물 처리
- 저장소 관리와 연동

### FilterRegistry

- 필터 등록 및 관리
- 활성화된 필터들을 이용한 매물 필터링 결정
- 필터 상태 직렬화/역직렬화

### FilterPanel (UI)

- 사용자 인터페이스 생성 및 관리
- 필터 옵션 토글 이벤트 처리
- 체크박스 가시성 보장

### StorageManager

- Chrome Extension Storage 우선 사용
- LocalStorage 대체 지원
- 비동기 저장/불러오기

### DOMObserver

- MutationObserver를 이용한 DOM 변화 감지
- 새로운 매물 추가 시 자동 필터 적용
- 성능 최적화된 변화 감지

## 🔧 개발 이점

### 1. 유지보수성

```javascript
// 새로운 필터 추가가 간단함
class PriceFilter extends BaseFilter {
  shouldFilter(listing) {
    // 가격 필터 로직
  }
}

// 레지스트리에 등록만 하면 됨
filterRegistry.registerFilter(new PriceFilter("price", "가격"));
```

### 2. 테스트 용이성

```javascript
// 각 모듈을 독립적으로 테스트 가능
const filterManager = new FilterManager();
const result = filterManager.filterListings();
expect(result.hidden).toBe(expectedCount);
```

### 3. 확장성

```javascript
// 새로운 UI 컴포넌트 추가
class AdvancedFilterPanel extends FilterPanel {
  // 고급 필터 UI 구현
}
```

## 🚀 사용법

### 기본 사용

```javascript
// 확장 프로그램이 자동으로 초기화됨
// window.naverLandFilter로 접근 가능

// 필터 상태 확인
const hasActiveFilters = naverLandFilter.filterManager.hasActiveFilters();

// 수동 필터 적용
const result = naverLandFilter.filterManager.filterListings();
```

### 커스텀 필터 추가

```javascript
// 1. BaseFilter를 상속한 새 필터 클래스 생성
class CustomFilter extends BaseFilter {
  shouldFilter(listing) {
    // 커스텀 필터 로직
    return someCondition;
  }
}

// 2. 필터 등록
const customFilter = new CustomFilter("custom", "커스텀 필터");
naverLandFilter.filterManager.getFilterRegistry().registerFilter(customFilter);

// 3. UI 업데이트 (필요시)
naverLandFilter.filterPanel.refresh();
```

## 📝 개발 가이드라인

### 1. 새 필터 추가 시

1. `src/filters/` 디렉토리에 새 필터 클래스 생성
2. `BaseFilter`를 상속하여 `shouldFilter` 메서드 구현
3. `FilterRegistry`의 `initializeDefaultFilters`에서 등록
4. UI 필요시 `FilterPanel`에서 HTML 생성 로직 수정

### 2. 새 UI 컴포넌트 추가 시

1. `src/ui/` 디렉토리에 새 클래스 생성
2. 생성자에서 필요한 의존성 주입받기
3. 이벤트 핸들링을 통한 느슨한 결합 유지

### 3. 저장소 확장 시

1. `StorageManager`에 새로운 저장 방식 추가
2. 기존 방식과의 호환성 유지
3. 에러 처리 및 대체 방안 구현

## 🔄 마이그레이션

기존 `content.js`에서 새로운 구조로:

```javascript
// 기존: 모든 것이 하나의 클래스에
class NaverLandFilter {
  // 600+ 라인의 코드
}

// 새로운 구조: 역할별로 분리
- FilterManager: 필터링 로직
- FilterPanel: UI 관리
- StorageManager: 저장소 관리
- DOMObserver: DOM 감지
// 각각 50-100 라인의 집중된 코드
```

이 구조화된 접근 방식을 통해 코드의 가독성, 유지보수성, 확장성이 크게 향상되었습니다.
