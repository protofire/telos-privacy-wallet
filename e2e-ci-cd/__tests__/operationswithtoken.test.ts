import { test } from "../fixtures/testContextFixture";
import OperationsWithTokenPages from "../pages/PageObjects/OperationsWithToken/OperationsWithTokenElements";

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


test("Deposit", async ({ app }) => {
  await app.open("/#/Deposit");
  await app.delay(2000);
  await app.createZkAccountFromMetamask();
  const operations = new OperationsWithTokenPages(app["page"]);
  await operations.Deposit();
});

test("Transfer", async ({ app }) => {
  await app.open("/#/Transfer");
  await app.delay(2000);
  await app.createZkAccountFromMetamask();
  const operations = new OperationsWithTokenPages(app["page"]);
  await operations.Transfer();
  await operations.CheckTransfer();
});


test("Withdraw", async ({ app }) => {
  await app.open("/#/Withdraw");
  await app.delay(2000);
  await app.createZkAccountFromMetamask();
  const operations = new OperationsWithTokenPages(app["page"]);
  await operations.Withdraw();
});
