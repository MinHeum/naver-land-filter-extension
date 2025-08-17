import { describe, it, expect, beforeEach, vi } from "vitest";
import { FilterRegistry } from "@/filters/FilterRegistry.js";
import { FloorFilter } from "@/filters/FloorFilter.js";

describe("FilterRegistry", () => {
  let filterRegistry;

  beforeEach(() => {
    filterRegistry = new FilterRegistry();
  });

  it("should initialize with default filters", () => {
    const filters = filterRegistry.getAllFilters();
    expect(filters).toHaveLength(2);
    expect(filters[0].id).toBe("hide-basement");
    expect(filters[1].id).toBe("hide-high-floor");
  });

  it("should register new filters", () => {
    const customFilter = new FloorFilter("custom", "Custom Filter", "custom");
    filterRegistry.registerFilter(customFilter);

    const filter = filterRegistry.getFilter("custom");
    expect(filter).toBe(customFilter);
  });

  it("should return active filters only", () => {
    const basementFilter = filterRegistry.getFilter("hide-basement");
    basementFilter.enable();

    const activeFilters = filterRegistry.getActiveFilters();
    expect(activeFilters).toHaveLength(1);
    expect(activeFilters[0].id).toBe("hide-basement");
  });

  it("should serialize and deserialize filter states", () => {
    const basementFilter = filterRegistry.getFilter("hide-basement");
    basementFilter.enable();

    const serialized = filterRegistry.serialize();
    expect(serialized["hide-basement"].enabled).toBe(true);

    const newRegistry = new FilterRegistry();
    newRegistry.deserialize(serialized);

    const restoredFilter = newRegistry.getFilter("hide-basement");
    expect(restoredFilter.isEnabled()).toBe(true);
  });
});
