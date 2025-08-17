// 백그라운드 서비스 워커
class BackgroundService {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupContextMenus();
  }

  bindEvents() {
    // 확장 프로그램 설치 시
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.onFirstInstall();
      } else if (details.reason === 'update') {
        this.onUpdate(details.previousVersion);
      }
    });

    // 확장 프로그램 시작 시
    chrome.runtime.onStartup.addListener(() => {
      this.onStartup();
    });

    // 메시지 수신
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // 비동기 응답을 위해 true 반환
    });

    // 탭 업데이트 감지
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && tab.url.includes('new.land.naver.com')) {
        this.onNaverLandPageLoad(tabId, tab);
      }
    });

    // 탭 활성화 감지
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.onTabActivated(activeInfo.tabId);
    });
  }

  setupContextMenus() {
    // 우클릭 메뉴 설정
    chrome.contextMenus.create({
      id: 'naver-land-filter',
      title: '🔍 Naver Land Filter',
      contexts: ['page'],
      documentUrlPatterns: ['https://new.land.naver.com/*']
    });

    chrome.contextMenus.create({
      id: 'toggle-filter-panel',
      title: '필터 패널 토글',
      contexts: ['page'],
      documentUrlPatterns: ['https://new.land.naver.com/*'],
      parentId: 'naver-land-filter'
    });

    chrome.contextMenus.create({
      id: 'reset-filters',
      title: '필터 초기화',
      contexts: ['page'],
      documentUrlPatterns: ['https://new.land.naver.com/*'],
      parentId: 'naver-land-filter'
    });

    // 우클릭 메뉴 클릭 이벤트
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab);
    });
  }

  onFirstInstall() {
    console.log('Naver Land Filter 확장 프로그램이 설치되었습니다!');
    
    // 초기 설정 저장
    chrome.storage.local.set({
      'firstInstallDate': new Date().toISOString(),
      'version': chrome.runtime.getManifest().version,
      'settings': {
        'autoShowFilter': true,
        'saveFilters': true,
        'notifications': true
      }
    });

    // 환영 페이지 열기
    chrome.tabs.create({
      url: 'https://github.com/your-username/naver-land-filter#readme'
    });
  }

  onUpdate(previousVersion) {
    console.log(`Naver Land Filter가 ${previousVersion}에서 ${chrome.runtime.getManifest().version}로 업데이트되었습니다.`);
    
    // 업데이트 정보 저장
    chrome.storage.local.set({
      'lastUpdateDate': new Date().toISOString(),
      'previousVersion': previousVersion,
      'currentVersion': chrome.runtime.getManifest().version
    });
  }

  onStartup() {
    console.log('Naver Land Filter 백그라운드 서비스가 시작되었습니다.');
  }

  onNaverLandPageLoad(tabId, tab) {
    console.log('네이버 부동산 페이지가 로드되었습니다:', tab.url);
    
    // 자동으로 필터 패널을 표시할지 확인
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings && result.settings.autoShowFilter) {
        // content script에 메시지 전송하여 필터 패널 표시
        chrome.tabs.sendMessage(tabId, {
          action: 'showFilterPanel',
          data: { autoShow: true }
        }).catch(() => {
          // content script가 아직 로드되지 않은 경우 무시
        });
      }
    });
  }

  onTabActivated(tabId) {
    // 활성화된 탭이 네이버 부동산인지 확인
    chrome.tabs.get(tabId, (tab) => {
      if (tab.url && tab.url.includes('new.land.naver.com')) {
        // 상태 업데이트를 위해 메시지 전송
        chrome.tabs.sendMessage(tabId, {
          action: 'tabActivated',
          data: { timestamp: Date.now() }
        }).catch(() => {
          // content script가 아직 로드되지 않은 경우 무시
        });
      }
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'getFilterSettings':
          const result = await chrome.storage.local.get(['naverLandFilters', 'settings']);
          sendResponse({ success: true, data: result });
          break;

        case 'saveFilterSettings':
          await chrome.storage.local.set({
            'naverLandFilters': message.data.filters,
            'lastUpdate': new Date().toISOString()
          });
          sendResponse({ success: true });
          break;

        case 'getExtensionInfo':
          const manifest = chrome.runtime.getManifest();
          sendResponse({
            success: true,
            data: {
              name: manifest.name,
              version: manifest.version,
              description: manifest.description
            }
          });
          break;

        case 'openOptionsPage':
          chrome.runtime.openOptionsPage();
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('메시지 처리 중 오류 발생:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  handleContextMenuClick(info, tab) {
    switch (info.menuItemId) {
      case 'toggle-filter-panel':
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleFilterPanel',
          data: {}
        });
        break;

      case 'reset-filters':
        chrome.tabs.sendMessage(tab.id, {
          action: 'resetFilters',
          data: {}
        });
        break;
    }
  }

  // 알림 표시
  showNotification(title, message) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: title,
      message: message
    });
  }
}

// 백그라운드 서비스 초기화
new BackgroundService();
