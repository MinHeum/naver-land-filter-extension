// 팝업 UI 제어 스크립트
class PopupController {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkPageStatus();
    this.loadFilterInfo();
  }

  bindEvents() {
    // 새로고침 버튼
    document.getElementById('refresh-btn').addEventListener('click', () => {
      this.refreshStatus();
    });

    // 설정 버튼
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.openSettings();
    });

    // 도움말 링크
    document.getElementById('help-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });

    // 피드백 링크
    document.getElementById('feedback-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openFeedback();
    });
  }

  async checkPageStatus() {
    try {
      // 현재 활성 탭에서 네이버 부동산 페이지 상태 확인
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('new.land.naver.com')) {
        this.updateStatus('active', '✅ 활성화됨', '네이버 부동산 페이지에서 작동 중입니다');
        this.loadFilterInfo();
      } else {
        this.updateStatus('inactive', '❌ 비활성화됨', '네이버 부동산 페이지에서만 사용 가능합니다');
      }
    } catch (error) {
      console.error('페이지 상태 확인 실패:', error);
      this.updateStatus('inactive', '❌ 오류 발생', '상태를 확인할 수 없습니다');
    }
  }

  updateStatus(type, text, description) {
    const statusElement = document.getElementById('status');
    const statusText = statusElement.querySelector('.status-text');
    const statusDesc = statusElement.querySelector('.status-desc');
    const statusIcon = statusElement.querySelector('.status-icon');

    // 기존 클래스 제거
    statusElement.className = 'status';
    
    // 새 상태에 따른 클래스 추가
    if (type === 'active') {
      statusElement.classList.add('active');
      statusIcon.textContent = '✅';
    } else if (type === 'inactive') {
      statusElement.classList.add('inactive');
      statusIcon.textContent = '❌';
    }

    statusText.textContent = text;
    statusDesc.textContent = description;
  }

  async loadFilterInfo() {
    try {
      // 저장된 필터 설정 불러오기
      const result = await chrome.storage.local.get(['naverLandFilters', 'lastUpdate']);
      
      if (result.naverLandFilters) {
        const filters = result.naverLandFilters;
        const activeCount = Object.values(filters).filter(value => 
          value !== '' && value !== false
        ).length;
        
        document.getElementById('active-filters').textContent = `${activeCount}개`;
        document.getElementById('saved-settings').textContent = '있음';
      } else {
        document.getElementById('active-filters').textContent = '0개';
        document.getElementById('saved-settings').textContent = '없음';
      }

      if (result.lastUpdate) {
        const date = new Date(result.lastUpdate);
        document.getElementById('last-update').textContent = date.toLocaleString('ko-KR');
      } else {
        document.getElementById('last-update').textContent = '없음';
      }
    } catch (error) {
      console.error('필터 정보 로드 실패:', error);
      document.getElementById('active-filters').textContent = '오류';
      document.getElementById('saved-settings').textContent = '오류';
      document.getElementById('last-update').textContent = '오류';
    }
  }

  async refreshStatus() {
    // 상태 새로고침
    this.updateStatus('inactive', '⏳ 확인 중...', '페이지 상태를 다시 확인하고 있습니다');
    
    // 잠시 대기 후 상태 재확인
    setTimeout(() => {
      this.checkPageStatus();
    }, 1000);
  }

  openSettings() {
    // 설정 페이지 열기 (Chrome 확장 프로그램 관리 페이지)
    chrome.tabs.create({
      url: 'chrome://extensions/?id=' + chrome.runtime.id
    });
  }

  openHelp() {
    // 도움말 페이지 열기
    chrome.tabs.create({
      url: 'https://github.com/your-username/naver-land-filter#readme'
    });
  }

  openFeedback() {
    // 피드백 페이지 열기
    chrome.tabs.create({
      url: 'https://github.com/your-username/naver-land-filter/issues'
    });
  }
}

// 팝업 컨트롤러 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
