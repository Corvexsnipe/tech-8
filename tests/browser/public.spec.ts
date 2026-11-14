import { test, expect } from "@playwright/test";

test("methodology walkthrough, evidence modal, and responsive layout", async ({ page }, testInfo) => {
  const exceptions: string[] = [];
  page.on("pageerror", error => exceptions.push(error.message));
  await page.goto("/how-it-works");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("clarity");
  await expect(page.getByText("Trusted by Businesses Worldwide")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("tab", { name: /Read reviews/ }).click();
  await expect(page.getByRole("tabpanel").getByText("More than a rating.")).toBeVisible();
  const proof = page.getByRole("tabpanel").getByRole("button", { name: /Check Proof/ });
  await proof.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Illustration — no real purchase or customer data")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(proof).toBeFocused();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByRole("tabpanel").getByText("85 points", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Previous step" }).click();
  await expect(page.getByRole("tab", { name: /Read reviews/ })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: /Find a business/ }).click();
  await page.getByRole("textbox", { name: "Find a business" }).fill("A real search");
  await page.getByRole("tabpanel").getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/explore\?q=A\+real\+search/);
  await expect(page.getByText("No matches just yet.")).toBeVisible();
  expect(exceptions).toEqual([]);
  await page.goto("/");
  await page.screenshot({ path: `test-results/home-${testInfo.project.name}.png`, fullPage: true });
});

test("homepage carousels rotate real records and search navigates", async ({ page }) => {
  await page.goto("/");
  const next = page.getByRole("button", { name: "Next featured businesses" });
  if (await next.count()) {
    const firstCard = page.locator(".lp .business-card").first();
    const name = await firstCard.textContent();
    await next.click();
    await expect(firstCard).not.toHaveText(name!);
    await page.getByRole("button", { name: "Previous featured businesses" }).click();
    await expect(firstCard).toHaveText(name!);
  }
  const nextReview = page.getByRole("button", { name: "Next recent reviews" });
  if (await nextReview.count()) {
    const firstReview = page.locator(".lp-rv").first();
    const headline = await firstReview.textContent();
    await nextReview.click();
    await expect(firstReview).not.toHaveText(headline!);
  }
  // Letter grades only — the platform never shows star ratings.
  await expect(page.locator(".lp svg.lucide-star")).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Search businesses", exact: true }).fill("A real search");
  await page.locator(".lp-search").getByRole("button", { name: "Search businesses directory" }).click();
  await expect(page).toHaveURL(/\/explore\?q=A\+real\+search/);
});

test("public routes and authentication pages render without broken navigation", async ({ page }) => {
  for (const route of ["/explore", "/how-it-works", "/for-businesses", "/privacy", "/terms", "/contact", "/sign-in", "/register", "/forgot-password", "/resend-verification", "/verify-email", "/reset-password"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} has horizontal overflow`).toBe(true);
  }
  await page.goto("/not-a-real-route");
  await expect(page.getByText("This page has moved on.")).toBeVisible();
});

test("protected pages redirect unauthenticated visitors", async ({ page }) => {
  for (const route of ["/account", "/account/settings", "/dashboard", "/claim", "/admin", "/review-matter-panel", "/review-matter-panel/users", "/review-matter-panel/reviews", "/dashboard/not-owned", "/business/not-found/review"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/sign-in$/);
  }
});

test("server rejects cross-origin writes and protected asset access", async ({ request, baseURL }) => {
  const crossOrigin = await request.post("/api/action", { headers: { origin: "https://attacker.invalid" }, data: { action: "login", data: {} } });
  expect(crossOrigin.status()).toBe(403);
  const unauthorized = await request.post("/api/action", { headers: { origin: baseURL! }, data: { action: "admin-config", data: { minimumReviews: 1 } } });
  expect(unauthorized.status()).toBe(401);
  expect((await request.get("/api/qr/not-owned")).status()).toBe(401);
  expect((await request.get("/api/admin-export?kind=users")).status()).toBe(403);
  expect((await request.get("/api/evidence/private-file")).ok()).toBe(false);
  expect([200, 503]).toContain((await request.get("/api/health")).status());
});

test("contact form responds honestly — saves when configured, setup error otherwise", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Preview visitor");
  await page.getByLabel("Email address", { exact: true }).fill("preview@example.org");
  await page.getByLabel("Subject").fill("A development configuration check");
  await page.getByLabel("Your message").fill("This form should report missing configuration instead of pretending to save a message.");
  await page.getByRole("button", { name: "Send message" }).click();
  const feedback = page.locator("form .notice");
  await expect(feedback).toBeVisible();
  await expect(feedback).toContainText(/configuration|setup|saved/i);
  await expect(feedback).not.toContainText("Something went wrong");
});

test("reduced motion remains usable and mobile navigation opens", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Service Quality: A+, Excellent", exact: true }).click();
  await expect(page.locator(".lp-lab-result")).toContainText("85 points");
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Explore businesses" }).click();
    await expect(page).toHaveURL(/\/explore$/);
  }
});

test("landing grade calculator, FAQ, directory links and responsive widths", async ({ page }, testInfo) => {
  test.setTimeout(60000); // Includes several real directory/profile database reads.
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("Review Matters — Real Reviews. Real Reputation.");
  await expect(page.locator("h1")).toHaveText("Real Reviews.Better Decisions.");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".lp svg.lucide-star")).toHaveCount(0);
  await expect(page.locator(".lp-lab-result")).toContainText("75 points");
  await page.getByRole("button", { name: "Service Quality: A+, Excellent", exact: true }).click();
  await expect(page.locator(".lp-lab-result")).toContainText("85 points");
  await page.getByRole("button", { name: "Customer Support: D, Poor", exact: true }).click();
  await expect(page.locator(".lp-lab-result")).toContainText("57.5 points");
  await expect(page.locator(".lp-lab-result strong")).toHaveText("C");
  const question = page.locator(".lp-faq summary").filter({ hasText: "Will my review appear immediately?" });
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".lp-faq details[open]")).toContainText("pending until staff verification");
  await page.keyboard.press("Enter");
  await expect(page.locator(".lp-faq details[open]")).toHaveCount(0);
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px`).toBe(true);
    expect(await page.locator("h1").evaluate(el => el.scrollWidth <= el.clientWidth), `headline clips at ${width}px`).toBe(true);
  }
  await page.setViewportSize(testInfo.project.name === "mobile" ? { width: 390, height: 844 } : { width: 1440, height: 1000 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `test-results/landing-${testInfo.project.name}.png`, fullPage: true });
  const profileLinks = await page.locator(".lp-business").evaluateAll(els => els.map(el => el.getAttribute("href")!));
  for (const href of profileLinks) {
    const response = await page.goto(href);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.goto("/");
  const categoryLink = page.locator(".lp-categories>a").first();
  if (await categoryLink.count()) {
    await categoryLink.click();
    await expect(page).toHaveURL(/\/explore\?category=/);
    await expect(page.locator('select[name="category"]')).not.toHaveValue("");
  }
  await page.goto("/");
  await page.locator(".lp-hero").getByRole("link", { name: "List Your Business" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  expect(errors).toEqual([]);
});
