import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';
import dotenv from 'dotenv';

import { Storage } from '../wrappers/Storage';

dotenv.config();

export async function execute() {
  const tonClient = new TonClient({
    endpoint: process.env.TON_RPC!,
    apiKey: process.env.API_KEY,
  });

  const storageAddress = Address.parse(process.env.AVL_TREE_ADDRESS!);
  const storage = tonClient.open(Storage.createFromAddress(storageAddress));

  console.log(await storage.getAllKey());
}

execute().then();
