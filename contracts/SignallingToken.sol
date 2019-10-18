/*
Implements ERC20 Token Standard: https://github.com/ethereum/EIPs/issues/20
*/

pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol';

contract SignallingToken is ERC20Mintable, ERC20Burnable {

  string public name = "SignallingToken";
  uint8 public decimals = 2;
  string public symbol = "SGT";
  string public version = 'SGT 1.0';


}
