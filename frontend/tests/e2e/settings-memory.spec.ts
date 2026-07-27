import { expect, test, type Page } from "@playwright/test";

import { mockLangGraphAPI } from "./utils/mock-api";

const emptyMemory = {
  version: "1",
  lastUpdated: "2026-07-22T00:00:00Z",
  user: {
    workContext: { summary: "", updatedAt: "" },
    personalContext: { summary: "", updatedAt: "" },
    topOfMind: { summary: "", updatedAt: "" },
  },
  history: {
    recentMonths: { summary: "", updatedAt: "" },
    earlierContext: { summary: "", updatedAt: "" },
    longTermBackground: { summary: "", updatedAt: "" },
  },
  facts: [],
};

async function openMemorySettings(page: Page) {
  await page.goto("/workspace/chats/new");
  if ((page.viewportSize()?.width ?? 1280) < 768) {
    await page.locator("[data-sidebar='trigger']:visible").first().click();
  }
  const sidebar = page.locator("[data-sidebar='sidebar']:visible").first();
  await sidebar.getByRole("button", { name: /Settings and more/ }).click();
  await page.getByRole("menuitem", { name: "Settings" }).click();
  const dialog = page.getByRole("dialog", { name: "Settings" });
  await dialog.getByRole("button", { name: "Memory", exact: true }).click();
  return dialog;
}

test.describe("Memory settings", () => {
  test("keeps empty memory actionable and preserves a failed fact form", async ({
    page,
  }) => {
    mockLangGraphAPI(page);
    let createCalls = 0;
    void page.route("**/api/memory**", async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (path.endsWith("/api/memory/facts") && request.method() === "POST") {
        createCalls += 1;
        if (createCalls === 1) {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ detail: "Fact create failed" }),
          });
          return;
        }
        const input = request.postDataJSON() as {
          content: string;
          category: string;
          confidence: number;
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...emptyMemory,
            facts: [
              {
                id: "fact-1",
                ...input,
                createdAt: "2026-07-22T00:00:00Z",
                source: "manual",
              },
            ],
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyMemory),
      });
    });

    const settings = await openMemorySettings(page);
    await expect(settings.getByText("No memory saved yet.")).toHaveCount(1);
    await expect(settings.getByText("(empty)")).toHaveCount(0);
    await expect(
      settings.getByRole("button", { name: "Import memory" }),
    ).toBeEnabled();
    await settings.getByRole("button", { name: "Add fact" }).click();

    const editor = page.getByRole("dialog", { name: "Add memory fact" });
    const content = editor.getByLabel("Content");
    await content.fill("User prefers concise answers");
    await editor.getByRole("button", { name: "Save fact" }).click();

    await expect.poll(() => createCalls).toBe(1);
    await expect(page.getByText("Fact create failed")).toBeVisible();
    await expect(editor).toBeVisible();
    await expect(content).toHaveValue("User prefers concise answers");
    await editor.getByRole("button", { name: "Save fact" }).click();
    await expect.poll(() => createCalls).toBe(2);
    await expect(editor).toBeHidden();
    await expect(
      settings.getByText("User prefers concise answers"),
    ).toBeVisible();
  });

  test("confirms imports and keeps the selected backup after failure", async ({
    page,
  }) => {
    mockLangGraphAPI(page);
    let importCalls = 0;
    let releaseFirstImport!: () => void;
    const firstImportGate = new Promise<void>((resolve) => {
      releaseFirstImport = resolve;
    });
    void page.route("**/api/memory**", async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (path.endsWith("/api/memory/import") && request.method() === "POST") {
        importCalls += 1;
        if (importCalls === 1) {
          await firstImportGate;
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ detail: "Import failed" }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: request.postData() ?? JSON.stringify(emptyMemory),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyMemory),
      });
    });

    const settings = await openMemorySettings(page);
    await settings.getByLabel("Import memory").setInputFiles({
      name: "very-long-memory-backup-name-that-must-wrap-inside-the-dialog.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(emptyMemory)),
    });
    const confirm = page.getByRole("dialog", { name: "Import memory?" });
    await expect(confirm).toBeVisible();
    expect(importCalls).toBe(0);
    await confirm.getByRole("button", { name: "Import" }).click();

    await expect.poll(() => importCalls).toBe(1);
    await expect(confirm).toHaveAttribute("aria-busy", "true");
    await page.keyboard.press("Escape");
    await expect(confirm).toBeVisible();
    releaseFirstImport();
    await expect(page.getByText("Import failed")).toBeVisible();
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText("very-long-memory-backup-name");
    await confirm.getByRole("button", { name: "Import" }).click();
    await expect.poll(() => importCalls).toBe(2);
    await expect(confirm).toBeHidden();
  });

  test("retries loading and preserves clear confirmation after failure", async ({
    page,
  }) => {
    mockLangGraphAPI(page);
    let getCalls = 0;
    let clearCalls = 0;
    void page.route("**/api/memory**", async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (path.endsWith("/api/memory") && request.method() === "DELETE") {
        clearCalls += 1;
        if (clearCalls === 1) {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ detail: "Clear failed" }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(emptyMemory),
        });
        return;
      }
      if (path.endsWith("/api/memory") && request.method() === "GET") {
        getCalls += 1;
        if (getCalls <= 4) {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ detail: "Memory unavailable" }),
          });
          return;
        }
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyMemory),
      });
    });

    const settings = await openMemorySettings(page);
    await expect(settings.getByRole("alert")).toContainText(
      "Memory unavailable",
      {
        timeout: 15_000,
      },
    );
    await settings.getByRole("button", { name: "Retry" }).click();
    await expect(settings.getByText("No memory saved yet.")).toBeVisible();
    await settings.getByRole("button", { name: "Clear all memory" }).click();

    const confirm = page.getByRole("dialog", { name: "Clear all memory?" });
    await expect(confirm).toBeVisible();
    expect(clearCalls).toBe(0);
    await confirm.getByRole("button", { name: "Clear all memory" }).click();
    await expect.poll(() => clearCalls).toBe(1);
    await expect(page.getByText("Clear failed")).toBeVisible();
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Clear all memory" }).click();
    await expect.poll(() => clearCalls).toBe(2);
    await expect(confirm).toBeHidden();
  });

  test("keeps empty memory actions inside a mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    mockLangGraphAPI(page);
    void page.route("**/api/memory**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyMemory),
      }),
    );

    const settings = await openMemorySettings(page);
    await expect(
      settings.getByRole("button", { name: "Add fact" }),
    ).toBeVisible();
    const widths = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(widths.body).toBeLessThanOrEqual(widths.viewport);
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  });
});
