const { Web3 } = require("web3");
const Cryptr = require("cryptr");
const BigNumber = require("bignumber.js");
const cron = require('node-cron');

const services = require("../../services/index.js");

const env = process.env

const express = require("express");
const router = express.Router();

function delay(s) { return new Promise(res => setTimeout(res, s * 1000)); }

const WalletVacia = "0x0000000000000000000000000000000000000000"
const factorBlock = 1.7
const factorFail = 30
const abiContrato = require("../../abi/BinarySystemV4.json");


let allbinario = []
let binarioindexado = []

let appReady = false;

cron.schedule('0 0 */1 * * *', async () => {
  console.log('running a task every Hour scan Binary');

  appReady = false;

  await escalarRedV2(["0x04302e4e19552635EADd013eFe54E10f30BA1Bf2"])

  console.log('end task every Hour ');

}, null, true, 'America/Bogota');


const addressContrato = env.REACT_APP_SMARTCONTRACT; //Nevo v4

const KEY_Secreto = env.REACT_APP_ENCR_STO ?? "AAAAAAAAAAAAAAAA"; // cifrado secreto para evitar fugas de informacion sencible

const TOKEN = env.REACT_APP_TOKEN_API ?? "1234567890"; // Id de conecion para identificar

const RED = env.APP_RED ?? "https://bsc-dataseed.binance.org/";

let redes = ["https://bsc-dataseed1.binance.org/", "https://bsc-dataseed2.binance.org/", "https://bsc-dataseed3.binance.org/", "https://bsc-dataseed4.binance.org/"]

let web3 = new Web3(RED);
let web3_1 = new Web3(redes[0]);
let web3_2 = new Web3(redes[1]);
let web3_3 = new Web3(redes[2]);

let prinka = env.REACT_APP_PRIVATE_KY

//prinka = web3.eth.accounts.create("orginal new interactions")
//console.log(prinka)

//prinka = encryptString("...", env.REACT_APP_PRIVATE_CR2)
//console.log(prinka)

const account_1_priv = decryptString(prinka, env.REACT_APP_PRIVATE_CR2 ?? "AAAAAAAAAAAAAAAA");

web3.eth.accounts.wallet.add(account_1_priv);
web3_1.eth.accounts.wallet.add(account_1_priv);
web3_2.eth.accounts.wallet.add(account_1_priv);
web3_3.eth.accounts.wallet.add(account_1_priv);

const WALLET_API = web3.eth.accounts.wallet[0].address;
console.log("Wallet API: ", WALLET_API)

let nonces = 0;
let gasPrice = "1000000000";

let contrato = new web3_1.eth.Contract(abiContrato, addressContrato, { // nuevo proxy
  from: WALLET_API, // default from address
  //gasPrice: '3000000000' //defautl gas price
});

web3_3.eth
  .getGasPrice()
  .then((g) => {
    gasPrice = g;
  })
  .catch((e) => {
    console.log(e);
  });

nonce(0);

web3_3.eth.getBalance(WALLET_API).then(async (r) => {
  r = new BigNumber(r).shiftedBy(-18)
  //console.log("balance: " + r.toString(10) + " BNB")

  if (r.toNumber() > 0.3) {
    let evio = r.minus(0.2)
    /*
      let rawTransaction = {
        "from": WALLET_API,
        "nonce": await nonce(0),
        "gasPrice": web3.utils.toHex(gasPrice * 1e9),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": toAddress,
        "value": amountToSend
      }
    */
    //console.log("Enviar a Binance: " + evio.toString(10) + " BNB")

  }

})

async function nonce() {
  var activo = await web3_3.eth.getTransactionCount(WALLET_API, "pending");
  console.log(new BigNumber(activo).toString(10));

  gasPrice = new BigNumber(await web3_3.eth.getGasPrice())

  console.log("gas: " + gasPrice.toString(10) + " factor: " + factorBlock);

  if (activo > nonces) {
    nonces = activo;
  } else {
    nonces++;
  }

  return nonces;
}

function encryptString(s, KEY) {
  const cryptr = new Cryptr(KEY);
  if (typeof s === "string") {
    return cryptr.encrypt(s);
  } else {
    return {};
  }
}

function decryptString(s, KEY) {
  const cryptr = new Cryptr(KEY);
  if (typeof s === "string") {
    return cryptr.decrypt(s);
  } else {
    return {};
  }
}



