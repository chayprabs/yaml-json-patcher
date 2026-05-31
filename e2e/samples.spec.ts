import { test, expect } from "@playwright/test";

const SAMPLE_CASES = [
  { value: "pkg", output: "vite build" },
  { value: "pyproject", output: "configshape" },
  { value: "cargo", output: "demo-crate" },
  { value: "atom", output: "Hello World" },
] as const;

for (const { value, output } of SAMPLE_CASES) {
  test(`sample ${value} produces expected output`, async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Load sample file").selectOption(value);
    await page.getByRole("button", { name: "Run" }).click();
    await expect(page.getByLabel("Result output")).toContainText(output, { timeout: 30000 });
  });
}

test("single JSON Patch object applies correctly", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Load sample file").selectOption("pkg");
  await expect(page.getByLabel("Configuration input")).toContainText("vite build", { timeout: 10000 });
  await page.getByRole("button", { name: "Patch" }).click();
  await page
    .getByPlaceholder('JSON Patch [{"op":"replace",...}] or merge patch {"key":"value"}')
    .fill('{"op":"replace","path":"/scripts/build","value":"webpack build"}');
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByLabel("Result output")).toContainText("webpack build", { timeout: 15000 });
});
