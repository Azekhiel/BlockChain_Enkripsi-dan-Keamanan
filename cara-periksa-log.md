> var abi = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "AccessControlBadConfirmation", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "bytes32", "name": "neededRole", "type": "bytes32" } ], "name": "AccessControlUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "bytes32", "name": "roleUsed", "type": "bytes32" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" } ], "name": "AccessLogged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "bytes32", "name": "previousAdminRole", "type": "bytes32" }, { "indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32" } ], "name": "RoleAdminChanged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "sender", "type": "address" } ], "name": "RoleGranted", "type": "event" }, { 
"anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "sender", "type": "address" } ], "name": "RoleRevoked", "type": "event" }, { "inputs": [], "name": "ADMIN_ROLE", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "DEFAULT_ADMIN_ROLE", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "FINANCE_ROLE", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "LOGGER_ROLE", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "role", 
"type": "bytes32" } ], "name": "getRoleAdmin", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" } ], "name": "grantRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" } ], "name": "hasRole", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "bytes32", "name": "_roleUsed", "type": "bytes32" } ], "name": "logAccess", 
"outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "callerConfirmation", "type": "address" } ], "name": "renounceRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" } ], "name": "revokeRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" } ], "name": "supportsInterface", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" } ]
undefined

> var contractAddress = "0x3A220f351252089D385b29beca14e27F204c296A"
undefined

> var myContractBlueprint = eth.contract(abi)
undefined

> var myContract = myContractBlueprint.at(contractAddress)
undefined

> myContract.AccessLogged({}, {fromBlock: 0, toBlock: 'latest'}).get(function(error, events){
......   if (!error) {
.........     console.log(JSON.stringify(events, null, 2));
.........   } else {
.........     console.log(error);
.........   }
...... });

//output
[
  {
    "address": "0x3a220f351252089d385b29beca14e27f204c296a",
    "blockNumber": 3923,
    "transactionHash": "0x4cc06bae2143c0a2448f94a1e8521a0d396fdcac3eb57810f79762a2792248ea",
    "transactionIndex": 0,
    "blockHash": "0x0b7f1b2af315e45a0c3e64d53cdb10b6d786b481b4f0da2cad7e38ad24de07da",
    "blockTimestamp": "0x690a6e9e",
    "logIndex": 0,
    "removed": false,
    "event": "AccessLogged",
    "args": {
      "user": "0x71562b71999873db5b286df957af199ec94617f7",
      "roleUsed": "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
      "timestamp": "1762291358"
    }
  }
]
{
  callbacks: [],
  filterId: "0xb732d8c54b361b1ceca0739c95660135",
  getLogsCallbacks: [],
  implementation: {
    getLogs: function(),
    newFilter: function(),
    poll: function(),
    uninstallFilter: function()
  },
  options: {
    address: "0x3A220f351252089D385b29beca14e27F204c296A",
    from: undefined,
    fromBlock: "0x0",
    to: undefined,
    toBlock: "latest",
    topics: ["0xe30ba8c50028b51f5769dd6508f59abb43ac1e1e2a3d2e4661d503b299962f07", null, null]
  },
  pollFilters: [],
  requestManager: {
    polls: {},
    provider: {
      send: function github.com/ethereum/go-ethereum/internal/jsre.MakeCallback.func1(),
      sendAsync: function github.com/ethereum/go-ethereum/internal/jsre.MakeCallback.func1()
    },
    timeout: null,
    poll: function(),
    reset: function(keepIsSyncing),
    send: function(data),
    sendAsync: function(data, callback),
    sendBatch: function(data, callback),
    setProvider: function(p),
    startPolling: function(data, pollId, callback, uninstall),
    stopPolling: function(pollId)
  },
  formatter: function bound(),
  get: function(callback),
  stopWatching: function(callback),
  watch: function(callback)
}

> new Date(1762291358 * 1000)
<Date Wed Nov 05 2025 04:22:38 GMT+0700 (+07)>
> eth.getTransactionReceipt("0x4cc06bae2143c0a2448f94a1e8521a0d396fdcac3eb57810f79762a2792248ea")
{
  blockHash: "0x0b7f1b2af315e45a0c3e64d53cdb10b6d786b481b4f0da2cad7e38ad24de07da",
  blockNumber: 3923,
  contractAddress: null,
  cumulativeGasUsed: 27111,
  effectiveGasPrice: 8,
  from: "0x71562b71999873db5b286df957af199ec94617f7",
  gasUsed: 27111,
  logs: [{
      address: "0x3a220f351252089d385b29beca14e27f204c296a",
      blockHash: "0x0b7f1b2af315e45a0c3e64d53cdb10b6d786b481b4f0da2cad7e38ad24de07da",
      blockNumber: 3923,
      blockTimestamp: "0x690a6e9e",
      data: "0x00000000000000000000000000000000000000000000000000000000690a6e9e",
      logIndex: 0,
      removed: false,
      topics: ["0xe30ba8c50028b51f5769dd6508f59abb43ac1e1e2a3d2e4661d503b299962f07", "0x00000000000000000000000071562b71999873db5b286df957af199ec94617f7", "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775"],
      transactionHash: "0x4cc06bae2143c0a2448f94a1e8521a0d396fdcac3eb57810f79762a2792248ea",
      transactionIndex: 0
  }],
  logsBloom: "0x00000000000000000000020000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000020000000000000000000000000000000000000000004000001000000000000000400000800000000000000000000000000000000000000000000004000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000080000000000000",
  status: "0x1",
  to: "0x3a220f351252089d385b29beca14e27f204c296a",
  transactionHash: "0x4cc06bae2143c0a2448f94a1e8521a0d396fdcac3eb57810f79762a2792248ea",
  transactionIndex: 0,
  type: "0x0"
}

> web3.sha3("FINANCE_ROLE", {encoding: 'string'})
"0x940d6b1946ff1d2b5a9f1909219c3c81a370804b5ba0f91ec0828c99a2e6a681"

>  web3.sha3("ADMIN_ROLE", {encoding: 'string'})
"0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775"