escalarRedV2(["0x04302e4e19552635EADd013eFe54E10f30BA1Bf2"])

    

router.route("/").get((req, res) => {
  res.send({ online: true });
});

async function hacerTakeProfit(wallet) {

  wallet = wallet.toLowerCase()

  let result = {
    result: false,
  };

  let retBinario = new BigNumber(0);
  let user = null
  let newUser = {}

  try {
    user = await services.getUser((wallet).toLocaleLowerCase())

  } catch (error) {
    console.log(error.toString())
  }

  let puntosL = new BigNumber(user.lPuntos).minus(user.lReclamados).plus(user.lExtra).dp(0)
  let puntosR = new BigNumber(user.rPuntos).minus(user.rReclamados).plus(user.rExtra).dp(0)

  //puntos que ha ganado hasta el momento
  let puntosReclamados = puntosL.toNumber() <= puntosR.toNumber() ? puntosL : puntosR

  //sobre estos puntos calcula lo que puede retirar en USDT
  let retBin = retirableBinario(puntosL.toString(10), puntosR.toString(10))

  let puntosUsados = new BigNumber(0)

  if (new BigNumber(retBin).toNumber() <= 0) {
    retBin = 0
  } else {
    newUser.lReclamados = new BigNumber(user.lReclamados).plus(puntosReclamados).toString(10)
    newUser.rReclamados = new BigNumber(user.rReclamados).plus(puntosReclamados).toString(10)

    puntosUsados = new BigNumber(newUser.lReclamados)

  }

  retBinario = retBin

  let pRango = new BigNumber(0)

  let rangoArray = []

  for (let index = 0; index < 12; index++) {
    rangoArray[index] = await contrato.methods
      .rangoReclamado("0xcBD6272721306Cbc2621B6919481bD0a7d5f0ce3", 0)
      .call()
      .then((r) => {
        //console.log(index, r);
        return r;
      })
      .catch((e) => {
        console.log(e.toString());
        return false;
      });

  }

  let truerango = true;

  if (truerango) {
    pRango = puntosUsados
  }


  let gas = await contrato.methods
    .corteBinarioDo(wallet, retBinario, pRango.toString(10), 0)
    .estimateGas({ from: WALLET_API }); // gas: 1000000});

  await contrato.methods
    .corteBinarioDo(wallet, retBinario, pRango.toString(10), 0)
    .send({ gasPrice: gasPrice.toString(10), gas: gas })
    .then(async (r) => {
      await services.updateUser(wallet, newUser)
      console.log("Corte Binario: " + (wallet).toLowerCase())

      result.hash = r.transactionHash;
      result.result = true;
      result.error = false;
      console.log("Registro Retiro " + wallet);
    })
    .catch(async (e) => {
      let error = e.toString()
      if (error.indexOf("Transaction Hash: ") >= 0) {
        await services.updateUser(wallet, newUser)
        console.log("Corte Binario (2): " + (wallet).toLowerCase())

        result.hash = "operation processing is in progress please be patient";
        result.result = true;
        result.error = false;
        console.log("Registro Retiro " + wallet);

      } else {
        console.error(e);
        console.log("RR Fallo " + wallet);
        result.result = false;
        result.error = true;
        result.message = e.toString();

      }

    });


  consultarUsuario(wallet, true)

  return result;
}

router.route("/retiro").post(async (req, res) => {
  let result = {
    result: false,
    message: "no enter data"
  };

  if (typeof req.body.data === "string") {
    let data = JSON.parse(decryptString(req.body.data, KEY_Secreto));

    result.message = "reading data"
    if (
      data.token == TOKEN &&
      data.fecha + 5 * 60 * 1000 >= Date.now() //&&
      //data.origen === "web-huevo"
    ) {
      result.result = await hacerTakeProfit(data.wallet)
      result.message = "profit called"
    }
  }

  res.send(result);
});

