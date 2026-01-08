import React from "react";
import { describe, expect, it } from "vitest";

import RootLayout from "./layout";

describe("RootLayout", () => {
  it("renders children content", () => {
    const element = RootLayout({
      children: React.createElement("div", null, "Layout content"),
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.type).toBe("html");

    const body = element.props.children;
    expect(body.type).toBe("body");
    expect(body.props.children.props.children).toBe("Layout content");
  });
});
