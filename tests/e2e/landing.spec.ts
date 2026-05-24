import { expect, test } from "@playwright/test";

test("landing page shows product hook and links to auth", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Define your stack, develop your mind." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started" })).toHaveAttribute(
    "href",
    "/auth/register",
  );
  await expect(page.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/auth/login");
});