async function estimateRetiro(wallet) {
  wallet = wallet.toLowerCase();

  let result = {
    result: false,
  };

  var retBinario = new BigNumber(0);

  let user = await consultarUsuario(wallet, true)

  let puntosL = new BigNumber(user.lPuntos).minus(user.lReclamados).plus(user.lExtra).dp(0)
  let puntosR = new BigNumber(user.rPuntos).minus(user.rReclamados).plus(user.rExtra).dp(0)

  let reclamados = puntosL <= puntosR ? puntosL : puntosR

  let retBin = retirableBinario(puntosL, puntosR) <= 0 ? 0 : retirableBinario(puntosL, puntosR)

  retBinario = new BigNumber(retBin)

  await contrato.methods.corteBinarioDo(wallet, retBinario.toString(10), reclamados.plus(user.lReclamados).toString(10), "0").estimateGas({ from: WALLET_API })
    .then((r) => {
      result.result = true;
      result.gas = new BigNumber(r).times(gasPrice).times(factorBlock);
      result.error = false;
      console.log(
        "calculo Retiro: " + wallet + " - " + retBinario.toString(10) + " | " + new BigNumber(r).toString(10)
      );
    })
    .catch((e) => {
      result.result = true;
      result.gas = new BigNumber(21000).times(gasPrice).times(factorFail);
      result.error = true;
      result.message = e.toString();
      console.log(result.message);
    });

  return result;

}

router.route("/calculate/retiro").post(async (req, res) => {
  let result = {
    result: false,
    error: true,
    message: "do nothing"
  };

  if (typeof req.body.data === "string") {
    var data = JSON.parse(decryptString(req.body.data, KEY_Secreto));


    if (data.token == TOKEN) {
      result = await estimateRetiro(data.wallet);
    }
  }

  res.send(result);
});

router.route("/binario/todo").get(async (req, res) => {
  let result = {
    result: true,
    data: allbinario
  };

  res.send(result);
});

function retirableBinario(puntosA, puntosB) {

  puntosA = new BigNumber(puntosA).toNumber()
  puntosB = new BigNumber(puntosB).toNumber()

  let amount = puntosA <= puntosB ? puntosA : puntosB;

  return new BigNumber(amount).times(10).dividedBy(100).dp(0).toString(10)

}

router.route("/usuario/actualizar").get(async (req, res) => {

  let result = {
    result: false
  };

  if (req.query.wallet) {

    let wallet = (req.query.wallet).toString().toLocaleLowerCase()

    result.result = await consultarUsuario(wallet, true, true)


  } else {

    result = {
      result: false,
      error: true,
      msg: "not valid wallet parameter"
    };
  }


  res.send(result);
});

async function binariV2(wallet) {
  wallet = (wallet).toLocaleLowerCase()

  let userTemp = await services.getUser(wallet)
  let newUserData = {}

  let puntosIz = new BigNumber(0)
  let puntosDe = new BigNumber(0)

  let personasIz = new BigNumber(0)
  let personasDe = new BigNumber(0)

  /// recordar restar puntos Extra de cada lado

  console.log("Binario in: " + userTemp)

  if (userTemp === null) {
    return false
  }

  if ((userTemp.left !== WalletVacia) || (userTemp.left !== "")) {

    await consultarUsuario(userTemp.left, false, true)

    let uleft = await services.getUser(userTemp.left)

    if (uleft !== null) {
      if (uleft.lPuntos !== undefined && uleft.rPuntos !== undefined) {

        puntosIz = puntosIz.plus(uleft.invested).times(50).dividedBy(100)
        puntosIz = puntosIz.plus(uleft.lPuntos).plus(uleft.rPuntos)

        if (puntosIz.toNumber() > new BigNumber(userTemp.lPuntos).toNumber()) {
          newUserData.lPuntos = puntosIz.toString(10)
        }

        personasIz = personasIz.plus(1).plus(uleft.lPersonas).plus(uleft.rPersonas)

        if (personasIz.toNumber() > new BigNumber(userTemp.lPersonas).toNumber()) {
          newUserData.lPersonas = personasIz.toString(10)
        }

      }
    }

  } else {
    newUserData.lPuntos = "0"
    newUserData.lPersonas = "0"
  }

  if ((userTemp.right !== WalletVacia) || (userTemp.right !== "")) {

    await consultarUsuario(userTemp.right, false, true)

    let uright = await services.getUser(userTemp.right)

    if (uright !== null) {
      if (uright.lPuntos !== undefined && uright.rPuntos !== undefined) {
        puntosDe = puntosDe.plus(uright.invested).times(50).dividedBy(100);
        puntosDe = puntosDe.plus(uright.lPuntos).plus(uright.rPuntos);

        if (puntosDe.toNumber() > new BigNumber(userTemp.rPuntos).toNumber()) {
          newUserData.rPuntos = puntosDe.toString(10)
        }

        personasDe = personasDe.plus(1).plus(uright.lPersonas).plus(uright.rPersonas)

        if (personasDe.toNumber() > new BigNumber(userTemp.rPersonas).toNumber()) {
          newUserData.rPersonas = personasDe.toString(10)
        }

      }
    }

  } else {
    newUserData.rPuntos = "0"
    newUserData.rPersonas = "0"
  }

  //puntos activos
  if ((userTemp.left !== "") && (userTemp.right !== "")) {

    let pL = new BigNumber(userTemp.lPuntos).plus(userTemp.lExtra).minus(userTemp.lReclamados)
    let pR = new BigNumber(userTemp.rPuntos).plus(userTemp.rExtra).minus(userTemp.rReclamados)

    if (pL.toNumber() < pR.toNumber()) {
      newUserData.puntosActivos = pL.toString(10)

    } else {
      newUserData.puntosActivos = pR.toString(10)
    }

  }

  await services.updateUser(wallet, newUserData)

  return true

}

