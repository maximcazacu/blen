import { test, expect } from "@playwright/test";

test("blen. systems diagram, retained workflow motion and reduced-motion support", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en");
  const system = page.locator(".systems-visual");
  await expect(system.getByRole("button",{name:/Rules & routing/})).toHaveAttribute("aria-pressed","true");
  await system.getByRole("button",{name:/Shared reporting/}).click();
  await expect(system.getByRole("status")).toContainText("Record outcomes");
  await expect(page.locator("body")).toHaveCSS("color","rgb(23, 26, 36)");
  await page.screenshot({ path: info.outputPath("blen-home-desktop.png") });

  await page.goto("/en/services");
  const implementation=page.locator("#implementation");
  const icons=implementation.locator(".tool-icon img");
  await expect(icons).toHaveCount(4);
  await implementation.scrollIntoViewIfNeeded();
  await expect.poll(() => icons.evaluateAll(images=>images.every(img=>img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0))).toBe(true);
  await expect(implementation.getByRole("link",{name:/Automated reporting/}).getByText("Excel and Office Scripts",{exact:true})).toBeVisible();

  await page.goto("/en/ops");
  const workflow = page.locator(".motion-workflow");
  await expect(workflow).toHaveAttribute("data-active", "true");
  await expect(workflow).toHaveAttribute("data-running", "true");
  await expect(workflow.getByRole("status")).toHaveText("Simulation complete", { timeout: 12000 });

  await page.goto("/en/consulting");
  await expect(page.getByRole("status")).toHaveText("Proposed future state", { timeout: 12000 });
  await page.screenshot({ path: info.outputPath("blen-advisory-desktop.png") });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/ops");
  const ops = page.locator(".motion-workflow");
  await expect(ops).toHaveAttribute("data-active", "false");
  await expect(ops.getByRole("status")).toHaveText("Synthetic workflow preview");
  await ops.getByRole("button", { name: "Play flow" }).click();
  await expect(ops.getByRole("status")).toHaveText("Simulation complete");
  await expect(ops.locator(".visual-node").first()).toHaveCSS("animation-name", "none");
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/ro/consulting");
  await expect(page.getByRole("status")).toHaveText("Proces actual fragmentat");
  await page.getByRole("button", { name: "Arată fluxul conectat" }).click();
  await expect(page.getByRole("status")).toHaveText("Flux viitor propus");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: info.outputPath("blen-advisory-mobile.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/ro/builder");
  await expect(page.getByRole("button", { name: "Curățare date Excel", exact: true })).toHaveCSS("color", "rgb(23, 26, 36)");
  await expect(page.locator(".react-flow__node")).toHaveCount(5);
  await expect(page.locator(".react-flow__node").first()).toBeVisible();
  await page.screenshot({ path: info.outputPath("blen-builder-desktop.png"), caret: "initial" });
  expect(errors).toEqual([]);
});
