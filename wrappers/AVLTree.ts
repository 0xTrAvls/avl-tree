import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
  Slice,
} from '@ton/core';

export type AVLTreeConfig = {
  adminAddress: Address;
};

export function avlTreeConfigToCell(config: AVLTreeConfig): Cell {
  return beginCell().storeAddress(config.adminAddress).storeMaybeRef(null).endCell();
}

export class AVLTree implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address) {
    return new AVLTree(address);
  }

  static createFromConfig(config: AVLTreeConfig, code: Cell, workchain = 0) {
    const data = avlTreeConfigToCell(config);
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

  async sendCreateNode(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    key: bigint,
    nodeValue: bigint,
    queryId: bigint = 0n,
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(0x8b440707, 32)
        .storeUint(queryId, 64)
        .storeUint(key, 32)
        .storeUint(nodeValue, 64)
        .endCell(),
    });
  }

  async sendUpdateNode(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    key: bigint,
    newNodeValue: bigint,
    queryId: bigint = 0n,
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(0xde89cdf1, 32)
        .storeUint(queryId, 64)
        .storeUint(key, 32)
        .storeUint(newNodeValue, 64)
        .endCell(),
    });
  }

  async sendResetGas(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint = 0n) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(0x42a0fb43, 32).storeUint(queryId, 64).endCell(),
    });
  }

  async getValueByKey(provider: ContractProvider, key: bigint): Promise<bigint> {
    const res = await provider.get('get_value_by_key', [{ type: 'int', value: key }]);
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

  async unPackNodeData(node: Cell) {
    let ds: Slice = node.beginParse();
    let leftChild = ds.loadMaybeRef();
    let rightChild = ds.loadMaybeRef();
    let key = ds.loadUint(32);
    let nodeValue = ds.loadRef();
    let height = ds.loadUint(32);
    return { leftChild, rightChild, key, nodeValue, height };
  }

  async countNode(node: Cell | null): Promise<bigint> {
    if (node == null) {
      return BigInt(0);
    }
    let numNode = BigInt(1);
    let nodeData = await this.unPackNodeData(node);
    numNode += await this.countNode(nodeData.leftChild);
    numNode += await this.countNode(nodeData.rightChild);
    return numNode;
  }

  async getAllKeyRecursive(node: Cell | null, array: any[]): Promise<void> {
    if (node == null) {
      return;
    }
    let nodeData = await this.unPackNodeData(node);
    array.push(nodeData.key);
    await this.getAllKeyRecursive(nodeData.leftChild, array);
    await this.getAllKeyRecursive(nodeData.rightChild, array);
    return;
  }
  async getAllKey(provider: ContractProvider) {
    let root = await this.getRoot(provider);
    const array: any[] = [];
    await this.getAllKeyRecursive(root, array);
    return array;
  }

  async getAllLeavesRecursive(node: Cell | null, array: any[]): Promise<void> {
    if (node == null) {
      return;
    }
    let nodeData = await this.unPackNodeData(node);
    if (nodeData.leftChild == null && nodeData.rightChild == null) {
      array.push(nodeData.key);
    }
    await this.getAllLeavesRecursive(nodeData.leftChild, array);
    await this.getAllLeavesRecursive(nodeData.rightChild, array);
    return;
  }

  async getAllLeaves(provider: ContractProvider) {
    let root = await this.getRoot(provider);
    const array: any[] = [];
    await this.getAllLeavesRecursive(root, array);
    return array;
  }

  async getTreeData(provider: ContractProvider) {
    let root = await this.getRoot(provider);
    return this.countNode(root);
  }
}
