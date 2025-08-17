# 🔍 Naver Land Filter

네이버 부동산 지도에서 추가 필터링 기능을 제공하는 Chrome 확장 프로그램입니다.

## ✨ 주요 기능

- **추가 필터링**: 거래 유형, 면적 범위, 건물 연식, 주차, 엘리베이터 등
- **실시간 필터링**: 매물 목록을 실시간으로 필터링
- **설정 저장**: 사용자 필터 설정을 자동으로 저장
- **반응형 UI**: 모바일과 데스크톱 모두 지원
- **다크 모드**: 시스템 다크 모드 자동 감지 및 지원

## 🚀 설치 방법

### 개발자 모드로 설치

1. Chrome 브라우저에서 `chrome://extensions/` 접속
2. 우측 상단의 "개발자 모드" 토글 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 이 프로젝트 폴더 선택

### Chrome Web Store에서 설치 (준비 중)

- Chrome Web Store 링크: 준비 중

## 📁 프로젝트 구조

```
naver-land-filter/
├── manifest.json          # 확장 프로그램 설정
├── content.js            # 페이지 주입 스크립트
├── styles.css            # 필터 UI 스타일
├── popup.html            # 팝업 UI
├── popup.js              # 팝업 제어 스크립트
├── background.js         # 백그라운드 서비스
├── icons/                # 확장 프로그램 아이콘
└── README.md             # 프로젝트 설명서
```

## 🎯 사용법

### 기본 사용

1. 네이버 부동산 페이지(`new.land.naver.com`)에 접속
2. 우측 상단에 "🔍 추가 필터" 패널이 자동으로 표시
3. 원하는 필터 조건을 선택하고 "필터 적용" 클릭

### 필터 옵션

- **거래 유형**: 매매, 전세, 월세
- **면적 범위**: 20평 이하, 20-40평, 40평 이상
- **건물 연식**: 5년 이하, 5-15년, 15년 이상
- **주차 가능**: 체크박스
- **엘리베이터**: 체크박스

### 고급 기능

- **우클릭 메뉴**: 페이지에서 우클릭하여 필터 패널 제어
- **자동 저장**: 필터 설정이 자동으로 저장됨
- **팝업 제어**: 확장 프로그램 아이콘 클릭하여 상태 확인

## 🛠️ 개발 가이드

### 로컬 개발 환경 설정

1. 프로젝트 클론
```bash
git clone https://github.com/your-username/naver-land-filter.git
cd naver-land-filter
```

2. Chrome 확장 프로그램으로 로드
   - `chrome://extensions/` 접속
   - 개발자 모드 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - 프로젝트 폴더 선택

3. 코드 수정 후 확장 프로그램 새로고침

### 파일 설명

- **`manifest.json`**: 확장 프로그램의 메타데이터와 권한 설정
- **`content.js`**: 네이버 부동산 페이지에 주입되는 메인 스크립트
- **`styles.css`**: 필터 UI의 스타일 정의
- **`popup.html/js`**: 확장 프로그램 아이콘 클릭 시 표시되는 팝업
- **`background.js`**: 백그라운드에서 작동하는 서비스 워커

### API 및 이벤트

#### Content Script → Background Script
```javascript
// 필터 설정 저장
chrome.runtime.sendMessage({
  action: 'saveFilterSettings',
  data: { filters: filterData }
});

// 필터 설정 불러오기
chrome.runtime.sendMessage({
  action: 'getFilterSettings'
}, response => {
  console.log(response.data);
});
```

#### Background Script → Content Script
```javascript
// 필터 패널 토글
chrome.tabs.sendMessage(tabId, {
  action: 'toggleFilterPanel',
  data: {}
});
```

## 🔧 설정 옵션

### 자동 설정

- **자동 필터 표시**: 페이지 로드 시 자동으로 필터 패널 표시
- **필터 자동 저장**: 필터 변경 시 자동으로 설정 저장
- **알림 표시**: 필터 적용/초기화 시 알림 표시

### 수동 설정

Chrome 확장 프로그램 관리 페이지에서 설정 변경 가능

## 🐛 문제 해결

### 일반적인 문제

1. **필터 패널이 표시되지 않음**
   - 페이지 새로고침
   - 확장 프로그램 비활성화 후 재활성화

2. **필터가 작동하지 않음**
   - 네이버 부동산 페이지인지 확인
   - 개발자 도구 콘솔에서 오류 메시지 확인

3. **설정이 저장되지 않음**
   - Chrome 저장소 권한 확인
   - 브라우저 캐시 및 쿠키 정리

### 디버깅

1. 개발자 도구 콘솔에서 로그 확인
2. `chrome://extensions/`에서 확장 프로그램 오류 확인
3. 백그라운드 페이지에서 서비스 워커 상태 확인

## 🤝 기여하기

1. Fork 후 개발 브랜치 생성
2. 기능 개발 또는 버그 수정
3. Pull Request 생성

### 개발 가이드라인

- 코드 스타일: ES6+ JavaScript, CSS3
- 주석: 한국어로 상세한 설명
- 테스트: 주요 기능에 대한 테스트 코드 작성

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 🙏 감사의 말

- 네이버 부동산 서비스 팀
- Chrome 확장 프로그램 개발자 커뮤니티
- 이 프로젝트에 기여해주신 모든 분들

## 📞 연락처

- GitHub Issues: [이슈 등록](https://github.com/your-username/naver-land-filter/issues)
- 이메일: your-email@example.com

---

**참고**: 이 확장 프로그램은 개인적인 용도로 개발되었으며, 네이버의 공식 제품이 아닙니다.
