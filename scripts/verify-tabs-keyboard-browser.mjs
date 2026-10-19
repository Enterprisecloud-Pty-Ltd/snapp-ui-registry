import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { createServer } from "vite";
import { chromium } from "playwright";
import { Scanner } from "@tailwindcss/oxide";

const root = fileURLToPath(new URL("..", import.meta.url));
const consumer = path.resolve(
  process.argv[2] ||
    process.env.SNAPP_CONSUMER_ROOT ||
    path.join(root, "../snappcomponents"),
);
const require = createRequire(path.join(consumer, "package.json"));
const tabsSource = path.resolve(
  process.env.SNAPP_TABS_SOURCE ||
    path.join(root, "registry/radix-nova/ui/tabs.tsx"),
);
const keyboardSource = path.join(path.dirname(tabsSource), "tabs.keyboard.ts");
const relativeTabsSource = path.relative(consumer, tabsSource);
const hugTextSource =
  !relativeTabsSource.startsWith("..") && !path.isAbsolute(relativeTabsSource)
    ? path.join(consumer, "src/components/ui/hug-text.tsx")
    : path.join(root, "registry/radix-nova/ui/hug-text.tsx");
const output = path.resolve(
  process.env.SNAPP_TABS_QA_OUTPUT ||
    path.join(root, "artifacts/figma-qa/tabs-keyboard"),
);
const fixture = await fs.mkdtemp(
  path.join(os.tmpdir(), "snapp-tabs-keyboard-"),
);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const report = {
  capturedAt: new Date().toISOString(),
  source: tabsSource,
  sourceSha256: hash(await fs.readFile(tabsSource)),
  fixture,
  checks: [],
  errors: [],
  limits: [
    "Canonical-source React fixture; not a generated consumer or external PCF deployment.",
    "Light DOM is the native PCF representation. Nested open ShadowRoots represent Shell/Cabinet isolation. No iframe is used.",
    "Chromium browser coverage; not a Firefox/Safari certification.",
    "Installed Radix schedules item navigation before list bubble handlers. Trigger.onKeyDown or List.onKeyDownCapture can cancel; List.onKeyDown is notification and observes defaultPrevented.",
  ],
};
report.testSha256 = hash(await fs.readFile(fileURLToPath(import.meta.url)));
if ((await fs.readFile(tabsSource, "utf8")).includes("tabs.keyboard"))
  report.keyboardSource = {
    file: keyboardSource,
    sha256: hash(await fs.readFile(keyboardSource)),
  };
report.hugTextSource = {
  file: hugTextSource,
  sha256: hash(await fs.readFile(hugTextSource)),
};
const check = (name, passed, details = {}) =>
  report.checks.push({ name, passed: Boolean(passed), ...details });
