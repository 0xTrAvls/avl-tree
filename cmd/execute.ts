import { mnemonicToPrivateKey } from 'ton-crypto';
import { WalletContractV4, TonClient } from '@ton/ton';
import dotenv from 'dotenv';
dotenv.config();

export async function execute() {
    const secretString = process.env.SECRET_KEY;
    const secretKeys = secretString?.split(' ');
    const keyPair = await mnemonicToPrivateKey(secretKeys!);
    const workchain = 0; 
    const wallet = WalletContractV4.create({
        workchain,
        publicKey: keyPair.publicKey,
    });

    const tonClient = new TonClient({
        endpoint: process.env.TON_RPC!,
        apiKey: process.env.API_KEY,
    });

    console.log(wallet.address);
    console.log(await tonClient.getBalance(wallet.address));
}
