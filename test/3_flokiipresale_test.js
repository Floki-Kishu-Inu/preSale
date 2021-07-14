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
        var flokiiAmount = transferAmount.mul(usdtPrice)
                                            .mul(new BN('1000000000'))
                                            .div(new BN('1000000'));
        flokiiAmount = flokiiAmount.divn(2).add(flokiiAmount);
        const expectedFlokiiAmount1 = flokiiAmount.muln(98).divn(100)
                                                  .add(flokiiBalance1);
        const expectedFlokiiAmount2 = flokiiAmount.add(flokiiBalance1);
        const flokiiBalance2 = await flokii.balanceOf(accounts[0]);

        // console.log("real amount 1: " + flokiiBalance1);
        // console.log("expected 1: " + expectedFlokiiAmount1);
        // console.log("expected 2: " + expectedFlokiiAmount2);
        // console.log("real amount 2: " + flokiiBalance2);

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

        const strEthBalance = await web3.eth.getBalance(accounts[0]);
        const transferAmount = new BN('100000000000'); // 0.0000001 ether

        // var flokiiBalanceInPresale = await flokii.balanceOf(presale.address);
        // console.log("left balance : " + flokiiBalanceInPresale.toString());

        var tx = await presale.purchaseByETH({from : accounts[0], value : transferAmount});

        const strEthBalance1 = await web3.eth.getBalance(accounts[0]);

        var ethBalance = new BN(strEthBalance);
        var ethBalance1 = new BN(strEthBalance1);

        assert.equal(ethBalance.sub(ethBalance1).cmp(transferAmount), 1);

        const ethPrice = await presale.ethPrice();
        var flokiiAmount = transferAmount.mul(ethPrice)
                                            .mul(new BN('1000000000'))
                                            .div(new BN('1000000000000000000'));
        flokiiAmount = flokiiAmount.divn(2).add(flokiiAmount);
        const expectedFlokiiAmount1 = flokiiAmount.muln(98).divn(100)
                                                  .add(flokiiBalance1);
        const expectedFlokiiAmount2 = flokiiAmount.add(flokiiBalance1);
        const flokiiBalance2 = await flokii.balanceOf(accounts[0]);

        // console.log("real amount 1: " + flokiiBalance1);
        // console.log("expected 1: " + expectedFlokiiAmount1);
        // console.log("expected 2: " + expectedFlokiiAmount2);
        // console.log("real amount 2: " + flokiiBalance2);
        // console.log("got amount: " + flokiiBalance2.sub(flokiiBalance1));

        assert.equal(flokiiBalance2.cmp(expectedFlokiiAmount1), 1);
        assert.equal(flokiiBalance2.cmp(expectedFlokiiAmount2), -1);
    });

    it("Test purchase by sending ETH", async() => {
        const presale = await FLOKIIPreSale.deployed();
        const flokii = await FlokiKishu.deployed();

        await flokii.transfer(accounts[1], new BN('1000000000000000000'));
        await flokii.transfer(accounts[2], new BN('1000000000000000000'));
        await flokii.transfer(accounts[3], new BN('1000000000000000000'));

        const flokiiBalance1 = await flokii.balanceOf(accounts[0]);

        const transferAmount = new BN('99000000000000000000'); // 99 ether
        
        var tx = await web3.eth.sendTransaction({from:accounts[0], to:presale.address, value : transferAmount});
        // console.log("sending eth: " + tx.hash);

        const ethPrice = await presale.ethPrice();
        var flokiiAmount = transferAmount.mul(ethPrice)
                                        .mul(new BN('1000000000'))
                                        .div(new BN('1000000000000000000'));
        flokiiAmount = flokiiAmount.divn(2).add(flokiiAmount);
        const expectedFlokiiAmount1 = flokiiAmount.muln(98).divn(100)
                                                  .add(flokiiBalance1);
        const expectedFlokiiAmount2 = flokiiAmount.add(flokiiBalance1);
        const flokiiBalance2 = await flokii.balanceOf(accounts[0]);

        // console.log("real amount 1: " + flokiiBalance1);
        // console.log("expected 1: " + expectedFlokiiAmount1);
        // console.log("expected 2: " + expectedFlokiiAmount2);
        // console.log("real amount 2: " + flokiiBalance2);
        // console.log("got amount: " + flokiiBalance2.sub(flokiiBalance1));

        assert.equal(flokiiBalance2.cmp(expectedFlokiiAmount1), 1);
        assert.equal(flokiiBalance2.cmp(expectedFlokiiAmount2), -1);
    });

    it("Test withdraw", async() => {
        const presale = await FLOKIIPreSale.deployed();
        const flokii = await FlokiKishu.deployed();
        const usdt = await TetherUSD.deployed();

        const withdrawableUSDT = await usdt.balanceOf(presale.address);
        const eBalance = await web3.eth.getBalance(presale.address);
        const withdrawableETH = new BN(eBalance);

        const usdtBalance1 = await usdt.balanceOf(accounts[0]);
        var b = await web3.eth.getBalance(accounts[0]);
        const ethBalance1 = new BN(b);

        // Withdraw
        var tx = await presale.withdraw({from:accounts[0]});

        var gasprice = new BN('20000000000'); // 20 gwei
        var gasUsed = new BN(tx.receipt.gasUsed);
        var minerFee = gasprice.mul(gasUsed);
        // console.log("miner fee: " + minerFee.toString());

        const usdtBalance2 = await usdt.balanceOf(accounts[0]);
        b = await web3.eth.getBalance(accounts[0]);
        const ethBalance2 = new BN(b);

        // console.log("eth balance 1: " + ethBalance1.toString());
        // console.log("eth withdrawable: " + withdrawableETH.toString());
        // console.log("eth balance 2: " + ethBalance2.toString());
        // console.log("real miner fee: " + ethBalance1.add(withdrawableETH).sub(ethBalance2).toString());

        assert.equal(usdtBalance1.add(withdrawableUSDT).cmp(usdtBalance2), 0);
        assert.equal(ethBalance1.add(withdrawableETH).cmp(ethBalance2.add(minerFee)), 0);
    });
});