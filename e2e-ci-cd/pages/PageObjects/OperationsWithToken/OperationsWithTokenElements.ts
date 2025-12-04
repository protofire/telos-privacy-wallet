import { expect, Page } from '@playwright/test';
import { TIMEOUTS } from '../../../constants';
import { OperationsWithTokenElementsLocators} from './OperationsWithTokenLocators';
import BasePage from '../../base';
import { zkAccountCreatePasswordLocators, zkAccountElementsLocators } from '../zkAccount/zkAccountLocators';

export default class OperationsWithTokenPages extends BasePage{
  readonly ADDRESS_METAMASK_ACCOUNT: string;
  readonly ZKACCOUNT_PASSWORD: string;
  readonly ZKBOB_RECEIVER_ADDRESS: string;
  readonly ZKACCOUNT_SEED_PHRASE: string;

  constructor(page: Page) {
    super(page);
    this.ADDRESS_METAMASK_ACCOUNT = process.env.ADDRESS_METAMASK_ACCOUNT as string;
    this.ZKACCOUNT_PASSWORD = process.env.ZKACCOUNT_PASSWORD as string;
    this.ZKBOB_RECEIVER_ADDRESS = process.env.ZKBOB_RECEIVER_ADDRESS as string;
    this.ZKACCOUNT_SEED_PHRASE = process.env.ZKACCOUNT_SEED_PHRASE as string;
  }

    async ReloadPage(): Promise<void> {
      await this.focus();
      await this.page.reload();
      await this.focus();
      await expect(this.locator('//div//span[contains(text(), "zkAccount")]')).toBeVisible({timeout: TIMEOUTS.tenMinutes});
    }

    async Deposit(): Promise<void> {
      await this.focus();
      await expect(this.locator('//button[text()="Enter amount"]')).toBeVisible({timeout: TIMEOUTS.fiveMinutes});
      await this.locator(OperationsWithTokenElementsLocators.input_amount_in_deposit_tab).type('0.5');
      const [popup] = await Promise.all([this.waitForPage(), this.locator(OperationsWithTokenElementsLocators.button_deposit).click()]);
      await popup.locator('//button[text()="Confirm"]').click();
      await this.locator('//button[text()="Got it"]').click();
      await expect(this.locator('//span[text()="Please wait for your transaction"]')).not.toBeVisible({timeout: TIMEOUTS.oneMinute});
    }

    async Transfer(): Promise<void> {
      await this.locator(OperationsWithTokenElementsLocators.input_amount_in_transfer_tab).type('1');
      await this.locator(OperationsWithTokenElementsLocators.enter_receiver_address).click();
      await this.locator(OperationsWithTokenElementsLocators.enter_receiver_address).type(this.ZKBOB_RECEIVER_ADDRESS);
      await this.locator(OperationsWithTokenElementsLocators.button_transfer).click();
      await this.locator(OperationsWithTokenElementsLocators.button_confirm).click();
      await expect(this.locator('//span[text()="Transfer is in progress"]')).toBeVisible({timeout: TIMEOUTS.oneMinute});
      await this.locator(OperationsWithTokenElementsLocators.close_transaction_modal).click();
      }

    async CheckTransfer(): Promise<void> {
      await this.ReloadPage()
      await expect(this.locator('//span[contains(text(), "Latest Transfer")]')).toBeVisible({timeout:TIMEOUTS.thirtySeconds});
      await expect(this.locator("text=/^\\s*1\\s*TLOS\\s*$/")).toBeVisible({ timeout: TIMEOUTS.thirtySeconds });
    }

    async Withdraw(): Promise<void> {

      await this.locator(OperationsWithTokenElementsLocators.tab_withdraw).click();
      expect(this.page.url()).toContain('/withdraw');
      await this.locator(OperationsWithTokenElementsLocators.input_amount_in_withdraw_tab).type('1');
      await this.locator(OperationsWithTokenElementsLocators.enter_web3_address).type(this.ADDRESS_METAMASK_ACCOUNT);
      await this.locator(OperationsWithTokenElementsLocators.button_withdraw).click({timeout:TIMEOUTS.tenMinutes});
      await this.locator(OperationsWithTokenElementsLocators.button_confirm).click();
      await expect(this.locator('//span[text()="Withdrawal sent"]')).toBeVisible({timeout: TIMEOUTS.tenMinutes});
      
    }
    

    
}