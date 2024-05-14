import { AVLTree } from '../wrappers/AVLTree';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { mnemonicToPrivateKey } from 'ton-crypto';
import { WalletContractV4, TonClient } from '@ton/ton';
import dotenv from 'dotenv';
dotenv.config();

export async function run(provider: NetworkProvider) {
    const secretString = process.env.SECRET_KEY;
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
    const AVLTreeAddress = Address.parse('EQC1FMAj5ZOQT51OiFbJP22e-zfJ5GlhjdYRdpD9M0Z7z2DK');
    const tree = provider.open(AVLTree.createFromAddress(AVLTreeAddress));

    await tree.sendCreateNode(sender, toNano('0.05'), BigInt(3), BigInt(6));
}
