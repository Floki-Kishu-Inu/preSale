const FlokiKishu = artifacts.require("FlokiKishu");
const FLOKIIPreSale = artifacts.require("FLOKIIPreSale");
const TetherUSD = artifacts.require('TetherUSD');

const BigNumber = require("bignumber.js");

module.exports = async function (deployer, network, accounts) {
    var flokii = await FlokiKishu.deployed();

    var argFlokii = flokii.address;
    var argUsdt = "";
    var argAdmin = accounts[0];
    var argUsdtPrice = new BigNumber(143); // 0.007 USDT per FLOKII
    var argEthPrice = new BigNumber(306020);

    if(network == 'mainnet') {
        argUsdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        argAdmin = "0xCbF0899FA714840e907475bBf3BF9841222286AE"; // Dev team's address, given by Freddy.
    } else if(network == 'kovan') {
        argUsdt = "0xEBA2a7912bC80edf9966648ae0c43190CDDffAeC";
    } else {// ganache, we need to deploy a erc20 token contract, which will named USDT.
        await deployer.deploy(TetherUSD);
        var usdt = await TetherUSD.deployed();
        argUsdt = usdt.address;
    }

    await deployer.deploy(FLOKIIPreSale, argFlokii, argUsdt, argAdmin, argUsdtPrice, argEthPrice);

    var flokiiPreSale = await FLOKIIPreSale.deployed();

    var tx = await flokii.excludeAccount(flokiiPreSale.address);
    console.log("Exlude account : " + tx.tx);

    tx = await flokii.transfer(flokiiPreSale.address, new BigNumber(1000000000000000000)); // 1 billion FLOKII to sale.
    console.log("Tansfer 1 billion FLOKII to Pre-sale contract : " + tx.tx);
};
