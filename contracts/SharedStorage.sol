// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SharedStorage {
  // address of logic contract
  address public logic;

  /// -----------------------------------
  /// -------- BASIC INFORMATION --------
  /// -----------------------------------

  /// @notice weth address
  address public constant weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  /// -----------------------------------
  /// -------- TOKEN INFORMATION --------
  /// -----------------------------------

  /// @notice the ERC721 token address of the vault's token
  address public token;

  /// @notice the ERC721 token ID of the vault's token
  uint256 public id;

  /// -------------------------------------
  /// -------- AUCTION INFORMATION --------
  /// -------------------------------------

  /// @notice the unix timestamp end time of the token auction
  uint256 public auctionEnd;

  /// @notice the length of auctions
  uint256 public auctionLength;

  /// @notice reservePrice * votingTokens
  uint256 public reserveTotal;

  /// @notice the current price of the token during an auction
  uint256 public livePrice;

  /// @notice the current user winning the token auction
  address payable public winning;

  enum State {
    inactive,
    live,
    ended,
    redeemed
  }

  State public auctionState;

  /// -----------------------------------
  /// -------- VAULT INFORMATION --------
  /// -----------------------------------

  /// @notice the governance contract which gets paid in ETH
  address public settings;

  /// @notice the address who initially deposited the NFT
  address public curator;

  /// @notice the AUM fee paid to the curator yearly. 3 decimals. ie. 100 = 10%
  uint256 public fee;

  /// @notice the last timestamp where fees were claimed
  uint256 public lastClaimed;

  /// @notice a boolean to indicate if the vault has closed
  bool public vaultClosed;

  /// @notice the number of ownership tokens voting on the reserve price at any given time
  uint256 public votingTokens;

  /// @notice a mapping of users to their desired token price
  mapping(address => uint256) public userPrices;

  /// ------------------------
  /// -------- EVENTS --------
  /// ------------------------

  /// @notice An event emitted when a user updates their price
  event PriceUpdate(address indexed user, uint256 price);

  /// @notice An event emitted when an auction starts
  event Start(address indexed buyer, uint256 price);

  /// @notice An event emitted when a bid is made
  event Bid(address indexed buyer, uint256 price);

  /// @notice An event emitted when an auction is won
  event Won(address indexed buyer, uint256 price);

  /// @notice An event emitted when someone redeems all tokens for the NFT
  event Redeem(address indexed redeemer);

  /// @notice An event emitted when someone cashes in ERC20 tokens for ETH from an ERC721 token sale
  event Cash(address indexed owner, uint256 shares);
}
