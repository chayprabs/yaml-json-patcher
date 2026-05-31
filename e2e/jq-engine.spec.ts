import { test, expect } from "@playwright/test";

test("jq engine returns k8s image tags", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Load sample file").selectOption("k8s");
  await page.getByRole("button", { name: "jq", exact: true }).click();
  await page.getByPlaceholder("jq / JSONPath").fill(".spec.template.spec.containers[].image");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByLabel("Result output")).toContainText("nginx:1.25", { timeout: 45000 });
});
