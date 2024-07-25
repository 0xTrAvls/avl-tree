import { Address, toNano, Sender } from '@ton/core';
import { mnemonicToPrivateKey } from 'ton-crypto';
import { WalletContractV4, TonClient } from '@ton/ton';
import fs from 'fs';
import dotenv from 'dotenv';
import { Storage } from '../wrappers/Storage';
dotenv.config();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const generateUniqueRandomArray = async (size: number, min: number = 1, max: number = 20000) => {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers.slice(0, size);
};

export async function execute() {
  const sendCreate = async (sender: Sender, key: bigint, value: bigint) => {
    let remainTry = 5;
    while (true) {
      if (remainTry === 0) {
        break;
      }
      try {
        --remainTry;
        await storage.sendCreateNode(sender, toNano('0.2'), key, value);
        console.log(`Created node with key ${key}`);
        break;
      } catch (e) {
        console.log(e);
      }
    }
  };

  const secretStrings = fs.readFileSync(__dirname + '/mnemonics.txt', { encoding: 'utf8' }).split('\n');
  const secretKeys = [];
  for (let i = 0; i < secretStrings.length; i++) {
    const secretKey = secretStrings[i].split(' ');
    secretKeys.push(secretKey);
  }
  const keyPairs = [];
  for (let i = 0; i < secretKeys.length; i++) {
    keyPairs.push(await mnemonicToPrivateKey(secretKeys[i]));
  }
  console.log(keyPairs);

  const workchain = 0; // Usually you need a workchain 0
  const wallets = [];
  for (let i = 0; i < keyPairs.length; i++) {
    wallets.push(
      WalletContractV4.create({
        workchain,
        publicKey: keyPairs[i].publicKey,
      }),
    );
  }

  const tonClient = new TonClient({
    endpoint: process.env.TON_RPC!,
    apiKey: process.env.API_KEY,
  });

  const senders = [];
  for (let i = 0; i < wallets.length; i++) {
    senders.push(wallets[i].sender(tonClient.provider(wallets[i].address), keyPairs[i].secretKey));
  }
  console.log(senders);
  const storageAddress = Address.parse(process.env.STORAGE_ADDRESS!);
  const storage = tonClient.open(Storage.createFromAddress(storageAddress));
  const numberOfNodes = 20000;
  const keys = await generateUniqueRandomArray(numberOfNodes, 200000, 300000);

  let promises = [];
  const startTime = new Date();
  for (let i = 0; i < keys.length; i++) {
    let key = BigInt(keys[i]);
    promises.push(sendCreate(senders[i % senders.length], key, key * 2n));
    await sleep(2000);
    if (promises.length === senders.length) {
      await Promise.all(promises);
      promises = [];
    }
  }
  let endTime = new Date();
  console.log(`Total time to add ${numberOfNodes} key: ${endTime.getTime() - startTime.getTime()}`);
}

execute().then();
