// const OpenLandNFT = artifacts.require("OpenLandNFT");
// const ERC721VaultFactory = artifacts.require("ERC721VaultFactory");
// const InitializedProxy = artifacts.require("InitializedProxy");
// const Settings = artifacts.require("Settings");
const { utils, providers, BigNumber } = require("ethers");
// const { AbiCoder, Interface } = require("ethers/lib/utils");
const { CeloContract, newKit } = require("@celo/contractkit");

contract("ERC721VaultFactory", function ([deployer, account1]) {
  // before(async function () {
  //   this.settings = await Settings.deployed();
  //   this.factory = await ERC721VaultFactory.deployed();
  //   this.openlandnft = await OpenLandNFT.deployed();
  // });

  it.skip("should assert that deploy can mint land as nft", async function () {
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

  it.skip("should assert that deploy can mint vault", async function () {
    //Approve factory to spend NFT token
    await this.openlandnft.setApprovalForAll(this.factory.address, true);

    let ABI, interface, data, response;

    /// @notice the function to mint a new vault
    /// @param _name the desired name of the vault
    /// @param _symbol the desired sumbol of the vault
    /// @param _token the ERC721 token address fo the NFT
    /// @param _id the uint256 ID of the token
    /// @param _supply is the initial total supply of the token
    /// @param _listPrice the initial price of the NFT
    /// @param _fee is the curators fee on creation
    /// @return the ID of the vault
    response = await this.factory.mint(
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

    this.vault = vault;

    //Read proxy state for ERC721 token address
    ABI = ["function token() public view returns(address)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("token", []);

    response = await vault.delegateTo(0, data);
    const token = response.logs[0].args._data;

    //Read proxy state for ERC721 token id
    ABI = ["function id() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("id", []);

    response = await vault.delegateTo(1, data);
    const id = response.logs[0].args._data;

    //Read proxy state for reserve total
    ABI = ["function reserveTotal() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("reserveTotal", []);

    response = await vault.delegateTo(1, data);
    const reserveTotal = response.logs[0].args._data;

    //Read proxy state for live price
    ABI = ["function livePrice() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("livePrice", []);

    response = await vault.delegateTo(1, data);
    const livePrice = response.logs[0].args._data;

    //Read proxy state for voting tokens
    ABI = ["function votingTokens() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("votingTokens", []);

    response = await vault.delegateTo(1, data);
    const votingTokens = response.logs[0].args._data;

    //Read proxy state for reserve price
    ABI = ["function reservePrice() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("reservePrice", []);

    response = await vault.delegateTo(1, data);
    const reservePrice = response.logs[0].args._data;

    //Read proxy state for user prices
    ABI = ["function userPrices(address) public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("userPrices", [deployer]);

    response = await vault.delegateTo(1, data);
    const userPrice = response.logs[0].args._data;

    //Read proxy state for fee
    ABI = ["function fee() public view returns(uint256)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("fee", []);

    response = await vault.delegateTo(1, data);
    const fee = response.logs[0].args._data;

    //Read proxy state for curator address
    ABI = ["function curator() public view returns(address)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("curator", []);

    response = await vault.delegateTo(0, data);
    const curator = response.logs[0].args._data;

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

    assert.equal(
      reserveTotal.toString(),
      utils.parseEther("10000").mul(utils.parseEther("200")).toString() //Reserve total is supply * list price
    );
    assert.equal(livePrice, 0); // Live price is the price of the property(NFT) in MOVR when auction is live
    assert.equal(reservePrice, 200e18); // Reserve price is the price of the property(NFT) in MOVR
    assert.equal(votingTokens, 10000e18); // the number of ownership tokens voting on the reserve price at any given time
    assert.equal(userPrice, 200e18);
    assert.equal(fee, 20);
    assert.equal(curator, deployer);
    assert.equal(auctionState, 0);
    assert.equal(_token, token);
    assert.equal(_id.toString(), id.toString());
  });

  it.skip("should allow curator to update curator address", async function () {
    let ABI, interface, data, response;
    ABI = ["function updateCurator(address _curator) external"];
    interface = new utils.Interface(ABI);

    data = interface.encodeFunctionData("updateCurator", [account1]);

    response = await this.vault.sendTransaction({
      from: deployer,
      data: data,
    });

    //Read proxy state for curator address
    ABI = ["function curator() public view returns(address)"];
    interface = new utils.Interface(ABI);
    data = interface.encodeFunctionData("curator", []);

    response = await this.vault.delegateTo(0, data);
    const curator = response.logs[0].args._data;

    assert.equal(curator, account1);
  });

  it("should get baseGasPrice", async function () {
    let abi = [
      "event Mint(address indexed token, uint256 id, uint256 price, address vault, uint256 vaultId)",
    ];
    let iface = new utils.Interface(abi);

    const data =
      "0x000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000006c6b935b8bbd400000000000000000000000000000fae92e6a3854c61cd23fd87d3a512b3e93260e9b0000000000000000000000000000000000000000000000000000000000000005";

    const topics = [
      "0xf9c32fbc56ff04f32a233ebc26e388564223745e28abd8d0781dd906537f563e",
      "0x000000000000000000000000a0b4ba8ee06d766cbefd1c140a9b1ef00e6ec323",
    ];

    const log = iface.decodeEventLog("Mint", data, topics);

    const params = {
      token_address: log["token"], // The address of the ERC20 token minted for the vault
      token_id: log["id"].toString(), // The ERC 721 token locked in the vault the uint256 ID of the token
      token_price: log["price"].toString(), // Price of each token in wei
      vault_address: log["vault"], // The contract address of the vault
      vault_id: log["vaultId"], // The Id of the vault in the factpry contract which can be accessed as await factory.vaults(vaultId) and returns the vault address
    };

    console.log(params);
  });

  // @Todo write test for governance contracts
  //Update User Price
  //Update Fee
  //Update Aution Length
  //Update Reserve Price
  //Can start auction

  // @Todo write test for governance contracts
});
