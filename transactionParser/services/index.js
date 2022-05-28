const ethers = require('ethers');
const Buffer = require('buffer/').Buffer;
const isBuffer = require('is-buffer');
const Routerabi = require('./RouterSwapAbi.json');
const Erc20abi = require('./erc20.json');
const Web3 = require('web3');
// TODO: dry up and clean up
// NOTE: this library may be deprecated in future, in favor of ethers v5 AbiCoder.

const web3 = new Web3('https://bsc-dataseed.binance.org/');
class InputDataDecoder {
  constructor(prop) {
    this.abi = [];

    if (typeof prop === `string`) {
      try {
        const fs = require('fs');
        this.abi = JSON.parse(fs.readFileSync(prop));
      } catch (err) {
        try {
          this.abi = JSON.parse(prop);
        } catch (err) {
          throw new Error(`Invalid ABI: ${err.message}`);
        }
      }
    } else if (prop instanceof Object) {
      this.abi = prop;
    } else {
      throw new TypeError(
        `Must pass ABI array object or file path to constructor`
      );
    }
  }

  decodeConstructor(data) {
    if (isBuffer(data)) {
      data = data.toString('utf8');
    }

    if (typeof data !== 'string') {
      data = '';
    }

    data = data.trim();

    for (let i = 0; i < this.abi.length; i++) {
      const obj = this.abi[i];

      if (obj.type !== 'constructor') {
        continue;
      }

      const method = obj.name || null;
      const types = obj.inputs ? obj.inputs.map((x) => x.type) : [];
      const names = obj.inputs ? obj.inputs.map((x) => x.name) : [];

      // take last 32 bytes
      data = data.slice(-256);

      if (data.length !== 256) {
        throw new Error('fail');
      }

      if (data.indexOf('0x') !== 0) {
        data = `0x${data}`;
      }

      let inputs = ethers.utils.defaultAbiCoder.decode(types, data);
      inputs = deepRemoveUnwantedArrayProperties(inputs);

      return {
        method,
        types,
        inputs,
        names,
      };
    }

    throw new Error('not found');
  }

  decodeData(data) {
    if (isBuffer(data)) {
      data = data.toString('utf8');
    }

    if (typeof data !== 'string') {
      data = '';
    }

    data = data.trim();

    const dataBuf = Buffer.from(data.replace(/^0x/, ''), 'hex');
    const methodId = toHexString(dataBuf.subarray(0, 4));
    let inputsBuf = dataBuf.subarray(4);

    const result = this.abi.reduce(
      (acc, obj) => {
        try {
          if (obj.type === 'constructor') {
            return acc;
          }
          if (obj.type === 'event') {
            return acc;
          }
          const method = obj.name || null;
          let types = obj.inputs
            ? obj.inputs.map((x) => {
                if (x.type.includes('tuple')) {
                  return x;
                } else {
                  return x.type;
                }
              })
            : [];

          let names = obj.inputs
            ? obj.inputs.map((x) => {
                if (x.type.includes('tuple')) {
                  return [x.name, x.components.map((a) => a.name)];
                } else {
                  return x.name;
                }
              })
            : [];

          const hash = genMethodId(method, types);

          if (hash === methodId) {
            let inputs = [];

            inputsBuf = normalizeAddresses(types, inputsBuf);
            try {
              inputs = ethers.utils.defaultAbiCoder.decode(types, inputsBuf);
            } catch (err) {
              try {
                const ifc = new ethers.utils.Interface([]);
                inputs = ifc.decodeFunctionData(
                  ethers.utils.FunctionFragment.fromObject(obj),
                  data
                );
              } catch (err) {}
            }

            // TODO: do this normalization into normalizeAddresses
            inputs = inputs.map((input, i) => {
              if (types[i].components) {
                const tupleTypes = types[i].components;
                return deepStripTupleAddresses(input, tupleTypes);
              }
              if (types[i] === 'address') {
                return input.split('0x')[1];
              }
              if (types[i] === 'address[]') {
                return input.map((address) => address.split('0x')[1]);
              }
              return input;
            });

            // Map any tuple types into arrays
            const typesToReturn = types.map((t) => {
              if (t.components) {
                const arr = t.components.reduce(
                  (acc, cur) => [...acc, cur.type],
                  []
                );
                const tupleStr = `(${arr.join(',')})`;
                if (t.type === 'tuple[]') return tupleStr + '[]';
                return tupleStr;
              }
              return t;
            });

            // defaultAbiCoder attaches some unwanted properties to the list object
            inputs = deepRemoveUnwantedArrayProperties(inputs);

            return {
              method,
              types: typesToReturn,
              inputs,
              names,
            };
          }

          return acc;
        } catch (err) {
          return acc;
        }
      },
      { method: null, types: [], inputs: [], names: [] }
    );

    if (!result.method) {
      this.abi.reduce((acc, obj) => {
        if (obj.type === 'constructor') {
          return acc;
        }
        if (obj.type === 'event') {
          return acc;
        }
        const method = obj.name || null;

        try {
          const ifc = new ethers.utils.Interface([]);
          const _result = ifc.decodeFunctionData(
            ethers.utils.FunctionFragment.fromObject(obj),
            data
          );
          let inputs = deepRemoveUnwantedArrayProperties(_result);
          result.method = method;
          result.inputs = inputs;
          result.names = obj.inputs
            ? obj.inputs.map((x) => {
                if (x.type.includes('tuple')) {
                  return [x.name, x.components.map((a) => a.name)];
                } else {
                  return x.name;
                }
              })
            : [];
          const types = obj.inputs
            ? obj.inputs.map((x) => {
                if (x.type.includes('tuple')) {
                  return x;
                } else {
                  return x.type;
                }
              })
            : [];

          result.types = types.map((t) => {
            if (t.components) {
              const arr = t.components.reduce(
                (acc, cur) => [...acc, cur.type],
                []
              );
              const tupleStr = `(${arr.join(',')})`;
              if (t.type === 'tuple[]') return tupleStr + '[]';
              return tupleStr;
            }
            return t;
          });
        } catch (err) {}
      });
    }

    if (!result.method) {
      try {
        const decoded = this.decodeConstructor(data);
        if (decoded) {
          return decoded;
        }
      } catch (err) {}
    }

    return result;
  }
}

