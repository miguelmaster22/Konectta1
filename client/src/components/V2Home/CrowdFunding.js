import React, { Component } from "react";
import cons from "../../cons.js";

const BigNumber = require("bignumber.js");

export default class CrowdFunding extends Component {
  constructor(props) {
    super(props);

    this.state = {
      min: 100,
      deposito: "Loading...",
      balance: "Loading...",
      currentAccount: this.props.currentAccount,
      porcentaje: "Loading...",
      dias: "Loading...",
      partner: "Loading...",
      balanceTRX: "Loading...",
      balanceUSDT: "Loading...",
      precioSITE: 1,
      valueUSDT: 1,
      valueUSDTResult: 25,
      hand: 0,
      balanceSite: 0,
      ModalTitulo: "",
      ModalBody: "",
      id: "##",
      upline: "----------------------"

    };

    this.deposit = this.deposit.bind(this);
    this.estado = this.estado.bind(this);

    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);
    this.handleChangeUSDTResult = this.handleChangeUSDTResult.bind(this);

  }

  async handleChangeUSDT(event) {
    let value = event.target.value;

    if (parseInt(value) < 1) {
      value = 1;
    }


    this.setState({
      valueUSDT: value,
      valueUSDTResult: parseInt(value * 25),
    });

    document.getElementById('value').value = parseInt(value * 25)
  }

  async handleChangeUSDTResult(event) {
    let value = event.target.value;

    this.setState({
      valueUSDTResult: value,
      valueUSDT: parseInt(value / 25),
    });

    document.getElementById('contracts').value = parseInt(value / 25)

  }

  async componentDidMount() {
    setTimeout(() => {
      this.estado();
      //this.migrate(this.props.currentAccount);
    }, 3 * 1000);

    setInterval(() => {
      this.estado();
    }, 10 * 1000);
  }

  async estado() {
    let accountAddress = this.props.currentAccount;
    let inversors = await this.props.contract.binaryProxy.methods
      .investors(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

    var nameToken1 = await this.props.contract.contractToken.methods
      .symbol()
      .call({ from: this.props.currentAccount });

    var aprovado = await this.props.contract.contractToken.methods
      .allowance(accountAddress, this.props.contract.binaryProxy._address)
      .call({ from: this.props.currentAccount });

    if (aprovado > 0) {
      if (!inversors.registered) {
        aprovado = "Register";
      } else {
        aprovado = "Buy Plan";
      }
    } else {
      aprovado = "Allow wallet";
    }

    inversors.inicio = 1000;

    let tiempo = await this.props.contract.binaryProxy.methods
      .tiempo()
      .call({ from: this.props.currentAccount });

    tiempo = parseInt(tiempo) * 1000;

    var porcentiempo = ((Date.now() - inversors.inicio) * 100) / tiempo;

    var decimales = await this.props.contract.contractToken.methods
      .decimals()
      .call({ from: this.props.currentAccount });
    decimales = parseInt(decimales);

    var balance = await this.props.contract.contractToken.methods
      .balanceOf(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

    balance = new BigNumber(parseInt(balance)).shiftedBy(-decimales).toString(10);

    var valorPlan = 0;

    if (porcentiempo < 100) {
      aprovado = "Update Plan";

      valorPlan = inversors.plan / 10 ** 8;
    }

    var partner = cons.WS;

    var hand = "Left ";

    if (inversors.registered) {
      partner = await this.props.contract.binaryProxy.methods
        .padre(this.props.currentAccount)
        .call({ from: this.props.currentAccount });


      if (partner !== "0x0000000000000000000000000000000000000000") {

        let partner_b = await this.props.contract.binaryProxy.methods.upline(this.props.currentAccount).call()

        let lado = parseInt(partner_b._lado);

        if (lado < 2) {
          if (lado === 0) {
            partner = "Left of " + partner
          } else {
            partner = "Right of " + partner

          }
        }


      } else {
        partner = "---------------------------------";
      }




    } else {
      var loc = document.location.href;
      if (loc.indexOf("?") > 0) {
        var getString = loc.split("?");
        //console.log(getString)
        getString = getString[getString.length - 1];
        //console.log(getString);
        var GET = getString.split("&");
        var get = {};
        for (var i = 0, l = GET.length; i < l; i++) {
          var tmp = GET[i].split("=");
          get[tmp[0]] = unescape(decodeURI(tmp[1]));
        }

        if (get["hand"]) {
          tmp = get["hand"].split("#");

          //console.log(tmp);

          if (tmp[0] === "right") {
            hand = "Rigth ";
          }
        }

        if (get["ref"]) {
          tmp = get["ref"].split("#");

          //console.log(tmp[0]);

          var wallet = await this.props.contract.binaryProxy.methods
            .idToAddress(tmp[0])
            .call({ from: this.props.currentAccount });

          inversors = await this.props.contract.binaryProxy.methods
            .investors(wallet)
            .call({ from: this.props.currentAccount });
          //console.log(wallet);
          if (inversors.registered) {
            partner = hand + " of " + wallet;
          }
        }
      }
    }



    let dias = await this.props.contract.binaryProxy.methods
      .tiempo()
      .call({ from: this.props.currentAccount });

    dias = parseInt(dias);

    let porcentaje = await this.props.contract.binaryProxy.methods
      .porcent()
      .call({ from: this.props.currentAccount });

    porcentaje = parseInt(porcentaje);

    let decimals = await this.props.contract.contractToken.methods
      .decimals()
      .call({ from: this.props.currentAccount });
    decimals = parseInt(decimals);

    let balanceUSDT = await this.props.contract.contractToken.methods
      .balanceOf(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

    balanceUSDT = parseInt(balanceUSDT) / 10 ** decimals;

    const investorNew = await this.props.contract.binaryProxy.methods
      .investors(this.props.currentAccount)
      .call();

    this.setState({
      deposito: aprovado,
      balance: valorPlan,
      decimales: decimales,
      accountAddress: accountAddress,
      porcentaje: porcentaje,
      dias: dias,
      partner: partner,
      balanceSite: balance,
      balanceUSDT: balanceUSDT,
      nameToken1: nameToken1,
      investorNew: investorNew,
    });

    if (this.props.investor.registered) {
      let inves = this.props.investor
      this.setState({
        id: inves.id,
        upline: inves.upline
      })
    }
  }

  async deposit() {

    if (this.props.view) {
      this.setState({
        ModalTitulo: "ALERT!",
        ModalBody: "Is only view mode"
      })
      window.$("#alert").modal("show");

      return;
    }

    if (this.props.investor.old_version && !this.props.investor.migrated) {
      this.setState({
        ModalTitulo: "INFO",
        ModalBody: "Please migrate this acount first"
      })
      window.$("#alert").modal("show");
      return;
    }

    if (!this.state.investorNew.registered && false) {
      this.setState({
        ModalTitulo: "Global migration in progress",
        ModalBody: "At this moment we are in the migration process, you must wait for this to finish to make a deposit or register"
      })
      window.$("#alert").modal("show");

      return;
    }

    var { balanceSite, valueUSDT, balance } = this.state;


    var aprovado = await this.props.contract.contractToken.methods
      .allowance(
        this.props.currentAccount,
        this.props.contract.binaryProxy._address
      )
      .call({ from: this.props.currentAccount });

    aprovado = new BigNumber(aprovado).shiftedBy(-18).toNumber()

    if (aprovado <= 10000) {
      await this.props.contract.contractToken.methods
        .approve(
          this.props.contract.binaryProxy._address,
          "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        )
        .send({ from: this.props.currentAccount });

      this.setState({
        ModalTitulo: "INFO",
        ModalBody: "Balance approval for exchange: successful"
      })
      window.$("#alert").modal("show");
      aprovado = await this.props.contract.contractToken.methods
        .allowance(
          this.props.currentAccount,
          this.props.contract.binaryProxy._address
        )
        .call({ from: this.props.currentAccount });
    }

    let amount = await this.props.contract.binaryProxy.methods
      .plan()
      .call({ from: this.props.currentAccount });
    amount = new BigNumber(parseInt(amount)).shiftedBy(-18).toNumber();
    amount = amount * valueUSDT;
    amount = amount - balance;

    if (aprovado > 0 && balanceSite >= amount) {
      var loc = document.location.href;
      var sponsor = cons.WS;
      var hand = 0;
      let investors = await this.props.contract.binaryProxy.methods
        .investors(this.props.currentAccount)
        .call({ from: this.props.currentAccount });

      if (investors.registered) {
        sponsor = await this.props.contract.binaryProxy.methods
          .padre(this.props.currentAccount)
          .call({ from: this.props.currentAccount });
      } else {
        if (loc.indexOf("?") > 0) {
          var getString = loc.split("?");
          getString = getString[getString.length - 1];
          //console.log(getString);
          var GET = getString.split("&");
          var get = {};
          for (var i = 0, l = GET.length; i < l; i++) {
            var tmp = GET[i].split("=");
            get[tmp[0]] = unescape(decodeURI(tmp[1]));
          }

          if (get["hand"]) {
            tmp = get["hand"].split("#");

            if (tmp[0] === "right") {
              hand = 1;
            }
          }

          if (get["ref"]) {
            tmp = get["ref"].split("#");

            var wallet = await this.props.contract.binaryProxy.methods
              .idToAddress(tmp[0])
              .call({ from: this.props.currentAccount });

            var padre = await this.props.contract.binaryProxy.methods
              .investors(wallet)
              .call({ from: this.props.currentAccount });

            if (padre.registered) {
              sponsor = wallet;
            }
          }
        }
      }

      // registered referer 

      let refererInvest = await this.props.contract.binaryProxy.methods
        .investors(sponsor)
        .call({ from: this.props.currentAccount });

      if (!refererInvest.registered) {
        this.setState({
          ModalTitulo: "INFO",
          ModalBody: "Your referral must be migrated in order to continue with the process"
        })
        window.$("#alert").modal("show");
        return;
      }

      if (
        !investors.registered &&
        sponsor !== "0x0000000000000000000000000000000000000000"
      ) {
        await this.props.contract.binaryProxy.methods
          .registro(sponsor, hand)
          .send({ from: this.props.currentAccount });
        this.setState({
          ModalTitulo: "INFO",
          ModalBody: "congratulation registration: successful"
        })
        window.$("#alert").modal("show");
        sponsor = await this.props.contract.binaryProxy.methods
          .padre(this.props.currentAccount)
          .call({ from: this.props.currentAccount });
      } else {
        if (!investors.registered) {
          this.setState({
            ModalTitulo: "CHECK",
            ModalBody: "You need a referral link to register"
          })
          window.$("#alert").modal("show");
          return;
        }
      }

      if (
        (
          (
            await this.props.contract.binaryProxy.methods
              .leveling(this.props.currentAccount)
              .call({ from: this.props.currentAccount })
          ).toLowerCase() === 1
          ||
          sponsor !== "0x0000000000000000000000000000000000000000"
        ) &&
        investors.registered &&
        parseInt(valueUSDT) > 0
      ) {

        await this.props.contract.binaryProxy.methods
          .buyPlan(valueUSDT)
          .send({ from: this.props.currentAccount });

        this.setState({
          ModalTitulo: "INFO",
          ModalBody: "Congratulations on a successful investment"
        })
        window.$("#alert").modal("show");

        document
          .getElementById("services")
          .scrollIntoView({ block: "start", behavior: "smooth" });

      } else {
        if (valueUSDT <= 0) {
          this.setState({
            ModalTitulo: "CHECK",
            ModalBody: "Invalid imput to buy a plan"
          })
          window.$("#alert").modal("show");
        } else {
          this.setState({
            ModalTitulo: "CHECK",
            ModalBody: "Please use referral link to buy a plan"
          })
          window.$("#alert").modal("show");
        }
      }
    } else {
      if (balanceSite < amount) {
        this.setState({
          ModalTitulo: "CHECK",
          ModalBody: "You do not have enough balance, you need: " +
            amount +
            " USDT and in your wallet you have: " +
            balanceSite
        })
        window.$("#alert").modal("show");
      }
    }

    fetch("")
  }


  render() {
    return (
      <>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6">
              <div className="icon-box" data-aos="zoom-in-left">
                <div className="icon">
                  <i
                    className="bi bi-person"
                    style={{ color: "rgb(7 89 232)" }}
                  ></i>
                </div>
                <h4 className="title">
                  <a href="#User">User ID: {this.state.id}</a>
                </h4>
                <p className="description">
                  <strong>Wallet:</strong>{" "}
                  <span style={{ wordWrap: "break-word" }}>
                    {this.state.accountAddress}
                  </span>
                  <br />
                  <strong>USDT:</strong> {this.state.balanceSite}
                  <br />
                  <strong>Partner: </strong>{" "}
                  <span style={{ wordWrap: "break-word" }}>
                    {this.state.partner}
                  </span>
                  <br />
                  <strong>Upline: </strong>{" "}
                  <span style={{ wordWrap: "break-word" }}>
                    {this.state.upline}
                  </span>
                </p>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="icon-box" data-aos="zoom-in-left">
                <div className="icon">
                  <i
                    className="bi bi-currency-dollar"
                    style={{ color: "rgb(7 89 232)" }}
                  ></i>
                </div>
                <h4 className="title text-center">
                  <a href="#Invest">Invest </a>
                </h4>
                <p className="description text-center">
                  <strong>{"Contract  /  USDT"}</strong>
                  <br />
                  <b className="text-center">
                    <input
                      id="contracts"
                      type={"number"}
                      defaultValue={this.state.valueUSDT}
                      min="1"
                      step="1"
                      onInput={this.handleChangeUSDT}
                    />
                    {" = "}
                    <input
                      id="value"
                      type={"number"}
                      defaultValue={this.state.valueUSDTResult}
                      min="25"
                      step="25"
                      onInput={this.handleChangeUSDTResult}
                    />
                  </b>
                  <br />
                  <br />
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => this.deposit()}
                  >
                    {this.state.deposito}
                  </button>
                </p>
              </div>
            </div>

          </div>
        </div>




        <div className="modal fade" tabIndex="-1" id="alert" role="dialog" aria-labelledby="alert" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.state.ModalTitulo}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal">
                </button>
              </div>
              <div className="modal-body">
                <p>{this.state.ModalBody}</p>
              </div>
            </div>
          </div>
        </div>





      </>);
  }
}
