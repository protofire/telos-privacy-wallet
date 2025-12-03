import { Page } from '@playwright/test';


import BasePage from './base';
import MetamaskNotification from './metamaskNotification';
import { zkAccountElementsLocators } from './PageObjects/zkAccount/zkAccountLocators';


var seed_phrase = new Array();
export default class App extends BasePage {

  constructor(page: Page) {
    super(page);
  }

  async createZkAccountFromMetamask(): Promise<void> {
    await this.focus();

    await this.locator('text=Connect wallet').click();

    const [popup] = await Promise.all([this.waitForPage(), this.locator(`text=MetaMask`).click()]);

    const metamaskNotification = new MetamaskNotification(popup);
    await metamaskNotification.grantAccess();

    await this.locator(`text=0x`).isVisible()
    // Private account section
    await this.locator(`text=PUSD:`).isVisible()
    await this.locator(`text=TLOS:`).isVisible()
  }

  async createZkAccountFromSeedPhrase(): Promise<void> {
    await this.focus();

    await this.locator('text=Create Private Account').click();

    await this.locator('text=Instant Account (seed phrase)').click();

    // Copy seed phrase
    for (let num = 1; num < 13; num++) {
      let word = await this.locator(`//div/span[text()="${num}"]/../span[2]`).textContent();
      seed_phrase.push(word);
    }

    await this.locator(zkAccountElementsLocators.button_Continue).click();

    // Input seed phrase
    for (const [word] of seed_phrase.entries()) {
      await this.locator(`//div[text()="${seed_phrase[word]}"]`).click();
    }

    await this.locator(zkAccountElementsLocators.button_Verify).click();

    await this.locator('text=PUSD:').isVisible();
    await this.locator('text=TLOS:').isVisible();
  }
}
