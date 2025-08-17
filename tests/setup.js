// 테스트 환경 설정
import { vi } from "vitest";

// Chrome Extension API 모킹
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
    lastError: null,
  },
};

// DOM 관련 전역 설정
Object.defineProperty(window, "location", {
  value: {
    href: "https://new.land.naver.com/rooms",
  },
  writable: true,
});

// MutationObserver 모킹
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}));
