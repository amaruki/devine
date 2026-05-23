import { expect, test } from "@playwright/test";

test("landing page links to dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Keep your reading duck alive." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open dashboard" })).toHaveAttribute(
    "href",
    "/dashboard",
  );
});
