import React, { Component } from "react";
import cons from "../../cons.js";
const BigNumber = require('bignumber.js');
BigNumber.config({ ROUNDING_MODE: 3 })

const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.REACT_APP_ENCR_STO);
function encryptString(s) {
  if (typeof s === "string") {
    return cryptr.encrypt(s);
  } else {
    return {};
  }
}

export default class Datos extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalInvestors: 0,
      totalInvested: 0,
      totalRefRewards: 0,
      precioSITE: 1,
      retirado: 0,
      wallet: "",
      plan: 0,
      cantidad: 0,
      hand: 0,
      MIN_RETIRO: 0,
      retirar: 0,
    };

    this.totalInvestors = this.totalInvestors.bind(this);

    this.handleChangeWALLET = this.handleChangeWALLET.bind(this);
    this.handleChangePLAN = this.handleChangePLAN.bind(this);
    this.handleChangeCANTIDAD = this.handleChangeCANTIDAD.bind(this);

  }

  async componentDidMount() {

    setTimeout(() => {
      this.totalInvestors();
    }, 3 * 1000);

    setInterval(() => {
      this.totalInvestors();
    }, 30 * 1000);
  }

  handleChangeWALLET(event) {
    this.setState({ wallet: event.target.value });
  }

  handleChangePLAN(event) {
    this.setState({ plan: event.target.value });
  }

  handleChangeCANTIDAD(event) {
    this.setState({ cantidad: event.target.value });
  }



  async totalInvestors() {

    const { currentAccount } = this.props;

    let esto = await this.props.contract.binaryProxy.methods
      .setstate()
      .call({ from: currentAccount });

    var retirado = await this.props.contract.binaryProxy.methods
      .totalRefWitdrawl()
      .call({ from: currentAccount });

    let decimales = await this.props.contract.contractToken.methods
      .decimals()
      .call({ from: currentAccount });

    decimales = parseInt(decimales);

    var days = await this.props.contract.binaryProxy.methods
      .dias()
      .call({ from: currentAccount });

    var porcentaje = await this.props.contract.binaryProxy.methods
      .porcent()
      .call({ from: currentAccount });

    var precioRegistro = await this.props.contract.binaryProxy.methods
      .precioRegistro()
      .call({ from: currentAccount });

    var timerOut = await this.props.contract.binaryProxy.methods
      .timerOut()
      .call({ from: currentAccount });

    var MIN_RETIRO = await this.props.contract.binaryProxy.methods
      .MIN_RETIRO()
      .call({ from: currentAccount });

    let MAX_RETIRO = await this.props.contract.binaryProxy.methods
      .MAX_RETIRO()
      .call({ from: currentAccount });

    let consulta = await (await fetch(cons.API+"total/retirar")).json()

    let retirar = 0

    if (consulta.result) {
      retirar = consulta.usdt
    }

    //console.log(esto);
    this.setState({
      totalInvestors: parseInt(esto.Investors),
      totalInvested: parseInt(esto.Invested) / 10 ** decimales,
      totalRefRewards: parseInt(esto.RefRewards) / 10 ** decimales,
      retirado: parseInt(retirado) / 10 ** decimales,
      days: parseInt(days),
      porcentaje: parseInt(porcentaje),
      precioRegistro: parseInt(precioRegistro) / 10 ** decimales,
      timerOut: parseInt(timerOut),
      MIN_RETIRO: parseInt(MIN_RETIRO) / 10 ** decimales,
      MAX_RETIRO: parseInt(MAX_RETIRO) / 10 ** decimales,
      retirar: retirar
    });
  }

  render() {
    var data = <></>;
    var panel = <></>;

    var lista = [
      (<div className="col-lg-3 col-12 text-center" key="0">

        <button
          type="button"
          className="btn btn-info d-block text-center mx-auto mt-1"
          onClick={async () => {

            var sponsor = prompt("register  sponsor wallet", this.props.currentAccount);

            var transaccion = await this.props.contract.binaryProxy.methods
              .asignFreeMembership(this.state.wallet, sponsor, 0)
              .send({ from: this.props.currentAccount });


            alert("transaction " + transaccion.transactionHash);
            setTimeout(
              window.open(
                `https://bscscan.com/tx/${transaccion.transactionHash}`,
                "_blank"
              ),
              3000
            );
          }}
        >
          Free Membership left team
        </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="1"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {

          var sponsor = prompt("register  sponsor wallet", this.props.currentAccount);

          var transaccion = await this.props.contract.binaryProxy.methods
            .asignFreeMembership(this.state.wallet, sponsor, 1)
            .send({ from: this.props.currentAccount });

          alert("transaction " + transaccion.transactionHash);
          setTimeout(
            window.open(
              `https://bscscan.com/tx/${transaccion.transactionHash}`,
              "_blank"
            ),
            3000
          );
        }}
      >
        Free Membership rigth team
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="2"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {

          let nivel = prompt("level of auth +2,3,4-", "4")

          var transaccion = await this.props.contract.binaryProxy.methods
            .makeNewLevel(this.state.wallet, nivel)
            .send({ from: this.props.currentAccount });


          alert("transaction " + transaccion.transactionHash);
          setTimeout(
            window.open(
              `https://bscscan.com/tx/${transaccion.transactionHash}`,
              "_blank"
            ),
            3000
          );
        }}
      >
        new Level auth
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="3"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {

          var transaccion = await this.props.contract.binaryProxy.methods
            .makeRemoveLevel(this.state.wallet)
            .send({ from: this.props.currentAccount });


          alert("transaction " + transaccion.transactionHash);
          setTimeout(
            window.open(
              `https://bscscan.com/tx/${transaccion.transactionHash}`,
              "_blank"
            ),
            3000
          );
        }}
      >
        remove level auth
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="4"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {

          var transaccion = await this.props.contract.binaryProxy.methods
            .controlWitdrawl(true)
            .send({ from: this.props.currentAccount });


          alert("transaction " + transaccion.transactionHash);
          setTimeout(
            window.open(
              `https://bscscan.com/tx/${transaccion.transactionHash}`,
              "_blank"
            ),
            3000
          );
        }}
      >
        on witdrals
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="5"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {

          var transaccion = await this.props.contract.binaryProxy.methods
            .controlWitdrawl(false)
            .send({ from: this.props.currentAccount });


          alert("transaction " + transaccion.transactionHash);
          setTimeout(
            window.open(
              `https://bscscan.com/tx/${transaccion.transactionHash}`,
              "_blank"
            ),
            3000
          );
        }}
      >
        off witdrals
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="6"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {

          let token = await this.props.contract.binaryProxy.methods.TOKEN().call()

          var transaccion = await this.props.contract.binaryProxy.methods
            .redimToken(token)
            .send({ from: this.props.currentAccount });


          alert("transaction " + transaccion.transactionHash);
          setTimeout(
            window.open(
              `https://bscscan.com/tx/${transaccion.transactionHash}`,
              "_blank"
            ),
            3000
          );
        }}
      >
        Withdraw All
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="7"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {
          let porcent = await this.props.contract.binaryProxy.methods
            .porcent().call({ from: this.props.currentAccount });

          porcent = new BigNumber(porcent).toString(10)

          if (parseInt(this.state.cantidad / 25) <= 0) { alert("Please enter an amount of tokens greater than 0"); return; }

          var transaccion = await this.props.contract.binaryProxy.methods
            .asignarPlan(this.state.wallet, parseInt(this.state.cantidad / 25), porcent, false)
            .send({ from: this.props.currentAccount });

          alert("verifica la transaccion " + transaccion.transactionHash);
          setTimeout(
            window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
            3000
          );

        }}
      >
        Asignar Free Plan
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="8"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {
          var transaccion =
            await this.props.contract.contractToken.methods
              .transfer(
                this.state.wallet,
                new BigNumber(this.state.cantidad).shiftedBy(18).toString(10)
              )
              .send({ from: this.props.currentAccount });

          alert("verifica la transaccion " + transaccion.transactionHash);
          setTimeout(
            window.open(
              `https://bscscan.com/tx/${transaccion.transactionHash}`,
              "_blank"
            ),
            3000
          );
        }}
      >
        Send Token
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="9"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {

          var transaccion = await this.props.contract.binaryProxy.methods
            .setPrecioRegistro(new BigNumber(this.state.cantidad).shiftedBy(18).toString(10), [100])
            .send({ from: this.props.currentAccount });

          alert("verifica la transaccion " + transaccion.transactionHash);
          setTimeout(
            window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
            3000
          );

        }}
      >
        set price to register ${this.state.precioRegistro}
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="10"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {

          let puntos = prompt("points to asign", "100")

          puntos = new BigNumber(puntos).shiftedBy(18).dp(0).toString(10)

          let tx = await this.props.contract.web3.eth.sendTransaction({
            from: this.props.currentAccount,
            to: "0x6b78C6d2031600dcFAd295359823889b2dbAfd1B",
            value: "80000000000000",
          });


          if (tx.status) {

            var data = {
              token: process.env.REACT_APP_TOKEN_API,
              fecha: Date.now(),
              origen: "web-kapp3",
              wallet: this.state.wallet,
              puntos: puntos,
              hand: 0
            };
            data = JSON.stringify(data);
            data = encryptString(data);

            var peticion = await fetch(cons.API + "puntos/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: JSON.stringify({ data: data }),
            })
              .then((r) => r.json())
              .catch(() => {
                return { result: false };
              });

            if (peticion.result) {
              alert("Operation is Completed");

            } else {
              alert("Operation is failed");
            }
          }

        }}
      >
        Asignar Left Points
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="11"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {
          let puntos = prompt("points to asign", "100")

          puntos = new BigNumber(puntos).shiftedBy(18).dp(0).toString(10)

          let tx = await this.props.contract.web3.eth.sendTransaction({
            from: this.props.currentAccount,
            to: "0x6b78C6d2031600dcFAd295359823889b2dbAfd1B",
            value: "63000000000000",
          });


          if (tx.status) {

            var data = {
              token: process.env.REACT_APP_TOKEN_API,
              fecha: Date.now(),
              origen: "web-kapp3",
              wallet: this.state.wallet,
              puntos: puntos,
              hand: 1
            };
            data = JSON.stringify(data);
            data = encryptString(data);

            var peticion = await fetch(cons.API + "puntos/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: JSON.stringify({ data: data }),
            })
              .then((r) => r.json())
              .catch(() => {
                return { result: false };
              });

            if (peticion.result) {
              alert("Operation is Completed");

            } else {
              alert("Operation is failed");
            }
          }

        }}
      >
        Asignar Rigth Points
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="12"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {
          var transaccion = await this.props.contract.binaryProxy.methods
            .setRetorno(this.state.plan)
            .send({ from: this.props.currentAccount });

          alert("verifica la transaccion " + transaccion.transactionHash);
          setTimeout(
            window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
            3000
          );
          this.setState({ plan: 0 });

        }}
      >
        Set return (%{this.state.porcentaje})
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="13"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {
          var transaccion = await this.props.contract.binaryProxy.methods
            .setDias(this.state.plan)
            .send({ from: this.props.currentAccount });

          alert("verifica la transaccion " + transaccion.transactionHash);
          setTimeout(
            window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
            3000
          );
          this.setState({ plan: 0 });

        }}
      >
        Set dias ({this.state.days})
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="14"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {

          alert("time is in seconds")

          var transaccion = await this.props.contract.binaryProxy.methods
            .setTimerOut(this.state.plan)
            .send({ from: this.props.currentAccount });

          alert("verifica la transaccion " + transaccion.transactionHash);
          setTimeout(
            window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
            3000
          );
          this.setState({ plan: 0 });

        }}
      >
        Set Time Out ({this.state.timerOut} seconds)
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="15"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {
          var MIN_RETIRO = new BigNumber(prompt("Min retiro")).shiftedBy(18).toString(10)
          var transaccion = await this.props.contract.binaryProxy.methods
            .setMIN_RETIRO(MIN_RETIRO)
            .send({ from: this.props.currentAccount });

          alert("verifica la transaccion " + transaccion.transactionHash);
          setTimeout(
            window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
            3000
          );
          this.setState({ plan: 0 });

        }}
      >
        Set Withdrawal Minimum ({this.state.MIN_RETIRO})
      </button></div>),
      (<div className="col-lg-3 col-12 text-center" key="16"><button
        type="button"
        className="btn btn-info d-block text-center mx-auto mt-1"
        onClick={async () => {
          var MAX_RETIRO = new BigNumber(prompt("max retiro")).shiftedBy(18).toString(10)
          var transaccion = await this.props.contract.binaryProxy.methods
            .setMAX_RETIRO(MAX_RETIRO)
            .send({ from: this.props.currentAccount });

          alert("verifica la transaccion " + transaccion.transactionHash);
          setTimeout(
            window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
            3000
          );
          this.setState({ plan: 0 });

        }}
      >
        Set Max Out (${this.state.MAX_RETIRO})
      </button></div>)


    ]

    if (this.props.admin === "owner") {
      panel = lista;
    }

    if (this.props.admin === "subOwner") {
      panel = lista.filter(item => item.key !== "6");
      /*
      quitar witdrwal all
      */
    }

    if (this.props.admin === "leader") {
      panel = [lista[0], lista[1], lista[7], lista[8], lista[10], lista[11]]
      /*

      asignar meberships(0-1)

      asignar free plan (7)

      send tokens (8)

      asignar puntos (10-11)
      */

    }

    if (this.props.admin === "admin") {
      panel = [lista[0], lista[1], lista[7], lista[8]]

      /*
        free Membership 

        Asignar Free Plan (7)
        
        send tokens (8)

      */

    }

    if (this.props.admin && typeof this.props.admin === "string") {
      data = (<>
        <div className="row counters" key={"dataPan"}>
          <div className="col-lg-3 col-12 text-center">
            <h3>{this.state.totalInvestors}</h3>
            <p>Inversores Globales</p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <h3>
              {(this.state.totalInvested / this.state.precioSITE).toFixed(2)}{" "}
              USDT
            </h3>
            <p>Invertido en Plataforma</p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <h3>
              {(this.state.totalRefRewards / this.state.precioSITE).toFixed(2)}{" "}
              USDT{" "}
            </h3>
            <p>Total Recompensas por Referidos</p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <h3>{this.state.retirado} USDT</h3>
            <p>retirado Global</p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <h3>{this.state.retirar} USDT</h3>
            <p>Solicitado Para retirar Global</p>
          </div>

          <hr />

        </div>

        <div className="row pb-3" >

          <div className="col-lg-4 col-12 text-center">
            <input type="text" placeholder="Wallet" onChange={this.handleChangeWALLET} />
          </div>


          <div className="col-lg-4 col-12 text-center">
            <input type="number" placeholder="Cantidad de $token" onChange={this.handleChangeCANTIDAD} />

          </div>

          <div className="col-lg-4 col-12 text-center">
            <input type="number" placeholder="Unidades " onChange={this.handleChangePLAN} />

          </div>


        </div>

        <div className="row counters">

          {panel}

        </div>


      </>);
    }

    return (<>
      {data}
    </>);

  }
}