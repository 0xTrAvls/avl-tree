import { NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { createSender } from '../utils/createSender';
import dotenv from 'dotenv';

import { Storage } from '../wrappers/Storage';

dotenv.config();

export async function run(provider: NetworkProvider) {
  const sender = await createSender();
  const storageAddress = Address.parse(process.env.STORAGE_ADDRESS!);
  const storage = provider.open(Storage.createFromAddress(storageAddress));

  await storage.sendResetGas(sender, toNano('0.05'), 0n);
}
