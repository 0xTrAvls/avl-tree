import { NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { createSender } from '../utils/createSender';
import dotenv from 'dotenv';
dotenv.config();

import { Storage } from '../wrappers/Storage';

export async function run(provider: NetworkProvider) {
  const sender = await createSender();
  const storageAddress = Address.parse(process.env.AVL_TREE_ADDRESS!);
  const storage = provider.open(Storage.createFromAddress(storageAddress));

  const key = 1000000n;
  const value = 999999n;
  await storage.sendCreateNode(sender, toNano('0.05'), key, value);
}
