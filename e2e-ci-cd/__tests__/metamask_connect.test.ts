import { test } from '../fixtures/testContextFixture';

test('Create zkAccount from Metamask', async ({app, metamask}) => {
  await metamask.importWallet()
  await app.open('/')
  await app.createZkAccountFromMetamask()
});
