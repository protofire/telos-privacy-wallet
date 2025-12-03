import { test } from "../fixtures/testContextFixture";

test.describe.configure({ mode: `parallel` });


test("Create zkAccount from Metamask", async ({ app, metamask }) => {
  await metamask.importWallet();
  await app.open("/");
  await app.createZkAccountFromMetamask();
});

test("Create zkAccount from seed phrase", async ({ app }) => {
  await app.open("/#/home");
  await app.createZkAccountFromSeedPhrase();
});
