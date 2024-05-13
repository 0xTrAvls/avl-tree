import { toNano } from '@ton/core';
import { AVLTree } from '../wrappers/AVLTree';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const aVLTree = provider.open(AVLTree.createFromConfig({}, await compile('AVLTree')));

    await aVLTree.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(aVLTree.address);

    // run methods on `aVLTree`
}
