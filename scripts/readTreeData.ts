import { AVLTree } from '../wrappers/AVLTree';
import { NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import dotenv from 'dotenv';
dotenv.config();

export async function run(provider: NetworkProvider) {
    const AVLTreeAddress = Address.parse(process.env.AVL_TREE_ADDRESS!);
    const tree = provider.open(AVLTree.createFromAddress(AVLTreeAddress));

    const treeData = await tree.getTreeData();
    console.log(treeData);
}