router.route("/binario/actualizar").get(async (req, res) => {

  let { wallet } = req.query
  wallet = (wallet).toString().toLocaleLowerCase()

  if (wallet && wallet !== "" && wallet.length === 42) {

    res.status(200).json({ success: await binariV2(wallet) });

  } else {

    res.status(400).json({ success: false, message: "invalid: wallet parameter" });

  }


});

async function lecturaBinari(wallet) {

  await consultarUsuario(wallet, true)
  let user = await services.getUser(wallet)

  let puntosL = new BigNumber(user.lPuntos).minus(user.lReclamados).plus(user.lExtra).dp(0).toString(10)
  let puntosR = new BigNumber(user.rPuntos).minus(user.rReclamados).plus(user.rExtra).dp(0).toString(10)


  let retBin = retirableBinario(puntosL, puntosR)
  if (new BigNumber(retBin) < 0) {
    retBin = "0"
  }


  let consulta = {
    result: true,
    data: {
      retirableBinario: retBin,
      upline: user.up,
      invested: user.invested,
      invested_leader: user.invested_leader,
      upTo: user.upTo,
      left: {
        dowline: user.left,
        puntos: new BigNumber(user.lPuntos).minus(user.lReclamados).plus(user.lExtra).dp(0).toString(10),
        usados: user.lReclamados,
        total: new BigNumber(user.lPuntos).plus(user.lExtra).dp(0).toString(10),
        personas: parseInt(user.lPersonas)
      },
      right: {
        dowline: user.right,
        puntos: new BigNumber(user.rPuntos).minus(user.rReclamados).plus(user.rExtra).dp(0).toString(10),
        usados: user.lReclamados,
        total: new BigNumber(user.rPuntos).plus(user.rExtra).dp(0).toString(10),
        personas: parseInt(user.rPersonas)
      }
    }
  }

  //console.log(consulta)
  return consulta;

}

router.route("/binario").get(async (req, res) => {

  let result = {
    result: false
  };


  if (req.query.wallet) {

    let wallet = (req.query.wallet).toString().toLocaleLowerCase()

    result = await lecturaBinari(wallet)


  } else {

    result = {
      result: false,
      error: true,
      msg: "not valid wallet parameter"
    };
  }


  res.send(result);
});

async function consultarBinario() {
  let red = []

  try {

    red = await services.getAllUsers()

    if (red.length > 0) {

      console.log("Inicia reduce")
      let inicio = Date.now()
      appReady = false
      delete binarioindexado;
      binarioindexado = red.reduce((acc, el, index) => {
        acc[el.wallet] = el;
        if (index == red.length - 1) {
          appReady = true
          console.log("Termino reduce: " + ((Date.now() - inicio) / 1000) + " seg")
          console.log("statusApp->" + appReady)

        }

        return acc
      }, red[0])


    }




  } catch (error) {
    console.log(error.toString())
  }
  //console.log(red)

  return appReady

}

