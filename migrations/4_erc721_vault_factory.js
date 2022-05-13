const ERC721VaultFactory = artifacts.require("ERC721VaultFactory");
const Settings = artifacts.require("Settings");

module.exports = async function (deployer) {
  const settings = await Settings.deployed();

  return deployer.deploy(ERC721VaultFactory, settings.address);
};
