import { TIMEOUTS } from "../constants";
import { test } from "../fixtures/testContextFixture";
import OperationsWithTokenPages from "../pages/PageObjects/OperationsWithToken/OperationsWithTokenElements";
import { OperationsWithTokenElementsLocators } from "../pages/PageObjects/OperationsWithToken/OperationsWithTokenLocators";

test.beforeAll(async ({ metamask }) => {
  await metamask.importWallet();
  await metamask.updateNetwork({
    blockExplorerUrl: "https://testnet.teloscan.io",
    chainId: "41",
    networkName: "Telos Testnet",
    rpcUrl: "https://rpc.testnet.telos.net",
    symbol: "TLOS",
  });
  await metamask.selectNetwork("Telos Testnet");

});


test("User Operations with Token", async ({ app }) => {
  await app.open("/#/Deposit");
  await app.delay(2000);
  await app.createZkAccountFromMetamask();
  const operations = new OperationsWithTokenPages(app["page"]);
  await operations.Deposit();
  
  await app.sleep(TIMEOUTS.oneSecond)
  await app.locator(OperationsWithTokenElementsLocators.tab_transfer).click();
  await operations.Transfer();
  await operations.CheckTransfer();
  
  await app.sleep(TIMEOUTS.oneSecond)
  await app.locator(OperationsWithTokenElementsLocators.tab_withdraw).click();
  await operations.Withdraw();
});


// test("Deposit", async ({ app }) => {
//   await app.open("/#/Deposit");
//   await app.delay(2000);
//   await app.createZkAccountFromMetamask();
//   const operations = new OperationsWithTokenPages(app["page"]);
//   await operations.Deposit();
// });

// test("Transfer", async ({ app }) => {
//   await app.open("/#/Transfer");
//   await app.delay(2000);
//   await app.createZkAccountFromMetamask();
//   const operations = new OperationsWithTokenPages(app["page"]);
//   await operations.Transfer();
//   await operations.CheckTransfer();
// });


// test("Withdraw", async ({ app }) => {
//   await app.open("/#/Withdraw");
//   await app.delay(2000);
//   await app.createZkAccountFromMetamask();
//   const operations = new OperationsWithTokenPages(app["page"]);
//   await operations.Withdraw();
// });
