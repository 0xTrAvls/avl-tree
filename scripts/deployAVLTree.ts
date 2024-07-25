import { toNano } from '@ton/core';
import { AvlTree } from '../wrappers/AVLTree';
import { compile, NetworkProvider } from '@ton/blueprint';
import { createSender } from '../utils/createSender';

export async function run(provider: NetworkProvider) {
  const sender = await createSender();

  const avlTree = provider.open(AvlTree.createFromConfig({ adminAddress: sender.address! }, await compile('AVLTree')));

  await avlTree.sendDeploy(sender, toNano('0.05'));

  await provider.waitForDeploy(avlTree.address);

  // run methods on `aVLTree`
}
