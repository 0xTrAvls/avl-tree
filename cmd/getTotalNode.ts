import { AvlTree } from '../wrappers/AVLTree';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { mnemonicToPrivateKey } from 'ton-crypto';
import { WalletContractV4, TonClient } from '@ton/ton';
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

export async function execute() {
  const secretString = process.env.WALLET_MNEMONIC;
  const secretKeys = secretString?.split(' ');
  const keyPair = await mnemonicToPrivateKey(secretKeys!);
  const workchain = 0; // Usually you need a workchain 0
  const wallet = WalletContractV4.create({
    workchain,
    publicKey: keyPair.publicKey,
  });

  const tonClient = new TonClient({
    endpoint: process.env.TON_RPC!,
    apiKey: process.env.API_KEY,
  });

  const sender = wallet.sender(tonClient.provider(wallet.address), keyPair.secretKey);
  const AVLTreeAddress = Address.parse('EQC57ZB5XLwPQbOqHlrxLv6MI1hXKwfAZ1Iv4W-NQ-3ReObr');
  const tree = tonClient.open(AvlTree.createFromAddress(AVLTreeAddress));

  console.log(await tree.getAllKey());
}

execute().then();
