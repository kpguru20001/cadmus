// SPDX-License-Identifier: MIT
pragma solidity ^0.6.9;

import "@opengsn/contracts/src/BaseRelayRecipient.sol";

interface SwapV2Router02 {
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address from,
        address to,
        uint deadline
    ) external;
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address from,
        address to,
        uint deadline
    ) external;

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address from,
        address to,
        uint deadline
    ) external;
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address from,
        address to,
        uint deadline
    ) external;
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable;
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address from,address to, uint deadline)
        external;
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address from,address to, uint deadline)
        external;
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address from,address to, uint deadline)
        external
        payable;
}

contract CadmusRelay is BaseRelayRecipient {
   address public _unirouter;
   address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "");
        _;
    }

    /**
     * Set the trustedForwarder address either in constructor or
     * in other init function in your contract
     */
    constructor (address customRouterAddress, address _trustedForwarder) public {
        _unirouter = customRouterAddress;
        _setTrustedForwarder(_trustedForwarder);
        owner = msg.sender;
    }

    function setTrustForwarder(address _trustedForwarder) public onlyOwner {
        _setTrustedForwarder(_trustedForwarder);
    }


    function versionRecipient() external view override returns (string memory) {
        return "1";
    }

    function updateUniRouter(address uniswapRouterAddress) public {
        _unirouter = uniswapRouterAddress;
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] memory path,
        uint deadline
        ) public {
            SwapV2Router02 theContract = SwapV2Router02(_unirouter);
            theContract.swapExactTokensForTokens(amountIn,amountOutMin,path, _msgSender(), _msgSender(), deadline);
    }

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] memory path,
        uint deadline
        ) public {
            SwapV2Router02 theContract = SwapV2Router02(_unirouter);
            theContract.swapTokensForExactTokens(amountOut,amountInMax,path, _msgSender(), _msgSender(), deadline);
    }

    function swapExactETHForTokens(
        uint amountOutMin,
        address[] memory path,
        uint deadline
        ) public {
            SwapV2Router02 theContract = SwapV2Router02(_unirouter);
            theContract.swapExactETHForTokens(amountOutMin,path, _msgSender(), deadline);
    }

    function swapTokensForExactETH(
        uint amountOut,
        uint amountInMax,
        address[] memory path,
        uint deadline
        ) public {
            SwapV2Router02 theContract = SwapV2Router02(_unirouter);
            theContract.swapTokensForExactETH(amountOut,amountInMax,path, _msgSender(), _msgSender(), deadline);
    }

    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] memory path,
        uint deadline
        ) public {
            SwapV2Router02 theContract = SwapV2Router02(_unirouter);
            theContract.swapExactTokensForETH(amountIn,amountOutMin,path, _msgSender(), _msgSender(), deadline);
    }

    function swapETHForExactTokens(
        uint amountOut,
        address[] memory path,
        uint deadline
        ) public {
            SwapV2Router02 theContract = SwapV2Router02(_unirouter);
            theContract.swapETHForExactTokens(amountOut,path, _msgSender(), _msgSender(), deadline);
    }

    //V2 Swaps

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] memory path,
        uint deadline
        ) public {
            SwapV2Router02 theContract = SwapV2Router02(_unirouter);
            theContract.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn,amountOutMin,path, _msgSender(), _msgSender(), deadline);
    }

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] memory path,
        uint deadline
        ) public {
            SwapV2Router02 theContract = SwapV2Router02(_unirouter);
            theContract.swapExactETHForTokensSupportingFeeOnTransferTokens(amountOutMin,path, _msgSender(), deadline);
    }

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] memory path,
        uint deadline
        ) public {
            SwapV2Router02 theContract = SwapV2Router02(_unirouter);
            theContract.swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn,amountOutMin,path, _msgSender(), _msgSender(), deadline);
    }
}