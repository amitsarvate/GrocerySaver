import { describe, expect, it } from "vitest";

import { formatDollars } from "./formatDollars";

describe("formatDollars", () => {
  it("formats cents as USD currency", () => {
    expect(formatDollars(199)).toBe("$1.99");
  });

  it("handles whole dollars", () => {
    expect(formatDollars(1200)).toBe("$12.00");
  });
});