router.route("/puntos/add").post(async (req, res) => {

  let result = {
    result: false,
  };

  if (typeof req.body.data === "string") {
    let { token, wallet, puntos, hand } = JSON.parse(decryptString(req.body.data, KEY_Secreto));

    if (token == TOKEN) {

      if ("puntos" in data) {

        let user = await services.getUser(wallet)

        let newUser = {}

        if (hand === 0) {
          newUser.lExtra = new BigNumber(user.lExtra).plus(puntos).toString(10)

        } else {
          newUser.rExtra = new BigNumber(user.rExtra).plus(puntos).toString(10)
        }

        await services.updateUser(wallet)
        console.log("puntos asignados: " + (wallet).toLocaleLowerCase() + " hand: " + hand + " -> " + puntos)

        await consultarUsuario((wallet).toLocaleLowerCase(), true, true, true)

        result.result = true
      } else {
        result.msg = "not correct value"

      }
    } else {
      result.msg = "not auth"
    }
  } else {
    result.msg = "data not found"
  }

  res.send(result);
})

async function escalarRedV2() {
  await consultarBinario();
  let lista2 = await services.getAllUsers()

  console.log("---- V2 Start Loop / escalar red LISTA ----")

  for (let index = 0; index < lista2.length; index++) {
    //console.log(index, lista2[index].wallet, lista2[index].idBlock)
    await delay(0.4);
    await conectarUpline(lista2[index].wallet)
    await binariV2(lista2[index].wallet)

  }

  console.log("----v2 END Loop / escalar red ----")
  await consultarBinario();
}

