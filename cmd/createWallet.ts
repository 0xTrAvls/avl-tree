import { Address, toNano } from '@ton/core';
import { mnemonicNew, mnemonicToPrivateKey } from 'ton-crypto';
import { WalletContractV4, TonClient } from '@ton/ton';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

export async function execute() {
    const mnemonicsList = [];
    const numberOfWallets = 100;
    for (let i = 0; i < numberOfWallets; i++) {
        let mnemonics = await mnemonicNew(24);
        mnemonicsList.push(mnemonics);

        const keyPair = await mnemonicToPrivateKey(mnemonics);
        const workchain = 0; // Usually you need a workchain 0
        const wallet = WalletContractV4.create({
            workchain,
            publicKey: keyPair.publicKey,
        });
    }

    // Write mnemonics to a file
    fs.writeFileSync(path.join(__dirname, 'mnemonics.txt'), mnemonicsList.join('\n'));
}

execute().then();
