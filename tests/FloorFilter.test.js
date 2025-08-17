import { describe, it, expect } from "vitest";
import { FloorFilter } from "@/filters/FloorFilter.js";

describe("FloorFilter", () => {
  it("should extract basement floor info correctly", () => {
    const filter = new FloorFilter("test", "Test", "basement");

    // 모킹된 DOM 요소 생성
    const mockListing = {
      querySelector: () => ({
        textContent: "B1/4층",
      }),
    };

    const floorInfo = filter.extractFloorInfo(mockListing);
    expect(floorInfo.isBasement).toBe(true);
    expect(floorInfo.floor).toBe(-1);
  });

  it("should extract high floor info correctly", () => {
    const filter = new FloorFilter("test", "Test", "high-floor");

    const mockListing = {
      querySelector: () => ({
        textContent: "고/5층",
      }),
    };

    const floorInfo = filter.extractFloorInfo(mockListing);
    expect(floorInfo.isHighFloor).toBe(true);
    expect(floorInfo.floor).toBe(5);
  });

  it("should filter basement listings when enabled", () => {
    const filter = new FloorFilter("test", "Test", "basement");
    filter.enable();

    const mockListing = {
      querySelector: () => ({
        textContent: "B1/4층",
      }),
    };

    expect(filter.shouldFilter(mockListing)).toBe(true);
  });

  it("should not filter when disabled", () => {
    const filter = new FloorFilter("test", "Test", "basement");
    // filter.enable() 호출하지 않음 (disabled 상태)

    const mockListing = {
      querySelector: () => ({
        textContent: "B1/4층",
      }),
    };

    expect(filter.shouldFilter(mockListing)).toBe(false);
  });
});
