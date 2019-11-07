pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import './LMSRMarketMakerFactory.sol';
import '@gnosis.pm/conditional-tokens-market-makers/contracts/Whitelist.sol';
import '@gnosis.pm/conditional-tokens-contracts/contracts/ConditionalTokens.sol';
import '@gnosis.pm/conditional-tokens-contracts/contracts/CTHelpers.sol';
import './CollateralToken.sol';


contract SignallingOrchestrator is Ownable {

    struct MarketDetails {
        // uint256 ratio;
        address mmAddress;
        string project;
        string outcome;
    }

    ConditionalTokens public conditionalTokens;
    Whitelist public whitelist;
    CollateralToken public collateralToken;
    LMSRMarketMakerFactory marketMakerFactory;
    address public oracle;
    MarketDetails[] public markets;

    uint64 FEE_FACTOR = 1;

    constructor(address _oracle, LMSRMarketMakerFactory _marketMakerFactory, ConditionalTokens _conditionalTokens) public {
        require(address(_oracle) != address(0));
        require(address(_marketMakerFactory) != address(0));

        oracle = _oracle;
        marketMakerFactory = _marketMakerFactory;
        conditionalTokens = _conditionalTokens;

        collateralToken = new CollateralToken();
        whitelist = new Whitelist();
    }

    function setMarketMakerFactory(LMSRMarketMakerFactory _marketMakerFactory) public onlyOwner {
        require(address(_marketMakerFactory) != address(0));
        marketMakerFactory = _marketMakerFactory;
    }

    function createMarket(bytes32 _questionId, uint256 funding, string memory project, string memory outcome) public onlyOwner {
        conditionalTokens.prepareCondition(oracle, _questionId, 2);
        bytes32[] memory conditions = new bytes32[](1);
        conditions[0] = CTHelpers.getConditionId(oracle, _questionId, 2);

        collateralToken.mint(address(this), funding);
        collateralToken.approve(address(marketMakerFactory), funding);

        address mm = address(marketMakerFactory.createLMSRMarketMaker(
            conditionalTokens,
            collateralToken,
            conditions,
            FEE_FACTOR,
            whitelist,
            funding));

        markets.push(MarketDetails(mm, project, outcome));
    }

    function getMarketsCount() public view returns(uint256) {
        return markets.length;
    }

    function getMarketDetails(uint256 marketNr) public view returns(MarketDetails memory) {
        return markets[marketNr];
    }

    function onBoard(address user, uint256 stipend) public onlyOwner {
        collateralToken.mint(user, stipend);
        address[] memory users = new address[](1);
        users[0] = user;
        whitelist.addToWhitelist(users);
    }

    function getOutcomeBalance(address owner, uint256 positionId) public view returns(uint256) {
      return conditionalTokens.balanceOf(owner, positionId);
    }

}