async function conectarUpline(from) {
  from = from.toLowerCase()

  let newUser = {}

  let userRef = null
  let userTemp = null;

  try {
    userTemp = await services.getUser(from)

  } catch (error) {
    console.log(error.toString())
  }

  if (userTemp === null) return false;

  //cambiar esto por metodo de consulta a base de datos mitigar error api binance por muchas consultas
  let consulta = await contrato.methods.upline(from).call()
    .catch((e) => {
      console.log("Error consulta binance " + e.toString())
      return false
    })

  if (consulta === false) return false;

  let hand = parseInt(consulta._lado);
  let referer = (consulta._referer).toLowerCase();

  try {
    userRef = await services.getUser(referer)
  } catch (error) {
    console.log(error.toString())
  }

  let result = false

  if (userRef !== null) {
    if (referer !== WalletVacia || referer !== "") {
      newUser.referer = referer

      if (userTemp.up === userTemp.wallet) {
        newUser.up = WalletVacia
      }

      if (userTemp.referer !== WalletVacia && userTemp.up === WalletVacia) {

        //console.log("user: " + from + " up: " + userTemp.up + " hand: " + hand + " padre: " + padre)
        //if (userTemp.up === WalletVacia ) {}

        //console.log("<<<<< upline no coneted: " + from + ">>>>>")
        if (parseInt(hand) === 0) {
          let ubication = null
          try {
            ubication = await services.getUser(from)
          } catch (error) {
            console.log(error.toString())
          }

          if (ubication.length >= 1) {

            if (ubication.length === 1) {

              if (userTemp.up !== ubication[0].wallet) {
                console.log("Ubicado izquierda largo1 " + from + " up: " + ubication[0].wallet)
                await services.updateUser(from, { up: ubication[0].wallet })
              }


            } else {

              console.log("eliminando izquierda  " + ubication.length + " " + from)

              // debe de encontrarse el correcto y eliminar el registro de los demas
              //console.log(ubication)
              let menor = ubication[0].idBlock;
              let ganador = 0;
              for (let index = 0; index < ubication.length; index++) {
                if (ubication[index].idBlock !== 0) {

                  if (ubication[index].idBlock < menor) {
                    menor = ubication[index].idBlock;
                    ganador = index;
                  }
                }
              }

              await services.updateUser(from, { up: ubication[ganador].wallet })

              for (let index = 0; index < ubication.length; index++) {
                if (index !== ganador) {
                  await services.updateUser(ubication[index].wallet, { left: WalletVacia, lPuntos: "0" })

                }

              }

            }

          } else {
            // debe ubicarlo en alguna parte del binario
            console.log(">Ubicando izquierda " + from + " ref: " + referer)
            let accion = 0
            let lista = []

            let buscando = referer;// wallet del uperline

            while (accion === 0) {
              try {
                userRef = await services.getUser(buscando)
              } catch (error) {
                console.log(error.toString())
              }

              if (userRef === null) {
                consultarUsuario(userRef.wallet)
                accion = 4
                break;
              }

              if (userRef.left === from) {
                await services.updateUser(from, { up: userRef.wallet })
                accion = 1
                break;
              }


              if (userRef.left === WalletVacia && userRef.wallet !== from) {

                await services.updateUser(userRef.wallet, { left: from })
                await services.updateUser(from, { up: userRef.wallet })

                accion = 2
                break;

              }

              if (lista.indexOf(userRef.wallet) === -1) {
                lista.push(userRef.wallet)
              } else {

                await services.updateUser(userRef.wallet, { left: WalletVacia, lPuntos: "0" })

                accion = 5
                break;

              }

              buscando = userRef.left


            }

            console.log(">Termina ubicación izquierda accion:" + accion + " " + from + " ^ " + buscando)

          }

          let adverso = null
          try {
            adverso = await services.getUser(from)
          } catch (error) {
            console.log(error.toString())
          }

          for (let index = 0; index < adverso.length; index++) {
            await services.updateUser(adverso[index].wallet, { right: WalletVacia, rPuntos: "0" })
          }

        }

        if (parseInt(hand) === 1) {
          let ubication = null
          try {
            ubication = await services.getUser(from)
          } catch (error) {
            console.log(error.toString())
          }

          if (ubication.length >= 1) {

            if (ubication.length === 1) {
              if (userTemp.up !== ubication[0].wallet) {
                console.log("Ubicado derecha largo1 " + from + " ref: " + referer)
                await services.updateUser(from, { up: ubication[0].wallet })
              }
            } else {

              console.log("eliminando derecha  " + ubication.length + " " + from)

              let menor = ubication[0].idBlock;
              let ganador = 0;
              for (let index = 0; index < ubication.length; index++) {
                if (ubication[index].idBlock !== 0) {
                  if (ubication[index].idBlock < menor) {
                    menor = ubication[index].idBlock;
                    ganador = index;
                  }
                }

              }

              await services.updateUser(from, { up: ubication[ganador].wallet })

              for (let index = 0; index < ubication.length; index++) {
                if (index !== ganador) {
                  await services.updateUser(ubication[ganador].wallet, { right: WalletVacia, rPuntos: "0" })

                }

              }

            }

          } else {
            // debe ubicarlo en alguna parte del binario
            console.log(">Ubicando derecha " + from)
            let accion = 0
            let lista = []
            let buscando = referer;// wallet del uperline

            while (accion === 0) {
              try {
                userRef = await services.getUser(buscando)
              } catch (error) {
                console.log(error.toString())
              }

              if (userRef === null) {
                consultarUsuario(buscando)
                accion = 4
                break;
              }

              if (userRef.right === from) {
                await services.updateUser(from, { up: userRef.wallet })

                accion = 1
                break;
              }


              if (userRef.right === WalletVacia && userRef.wallet !== from) {
                await services.updateUser(userRef.wallet, { right: from })
                await services.updateUser(from, { up: userRef.wallet })

                accion = 2
                break;

              }

              if (lista.indexOf(buscando) === -1) {
                lista.push(buscando)
              } else {
                await services.updateUser(buscando, { right: WalletVacia, rPuntos: "0" })

                accion = 5
                break;

              }

              buscando = userRef.right


            }

            console.log(">Termina ubicación derecha accion:" + accion + " " + from + " ^ " + buscando)

          }

          let adverso = null
          try {
            adverso = await services.getUser(from)
          } catch (error) {
            console.log(error.toString())
          }

          for (let index = 0; index < adverso.length; index++) {
            await services.updateUser(adverso[index].wallet, { left: WalletVacia, lPuntos: "0" })
          }

        }
      }



    } else {
      console.log("wallet: " + from + " sin referer valido: " + referer)
    }

    await services.updateUser(from, newUser)
    await consultarUsuario(from, true);

  } else {
    //console.log(from + " no existe, Upline: " + upline._referer+" wallet vacia no registrado")
    if (referer !== WalletVacia) {
      consultarUsuario(referer, true, true);
    }

    result = true
  }

  userTemp = await services.getUser(from)

  if (from !== WalletVacia && !userTemp.registered && userTemp.lReclamados === "0" && userTemp.rReclamados === "0" && (userTemp.lastUpdate === 0 || userTemp.lastUpdate < Date.now() - 86400 * 1000)) {
    console.log("Cuenta inactiva:  " + from)
    services.deleteUser(from)

    result = false

  }

  return result;
}

