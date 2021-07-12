const { assert } = require("chai");
const BigNumber = require("bignumber.js");
const BN = require("bn.js");

const FlokiKishu = artifacts.require("FlokiKishu");
const FLOKIIPreSale = artifacts.require("FLOKIIPreSale");
const TetherUSD = artifacts.require("TetherUSD");

contract("Pre-sale test.", async accounts => {
    it("excluded test", async() => {
        const presale = await FLOKIIPreSale.deployed();
        const flokii = await FlokiKishu.deployed();
        const isExcluded = await flokii.isExcluded(presale.address);
        assert(isExcluded);
    });

    it("Test purchase by USDT", async() => {
        const presale = await FLOKIIPreSale.deployed();
        const flokii = await FlokiKishu.deployed();
        const usdt = await TetherUSD.deployed();

        await flokii.transfer(accounts[1], new BN('1000000000000000000'));
        await flokii.transfer(accounts[2], new BN('1000000000000000000'));
        await flokii.transfer(accounts[3], new BN('1000000000000000000'));

        const usdtDecimals = await usdt.decimals();
        const flokiiDecimals = await flokii.decimals();

        const flokiiBalance1 = await flokii.balanceOf(accounts[0]);

        const usdtBalance = await usdt.balanceOf(accounts[0]);
        const transferAmount = new BN('100000000');

        await usdt.approve(presale.address, new BN('10000000000000000'));
        await presale.purchaseByUSDT(transferAmount);

        const usdtBalance1 = await usdt.balanceOf(accounts[0]);
        assert.equal(usdtBalance.sub(usdtBalance1).toString(), transferAmount.toString());

        const usdtPrice = await presale.usdtPrice();
        const expectedFlokiiAmount1 = transferAmount.div(new BN('1000000'))
                                                    .mul(usdtPrice)
                                                    .mul(new BN('1000000000'))
                                                    .muln(98).divn(100)
                                                    .add(flokiiBalance1);
        const expectedFlokiiAmount2 = transferAmount.div(new BN('1000000'))
                                                    .mul(usdtPrice)
                                                    .mul(new BN('1000000000'))
                                                    // .muln(98).divn(100)
                                                    .add(flokiiBalance1);
        const flokiiBalance2 = await flokii.balanceOf(accounts[0]);

        console.log("real amount 1: " + flokiiBalance1);
        console.log("expected 1: " + expectedFlokiiAmount1);
        console.log("expected 2: " + expectedFlokiiAmount2);
        console.log("real amount 2: " + flokiiBalance2);

        assert.equal(flokiiBalance2.cmp(expectedFlokiiAmount1), 1);
        assert.equal(flokiiBalance2.cmp(expectedFlokiiAmount2), -1);
    });

    it("Test purchase by ETH", async() => {
        const presale = await FLOKIIPreSale.deployed();
        const flokii = await FlokiKishu.deployed();

        await flokii.transfer(accounts[1], new BN('1000000000000000000'));
        await flokii.transfer(accounts[2], new BN('1000000000000000000'));
        await flokii.transfer(accounts[3], new BN('1000000000000000000'));

        const flokiiBalance1 = await flokii.balanceOf(accounts[0]);

        const ethBalance = await web3.eth.getBalance(accounts[0]);
        const transferAmount = new BN('1000000000000000000');

        var flokiiBalanceInPresale = await flokii.balanceOf(presale.address);
        console.log("left balance : " + flokiiBalanceInPresale.toString());

        var tx = await presale.purchaseByETH({from : accounts[0], value : transferAmount});

        const ethBalance1 = await web3.eth.getBalance(accounts[0]);
        assert.equal(ethBalance.sub(ethBalance1).cmp(transferAmount), 1);

        const ethPrice = await presale.ethPrice();
        const expectedFlokiiAmount1 = transferAmount.div(new BN('1000000000000000000'))
                                                    .mul(ethPrice)
                                                    .mul(new BN('1000000000'))
                                                    .muln(98).divn(100)
                                                    .add(flokiiBalance1);
        const expectedFlokiiAmount2 = transferAmount.div(new BN('1000000000000000000'))
                                                    .mul(ethPrice)
                                                    .mul(new BN('1000000000'))
                                                    // .muln(98).divn(100)
                                                    .add(flokiiBalance1);
        const flokiiBalance2 = await flokii.balanceOf(accounts[0]);

        console.log("real amount 1: " + flokiiBalance1);
        console.log("expected 1: " + expectedFlokiiAmount1);
        console.log("expected 2: " + expectedFlokiiAmount2);
        console.log("real amount 2: " + flokiiBalance2);

        assert.equal(flokiiBalance2.cmp(expectedFlokiiAmount1), 1);
        assert.equal(flokiiBalance2.cmp(expectedFlokiiAmount2), -1);
    });
});