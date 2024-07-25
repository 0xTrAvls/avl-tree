import { AvlTree } from '../wrappers/AVLTree';
import { NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import dotenv from 'dotenv';
dotenv.config();

export async function run(provider: NetworkProvider) {
  const avlTreeAddress = Address.parse(process.env.AVL_TREE_ADDRESS!);
  const tree = provider.open(AvlTree.createFromAddress(avlTreeAddress));

  const numNode = await tree.getNumNode();
  console.log(numNode);
}
