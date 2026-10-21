import { describe, expect, it } from "vitest";
import { istMidnight, formatISODate, formatISOTimestamp } from "../date";

describe("istMidnight", () => {
  it("returns a number", () => {
    expect(typeof istMidnight(2024, 0, 1)).toBe("number");
  });
  it("midnight is before noon same day", () => {
    const m = istMidnight(2024, 0, 1);
    const noon = istMidnight(2024, 0, 1) + 12 * 3600_000;
    expect(m).toBeLessThan(noon);
  });
});

describe("formatISODate", () => {
  it("returns YYYY-MM-DD", () => {
    const s = formatISODate(istMidnight(2024, 0, 1));
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(s).toBe("2024-01-01");
  });
});

describe("formatISOTimestamp", () => {
  it("includes a time component", () => {
    const s = formatISOTimestamp(istMidnight(2024, 0, 1));
    expect(s).toContain(" ");
  });
});