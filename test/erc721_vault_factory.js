const OpenLandNFT = artifacts.require("OpenLandNFT");
const ERC721VaultFactory = artifacts.require("ERC721VaultFactory");
const InitializedProxy = artifacts.require("InitializedProxy");
const Settings = artifacts.require("Settings");
const { utils, providers, BigNumber } = require("ethers");
const { AbiCoder, Interface } = require("ethers/lib/utils");

contract("ERC721VaultFactory", function ([deployer]) {
  before(async function () {
    this.settings = await Settings.deployed();
    this.factory = await ERC721VaultFactory.deployed();
    this.openlandnft = await OpenLandNFT.deployed();
    // this.vault = await TokenVault.deployed();
  });

  // const data =
  //   "0x17528c06ebd090dca20d27a5894255011d3472449ba4e8a310902a5f6b45e348";

  // const abiCoder = new AbiCoder();
  // const number = abiCoder.decode(["uint256"], data);

  // console.log(number.toString());

  it("should assert that deploy can mint land as nft", async function () {
    const ipfsUrl =
      "https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE";
    const response = await this.openlandnft.mintProperty(ipfsUrl);

    const { tokenId } = response.logs[0].args;

    this.tokenId = tokenId;

    const owner = await this.openlandnft.ownerOf(tokenId.toString());
    const balance = await this.openlandnft.balanceOf(deployer);

    assert.equal(owner, deployer);
    assert.equal(balance.toString(), 1);
  });

  it("should assert that deploy can mint vault", async function () {
    //Approve factory to spend NFT token
    await this.openlandnft.setApprovalForAll(this.factory.address, true);

    /// @notice the function to mint a new vault
    /// @param _name the desired name of the vault
    /// @param _symbol the desired sumbol of the vault
    /// @param _token the ERC721 token address fo the NFT
    /// @param _id the uint256 ID of the token
    /// @param _supply is the initial total supply of the token
    /// @param _listPrice the initial price of the NFT
    /// @param _fee is the curators fee on creation
    /// @return the ID of the vault
    const response = await this.factory.mint(
      "Lakwe Lakes",
      "LAK",
      this.openlandnft.address,
      this.tokenId,
      utils.parseEther("10000"),
      utils.parseEther("200"), //Price of the property(NFT) in MOVR
      20 //the AUM fee paid to the curator yearly. 3 decimals. ie. 100 = 10%, 20 = 2%, etc.
    );

    const {
      0: _token,
      1: _id,
      2: _listPrice,
      3: _vault,
      4: _vaultCount,
    } = response.logs[0].args;

    this.vaultAddress = _vault;

    const vault = await InitializedProxy.at(_vault);

    let ABI, interface, data, _response;

    //Read proxy state for ERC721 token address
    ABI = ["function token() public view returns(address)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("token", []);

    _response = await vault.delegateTo(0, data);
    const token = _response.logs[0].args._data;

    //Read proxy state for ERC721 token id
    ABI = ["function id() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("id", []);

    _response = await vault.delegateTo(1, data);
    const id = _response.logs[0].args._data;

    //Read proxy state for reserve total
    ABI = ["function reserveTotal() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("reserveTotal", []);

    _response = await vault.delegateTo(1, data);
    const reserveTotal = _response.logs[0].args._data;

    console.log("reserveTotal: ", reserveTotal.toString());

    //Read proxy state for live price
    ABI = ["function livePrice() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("livePrice", []);

    _response = await vault.delegateTo(1, data);
    const livePrice = _response.logs[0].args._data;

    console.log("livePrice: ", livePrice.toString());

    //Read proxy state for voting tokens
    ABI = ["function votingTokens() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("votingTokens", []);

    _response = await vault.delegateTo(1, data);
    const votingTokens = _response.logs[0].args._data;

    console.log("votingTokens: ", votingTokens.toString());

    //Read proxy state for reserve price
    ABI = ["function reservePrice() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("reservePrice", []);

    _response = await vault.delegateTo(1, data);
    const reservePrice = _response.logs[0].args._data;

    console.log("reservePrice: ", reservePrice.toString());

    //Read proxy state for user prices
    ABI = ["function userPrices(address) public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("userPrices", [deployer]);

    _response = await vault.delegateTo(1, data);
    const userPrice = _response.logs[0].args._data;

    console.log("userPrice: ", userPrice.toString());

    //Read proxy state for fee
    ABI = ["function fee() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("fee", []);

    _response = await vault.delegateTo(1, data);
    const fee = _response.logs[0].args._data;

    console.log("fee: ", fee.toString());

    //Read proxy state for curator address
    ABI = ["function curator() public view returns(address)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("curator", []);

    _response = await vault.delegateTo(0, data);
    const curator = _response.logs[0].args._data;

    console.log("curator: ", curator);

    //Read proxy state for auction state
    // 0 = inactive
    // 1 = live
    // 2 = ended
    // 3 = redeemed
    ABI = ["function auctionState() public view returns(uint8)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("auctionState", []);

    _response = await vault.delegateTo(3, data);
    const auctionState = _response.logs[0].args._data;

    console.log("auctionState: ", auctionState.toString());

    assert.equal(_token, token);
    assert.equal(_id.toString(), id.toString());

    //Check number of voting tokens
    //Check curator address
    //Confirm action state is inactive
    //Confirm reserve Total
    //Confirm livePrice
  });

  //Update User Price
});
