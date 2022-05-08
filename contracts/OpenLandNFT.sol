// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TickeoTicketingNFT is ERC721URIStorage {
  ////////////////////////////////////////
  //                                    //
  //         STATE VARIABLES            //
  //                                    //
  ////////////////////////////////////////

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  ////////////////////////////////////////
  //                                    //
  //              EVENTS                //
  //                                    //
  ////////////////////////////////////////
  event NewPropertyMinted(address indexed owner, uint256 indexed tokenId);

  ////////////////////////////////////////
  //                                    //
  //              FUNCTIONS             //
  //                                    //
  ////////////////////////////////////////

  constructor(address _ochesrator) ERC721("OpenLand", "OPEN") {}

  /**
   * @dev mint a new Property for a new event
   * @param ipfsUrl of json object with media details (opensea compatible)
   */
  function newTicket(string memory ipfsUrl) public returns (uint256) {
    _tokenIds.increment();

    uint256 newTokenId = _tokenIds.current();
    _mint(address(msg.sender), newTokenId);
    _setTokenURI(newTokenId, ipfsUrl);

    emit NewPropertyMinted(msg.sender, newTokenId);

    return newTokenId;
  }
}
