import { AvlTree } from '../wrappers/AVLTree';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { createSender } from '../utils/createSender';
import dotenv from 'dotenv';
dotenv.config();

export async function run(provider: NetworkProvider) {
  const sender = await createSender();
  const avlTreeAddress = Address.parse(process.env.AVL_TREE_ADDRESS!);
  const tree = provider.open(AvlTree.createFromAddress(avlTreeAddress));

  const key = 1000000n;
  const value = 999999n;
  await tree.sendCreateNode(sender, toNano('0.05'), key, value);
}
