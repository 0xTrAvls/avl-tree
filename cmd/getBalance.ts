import { fromNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import dotenv from 'dotenv';
import { getWallets } from './readWallet';
dotenv.config();

export async function execute() {
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
