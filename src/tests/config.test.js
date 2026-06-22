import { describe, it, expect } from "vitest";

describe("Frontend Configuration", () => {
  it("should resolve the default API URL when window is undefined", async () => {
    const { API_URL } = await import("../config.js");
    expect(API_URL).toBe(import.meta.env.VITE_API_URL || "http://localhost:5000");
  });
});
