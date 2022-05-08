const Settings = artifacts.require("Settings");

contract("Settings", function ([deployer]) {
  before(async () => {
    this.settings = await Settings.deployed();
  });

  weeks = (number) => {
    const oneWeek = 60 * 60 * 24 * 7;
    oneWeek * number;
  };

  it("should set max auction", async function () {
    await settings.setMaxAuctionLength(weeks(4));

    assert.equal(settings.maxAuctionLength(), weeks(4));
  });
});
