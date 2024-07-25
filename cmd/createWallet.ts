import { mnemonicNew } from 'ton-crypto';
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
    }

    // Write mnemonics to a file
    fs.writeFileSync(path.join(__dirname, 'mnemonics.txt'), mnemonicsList.join('\n'));
}

execute().then();