// remove 0x from addresses
function deepStripTupleAddresses(input, tupleTypes) {
  return input.map((item, i) => {
    // We find tupleTypes to not be an array where internalType is present in the ABI indicating item is a structure
    const type = tupleTypes[i] ? tupleTypes[i].type : null;

    if (type === 'address' && typeof item === 'string') {
      return item.split('0x')[1];
    }
    if (type === 'address[]' || Array.isArray()) {
      return item.map((a) => a.split('0x')[1]);
    }

    if (Array.isArray(item)) {
      return deepStripTupleAddresses(item, tupleTypes);
    }

    return item;
  });
}

function deepRemoveUnwantedArrayProperties(arr) {
  return [
    ...arr.map((item) => {
      if (Array.isArray(item)) return deepRemoveUnwantedArrayProperties(item);
      return item;
    }),
  ];
}

function normalizeAddresses(types, input) {
  let offset = 0;
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    if (type === 'address') {
      input.set(Buffer.alloc(12), offset);
    }

    if (isArray(type)) {
      const size = parseTypeArray(type);
      if (size && size !== 'dynamic') {
        offset += 32 * size;
      } else {
        offset += 32;
      }
    } else {
      offset += 32;
    }
  }

  return input;
}

function parseTypeArray(type) {
  const tmp = type.match(/(.*)\[(.*?)\]$/);
  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10);
  }
  return null;
}

function isArray(type) {
  return type.lastIndexOf(']') === type.length - 1;
}

function handleInputs(input, tupleArray) {
  if (input instanceof Object && input.components) {
    input = input.components;
  }

  if (!Array.isArray(input)) {
    if (input instanceof Object && input.type) {
      return input.type;
    }

    return input;
  }

  let ret =
    '(' +
    input
      .reduce((acc, x) => {
        if (x.type === 'tuple') {
          acc.push(handleInputs(x.components));
        } else if (x.type === 'tuple[]') {
          acc.push(handleInputs(x.components) + '[]');
        } else {
          acc.push(x.type);
        }
        return acc;
      }, [])
      .join(',') +
    ')';

  if (tupleArray) {
    return ret + '[]';
  }

  return ret;
}

function genMethodId(methodName, types) {
  const input =
    methodName +
    '(' +
    types
      .reduce((acc, x) => {
        acc.push(handleInputs(x, x.type === 'tuple[]'));
        return acc;
      }, [])
      .join(',') +
    ')';

  return ethers.utils.keccak256(Buffer.from(input)).slice(2, 10);
}

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}

