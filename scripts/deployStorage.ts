import { toNano } from '@ton/core';
import { compile, NetworkProvider } from '@ton/blueprint';
import { createSender } from '../utils/createSender';

import { Storage } from '../wrappers/Storage';

export async function run(provider: NetworkProvider) {
  const sender = await createSender();

  const storage = provider.open(Storage.createFromConfig({ adminAddress: sender.address! }, await compile('Storage')));

  await storage.sendDeploy(sender, toNano('0.05'));
  await provider.waitForDeploy(storage.address);
}
