## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```bash
forge build
```

> Note: ABI interface contract information may be found via
> `out/I<NAME>.sol/I<NAME>.json` naming conventions, ex;
>
> - `out/IZorpFactory.sol/out/IZorpFactory.json`
> - `out/IZorpStudy.sol/out/IZorpStudy.json`
>
> ...  These often are significantly fewer bytes to serve to third-party
> clients, and often load/parse faster within off-chain libraries.

### Test

- Run all tests
   ```bash
   forge test
   ```
- Run specific test file
   ```bash
   forge test --match-path test/ZorpFactory_Success.t.sol
   ```
- Run tests and gather coverage statistics, while ignoring `script/` and `test/` sub-directories
   ```bash
   forge coverage --no-match-coverage '(script|test)'
   ```
- Run tests and gather gas statistics
   ```bash
   forge test --gas-report
   ```

**Notes about testing philosophy**

- Test contracts will _mostly_ follow a naming convention of `<parent>_<topic>_<mutation>_Test`, ex `ZorpFactory_Revert_Write_Test` tests certain `Write` mutations will `Revert` for `ZorpFactory` parent
- All test functions must be independent, I.E. no shared or persistent state
- Test functions are generally ordered as they are defined within the contract being tested
- Test function names generally follow a pattern similar to `test_<action>__<name>__<description>`, and `__<description>` is optional when sufficiently self explanatory, ex. `test_write__setRefFactoryNext__rejects_when_previously_upgraded`
- Code within test functions are generally ordered as; `<setup>`, `<execute>`, then `<assert>`
- Assertions of values are generally ordered as; `<expected>`, `<got>`, then `<message>`
- Assertions of events ordered as; `<listener>`, `<expected>`, then `<execute>`
- Assertions of error ordered as; `<listener>`, `<expected>`, then `<execute>`

**Useful test writing resources**

- [Foundry -- Cheetcodes -- `expectEmit`](https://book.getfoundry.sh/cheatcodes/expect-emit)
- [Foundry -- Cheetcodes -- `expectRevert`](https://book.getfoundry.sh/cheatcodes/expect-revert)

### Format

```bash
forge fmt
```

### Gas Snapshots

```bash
forge snapshot
```

### Anvil

```bash
anvil
```

### Deploy

```bash
forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Mock

Start local dev-net;

```bash
anvil --host 127.0.0.1
```

> Note; if running in Docker, or other container/verbalization solution, then
> adjusting firewall rules and/or port forwarding may be necessary to allow
> end-to-end testing.

Within a separate terminal session publish a contract to the local dev-net;

```bash
_test_net_url='127.0.0.1:8545'
_test_private_key0='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
_initialOwner='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

## Dry run
forge create \
  --rpc-url "${_test_net_url}" \
  --private-key "${_test_private_key0}" \
  src/ZorpFactory.sol:ZorpFactory \
  --constructor-args "${_initialOwner}"

## Actually broadcast
forge create \
  --broadcast \
  --rpc-url "${_test_net_url}" \
  --private-key "${_test_private_key0}" \
  src/ZorpFactory.sol:ZorpFactory \
  --constructor-args "${_initialOwner}"
```

**Example result**

```
No files changed, compilation skipped
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Transaction hash: 0x0eab52efa60b06c9e0a56a0c1c816b755ec75d7cca16635d2f929e40874ff38b
```

### Cast

Syntax;

```
cast <subcommand>
```

Provided a local dev-net is running, such as via `anvil`, try getting contract
information via;

```bash
_test_net_url='127.0.0.1:8545'
_zorp_factory_address='0x5FbDB2315678afecb367f032d93F642f64180aa3'

cast call "${_zorp_factory_address}" "owner()(address)" --rpc-url "${_test_net_url}"
```

**Example reply**

```
0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
```

### Help

```bash
forge --help
anvil --help
cast --help
```


[gitfoundry__forge_create]: https://book.getfoundry.sh/reference/forge/forge-create
[gitfoundry__cast]: https://book.getfoundry.sh/cast/

