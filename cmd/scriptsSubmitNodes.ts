import { AVLTree } from '../wrappers/AVLTree';
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
    const sendCreate = async (key: bigint) => {
        await tree.sendCreateNode(sender, toNano('0.2'), key, key * 2n);
        console.log(`Created node with key ${key}`);
    };

    const secretString = process.env.WALLET_MNEMONIC;
    const secretKeys = secretString?.split(' ');
    const keyPair = await mnemonicToPrivateKey(secretKeys!);
    const workchain = 0; // Usually you need a workchain 0
    const wallet = WalletContractV4.create({
        workchain,
        publicKey: keyPair.publicKey,
    });
    console.log(secretKeys);

    const tonClient = new TonClient({
        endpoint: process.env.TON_RPC!,
        apiKey: process.env.API_KEY,
    });

    const sender = wallet.sender(tonClient.provider(wallet.address), keyPair.secretKey);
    console.log(sender);
    const AVLTreeAddress = Address.parse('EQC57ZB5XLwPQbOqHlrxLv6MI1hXKwfAZ1Iv4W-NQ-3ReObr');
    const tree = tonClient.open(AVLTree.createFromAddress(AVLTreeAddress));
    const numberOfNodes = 20000;
    const keys = await generateUniqueRandomArray(numberOfNodes, 200000, 300000);

    let promises = [];
    const startTime = new Date();
    for (let i = 0; i < keys.length; i++) {
        let key = BigInt(keys[i]);
        while (true) {
            try {
                await tree.sendCreateNode(sender, toNano('0.2'), key, key * 2n);
                break;
            } catch (e) {
                console.log(e);
            }
        }
        await sleep(2000);
        console.log('Created node with key: ', key);
        // if ((i + 1) % 1000 === 0) {
        //     await Promise.all(promises);
        //     promises = [];
        //     console.log(`Processed ${i + 1} nodes`);
        // }
    }
    let endTime = new Date();
    console.log(`Total time to add ${numberOfNodes} key: ${endTime.getTime() - startTime.getTime()}`);
}

execute().then();
