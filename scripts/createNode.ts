import { AVLTree } from '../wrappers/AVLTree';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { createSender } from '../utils/createSender';
import dotenv from 'dotenv';
dotenv.config();

export async function run(provider: NetworkProvider) {
    const sender = await createSender();
    const AVLTreeAddress = Address.parse(process.env.AVL_TREE_ADDRESS!);
    const tree = provider.open(AVLTree.createFromAddress(AVLTreeAddress));

    await tree.sendCreateNode(sender, toNano('0.05'), BigInt(4), BigInt(8));
}
