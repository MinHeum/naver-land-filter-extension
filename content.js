// 네이버 부동산 필터 확장 프로그램
class NaverLandFilter {
  constructor() {
    this.filters = {};
    this.init();
  }

  init() {
    // 페이지 로드 완료 후 필터 UI 주입
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.injectFilterUI());
    } else {
      this.injectFilterUI();
    }
  }

  injectFilterUI() {
    // 기존 필터 그룹들을 찾기
    const existingFilterGroups = document.querySelectorAll('.filter_group');
    
    if (existingFilterGroups.length > 0) {
      // 마지막 필터 그룹의 오른쪽에 새로운 필터 그룹 삽입
      const lastFilterGroup = existingFilterGroups[existingFilterGroups.length - 1];
      this.createFilterGroup(lastFilterGroup);
    } else {
      // 필터 그룹을 찾을 수 없는 경우, 기존 방식으로 주입
      const existingFilters = document.querySelector('.filter_area, .filter-container, [class*="filter"]');
      
      if (existingFilters) {
        this.createFilterPanel(existingFilters);
      } else {
        this.createFilterPanel(document.body);
      }
    }
  }

  createFilterGroup(targetFilterGroup) {
    // 새로운 필터 그룹 div 생성
    const newFilterGroup = document.createElement('div');
    newFilterGroup.className = 'filter_group naver-land-filter-group';
    newFilterGroup.style.cssText = `
      display: inline-block;
      margin-left: 10px;
      vertical-align: top;
    `;
    
    // 필터 패널 생성
    this.createFilterPanel(newFilterGroup);
    
    // 마지막 필터 그룹 다음에 삽입
    targetFilterGroup.parentNode.insertBefore(newFilterGroup, targetFilterGroup.nextSibling);
  }

  createFilterPanel(targetElement) {
    const filterPanel = document.createElement('div');
    filterPanel.id = 'naver-land-filter-panel';
    filterPanel.className = 'naver-land-filter-panel';
    
    filterPanel.innerHTML = `
      <div class="filter-header">
        <h3>🔍 추가 필터</h3>
        <button class="filter-toggle">접기</button>
      </div>
      <div class="filter-content">
        <div class="filter-row">
          <label>거래 유형:</label>
          <select id="transaction-type">
            <option value="">전체</option>
            <option value="sale">매매</option>
            <option value="rent">전세</option>
            <option value="monthly">월세</option>
          </select>
        </div>
        <div class="filter-row">
          <label>면적 범위:</label>
          <select id="area-range">
            <option value="">전체</option>
            <option value="small">20평 이하</option>
            <option value="medium">20-40평</option>
            <option value="large">40평 이상</option>
          </select>
        </div>
        <div class="filter-row">
          <label>건물 연식:</label>
          <select id="building-age">
            <option value="">전체</option>
            <option value="new">5년 이하</option>
            <option value="recent">5-15년</option>
            <option value="old">15년 이상</option>
          </select>
        </div>
        <div class="filter-row">
          <label>주차 가능:</label>
          <input type="checkbox" id="parking-available">
        </div>
        <div class="filter-row">
          <label>엘리베이터:</label>
          <input type="checkbox" id="elevator-available">
        </div>
        <div class="filter-actions">
          <button id="apply-filters" class="apply-btn">필터 적용</button>
          <button id="reset-filters" class="reset-btn">초기화</button>
        </div>
      </div>
    `;

    // 필터 패널을 기존 필터 영역 다음에 삽입
    if (targetElement === document.body) {
      const header = document.querySelector('header, .header, [class*="header"]');
      if (header) {
        header.parentNode.insertBefore(filterPanel, header.nextSibling);
      } else {
        document.body.insertBefore(filterPanel, document.body.firstChild);
      }
    } else {
      targetElement.parentNode.insertBefore(filterPanel, targetElement.nextSibling);
    }

    this.bindEvents(filterPanel);
    this.loadSavedFilters();
  }

  bindEvents(filterPanel) {
    // 필터 토글 버튼
    const toggleBtn = filterPanel.querySelector('.filter-toggle');
    const content = filterPanel.querySelector('.filter-content');
    
    toggleBtn.addEventListener('click', () => {
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'block';
      toggleBtn.textContent = isVisible ? '펼치기' : '접기';
    });

    // 필터 적용 버튼
    const applyBtn = filterPanel.querySelector('#apply-filters');
    applyBtn.addEventListener('click', () => this.applyFilters());

    // 필터 초기화 버튼
    const resetBtn = filterPanel.querySelector('#reset-filters');
    resetBtn.addEventListener('click', () => this.resetFilters());

    // 개별 필터 변경 감지
    const filterInputs = filterPanel.querySelectorAll('select, input[type="checkbox"]');
    filterInputs.forEach(input => {
      input.addEventListener('change', () => this.saveFilters());
    });
  }

  applyFilters() {
    // 현재 필터 값들을 수집
    this.filters = {
      transactionType: document.getElementById('transaction-type').value,
      areaRange: document.getElementById('area-range').value,
      buildingAge: document.getElementById('building-age').value,
      parkingAvailable: document.getElementById('parking-available').checked,
      elevatorAvailable: document.getElementById('elevator-available').checked
    };

    // 필터 적용 로직 (실제 구현은 네이버 부동산 API에 따라 달라질 수 있음)
    this.filterListings();
    
    // 사용자에게 알림
    this.showNotification('필터가 적용되었습니다!');
  }

  filterListings() {
    // 여기에 실제 필터링 로직을 구현
    // 네이버 부동산의 매물 목록을 필터링하는 코드
    console.log('적용된 필터:', this.filters);
    
    // 예시: 매물 목록 요소들을 찾아서 필터링
    const listings = document.querySelectorAll('[class*="item"], [class*="listing"], [class*="property"]');
    
    listings.forEach(listing => {
      // 필터 조건에 맞지 않는 매물은 숨김
      if (!this.matchesFilters(listing)) {
        listing.style.display = 'none';
      } else {
        listing.style.display = '';
      }
    });
  }

  matchesFilters(listing) {
    // 실제 구현에서는 매물의 상세 정보를 파싱하여 필터 조건과 비교
    // 현재는 기본적인 예시만 구현
    return true;
  }

  resetFilters() {
    // 모든 필터를 초기값으로 리셋
    document.getElementById('transaction-type').value = '';
    document.getElementById('area-range').value = '';
    document.getElementById('building-age').value = '';
    document.getElementById('parking-available').checked = false;
    document.getElementById('elevator-available').checked = false;
    
    this.filters = {};
    this.saveFilters();
    
    // 숨겨진 매물들을 다시 표시
    const listings = document.querySelectorAll('[class*="item"], [class*="listing"], [class*="property"]');
    listings.forEach(listing => {
      listing.style.display = '';
    });
    
    this.showNotification('필터가 초기화되었습니다!');
  }

  saveFilters() {
    // 필터 설정을 로컬 스토리지에 저장
    const filtersToSave = {
      transactionType: document.getElementById('transaction-type').value,
      areaRange: document.getElementById('area-range').value,
      buildingAge: document.getElementById('building-age').value,
      parkingAvailable: document.getElementById('parking-available').checked,
      elevatorAvailable: document.getElementById('elevator-available').checked
    };
    
    chrome.storage.local.set({ 'naverLandFilters': filtersToSave });
  }

  loadSavedFilters() {
    // 저장된 필터 설정을 불러오기
    chrome.storage.local.get(['naverLandFilters'], (result) => {
      if (result.naverLandFilters) {
        const filters = result.naverLandFilters;
        
        if (filters.transactionType) {
          document.getElementById('transaction-type').value = filters.transactionType;
        }
        if (filters.areaRange) {
          document.getElementById('area-range').value = filters.areaRange;
        }
        if (filters.buildingAge) {
          document.getElementById('building-age').value = filters.buildingAge;
        }
        if (filters.parkingAvailable) {
          document.getElementById('parking-available').checked = filters.parkingAvailable;
        }
        if (filters.elevatorAvailable) {
          document.getElementById('elevator-available').checked = filters.elevatorAvailable;
        }
        
        this.filters = filters;
      }
    });
  }

  showNotification(message) {
    // 사용자에게 알림을 표시
    const notification = document.createElement('div');
    notification.className = 'naver-land-filter-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3초 후 자동으로 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// 확장 프로그램 초기화
const naverLandFilter = new NaverLandFilter();
