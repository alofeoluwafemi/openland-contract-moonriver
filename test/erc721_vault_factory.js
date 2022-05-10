const OpenLandNFT = artifacts.require("OpenLandNFT");
const ERC721VaultFactory = artifacts.require("ERC721VaultFactory");
const InitializedProxy = artifacts.require("InitializedProxy");
const Settings = artifacts.require("Settings");
const { utils } = require("ethers");

contract("ERC721VaultFactory", function ([deployer]) {
  before(async function () {
    this.settings = await Settings.deployed();
    this.factory = await ERC721VaultFactory.new(this.settings.address);
    this.openlandnft = await OpenLandNFT.deployed();
  });

  it("should assert that deploy can mint land as nft", async function () {
    const ipfsUrl =
      "https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE";
    const response = await this.openlandnft.mintProperty(ipfsUrl);

    const { tokenId } = response.logs[0].args;

    this.tokenId = tokenId;

    const owner = await this.openlandnft.ownerOf(tokenId.toNumber());
    const balance = await this.openlandnft.balanceOf(deployer);

    assert.equal(owner, deployer);
    assert.equal(balance.toNumber(), 1);
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

    const vaultAddress = await this.factory.vaults(_vaultCount);
    console.log(vaultAddress, _vault);

    const vault = await InitializedProxy.at(vaultAddress);

    // const token = await vault.token();
    // const id = await vault.id();

    // assert.equal(_vault, vaultAddress);
    // assert.equal(_token, token);
    // assert.equal(_id, id);

    //Check number of voting tokens
    //Check curator address
    //Confirm action state is inactive
    //Confirm reserve Total
    //Confirm livePrice
  });

  //Update User Price
});
