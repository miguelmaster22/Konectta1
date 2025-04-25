let proxy = "";
let API = process.env.REACT_APP_URL_API;

let WS = "0x0000000000000000000000000000000000000000"; //0x0000000000000000000000000000000000000000 recibe los huerfanos por defecto

let wallet_API = "0x6b78C6d2031600dcFAd295359823889b2dbAfd1B"

let SC_Proxy = "0x661b713da0e63F729f8895c0D8f7200287969042"; // contrato proxy nuevo v4

let TOKEN = "0x55d398326f99059fF775485246999027B3197955";
let chainId = "0x38"; // bnb mainnet

let testnet = false; // habilitar red de pruebas

if (testnet) {
  proxy = "";
  API = process.env.REACT_APP_URL_API_2;

  TOKEN = "0xd5881b890b443be0c609BDFAdE3D8cE886cF9BAc";
  chainId = "0x61"; // bnb testnet
}

export default { proxy, API, WS, SC_Proxy, TOKEN, chainId, wallet_API };
