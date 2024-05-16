import { fromNano, internal, toNano } from '@ton/core';
import { mnemonicToPrivateKey } from 'ton-crypto';
import { WalletContractV4, TonClient } from '@ton/ton';
import dotenv from 'dotenv';
import { getWallets } from './readWallet';
dotenv.config();

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

    const wallets = await getWallets();

    for (const w of wallets) {
        console.log(fromNano(await w.getBalance(tonClient.provider(w.address))));
    }
}

execute().then();
