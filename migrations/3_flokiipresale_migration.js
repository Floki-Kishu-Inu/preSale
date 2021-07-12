const FlokiKishu = artifacts.require("FlokiKishu");
const FLOKIIPreSale = artifacts.require("FLOKIIPreSale");

const BigNumber = require("bignumber.js");

module.exports = async function (deployer) {
    var flokii = await FlokiKishu.deployed();

    var argFlokii = flokii.address;
    var argUsdt = "0xEBA2a7912bC80edf9966648ae0c43190CDDffAeC"; // USDT on Kovan testnet.
    var argAdmin = "0x7bF286026507df5F652eEA98eF9B77CB5767F06a"; //web3.eth.accounts[0];
    var argUsdtPrice = new BigNumber(10000); // 0.01 USDT
    var argEthPrice = new BigNumber(5000000000000); // 0.000005 ETH

    await deployer.deploy(FLOKIIPreSale, argFlokii, argUsdt, argAdmin, argUsdtPrice, argEthPrice);

    var flokiiPreSale = await FLOKIIPreSale.deployed();

    var tx = await flokii.transfer(flokiiPreSale.address, new BigNumber(100000000000000000)); // 0.1 billion FLOKII to sale.
    console.log("Tansfer 0.1 billion FLOKII to Pre-sale contract : " + tx.tx);
};
