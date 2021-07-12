const { assert } = require("chai");
const BigNumber = require("bignumber.js");
const BN = require("bn.js");

const FlokiKishu = artifacts.require("FlokiKishu");

contract("FLOKII test.", async accounts => {
    it("Meta data test.", async () => {
        const instance = await FlokiKishu.deployed();
        const name = await instance.name();
        const symbol = await instance.symbol();
        const tokendecimals = await instance.decimals();
        const supply = await instance.totalSupply();

        assert.equal(name, 'Floki Kishu Inu');
        assert.equal(symbol, 'FLOKII');
        assert.equal(tokendecimals, 9);
        assert.equal(supply.toString(), '100000000000000000000');
    });

    it("Owner ship test.", async() => {
        const instance = await FlokiKishu.deployed();
        const owner = await instance.owner();
        assert.equal(owner, accounts[0]);
    });

    // it("Balance test", async() => {
    //     const instance = await FlokiKishu.deployed();
    //     const balance = await instance.balanceOf(accounts[0]);
    //     assert.equal(balance.toString(), '99902000000000000000');
    // });

    it("Transfer test", async() => {
        const instance = await FlokiKishu.deployed();
        await instance.transfer(accounts[1], new BigNumber(100000000 * 10 ** 9));
        var b1 = await instance.balanceOf(accounts[1]);
        await instance.transfer(accounts[2], new BigNumber(100000000 * 10 ** 9));
        var b2 = await instance.balanceOf(accounts[2]);
        assert.equal(b1.toString(), b2.toString());
        b1 = await instance.balanceOf(accounts[1]);
        assert.equal(b1.cmp(b2), 1);
    });

    it("Excluded test", async() => {
        const instance = await FlokiKishu.deployed();
        await instance.excludeAccount(accounts[3]);
        const amount = new BN('100000000000000000');
        await instance.transfer(accounts[3], amount);
        var b3 = await instance.balanceOf(accounts[3]);
        assert.equal(b3.cmp(new BN('98000000000000000')), 0);

        const transferAmount = new BN('8000000000000000');
        const expectedB3 = new BN('90000000000000000');
        const expectedB4 = new BN('7840000000000000');
        await instance.excludeAccount(accounts[4]);
        await instance.transfer(accounts[4], transferAmount, {from : accounts[3]});
        b3 = await instance.balanceOf(accounts[3]);
        var b4 = await instance.balanceOf(accounts[4]);
        assert.equal(b3.cmp(expectedB3), 0);
        assert.equal(b4.cmp(expectedB4), 0);
    })
});