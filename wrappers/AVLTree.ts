import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type AVLTreeConfig = {};

export function aVLTreeConfigToCell(config: AVLTreeConfig): Cell {
    return beginCell().storeMaybeRef(null).endCell();
}

export class AVLTree implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new AVLTree(address);
    }

    static createFromConfig(config: AVLTreeConfig, code: Cell, workchain = 0) {
        const data = aVLTreeConfigToCell(config);
        const init = { code, data };
        return new AVLTree(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendCreateNode(provider: ContractProvider, via: Sender, value: bigint, key: bigint, nodeValue: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).storeUint(0, 64).storeUint(key, 32).storeUint(nodeValue, 64).endCell(),
        });
    }

    async sendUpdateNode(provider: ContractProvider, via: Sender, value: bigint, key: bigint, newnodeValue: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeUint(0, 64).storeUint(key, 32).storeUint(newnodeValue, 64).endCell(),
        });
    }

    async sendCollectTon(provider: ContractProvider, via: Sender, value: bigint, amount: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(3, 32).storeUint(0, 64).storeCoins(amount).endCell(),
        });
    }

    async getValueByKey(provider: ContractProvider, key: bigint): Promise<bigint> {
        const res = await provider.get('get_value_by_key', [
            { type: 'int', value: key },
        ]);
        return res.stack.readBigNumber();
    }

    async getHeight(provider: ContractProvider): Promise<bigint> {
        const res = await provider.get('get_tree_height', []);
        return res.stack.readBigNumber();
    }

    async getRoot(provider: ContractProvider): Promise<Cell> {
        const res = await provider.get('get_root', []);
        return res.stack.readCell();
    }
}
