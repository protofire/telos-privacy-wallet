import { test } from '../fixtures/testContextFixture';
import OperationsWithTokenPages from '../pages/PageObjects/OperationsWithToken/OperationsWithTokenElements';

test.beforeEach(async ({ metamask, app }) => {
  await metamask.importWallet();
  await metamask.updateNetwork({
    blockExplorerUrl: "https://testnet.teloscan.io",
    chainId: "41",
    networkName: "Telos Testnet",
    rpcUrl: "https://rpc.testnet.telos.net",
    symbol: "TLOS",
  });
  await metamask.selectNetwork('Telos Testnet');

  await app.open('/#/Deposit');
});

test('Deposit', async ({ app }) => {
  await app.delay(2000);
  await app.createZkAccountFromMetamask();
  const operations = new OperationsWithTokenPages(app['page']);
  await operations.Deposit();
});