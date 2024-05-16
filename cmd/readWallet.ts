import { WalletContractV4 } from '@ton/ton';
import fs from 'fs';
import path from 'path';
import { mnemonicNew, mnemonicToPrivateKey } from 'ton-crypto';

// Read mnemonics from a file
const mnemonics = fs.readFileSync(path.join(__dirname, 'mnemonics.txt'), 'utf-8');

// Split the mnemonics by newline to get an array
const mnemonicsList = mnemonics.split('\n');

export const getWallets = async () => {
    const wallets = [];
    for (const mnemonic of mnemonicsList) {
        const keyPair = await mnemonicToPrivateKey(mnemonic.split(','));
        const workchain = 0; // Usually you need a workchain 0
        const wallet = WalletContractV4.create({
            workchain,
            publicKey: keyPair.publicKey,
        });
        wallets.push(wallet);
    }
    return wallets
};
