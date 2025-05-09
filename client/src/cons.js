
const env = process.env;

let API = env.REACT_APP_URL_API ?? ""; // URL de la API

API = API.endsWith("/") ? API : API + "/"; // asegurarse de que la URL termine con /
API = API + "api/v2/"; // agregar la URL de la API al final

let WS = "0x0000000000000000000000000000000000000000"; 

let wallet_API = env.REACT_APP_WALLET_API || "0x0c4c6519E8B6e4D9c99b09a3Cda475638c930b00"; // wallet API

let SC_Proxy = env.REACT_APP_SMARTCONTRACT || "0x5674173b10E221eFE880C769e73ADA590df682e9"; // contrato proxy nuevo v4

let TOKEN = "0x55d398326f99059fF775485246999027B3197955";
let chainId = "0x38"; // bnb mainnet

let testnet = env.REACT_APP_TESTNET || false; // habilitar red de pruebas

if (testnet) {
  TOKEN = "0xd5881b890b443be0c609BDFAdE3D8cE886cF9BAc";
  chainId = "0x61"; // bnb testnet
}

export default { API, WS, SC_Proxy, TOKEN, chainId, wallet_API };

