import { test, expect } from "@playwright/test";

test("json-to-yaml route outputs YAML", async ({ page }) => {
  await page.goto("/json-to-yaml");
  await page.getByLabel("Configuration input").fill('{"hello":"world","count":2}');
  await page.getByRole("button", { name: "Run" }).click();
  const output = page.getByLabel("Result output");
  await expect(output).toContainText("hello:", { timeout: 15000 });
  await expect(output).not.toContainText('"hello"');
});

test("yaml-to-json route outputs JSON", async ({ page }) => {
  await page.goto("/yaml-to-json");
  await page.getByLabel("Configuration input").fill("hello: world\n");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByLabel("Result output")).toContainText('"hello"', { timeout: 15000 });
});