async function consultarUsuario(from, agregateBinario, updateInfoBlockchain, conectarUp) {
  from = from.toLowerCase()

  if (from === "0x0000000000000000000000000000000000000000") return {};

  let userTemp = null;

  if (updateInfoBlockchain) {
    await actualizarUsuario(from, {}, false) /// deshabilitar recuecuperacion reclamado del v1
  }

  userTemp = await services.getUser(from)

  if (agregateBinario) {
    binarioindexado[from] = userTemp
    //console.log("Actualizado localmente: " + from)

  }

  if (conectarUp) {
    await conectarUpline(from)
    try {
      userTemp = await services.getUser(from)

    } catch (error) {
      console.log(error.toString())
    }
  }

  return userTemp

}

async function actualizarUsuario(from, data) {
  from = from.toLowerCase()

  let userTemp = await services.getUser(from)

  if (userTemp === null) return false;

  let newUser = {}
  let investorNew = { registered: false }
  let realInvested = new BigNumber(0);

  try {
    investorNew = await contrato.methods.investors(from).call()
  } catch (error) { 
    console.log(error.toString())
    return false
  }

  let invertido = new BigNumber(0)
  let leader = new BigNumber(0)
  let upTo = new BigNumber(0)
  let porcentaje = await contrato.methods.porcent().call()

  if (investorNew.registered) {
    newUser.idBlock = parseInt(await contrato.methods.addressToId(from).call())
    newUser.registered = true;

    let consulta = await contrato.methods.upline(from).call()

    newUser.hand = parseInt(consulta._lado);
    if (newUser.hand <= 1 && userTemp.referer === WalletVacia) {
      newUser.referer = (consulta._referer).toLowerCase();
    }

    let depositos = await contrato.methods.verListaDepositos(from).call();

    for (let index = 0; index < depositos.length; index++) {
      let dep = new BigNumber(depositos[index].valor)

      if (depositos[index].pasivo) {
        invertido = invertido.plus(dep)
      } else {
        leader = leader.plus(dep)
      }

    }

    if (leader.toNumber(0) > 0) {
      if (invertido.toNumber() > realInvested.toNumber()) {
        realInvested = invertido;
      }
    } else {
      realInvested = new BigNumber(investorNew.invested)
    }

    newUser.retirableA = new BigNumber(await contrato.methods.retirableA(from).call()).toNumber()
    newUser.lastUpdate = Date.now()

  } else {
    newUser.registered = false;

  }

  newUser.invested = realInvested.toString(10)
  newUser.invested_leader = leader.toString(10)
  newUser.upTo = upTo.plus(investorNew.invested).times(porcentaje).dividedBy(100).toString(10)


  if (data.lReclamados) {
    newUser.lReclamados = new BigNumber(userTemp.lReclamados).plus(data.lReclamados).toString(10)
  }
  if (data.lExtra) {
    newUser.lExtra = new BigNumber(userTemp.lExtra).plus(data.lExtra).toString(10)
  }

  if (data.rReclamados) {
    newUser.rReclamados = new BigNumber(userTemp.rReclamados).plus(data.rReclamados).toString(10)
  }
  if (data.rExtra) {
    newUser.rExtra = new BigNumber(userTemp.rExtra).plus(data.rExtra).toString(10)
  }

  if (!userTemp.lPuntos) {
    newUser.lPuntos = "0"
  }
  if (!userTemp.rPuntos) {
    newUser.rPuntos = "0"
  }
  if (!userTemp.lPersonas) {
    newUser.lPersonas = "0"
  }
  if (!userTemp.rPersonas) {
    newUser.rPersonas = "0"
  }

  await services.updateUser(from, newUser)

  return true;

}

router.route("/total/retirar").get(async (req, res) => {

  /*
   escalarRedV2();
  */
  //await consultarUsuario("0x0ee1168b2e5d2ba5e6ab4bf6ca00881981d84ab9",false,true)

  let consulta = await services.getAllUsers()

  const initialValue = new BigNumber(0);
  const sumWithInitial = consulta.reduce(
    (accumulator, currentValue) => {
      if (new BigNumber(currentValue.retirableA).shiftedBy(-18).toNumber() > new BigNumber(5).toNumber()) {
        accumulator = accumulator.plus(currentValue.retirableA)
      }

      return accumulator
    },
    initialValue,
  );

  let result = {
    result: true,
    usdt: new BigNumber(sumWithInitial).shiftedBy(-18).dp(6),
    total: sumWithInitial.toString(10)
  };

  res.send(result);
});


module.exports = router;