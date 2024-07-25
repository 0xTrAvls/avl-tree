import { AvlTree } from '../wrappers/AVLTree';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, Sender, toNano } from '@ton/core';
import { mnemonicToPrivateKey } from 'ton-crypto';
import { WalletContractV4, TonClient } from '@ton/ton';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const generateUniqueRandomArray = async (size: number, min: number = 1, max: number = 20000) => {
  // Create an array with numbers in sequence
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  // Shuffle the array using the Fisher-Yates shuffle algorithm
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // Return the first 'size' elements (guaranteed unique)
  return numbers.slice(0, size);
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export async function execute() {
  const updateNode = async (sender: Sender, key: bigint, newValue: bigint) => {
    let remainTry = 5;
    while (true) {
      if (remainTry === 0) {
        break;
      }
      try {
        --remainTry;
        await tree.sendUpdateNode(sender, toNano('0.2'), key, newValue);
        console.log(`Update node with key ${key} to value ${newValue}`);
        break;
      } catch (e) {
        console.log(e);
        sleep(3000);
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
  const AVLTreeAddress = Address.parse('EQC57ZB5XLwPQbOqHlrxLv6MI1hXKwfAZ1Iv4W-NQ-3ReObr');
  const tree = tonClient.open(AvlTree.createFromAddress(AVLTreeAddress));

  const currentKeys = await tree.getAllLeavesKey();
  shuffleArray(currentKeys);

  let promises = [];
  const startTime = new Date();
  for (let i = 0; i < senders.length; i++) {
    let key = BigInt(currentKeys[i]);
    while (true) {
      try {
        promises.push(updateNode(senders[i], key, key * 3n));
        break;
      } catch (e) {
        console.log(e);
      }
    }
    await sleep(3000);
  }
  await Promise.all(promises);
  promises = [];
  let endTime = new Date();
  console.log(`Total time to update ${senders.length} key: ${endTime.getTime() - startTime.getTime()}`);
}

execute().then();
