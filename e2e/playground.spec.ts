import { test, expect } from "@playwright/test";

test.describe("ConfigShape playground", () => {
  test("home loads and shows product UI", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "ConfigShape", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run" })).toBeVisible();
    await expect(page.getByText("Query and patch YAML")).toBeVisible();
  });

  test("k8s sample query returns image array", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Load sample file").selectOption("k8s");
    await expect(page.getByLabel("Configuration input")).toContainText("Deployment", {
      timeout: 15000,
    });
    await page.getByRole("button", { name: "Run" }).click();
    await expect(page.getByLabel("Result output")).toContainText("nginx", { timeout: 45000 });
  });

  test("privacy and terms pages", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms & Conditions" })).toBeVisible();
  });

  test("SEO landing jq-online", async ({ page }) => {
    await page.goto("/jq-online");
    await expect(page.getByText("jq online", { exact: false })).toBeVisible();
  });
});