async function decodeSwap(dataInputString) {
  let method = '';
  let string1 = '';
  let token1 = '';
  let token2 = '';
  let output = '';
  let erc20_1, erc20_2;

  //   const abi = JSON.parse(abiInput.value.trim());
  const decoder = new InputDataDecoder(Routerabi);

  // if copied and pasted from etherscan only get data we need
  let dataInput = dataInputString;
  const data = dataInput
    .trim()
    .replace(/(?:[\s\S]*MethodID: (.*)[\s\S])?[\s\S]?\[\d\]:(.*)/gi, '$1$2');

  dataInput = data;
  const result = decoder.decodeData(data);
  method = result.method;
  console.log(result);
  switch (method) {
    case 'addLiquidity':
      erc20_1 = new web3.eth.Contract(Erc20abi, result.inputs[0]);
      erc20_2 = new web3.eth.Contract(Erc20abi, result.inputs[1]);
      token1 = await erc20_1.methods.name().call();
      token2 = await erc20_2.methods.name().call();
      break;
    case 'removeLiquidity':
      erc20_1 = new web3.eth.Contract(Erc20abi, result.inputs[0]);
      erc20_2 = new web3.eth.Contract(Erc20abi, result.inputs[1]);
      token1 = await erc20_1.methods.name().call();
      token2 = await erc20_2.methods.name().call();
      break;
    case 'addLiquidityETH':
      erc20_2 = new web3.eth.Contract(Erc20abi, result.inputs[0]);
      token2 = await erc20_2.methods.name().call();
      break;
    case 'removeLiquidityETH':
        erc20_2 = new web3.eth.Contract(Erc20abi, result.inputs[0]);
        token2 = await erc20_2.methods.name().call();
      break;
    case 'swapExactTokensForTokens':
      erc20_1 = new web3.eth.Contract(Erc20abi, result.inputs[2][0]);
      erc20_2 = new web3.eth.Contract(
        Erc20abi,
        result.inputs[2][result.inputs[2].length - 1]
      );
      token1 = await erc20_1.methods.name().call();
      token2 = await erc20_2.methods.name().call();
      break;
    case 'swapExactETHForTokens':
      erc20_2 = new web3.eth.Contract(
        Erc20abi,
        result.inputs[1][result.inputs[1].length - 1]
      );
      token2 = await erc20_2.methods.name().call();
      break;
    case 'swapExactTokensForETH':
      erc20_1 = new web3.eth.Contract(Erc20abi, result.inputs[2][0]);
      erc20_2 = new web3.eth.Contract(
        Erc20abi,
        result.inputs[2][result.inputs[2].length - 1]
      );
      token1 = await erc20_1.methods.name().call();
      token2 = await erc20_2.methods.name().call();
  }
  switch (method) {
    case 'addLiquidity':
      string1 = `${result.inputs[5]} has added liquidity for ${(
        ethers.BigNumber.from(`${result.inputs[2]}`) /
        10 ** 18
      ).toPrecision(5)} ${token1} and ${(
        ethers.BigNumber.from(`${result.inputs[3]}`) /
        10 ** 18
      ).toPrecision(5)} ${token2}`;
      break;
    case 'removeLiquidity':
      string1 = `${result.inputs[5]} has removed ${(
        ethers.BigNumber.from(`${result.inputs[2]}`) /
        10 ** 18
      ).toPrecision(5)} liquidity for ${token1} and ${token2}`;
      break;
    case 'addLiquidityETH':
      string1 = `${result.inputs[4]} has added liquidity for ${(
        ethers.BigNumber.from(`${result.inputs[3]}`) /
        10 ** 18
      ).toPrecision(5)} BNB and ${(
        ethers.BigNumber.from(`${result.inputs[1]}`) /
        10 ** 18
      ).toPrecision(5)} ${token2}`;
      break;
    case 'removeLiquidityETH':
      string1 = `${result.inputs[4]} has removed liquidity for ${(
        ethers.BigNumber.from(`${result.inputs[3]}`) /
        10 ** 18
      ).toPrecision(5)} BNB and ${(
        ethers.BigNumber.from(`${result.inputs[1]}`) /
        10 ** 18
      ).toPrecision(5)} ${token2}`;
      break;
    case 'swapExactTokensForTokens':
      string1 = `${result.inputs[3]} has swapped ${(
        ethers.BigNumber.from(`${result.inputs[0]}`) /
        10 ** 18
      ).toPrecision(5)} ${token1} with ${(
        ethers.BigNumber.from(`${result.inputs[1]}`) /
        10 ** 18
      ).toPrecision(5)} ${token2} `;
      break;
    case 'swapExactETHForTokens':
      string1 = `${result.inputs[2]} has swapped ${(
        ethers.BigNumber.from(`${result.inputs[0]}`) /
        10 ** 18
      ).toPrecision(5)} ${token2} for BNB`;
      break;
    case 'swapExactTokensForETH':
      string1 = `${result.inputs[3]} has recieved ${(
        ethers.BigNumber.from(`${result.inputs[0]}`) /
        10 ** 18
      ).toPrecision(5)} BNB in exchange for ${(
        ethers.BigNumber.from(`${result.inputs[1]}`) /
        10 ** 18
      ).toPrecision(5)} ${token1}`;
  }

  try {
    // output = JSON.stringify(result, null, 2);
    output = await string1;
    return output;
  } catch (error) {}
}
function decodeERC20(dataInputString) {
  let output = '';

  //   const abi = JSON.parse(abiInput.value.trim());
  const decoder = new InputDataDecoder(Erc20abi);

  // if copied and pasted from etherscan only get data we need
  let dataInput = dataInputString;
  const data = dataInput
    .trim()
    .replace(/(?:[\s\S]*MethodID: (.*)[\s\S])?[\s\S]?\[\d\]:(.*)/gi, '$1$2');

  dataInput = data;
  const result = decoder.decodeData(data);

  console.log(result);

  try {
    output = JSON.stringify(result, null, 2);
    return output;
  } catch (error) {}
}

module.exports = { InputDataDecoder, decodeSwap, decodeERC20 };
