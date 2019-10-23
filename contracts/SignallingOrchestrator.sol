pragma solidity ^0.5.2;

import '@gnosis.pm/conditional-tokens-market-makers/contracts/LMSRMarketMakerFactory.sol';
import '@gnosis.pm/conditional-tokens-market-makers/contracts/Whitelist.sol';
import '@gnosis.pm/conditional-tokens-contracts/contracts/ConditionalTokens.sol';
import '@gnosis.pm/conditional-tokens-contracts/contracts/CTHelpers.sol';
import './CollateralToken.sol';


contract SignallingOrchestrator is Ownable {

    ConditionalTokens conditionalTokens;
    Whitelist public whitelist;
    CollateralToken public collateralToken;
    LMSRMarketMakerFactory marketMakerFactory;
    address public oracle;

    uint64 FEE_FACTOR = 1;

    constructor(address _oracle) public {
        whitelist = new Whitelist();
        collateralToken = new CollateralToken();
        conditionalTokens = new ConditionalTokens();
        oracle = _oracle;
    }

    function setMarketMakerFactory(LMSRMarketMakerFactory _marketMakerFactory) public onlyOwner {
        require(address(_marketMakerFactory) != address(0));
        marketMakerFactory = _marketMakerFactory;
    }

    function createMarket(bytes32 _questionId, uint256 funding) public onlyOwner {
        conditionalTokens.prepareCondition(oracle, _questionId, 2);
        bytes32[] memory conditions = new bytes32[](1);
        conditions[0] = CTHelpers.getConditionId(oracle, _questionId, 2);

        collateralToken.mint(address(this), funding);
        collateralToken.approve(address(marketMakerFactory), funding);

        marketMakerFactory.createLMSRMarketMaker(conditionalTokens, collateralToken, conditions, FEE_FACTOR, whitelist, funding);
    }

    function onBoard(address user, uint256 stipend) public onlyOwner {
        collateralToken.mint(user, stipend);
        address[] memory users = new address[](1);
        users[0] = user;
        whitelist.addToWhitelist(users);
    }

}
