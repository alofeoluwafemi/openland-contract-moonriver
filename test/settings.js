const Settings = artifacts.require("Settings");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { utils } = require("ethers");

contract("Settings", function ([deployer, account1]) {
  before(async function () {
    this.settings = await Settings.deployed();
  });

  it("should set max auction", async function () {
    await this.settings.setMaxAuctionLength(weeks(4));
    assert.equal(await this.settings.maxAuctionLength(), weeks(4));
  });

  it("should revert when max auction is set too low/high", async function () {
    await expectRevert(
      this.settings.setMaxAuctionLength(weeks(10)),
      "max auction length too high"
    );
    await expectRevert(
      this.settings.setMaxAuctionLength(days(3)),
      "max auction length too low"
    );
  });

  it("should set min auction", async function () {
    await this.settings.setMinAuctionLength(weeks(1));
    assert.equal(await this.settings.minAuctionLength(), weeks(1));
  });

  it("should revert when min auction is set too low/high", async function () {
    await expectRevert(
      this.settings.setMinAuctionLength(weeks(15)),
      "min auction length too high"
    );
    await expectRevert(
      this.settings.setMinAuctionLength(days(0.1)),
      "min auction length too low"
    );
  });

  it("should set governance fee", async function () {
    await this.settings.setGovernanceFee(90);
    assert.equal(await this.settings.governanceFee(), 90);
  });

  it("should revert when governance fee is set too high", async function () {
    await expectRevert(this.settings.setGovernanceFee(110), "fee too high");
  });

  it("should set minimum bid increase", async function () {
    await this.settings.setMinBidIncrease(75);
    assert.equal(await this.settings.minBidIncrease(), 75);
  });

  it("should revert when minimum bid is set too low/high", async function () {
    await expectRevert(
      this.settings.setMinBidIncrease(5),
      "min bid increase too low"
    );
    await expectRevert(
      this.settings.setMinBidIncrease(1000),
      "min bid increase too high"
    );
  });

  it("should set max reserve factor", async function () {
    await this.settings.setMaxReserveFactor(10000);
    assert.equal(await this.settings.maxReserveFactor(), 10000);
  });

  it("should revert when max reserve factor is set too low", async function () {
    await expectRevert(
      this.settings.setMaxReserveFactor(200),
      "max reserve factor too low"
    );
  });

  it("should set min reserve factor", async function () {
    await this.settings.setMinReserveFactor(400);
    assert.equal(await this.settings.minReserveFactor(), 400);
  });

  it("should revert when min reserve factor is set too high", async function () {
    await expectRevert(
      this.settings.setMinReserveFactor(16000),
      "min reserve factor too high"
    );
  });

  it("should set fee receiver", async function () {
    await this.settings.setFeeReceiver(account1);
    assert.equal(await this.settings.feeReceiver(), account1);
  });

  it("should revert when fee receiver address is invalid", async function () {
    await expectRevert(
      this.settings.setFeeReceiver(
        "0x0000000000000000000000000000000000000000"
      ),
      "fees cannot go to 0 address"
    );
  });
});

const weeks = (number) => {
  const oneWeek = 60 * 60 * 24 * 7;
  return oneWeek * number;
};

const days = (number) => {
  const oneDay = 60 * 60 * 24;
  return oneDay * number;
};
