import { test, expect } from "@playwright/test";

test.describe("entry flows", () => {
  test("education route exposes only education quick mode", async ({ page }) => {
    await page.goto("/index.html");

    await page.getByRole("button", { name: "בחר אגף חינוך" }).click();

    await expect(page.locator("#entryModesWrap")).toBeVisible();
    await expect(page.locator("#entrySeasonalCard")).toBeHidden();
    await expect(page.locator("#entryActivityCard")).toBeHidden();

    const educationQuickBtn = page.getByRole("button", { name: /למשחק מהיר - אגף חינוך/ });
    await expect(educationQuickBtn).toBeVisible();
    await educationQuickBtn.click();

    await expect(page.getByRole("heading", { name: "משחק מהיר - אגף חינוך" })).toBeVisible();
    await expect(page.locator("#activityTopicField")).toBeHidden();
  });

  test("telemarketing activity route starts a scoped activity game", async ({ page }) => {
    await page.goto("/index.html");

    await page.getByRole("button", { name: "בחר טלמרקטינג" }).click();
    await page.getByRole("button", { name: "למשחק על פי פעילות" }).click();

    await expect(page.getByRole("heading", { name: "משחק על פי פעילות - טלמרקטינג" })).toBeVisible();
    await expect(page.locator("#activityTopicField")).toBeVisible();

    await page.fill("#playerNameInput", "בדיקת e2e");
    await page.selectOption("#questionCountSelect", "3");
    await page.selectOption("#activityTopicSelect", "judicial");
    await page.getByRole("button", { name: "התחל משחק" }).click();

    await expect(page.locator("#screenQuiz")).toBeVisible();
    await expect(page.locator("#quizProgress")).toContainText("שאלה 1/3");
    await expect(page.locator("#quizPlayerName")).toContainText("בדיקת e2e");
  });

  test("telemarketing seasonal route shows seasonal setup context", async ({ page }) => {
    await page.goto("/index.html");

    await page.getByRole("button", { name: "בחר טלמרקטינג" }).click();
    await page.getByRole("button", { name: "למשחק מהיר עונתי" }).click();

    await expect(page.getByRole("heading", { name: "משחק מהיר עונתי - טלמרקטינג" })).toBeVisible();
    await expect(page.locator("#quickModeNote")).toContainText("מאוקטובר 2025");
  });
});
