// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

// solhint-disable var-name-mixedcase, func-name-mixedcase

interface ICurvePlainPool {
  function exchange(
    int128 i,
    int128 j,
    uint256 dx,
    uint256 min_dy
  ) external payable;

  function get_dy(
    int128 i,
    int128 j,
    uint256 dx
  ) external view returns (uint256);

  function add_liquidity(uint256[2] memory amounts, uint256 min_mint_amount) external payable;

  function calc_token_amount(uint256[2] memory amounts, bool deposit) external view returns (uint256);

  function add_liquidity(uint256[3] memory amounts, uint256 min_mint_amount) external payable;

  function calc_token_amount(uint256[3] memory amounts, bool deposit) external view returns (uint256);

  function add_liquidity(uint256[4] memory amounts, uint256 min_mint_amount) external payable;

  function calc_token_amount(uint256[4] memory amounts, bool deposit) external view returns (uint256);

  function remove_liquidity_one_coin(
    uint256 _token_amount,
    int128 i,
    uint256 min_amount
  ) external;

  function calc_withdraw_one_coin(uint256 _token_amount, int128 i) external view returns (uint256);

  function coins(uint256 index) external view returns (address);

  function balances(uint256 index) external view returns (uint256);

  // ren and sbtc pool
  function coins(int128 index) external view returns (address);

  // ren and sbtc pool
  function balances(int128 index) external view returns (uint256);

  function get_virtual_price() external view returns (uint256);
}
