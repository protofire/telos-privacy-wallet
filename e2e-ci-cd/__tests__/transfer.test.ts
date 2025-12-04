import { test } from '../fixtures/testContextFixture';
import OperationsWithTokenPages from '../pages/PageObjects/OperationsWithToken/OperationsWithTokenElements';

test.beforeEach(async ({metamask, app}) => {
  await metamask.importWallet()
  await app.open('/#/Transfer')
  
});

test('Transfer', async({app}) => {
  await app.delay(2000);
  await app.createZkAccountFromMetamask();
  const operations = new OperationsWithTokenPages(app['page']);
  await operations.Transfer()
  await operations.CheckTransfer()
})
