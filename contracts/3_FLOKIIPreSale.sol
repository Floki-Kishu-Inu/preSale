// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FLOKIIPreSale is Ownable {
    using SafeERC20 for IERC20;

    enum PurchaseType {
        USDT,
        ETH
    }

    IERC20 public flokii;
    IERC20 public usdt;
    address payable private _admin;

    uint public usdtPrice;
    uint public ethPrice;

    event Purchase(uint amount, PurchaseType purchaseType, address buyer);

    constructor(address argFlokii, 
                address argUsdt, 
                address payable argAdmin, 
                uint argUsdtPrice, 
                uint argEthPrice) {
        flokii = IERC20(argFlokii);
        usdt = IERC20(argUsdt);
        _admin = argAdmin;
        usdtPrice = argUsdtPrice;
        ethPrice = argEthPrice;
    }

    function purchaseByUSDT(uint argUsdtAmount) public {
        uint tokenAmount = argUsdtAmount * usdtPrice * (10 ** 9) / (10 ** 6);
        require(tokenAmount > 0, "FLOKIIPreSale: The purchase amount cannot be less than 0.");
        uint tokenBalance = flokii.balanceOf(address(this));
        require(tokenAmount <= tokenBalance, "FLOKIIPreSale: The tokens' balance is insufficient.");

        usdt.safeTransferFrom(msg.sender, address(this), argUsdtAmount);
        flokii.safeTransfer(msg.sender, tokenAmount);

        emit Purchase(tokenBalance, PurchaseType.USDT, msg.sender);
    }

    function purchaseByETH() public payable {
        purchaseByETH(msg.sender, msg.value);
    }

    function purchaseByETH(address argBuyer, uint argEthValue) private {
        uint tokenAmount = argEthValue * ethPrice * (10 ** 9) / (10 ** 18);
        require(tokenAmount > 0, "FLOKIIPreSale: The purchase amount cannot be less than 0.");
        uint tokenBalance = flokii.balanceOf(address(this));
        require(tokenAmount <= tokenBalance, "FLOKIIPreSale: The tokens' balance is insufficient.");

        flokii.safeTransfer(argBuyer, tokenAmount);

        emit Purchase(tokenAmount, PurchaseType.ETH, argBuyer);
    }

    receive() external payable {
        purchaseByETH(msg.sender, msg.value);
    }

    function withdraw() public onlyOwner {
        uint usdtBalance = usdt.balanceOf(address(this));
        uint ethBalance = address(this).balance;
        require((usdtBalance > 0) || (ethBalance > 0), "FLOKIIPreSale: No balance to withdraw.");
        if(usdtBalance > 0) {
            usdt.safeTransfer(msg.sender, usdtBalance);
        }
        if(ethBalance > 0) {
            payable(msg.sender).transfer(ethBalance);
        }
    }
}