import { toNano } from '@ton/core';
import { AVLTree } from '../wrappers/AVLTree';
import { compile, NetworkProvider } from '@ton/blueprint';
import { createSender } from '../utils/createSender';

export async function run(provider: NetworkProvider) {
    const sender = await createSender();
    const aVLTree = provider.open(AVLTree.createFromConfig({}, await compile('AVLTree')));

    await aVLTree.sendDeploy(sender, toNano('0.05'));

    await provider.waitForDeploy(aVLTree.address);

    // run methods on `aVLTree`
}
