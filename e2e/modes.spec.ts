import { test, expect } from "@playwright/test";

test("patch mode applies JSON Patch to package.json", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Load sample file").selectOption("pkg");
  await page.getByRole("button", { name: "Patch" }).click();
  await page
    .getByPlaceholder(/JSON Patch/i)
    .fill('[{"op":"replace","path":"/scripts/build","value":"tsc -b"}]');
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByLabel("Result output")).toContainText("tsc -b", { timeout: 15000 });
});

test("merge mode merges helm values", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Load sample file").selectOption("helm");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByLabel("Result output")).toContainText("prod.example.com", {
    timeout: 15000,
  });
});

test("validate mode accepts valid JSON", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("configshape-session"));
  await page.reload();
  await page.getByLabel("Load sample file").selectOption("pkg");
  await page.getByRole("button", { name: "Validate" }).click();
  await page.getByPlaceholder("JSON Schema (optional)").fill("{}");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByLabel("Result output")).toContainText("✓ Valid", { timeout: 15000 });
});

test("diff mode generates patch JSON", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Configuration input").fill('{"a":1,"b":2}');
  await page.getByRole("button", { name: "Diff" }).click();
  await page.getByPlaceholder("After document").fill('{"a":1,"b":3}');
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByLabel("Result output")).toContainText('"op"', { timeout: 15000 });
});

test("command palette opens with Ctrl+K", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Configuration input").click();
  await page.keyboard.press("Control+KeyK");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
});

test("clear all resets playground", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Load sample file").selectOption("pkg");
  await page.getByRole("button", { name: "Clear stored data" }).click();
  await expect(page.getByLabel("Configuration input")).toHaveValue("");
});
