// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title InitializedProxy
 * @author Anna Carroll
 */
contract InitializedProxy {
  // address of logic contract
  address public logic;

  event ShareTypeAddress(address indexed _data);
  event ShareTypeUInt(uint256 indexed _data);
  event ShareTypeBool(bool indexed _data);
  event ShareTypeUInt8(uint8 indexed _data);

  // ======== Constructor =========

  constructor(address _logic, bytes memory _initializationCalldata) {
    logic = _logic;
    // Delegatecall into the logic contract, supplying initialization calldata
    (bool _ok, bytes memory returnData) = _logic.delegatecall(
      _initializationCalldata
    );
    // Revert if delegatecall to implementation reverts
    require(_ok, string(returnData));
  }

  // ======== Fallback =========

  fallback() external payable {
    address _impl = logic;
    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, calldatasize())
      let result := delegatecall(gas(), _impl, ptr, calldatasize(), 0, 0)
      let size := returndatasize()
      returndatacopy(ptr, 0, size)

      switch result
      case 0 {
        revert(ptr, size)
      }
      default {
        return(ptr, size)
      }
    }
  }

  function delegateTo(uint8 dataType, bytes memory data)
    public
    returns (bytes memory)
  {
    address _impl = logic;

    (bool success, bytes memory returnData) = _impl.delegatecall(data);

    if (dataType == 0) {
      address result = abi.decode(returnData, (address));
      emit ShareTypeAddress(result);
    } else if (dataType == 1) {
      uint256 result = abi.decode(returnData, (uint256));
      emit ShareTypeUInt(result);
    } else if (dataType == 2) {
      bool result = abi.decode(returnData, (bool));
      emit ShareTypeBool(result);
    } else if (dataType == 3) {
      uint8 result = abi.decode(returnData, (uint8));
      emit ShareTypeUInt8(result);
    } else {
      revert("Invalid data type");
    }

    assembly {
      if eq(success, 0) {
        revert(add(returnData, 0x20), returndatasize())
      }
    }
    return returnData;
  }

  // ======== Receive =========

  receive() external payable {} // solhint-disable-line no-empty-blocks
}
