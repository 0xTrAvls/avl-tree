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

  const ui = provider.ui();
  let tonAmount = await ui.input('Enter the amount of TON to collect');

  await tree.sendResetGas(sender, toNano('0.05'), BigInt(tonAmount));
}
