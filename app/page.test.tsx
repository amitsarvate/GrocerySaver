import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home page", () => {
  it("renders the headline and key calls to action", () => {
    render(<Home />);

    expect(screen.getByText("GrocerySaver")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Find the most cost-effective grocery plan across nearby stores.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Get started" }),
    ).toHaveAttribute("href", "/location");
    expect(screen.getByRole("link", { name: "View health" })).toHaveAttribute(
      "href",
      "/api/health",
    );
  });
});
