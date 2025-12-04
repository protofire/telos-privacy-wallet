import path from 'path';
import { BrowserContext, chromium, test as base } from '@playwright/test';

import App from '../pages/app';
import zkAccountPage from '../pages/PageObjects/zkAccount/zkAccountElements';

import Metamask from '../pages/metamask';
import OperationsWithTokenPages from '../pages/PageObjects/OperationsWithToken/OperationsWithTokenElements';

interface TestContextFixture {
  metamask: Metamask;
  metamaskContext: BrowserContext;
  app: App;
  zkAccount: zkAccountPage;
  OperationsWithToken: OperationsWithTokenPages;
}

export const test = base.extend<TestContextFixture>({
  metamaskContext: [
    async ({}, use) => {
      const pathToExtension = path.join(__dirname, '../dist/metamask/');
      const userDataDir = path.join(
        __dirname,
        `../tmp/${+new Date()}${Math.random()}`,
      );

      const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1080, height: 800 },
        args: [
          `--disable-extensions-except=${pathToExtension}`,
          `--load-extension=${pathToExtension}`,
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
        ],
        locale: 'en-US',
      });
      await use(context);
      await context.close()
    },
    { scope: 'test', auto: true },
  ],
  metamask: [
    async ({ metamaskContext: context }, use) => {
      let metamaskPage = context
        .pages()
        .find((p) => p.url().startsWith('chrome-extension://'));

      if (!metamaskPage) {
        metamaskPage = await context.waitForEvent('page', {
          predicate: (p) => p.url().startsWith('chrome-extension://'),
          timeout: 30000,
        });
      }

      await metamaskPage.waitForLoadState();
      if ((await metamaskPage.title()) === 'MetaMask') {
        await metamaskPage.reload();
        await metamaskPage.waitForLoadState();
      }
      await use(new Metamask(metamaskPage));
    },
    { scope: 'test' },
  ],

  app: async ({ metamaskContext: context }, use) => {
    const page = await context.newPage();
    await use(new App(page));
  },

  zkAccount: async ({ metamaskContext: context }, use) => {
    const page = await context.newPage();
    await use(new zkAccountPage(page));
  },

  OperationsWithToken: async ({ metamaskContext: context }, use) => {
    const page = await context.newPage();
    await use(new OperationsWithTokenPages(page));
  },


});
