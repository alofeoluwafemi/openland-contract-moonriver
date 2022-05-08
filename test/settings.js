const Settings = artifacts.require("Settings");

contract("Settings", function ([deployer]) {
  before(async function () {
    this.settings = await Settings.deployed();
  });

  it("should set max auction", async function () {
    await this.settings.setMaxAuctionLength(weeks(4));

    assert.equal(await this.settings.maxAuctionLength(), weeks(4));
  });
});

const weeks = (number) => {
  const oneWeek = 60 * 60 * 24 * 7;
  return oneWeek * number;
};
