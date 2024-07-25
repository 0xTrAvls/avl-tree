import { NetworkProvider } from '@ton/blueprint';
import { Address } from '@ton/core';
import dotenv from 'dotenv';

import { Storage } from '../wrappers/Storage';

dotenv.config();

export async function run(provider: NetworkProvider) {
  const storageAddress = Address.parse(process.env.STORAGE_ADDRESS!);
  const storage = provider.open(Storage.createFromAddress(storageAddress));

  const numNode = await storage.getNumNode();
  console.log(numNode);
}
