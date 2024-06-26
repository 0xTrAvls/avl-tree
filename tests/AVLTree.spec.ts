import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { AVLTree } from '../wrappers/AVLTree';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import exp from 'constants';
import logger from '../helpers/logger';

const convertToSeconds = (time: number) => {
    return time / 1000;
};

describe('AVLTree', () => {
    let code: Cell;

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tree: SandboxContract<AVLTree>;
    let generateUniqueRandomArray: any;
    let totalKey: number;

    beforeAll(async () => {
        totalKey = 10000;
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
            // Create an array with numbers in sequence
            const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

            // Shuffle the array using the Fisher-Yates shuffle algorithm
            for (let i = size - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }

            // Return the first 'size' elements (guaranteed unique)
            return numbers.slice(0, size);
        };
    });

    it('should deploy', async () => {});

    it('should create multi nodes', async () => {
        const sendCreate = async (key: bigint) => {
            const createNodeResult = await tree.sendCreateNode(deployer.getSender(), toNano('0.2'), key, key * 2n);
            // const value = await tree.getValueByKey(key);
            // expect(value).toBe(key * 2n);
        };

        const keys = await generateUniqueRandomArray(totalKey, 1, totalKey);
        let promises = [];
        const startTime = new Date();
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            promises.push(sendCreate(BigInt(key)));

            if ((i + 1) % 1000 === 0) {
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
        let endTime = new Date();
        console.log(`Total time to add ${totalKey} key: ${convertToSeconds(endTime.getTime() - startTime.getTime())}s`);
    });

    it('should query multi nodes', async () => {
        const startTime = new Date();
        const queryKeys = await generateUniqueRandomArray(100);
        for (let i = 0; i < queryKeys.length; i++) {
            const key = BigInt(queryKeys[i]);

            const value = await tree.getValueByKey(key);
            expect(value).toBe(key * 2n);
        }
        let endTime = new Date();
        console.log(`Total time to query 100 key: ${convertToSeconds(endTime.getTime() - startTime.getTime())}s`);
    });

    it('should update single node', async () => {
        const startTime = new Date();
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

        let endTime = new Date();
        logger.info(`Total time to update 1 key: ${convertToSeconds(endTime.getTime() - startTime.getTime())}s`);
    });

    it('should update multi nodes', async () => {
        const startTime = new Date();
        const updateKeys = [78, 12, 54, 91, 23, 69, 8, 30, 1, 45];
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

        const endTime = new Date();
        console.log(`Total time to update 10 keys: ${convertToSeconds(endTime.getTime() - startTime.getTime())} s`);
    });

    it('should update all nodes', async () => {
        const startTime = new Date();
        let promises = [];
        const sendUpdateNodeWrappers = async (key: bigint) => {
            const newValue = key * 4n;
            const combine = {
                key: key.toString(),
                start: new Date().getTime(),
                end: new Date().getTime(),
                t: 0,
            };
            await tree.sendUpdateNode(deployer.getSender(), toNano('0.05'), key, newValue);
            combine.end = new Date().getTime();
            combine.t = combine.end - combine.start;
            // logger.info(`${JSON.stringify(combine)}`);
        };
        for (let key = 1n; key <= BigInt(totalKey); key++) {
            // await sendUpdateNodeWrappers(key);
            promises.push(sendUpdateNodeWrappers(key));
            if ((Number(key) + 1) % 1000 === 0) {
                await Promise.all(promises);
                promises = [];
                logger.info(`Processed ${Number(key) + 1} nodes`);
            }
            // expect(updateNodeResult.transactions).toHaveTransaction({
            //     from: deployer.address,
            //     to: tree.address,
            //     success: true,
            // });

            // const value = await tree.getValueByKey(key);
            // expect(value).toBe(newValue);
        }
        await Promise.all(promises);

        const endTime = new Date();
        logger.info(
            `Total time to update ${totalKey} keys: ${convertToSeconds(endTime.getTime() - startTime.getTime())}s`,
        );
    });
});
