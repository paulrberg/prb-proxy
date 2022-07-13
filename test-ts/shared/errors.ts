export enum PanicCodes {
  ASSERT = "0x1",
  ARITHMETIC_OVERFLOW_OR_UNDERFLOW = "0x11",
  DIVISION_BY_ZERO = "0x12",
}

export enum PRBProxyErrors {
  EXECUTION_NOT_AUTHORIZED = "PRBProxy__ExecutionNotAuthorized",
  EXECUTION_REVERTED = "PRBProxy__ExecutionReverted",
  NOT_OWNER = "PRBProxy__NotOwner",
  OWNER_CHANGED = "PRBProxy__OwnerChanged",
  TARGET_INVALID = "PRBProxy__TargetInvalid",
  TARGET_ZERO_ADDRESS = "PRBProxy__TargetZeroAddress",
}

export enum PRBProxyRegistryErrors {
  PROXY_ALREADY_EXISTS = "PRBProxyRegistry__ProxyAlreadyExists",
}
