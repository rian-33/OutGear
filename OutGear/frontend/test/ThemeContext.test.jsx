import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext.jsx";

function Harness() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggleTheme</button>
    </div>
  );
}

function renderTheme() {
  return render(
    <ThemeProvider>
      <Harness />
    </ThemeProvider>,
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    window.matchMedia = () => ({ matches: false });
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to light when there is no stored preference", () => {
    renderTheme();
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggles between light and dark and persists the choice", () => {
    renderTheme();
    fireEvent.click(screen.getByText("toggleTheme"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("outgear_theme")).toBe("dark");

    fireEvent.click(screen.getByText("toggleTheme"));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(localStorage.getItem("outgear_theme")).toBe("light");
  });

  it("respects a stored dark preference on mount", () => {
    localStorage.setItem("outgear_theme", "dark");
    renderTheme();
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});