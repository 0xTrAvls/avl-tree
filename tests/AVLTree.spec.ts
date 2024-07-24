import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { compile } from '@ton/blueprint';
import logger from '../helpers/logger';
import '@ton/test-utils';

import { AVLTree } from '../wrappers/AVLTree';

describe('AVLTree', () => {
  let code: Cell;

  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let tree: SandboxContract<AVLTree>;
  let generateUniqueRandomArray: any;
  let totalKey: number;

  beforeAll(async () => {
    totalKey = 100;
    code = await compile('AVLTree');

    blockchain = await Blockchain.create();

    tree = blockchain.openContract(AVLTree.createFromConfig({}, code));

    deployer = await blockchain.treasury('deployer');

    const deployResult = await tree.sendDeploy(deployer.getSender(), toNano('0.05'));
    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: tree.address,
      deploy: true,
      success: true,
    });

    generateUniqueRandomArray = async (size: number, min: number = 1, max: number = 20000) => {
      const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

      for (let i = size - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }

      return numbers.slice(0, size);
    };
  });

  it('should create multi nodes', async () => {
    const sendCreate = async (key: bigint) => {
      const value = key * 2n;
      const createNodeResult = await tree.sendCreateNode(deployer.getSender(), toNano('0.2'), key, value);
      const nodeValue = await tree.getValueByKey(key);
      expect(nodeValue).toBe(value);
      logger.info(`Created key ${key} successfully`);
    };

    const keys = await generateUniqueRandomArray(totalKey, 1, totalKey);
    let promises = [];
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      promises.push(sendCreate(BigInt(key)));

      if ((i + 1) % 10 === 0) {
        await Promise.all(promises);
        promises = [];
        console.log(`Processed ${i + 1} nodes`);
        let height = await tree.getHeight();
        expect(height).toBeLessThanOrEqual(20n);
      }
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    logger.info(`Created ${totalKey} nodes successfully`);
  });

  it('should query multi nodes', async () => {
    const queryKeys = await generateUniqueRandomArray(totalKey, 1, totalKey);
    for (let i = 0; i < queryKeys.length; i++) {
      const key = BigInt(queryKeys[i]);

      const value = await tree.getValueByKey(key);
      const expectValue = key * 2n;
      expect(value).toBe(expectValue);
    }
    logger.info(`Query ${totalKey} keys successfully`);
  });

  it('should update single node', async () => {
    const key = 99n;
    const newValue = 99n * 3n;

    const updateNodeResult = await tree.sendUpdateNode(deployer.getSender(), toNano('0.05'), key, newValue);
    expect(updateNodeResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: tree.address,
      success: true,
    });

    const value = await tree.getValueByKey(key);
    expect(value).toBe(newValue);

    logger.info(`Updated key ${key} successfully`);
  });

  it('should update multi nodes', async () => {
    const startTime = new Date();
    const numKeys = 10;
    const updateKeys = generateUniqueRandomArray(numKeys, 1, totalKey);
    for (let i = 0; i < updateKeys.length; i++) {
      const key = BigInt(updateKeys[i]);
      const newValue = BigInt(key * 3n);

      const updateNodeResult = await tree.sendUpdateNode(deployer.getSender(), toNano('0.05'), key, newValue);
      expect(updateNodeResult.transactions).toHaveTransaction({
        from: deployer.address,
        to: tree.address,
        success: true,
      });

      const value = await tree.getValueByKey(key);
      expect(value).toBe(newValue);
    }

    logger.info(`Updated ${numKeys} keys successfully`);
  });

  it('should update all nodes', async () => {
    const keys = await generateUniqueRandomArray(totalKey, 1, totalKey);
    for (let i = 0; i < keys.length; i++) {
      const key = BigInt(keys[i]);
      const newValue = key * 5n;
      const updateNodeResult = await tree.sendUpdateNode(deployer.getSender(), toNano('0.05'), key, newValue);
      expect(updateNodeResult.transactions).toHaveTransaction({
        from: deployer.address,
        to: tree.address,
        success: true,
      });

      const value = await tree.getValueByKey(key);
      expect(value).toBe(newValue);
    }

    logger.info(`Updated ${totalKey} keys successfully`);
  });
});