await fs.mkdir(output, { recursive: true });
await fs.copyFile(
  path.join(root, "docs/figma-library/tabs-keyboard-preview.tsx"),
  path.join(fixture, "preview.tsx"),
);
report.fixtureSha256 = hash(
  await fs.readFile(path.join(fixture, "preview.tsx")),
);
await fs.writeFile(
  path.join(fixture, "index.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="/compiled.css"></head><body><p data-host-sentinel="document" style="font:27px Georgia;color:rgb(150,20,90)">Host sentinel</p><section id="standalone"></section><section id="pcf-light"></section><section id="shadow-a"></section><section id="shadow-b"></section><section id="nested-shell"></section><script type="module" src="/preview.tsx"></script></body></html>',
);
await fs.writeFile(
  path.join(fixture, "tsconfig.json"),
  JSON.stringify({ compilerOptions: { jsx: "react-jsx" } }),
);
const { compile } = await import(
  pathToFileURL(require.resolve("@tailwindcss/node"))
);
const compiler = await compile(
  await fs.readFile(path.join(consumer, "src/index.css"), "utf8"),
  { base: path.join(consumer, "src"), onDependency() {} },
);
const scanner = new Scanner({
  sources: [
    { base: path.join(consumer, "src"), pattern: "**/*.tsx", negated: false },
    {
      base: path.join(root, "registry/radix-nova"),
      pattern: "**/*.tsx",
      negated: false,
    },
    { base: fixture, pattern: "*.tsx", negated: false },
  ],
});
await fs.writeFile(
  path.join(fixture, "compiled.css"),
  compiler.build(scanner.scan()),
);
const server = await createServer({
  configFile: false,
  root: fixture,
  cacheDir: path.join(fixture, ".vite"),
  server: {
    host: "127.0.0.1",
    port: 0,
    hmr: false,
    fs: { allow: [fixture, consumer, root, path.dirname(tabsSource)] },
  },
  resolve: {
    alias: [
      { find: "@/components/ui/tabs.keyboard", replacement: keyboardSource },
      { find: "@/components/ui/tabs", replacement: tabsSource },
      {
        find: "@/components/ui/hug-text",
        replacement: hugTextSource,
      },
      { find: "@", replacement: path.join(consumer, "src") },
      ...["react", "react-dom", "radix-ui", "class-variance-authority"].map(
        (name) => ({
          find: name,
          replacement: path.join(consumer, "node_modules", name),
        }),
      ),
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom/client",
      "radix-ui",
      "class-variance-authority",
    ],
  },
});
await server.listen();
server.middlewares.use((request, response, next) => {
  if (request.url === "/favicon.ico") {
    response.statusCode = 204;
    response.end();
  } else next();
});
const url = `http://127.0.0.1:${server.httpServer.address().port}/`;
const browser = await chromium.launch({ headless: true });
report.browser = browser.version();
try {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 1200 },
  });
  page.setDefaultTimeout(10000);
  page.on("pageerror", (error) => report.errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") report.errors.push(message.text());
  });
  await page.addInitScript(() => {
    const active = [];
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const capture = (options) =>
      typeof options === "boolean" ? options : Boolean(options?.capture);
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      if (
        type === "keydown" &&
        !active.some(
          (item) =>
            item.active &&
            item.target === this &&
            item.listener === listener &&
            item.capture === capture(options),
        )
      )
        active.push({
          target: this,
          listener,
          capture: capture(options),
          active: true,
        });
      return add.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      if (type === "keydown") {
        const entry = active.find(
          (item) =>
            item.active &&
            item.target === this &&
            item.listener === listener &&
            item.capture === capture(options),
        );
        if (entry) entry.active = false;
      }
      return remove.call(this, type, listener, options);
    };
    window.__TABS_KEYDOWN_AUDIT__ = active;
  });
  await page.goto(url);
  await page.waitForFunction(
    () =>
      window.__TABS_KEYBOARD_PREVIEW__?.hosts.length === 6 &&
      document
        .querySelector("#nested-shell")
        ?.shadowRoot?.querySelector("#nested-cabinet")
        ?.shadowRoot?.querySelector('[data-case="horizontal"] [role="tab"]'),
  );
  await page.evaluate(() => document.fonts.ready);
  const hosts = await page.evaluate(
    () => window.__TABS_KEYBOARD_PREVIEW__.hosts,
  );
  report.hosts = hosts;
  const settle = () =>
    page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
  const list = (host, name) =>
    page
      .locator(
        `[data-mount-container="${host}"] [data-case="${name}"] [role="tablist"]`,
      )
      .first();
  const tab = (scope, value) =>
    scope.locator(`[role="tab"][data-value="${value}"]`).first();
  const state = (scope) =>
    scope.evaluate((element) => {
      let active = document.activeElement;
      while (active?.shadowRoot?.activeElement)
        active = active.shadowRoot.activeElement;
      const tabs = [...element.querySelectorAll('[role="tab"]')].filter(
        (item) => item.closest('[role="tablist"]') === element,
      );
      return {
        orientation: element.getAttribute("aria-orientation"),
        selected: tabs
          .filter((item) => item.getAttribute("aria-selected") === "true")
          .map((item) => item.dataset.value),
        focused: tabs.find((item) => item === active)?.dataset.value,
        enabledTabStops: tabs
          .filter(
            (item) => !item.hasAttribute("disabled") && item.tabIndex === 0,
          )
          .map((item) => item.dataset.value),
        disabledTabStop: tabs.some(
          (item) => item.hasAttribute("disabled") && item.tabIndex === 0,
        ),
      };
    });
  const expectState = async (name, scope, focused, selected = focused) => {
    const actual = await state(scope);
    check(
      name,
      actual.focused === focused &&
        actual.selected.length === 1 &&
        actual.selected[0] === selected &&
        actual.enabledTabStops.length === 1 &&
        actual.enabledTabStops[0] === focused &&
        !actual.disabledTabStop,
      { actual, expected: { focused, selected } },
    );
  };
  const press = async (name, scope, key, focused, selected = focused) => {
    await page.keyboard.press(key);
    await settle();
    await expectState(name, scope, focused, selected);
  };
  const sentinels = () =>
    page.locator("[data-host-sentinel]").evaluateAll((elements) =>
      elements.map((element) => {
        const s = getComputedStyle(element);
        return {
          host: element.dataset.hostSentinel,
          font: s.font,
          color: s.color,
        };
      }),
    );
  const beforeSentinels = await sentinels();
  // This first assertion reproduces Radix's document.activeElement error in a ShadowRoot.
  const isolationBefore = await Promise.all(
    hosts
      .filter((host) => host !== "shadow-a")
      .map(async (host) => ({
        host,
        state: await state(list(host, "horizontal")),
      })),
  );
  await tab(list("shadow-a", "horizontal"), "first").focus();
  await press(
    "ShadowRoot ArrowRight selects immediate enabled next tab",
    list("shadow-a", "horizontal"),
    "ArrowRight",
    "second",
  );
  const isolationAfter = await Promise.all(
    hosts
      .filter((host) => host !== "shadow-a")
      .map(async (host) => ({
        host,
        state: await state(list(host, "horizontal")),
      })),
  );
  check(
    "Sibling and nested hosts retain their own selection",
    isolationAfter.every(
      (item, i) =>
        JSON.stringify(item.state.selected) ===
        JSON.stringify(isolationBefore[i].state.selected),
    ),
    { before: isolationBefore, after: isolationAfter },
  );
  for (const host of hosts) {
    for (const name of [
      "horizontal",
      "vertical",
      "rtl",
      "vertical-rtl",
      "controlled",
      "as-child",
    ]) {
      const scope = list(host, name);
      const vertical = name.startsWith("vertical");
      const forward = vertical
        ? "ArrowDown"
        : name === "rtl"
          ? "ArrowLeft"
          : "ArrowRight";
      const backward = vertical
        ? "ArrowUp"
        : name === "rtl"
          ? "ArrowRight"
          : "ArrowLeft";
      const actualOrientation = await scope.getAttribute("aria-orientation");
      check(
        `${host}/${name}: native orientation`,
        actualOrientation === (vertical ? "vertical" : "horizontal"),
        { actual: actualOrientation },
      );
      await tab(scope, "first").focus();
      await settle();
      await press(`${host}/${name}: disabled skip`, scope, forward, "second");
      await press(`${host}/${name}: next`, scope, forward, "third");
      await press(`${host}/${name}: forward wrap`, scope, forward, "first");
      await press(`${host}/${name}: backward wrap`, scope, backward, "third");
      await press(`${host}/${name}: Home`, scope, "Home", "first");
      await press(`${host}/${name}: End`, scope, "End", "third");
      await press(
        `${host}/${name}: other axis ignored`,
        scope,
        vertical ? "ArrowRight" : "ArrowDown",
        "third",
      );
      if (name === "as-child")
        check(
          `${host}: custom asChild retains native button and rich label`,
          await tab(scope, "third").evaluate(
            (element) =>
              element.tagName === "BUTTON" &&
              Boolean(element.querySelector("[data-custom-label]")),
          ),
        );
    }
    for (const name of ["manual", "controlled-manual"]) {
      const scope = list(host, name);
      await tab(scope, "first").focus();
      await settle();
      await press(
        `${host}/${name}: arrow moves focus only`,
        scope,
        "ArrowRight",
        "second",
        "first",
      );
      await press(`${host}/${name}: Enter activates`, scope, "Enter", "second");
      await press(
        `${host}/${name}: next focus preserves selection`,
        scope,
        "ArrowRight",
        "third",
        "second",
      );
      await press(`${host}/${name}: Space activates`, scope, "Space", "third");
      await press(
        `${host}/${name}: Home preserves selection`,
        scope,
        "Home",
        "first",
        "third",
      );
      await press(
        `${host}/${name}: End preserves selection`,
        scope,
        "End",
        "third",
        "third",
      );
    }
    for (const name of ["controlled", "controlled-manual"]) {
      const external = page.locator(
        `[data-mount-container="${host}"] [data-case="${name}"] [data-external-value]`,
      );
      await external.click();
      await settle();
      const actual = await state(list(host, name));
      check(
        `${host}/${name}: external controlled value`,
        actual.selected[0] === "third" &&
          (await external.evaluate((element) => {
            let active = document.activeElement;
            while (active?.shadowRoot?.activeElement)
              active = active.shadowRoot.activeElement;
            return active === element;
          })),
        { actual },
      );
    }
    const horizontal = list(host, "horizontal");
    await tab(horizontal, "first").focus();
    await settle();
    for (const modifier of ["Shift", "Alt", "Control", "Meta"])
      await press(
        `${host}: ${modifier} navigation ignored`,
        horizontal,
        `${modifier}+ArrowRight`,
        "first",
      );
    for (const name of ["cancel-trigger", "cancel-capture"]) {
      const scope = list(host, name);
      await tab(scope, "first").focus();
      await settle();
      await press(
        `${host}/${name}: user preventDefault wins`,
        scope,
        "ArrowRight",
        "first",
      );
    }
    const bubble = list(host, "cancel-list");
    await tab(bubble, "first").focus();
    await settle();
    await press(
      `${host}: list bubble notification preserves installed Radix navigation timing`,
      bubble,
      "ArrowRight",
      "second",
    );
    const notifications = await page.evaluate(
      (host) =>
        window.__TABS_KEYBOARD_PREVIEW__.bubbleEvents.filter(
          (event) =>
            event.host === host &&
            event.name === "cancel-list" &&
            event.key === "ArrowRight",
        ),
      host,
    );
    check(
      `${host}: bubble handler receives the prevented navigation event`,
      notifications.length === 1 && notifications[0].defaultPrevented,
      { notifications },
    );
    const noLoop = list(host, "no-loop");
    await tab(noLoop, "first").focus();
    await settle();
    await press(`${host}: loop false Home edge`, noLoop, "ArrowLeft", "first");
    await press(
      `${host}: loop false disabled skip`,
      noLoop,
      "ArrowRight",
      "second",
    );
    await press(`${host}: loop false End`, noLoop, "End", "third");
    await press(
      `${host}: loop false final edge`,
      noLoop,
      "ArrowRight",
      "third",
    );
    const nested = page.locator(
      `[data-mount-container="${host}"] [data-case="nested"]`,
    );
    const inner = nested.locator(
      '[data-nested-owner="inner"] > [role="tablist"]',
    );
    const outer = nested.locator(
      '[data-nested-owner="outer"] > [role="tablist"]',
    );
    await tab(inner, "first").focus();
    await settle();
    await press(
      `${host}: inner nested tablist moves once`,
      inner,
      "ArrowRight",
      "second",
    );
    check(
      `${host}: inner navigation leaves outer selection`,
      (await state(outer)).selected[0] === "first",
    );
    await tab(outer, "first").focus();
    await settle();
    await press(
      `${host}: outer tablist excludes inner tabs`,
      outer,
      "ArrowRight",
      "second",
    );
    const disabledSource = list(host, "as-child");
    await tab(disabledSource, "first").click();
    await settle();
    await tab(disabledSource, "disabled").evaluate((element) =>
      element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      ),
    );
    await settle();
    await expectState(
      `${host}: disabled asChild source cannot navigate`,
      disabledSource,
      "first",
    );
    await tab(disabledSource, "first").evaluate((element) => {
      element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "End",
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
      element.setAttribute("aria-disabled", "true");
    });
    await settle();
    await expectState(
      `${host}: End timer drops an asChild origin disabled after keydown`,
      disabledSource,
      "first",
    );
    await tab(disabledSource, "first").evaluate((element) =>
      element.removeAttribute("aria-disabled"),
    );
    const canceledEntry = list(host, "cancel-focus");
    await canceledEntry.focus();
    await settle();
    const entryCanceled = await canceledEntry.evaluate((element) => {
      let active = document.activeElement;
      while (active?.shadowRoot?.activeElement)
        active = active.shadowRoot.activeElement;
      return active === element;
    });
    check(
      `${host}: public onFocus cancellation prevents entry focus redirect`,
      entryCanceled,
      { actual: await state(canceledEntry) },
    );
    const redirect = list(host, "redirect-focus");
    await tab(redirect, "first").focus();
    await settle();
    await page.keyboard.press("ArrowRight");
    await settle();
    const redirected = await page
      .locator(
        `[data-mount-container="${host}"] [data-case="redirect-focus"] [data-focus-redirect]`,
      )
      .evaluate((element) => {
        let active = document.activeElement;
        while (active?.shadowRoot?.activeElement)
          active = active.shadowRoot.activeElement;
        return active === element;
      });
    check(
      `${host}: user onFocus redirect is not replaced by a later candidate`,
      redirected && (await state(redirect)).selected[0] === "second",
      { actual: await state(redirect), redirected },
    );
    const offscreen = list(host, "offscreen");
    await tab(offscreen, "first").focus();
    await settle();
    await page
      .locator(`[data-mount-container="${host}"] [data-case="offscreen"]`)
      .evaluate((element) => {
        element.scrollTop = 0;
      });
    await press(
      `${host}: End focuses the offscreen enabled tab`,
      offscreen,
      "End",
      "third",
    );
    const reveal = await page
      .locator(`[data-mount-container="${host}"] [data-case="offscreen"]`)
      .evaluate((element) => {
        const viewport = element.getBoundingClientRect();
        const focused = element
          .querySelector('[data-value="third"]')
          .getBoundingClientRect();
        return {
          scrollTop: element.scrollTop,
          top: focused.top - viewport.top,
          bottom: focused.bottom - viewport.top,
          height: viewport.height,
        };
      });
    check(
      `${host}: keyboard focus reveals tab within its scroll viewport`,
      reveal.scrollTop > 0 && reveal.top >= 0 && reveal.bottom <= reveal.height,
      reveal,
    );
    const multiple = page.locator(
      `[data-mount-container="${host}"] [data-case="multiple-lists"]`,
    );
    const firstList = multiple.locator('[data-list="one"]');
    const secondList = multiple.locator('[data-list="two"]');
    await tab(firstList, "first").focus();
    await settle();
    await press(
      `${host}: multiple lists navigate within first list`,
      firstList,
      "ArrowRight",
      "second",
    );
    await tab(secondList, "first").focus();
    await settle();
    await press(
      `${host}: multiple lists navigate within second list`,
      secondList,
      "ArrowRight",
      "second",
    );
    await press(
      `${host}: second list reaches its own third tab`,
      secondList,
      "ArrowRight",
      "third",
    );
  }
  await tab(list("shadow-a", "manual"), "first").click();
  await settle();
  await page.evaluate(() => {
    const scope = document
      .getElementById("shadow-a")
      .shadowRoot.querySelector('[data-case="manual"]');
    const first = scope.querySelector('[data-value="first"]');
    const third = scope.querySelector('[data-value="third"]');
    const key = (value) =>
      new KeyboardEvent("keydown", {
        key: value,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
    first.dispatchEvent(key("ArrowRight"));
    third.focus();
    third.dispatchEvent(key("ArrowLeft"));
    first.focus();
  });
  await settle();
  await expectState(
    "A newer list navigation cancels an old origin even if focus returns before timers run",
    list("shadow-a", "manual"),
    "first",
  );
  await tab(list("shadow-a", "horizontal"), "first").click();
  await settle();
  await page.evaluate(() => {
    const first = (host) =>
      document
        .getElementById(host)
        .shadowRoot.querySelector(
          '[data-case="horizontal"] [data-value="first"]',
        );
    first("shadow-a").dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    first("shadow-b").focus();
  });
  await settle();
  const staleOrigin = {
    source: await state(list("shadow-a", "horizontal")),
    destination: await state(list("shadow-b", "horizontal")),
  };
  check(
    "Queued navigation drops when focus moves to another Snapp before timer fires",
    staleOrigin.source.selected[0] === "first" &&
      !staleOrigin.source.focused &&
      staleOrigin.destination.focused === "first" &&
      staleOrigin.destination.selected[0] === "first",
    staleOrigin,
  );
  await tab(list("shadow-a", "horizontal"), "first").click();
  await settle();
  await page.evaluate(() => {
    const source = document
      .getElementById("shadow-a")
      .shadowRoot.querySelector(
        '[data-case="horizontal"] [data-value="first"]',
      );
    source.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    window.__TABS_KEYBOARD_PREVIEW__.unmount("shadow-a");
    document
      .getElementById("shadow-b")
      .shadowRoot.querySelector('[data-case="horizontal"] [data-value="first"]')
      .focus();
  });
  await settle();
  await expectState(
    "Queued navigation is canceled on unmount and cannot steal sibling focus",
    list("shadow-b", "horizontal"),
    "first",
  );
  check(
    "Unmount removes first Snapp while sibling stays mounted",
    (await page.locator('#shadow-a [role="tab"]').count()) === 0 &&
      (await page.locator('#shadow-b [role="tab"]').count()) > 0,
  );
  await tab(list("shadow-b", "horizontal"), "first").focus();
  await settle();
  await press(
    "Sibling remains usable after another Snapp unmounts",
    list("shadow-b", "horizontal"),
    "ArrowRight",
    "second",
  );
  await page.evaluate(() => window.__TABS_KEYBOARD_PREVIEW__.mount("shadow-a"));
  await page
    .locator('#shadow-a [data-case="horizontal"] [role="tab"]')
    .first()
    .waitFor();
  await tab(list("shadow-a", "horizontal"), "first").focus();
  await settle();
  const beforeChanges = await page.evaluate(
    () =>
      window.__TABS_KEYBOARD_PREVIEW__.changes.filter(
        (change) => change.host === "shadow-a" && change.name === "horizontal",
      ).length,
  );
  await press(
    "Remount starts clean and selects once",
    list("shadow-a", "horizontal"),
    "ArrowRight",
    "second",
  );
  const afterChanges = await page.evaluate(
    () =>
      window.__TABS_KEYBOARD_PREVIEW__.changes.filter(
        (change) => change.host === "shadow-a" && change.name === "horizontal",
      ).length,
  );
  check(
    "Remount emits exactly one value change",
    afterChanges - beforeChanges === 1,
    { beforeChanges, afterChanges },
  );
  check(
    "No iframe fallback is used",
    (await page.locator("iframe").count()) === 0,
  );
  await page.evaluate(() => {
    for (const host of [...window.__TABS_KEYBOARD_PREVIEW__.hosts].reverse())
      window.__TABS_KEYBOARD_PREVIEW__.unmount(host);
  });
  await settle();
  const listenerAudit = await page.evaluate(() =>
    window.__TABS_KEYDOWN_AUDIT__
      .filter(
        (item) =>
          item.active &&
          !(
            item.target instanceof Element &&
            item.target.hasAttribute("data-mount-container")
          ),
      )
      .map((item) => ({
        target:
          item.target instanceof ShadowRoot
            ? `ShadowRoot:${item.target.host.id}`
            : item.target instanceof Element
              ? item.target.outerHTML.slice(0, 160)
              : String(item.target),
        capture: item.capture,
      })),
  );
  check(
    "Unmount cleans up keyboard listeners outside React root delegation",
    listenerAudit.length === 0,
    { activeListeners: listenerAudit },
  );
  check(
    "Host sentinel styles remain unchanged",
    JSON.stringify(await sentinels()) === JSON.stringify(beforeSentinels),
    { before: beforeSentinels, after: await sentinels() },
  );
} catch (error) {
  report.errors.push(error.stack || error.message);
} finally {
  await browser.close();
  await server.close();
}
report.failures = report.checks.filter((item) => !item.passed);
report.status =
  report.failures.length || report.errors.length ? "failed" : "passed";
await fs.writeFile(
  path.join(output, "report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      status: report.status,
      checks: report.checks.length,
      failures: report.failures.length,
      firstFailure: report.failures[0],
      errors: report.errors,
      sourceSha256: report.sourceSha256,
      output,
    },
    null,
    2,
  ),
);
if (report.status !== "passed") process.exitCode = 1;
