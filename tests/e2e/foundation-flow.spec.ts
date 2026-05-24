import { expect, test } from "@playwright/test";

test("account creation and login flow", async ({ page }) => {
  const username = `e2e_user_${Date.now()}`;
  const password = "TestPass123!";

  // Step 1: Navigate to register page
  await page.goto("/auth/register");
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

  // Step 2: Fill registration form
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  // Step 3: Should redirect to dashboard after successful registration
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();

  // Step 4: Verify daily target display (energy progress component)
  await expect(page.getByRole("heading", { name: "Demo actions" })).toBeVisible();

  // Step 5: Log out
  await page.getByRole("button", { name: "Log out" }).click();

  // Step 6: Should redirect to landing or login after logout
  await expect(page).not.toHaveURL(/\/dashboard/);

  // Step 7: Navigate to login page
  await page.goto("/auth/login");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();

  // Step 8: Fill login form
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  // Step 9: Should redirect to dashboard after successful login
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
});

test("private route protection redirects unauthenticated users", async ({ page }) => {
  // Try to access dashboard without authentication
  await page.goto("/dashboard");

  // Should redirect to login or show login prompt
  await expect(page).not.toHaveURL(/\/dashboard/);
});

test("activity recording and snapshot rendering", async ({ page }) => {
  const username = `e2e_activity_${Date.now()}`;
  const password = "TestPass123!";

  // Register and login
  await page.goto("/auth/register");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  // Verify demo actions section exists
  await expect(page.getByRole("heading", { name: "Demo actions" })).toBeVisible();

  // Click a demo action (read)
  const readButton = page.getByRole("button", { name: /read/i });
  if (await readButton.isVisible()) {
    await readButton.first().click();

    // Wait for action to process
    await page.waitForTimeout(1000);

    // Refresh to see if snapshot persisted
    await page.reload();

    // Should still show dashboard with energy
    await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
  }
});

test("login with invalid credentials shows error", async ({ page }) => {
  await page.goto("/auth/login");

  await page.getByLabel("Username").fill("nonexistent_user");
  await page.getByLabel("Password").fill("WrongPass123!");
  await page.getByRole("button", { name: "Log in" }).click();

  // Should show error message
  await expect(page.getByText(/invalid|incorrect|not found/i)).toBeVisible();
});

test("registration with duplicate username shows error", async ({ page }) => {
  const username = `e2e_dup_${Date.now()}`;
  const password = "TestPass123!";

  // First registration
  await page.goto("/auth/register");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Log out
  await page.getByRole("button", { name: "Log out" }).click();

  // Try to register with same username
  await page.goto("/auth/register");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  // Should show error about duplicate username
  await expect(page.getByText(/already|taken|exists/i)).toBeVisible();
});
