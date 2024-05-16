import { internal, toNano } from '@ton/core';
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

    const sender = wallet.sender(tonClient.provider(wallet.address), keyPair.secretKey);
    const wallets = await getWallets();
    for (const w of wallets) {
        console.log([
            internal({
                to: w.address,
                value: toNano(1),
                bounce: false,
            }),
        ]);

        const seqno = await wallet.getSeqno(tonClient.provider(wallet.address));
        await wallet.sendTransfer(tonClient.provider(wallet.address), {
            seqno: seqno,
            secretKey: keyPair.secretKey,
            messages: [
                internal({
                    to: w.address,
                    value: toNano(1),
                    bounce: false,
                    init: wallet.init,
                }),
            ],
        });
        console.log('transfer money to ', w.address.toString());
    }
}

execute().then();
