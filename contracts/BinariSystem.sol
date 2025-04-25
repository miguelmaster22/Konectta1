pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache-2.0

interface TRC20_Interface {
  function allowance(address _owner, address _spender) external view returns (uint);
  function transferFrom(address _from, address _to, uint _value) external returns (bool);
  function transfer(address direccion, uint cantidad) external returns (bool);
  function balanceOf(address who) external view returns (uint256);
  function decimals() external view returns(uint);
}

library SafeMath {

  function mul(uint a, uint b) internal pure returns (uint) {
    if (a == 0) {
        return 0;
    }

    uint c = a * b;
    require(c / a == b);

    return c;
  }

  function div(uint a, uint b) internal pure returns (uint) {
    require(b > 0);
    uint c = a / b;

    return c;
  }

  function sub(uint a, uint b) internal pure returns (uint) {
    require(b <= a);
    uint c = a - b;

    return c;
  }

  function add(uint a, uint b) internal pure returns (uint) {
    uint c = a + b;
    require(c >= a);

    return c;
  }

}

abstract contract Context {
  function _msgSender() internal view virtual returns (address) {
    return msg.sender;
  }

  function _msgData() internal view virtual returns (bytes calldata) {
    return msg.data;
  }
}

contract Admin is Context {
  address payable public owner;
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  constructor(){
    owner = payable(_msgSender());
    admin[_msgSender()] = true;
    leader[_msgSender()] = true;
  }
  modifier onlyOwner() {
    if(_msgSender() != owner)revert();
    _;
  }
  function transferOwnership(address payable newOwner) public onlyOwner {
    if(newOwner == address(0))revert();
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
    admin[newOwner] = true;
    leader[newOwner] = true;
  }

  mapping (address => bool) public admin;
  mapping (address => bool) public leader;

  event NewAdmin(address indexed admin);
  event AdminRemoved(address indexed admin);

  modifier onlyAdmin() {
    if(!admin[_msgSender()])revert();
    _;
  }

  function makeNewAdmin(address payable _newadmin) public onlyOwner {
    if(_newadmin == address(0))revert();
    emit NewAdmin(_newadmin);
    admin[_newadmin] = true;
  }

  function makeRemoveAdmin(address payable _oldadmin) public onlyOwner {
    if(_oldadmin == address(0))revert();
    emit AdminRemoved(_oldadmin);
    admin[_oldadmin] = false;

  }

  modifier onlyLeader() {
    if(!leader[_msgSender()])revert();
    _;
  }

  function makeNewLeader(address payable _newadmin) public onlyOwner {
    if(_newadmin == address(0))revert();
    emit NewAdmin(_newadmin);
    leader[_newadmin] = true;
    admin[_newadmin] = true;

  }

  function makeRemoveLeader(address payable _oldadmin) public onlyOwner {
    if(_oldadmin == address(0))revert();
    emit AdminRemoved(_oldadmin);
    leader[_oldadmin] = false;
    admin[_oldadmin] = false;

  }

}

contract BinarySystem is Context, Admin{
  using SafeMath for uint256;

  address token = 0x55d398326f99059fF775485246999027B3197955;

  TRC20_Interface USDT_Contract = TRC20_Interface(token);

  struct Hand {
    uint256 lReclamados;
    uint256 lExtra;
    address lReferer;
    uint256 rReclamados;
    uint256 rExtra;
    address rReferer;
  }

  struct Deposito {
    uint256 inicio;
    uint256 amount;
    uint256 valor;
    bool pasivo;
  }

  struct Investor {
    bool registered;
    uint256 balanceRef;
    uint256 balanceSal;
    uint256 totalRef;
    uint256 invested;
    uint256 paidAt;
    uint256 amount;
    uint256 withdrawn;
    address[] directosL;
    address[] directosR;
    Deposito[] depositos;
    Hand hands;
  }

  uint256 public MIN_RETIRO = 10*10**18;
  uint256 public MAX_RETIRO = 3000*10**18;

  uint256 public GanaMax;

  uint256 public plan = 25*10**18;

  address public tokenPricipal = token;

  uint256 public inversiones = 1;
  uint256[] public primervez = [80];
  uint256[] public porcientos = [40];
  uint256[] public porcientosSalida = [20, 5, 5, 5, 5];

  bool[] public espaciosRango = [false,false,false,false,false,false,false,false,false,false,false,false];
  uint256[] public gananciasRango = [10*10**18, 20*10**18, 40*10**18, 100*10**18, 200*10**18, 400*10**18, 1000*10**18, 2000*10**18, 4000*10**18, 5000*10**18, 10000*10**18, 20000*10**18, 50000*10**18 ];
  uint256[] public puntosRango = [125*10**18, 250*10**18, 500*10**18, 1250*10**18, 2500*10**18, 5000*10**18, 12500*10**18, 25000*10**18, 50000*10**18, 125000*10**18, 250000*10**18, 500000*10**18, 1250000*10**18];

  bool public onOffWitdrawl = true;

  uint256 public dias = 1000;
  uint256 public unidades = 86400;

  uint256 public timerOut = 86400; // tiempo entre retiros , segundos

  uint256 public porcent = 200;

  uint256 public multiPuntos = 1; //multiplicar puntos
  uint256 public factorPuntos = 2; // dividir puntos

  uint256 public porcentPuntosBinario = 10;
  uint256 public directosBinario = 2;

  uint256 public descuento = 92;

  uint256 public totalInvestors = 1;
  uint256 public totalInvested;
  uint256 public totalRefRewards;
  uint256 public totalRefWitdrawl;

  mapping (address => Investor) public investors;
  mapping (address => address) public padre;
  mapping (uint256 => address) public idToAddress;
  mapping (address => uint256) public addressToId;
  mapping (address => bool[]) public rangoReclamado;
  
  uint256 public lastUserId = 1;
  uint256 public valorFee = 4;
  address public walletFee = 0xDF835Cb0935FdBC51BBf730599B57b21815441Dd;
  address[] public walletRegistro = [0xDF835Cb0935FdBC51BBf730599B57b21815441Dd,0x52F77B3283C5627FDd827eF62a32D9E90910a6b5];
  uint256 public precioRegistro = 10 * 10**18;
  uint256[] public porcientoRegistro = [50,50];
  uint256 public activerFee = 2;
  // activerFee = 0 desactivada total | 1 activa fee retiro | 2 activa fee retiro y precio de registro

  address[] public wallet = [0xDF835Cb0935FdBC51BBf730599B57b21815441Dd, 0x52F77B3283C5627FDd827eF62a32D9E90910a6b5, 0x6bD8C114DDe23c9d543E1974822646eE840B7D33];
  uint256[] public valor = [5, 5, 65];

  constructor() {

    Investor storage usuario = investors[owner];

    usuario.registered = true;

    rangoReclamado[_msgSender()] = espaciosRango;

    idToAddress[0] = _msgSender();
    addressToId[_msgSender()] = 0;

  }

  function setstate() public view  returns(uint256 Investors,uint256 Invested,uint256 RefRewards){
    return (totalInvestors, totalInvested, totalRefRewards);
  }
  
  function tiempo() public view returns (uint256){
    return dias.mul(unidades);
  }

  function column(address yo, uint256 _largo) public view returns(address[] memory) {

    address[] memory res;
    for (uint256 i = 0; i < _largo; i++) {
      res = actualizarNetwork(res);
      res[i] = padre[yo];
      yo = padre[yo];
    }
    
    return res;
  }

  function miHands(address _user, uint256 _hand) public view returns(uint256 equipo, uint256 extra, uint256 reclamados,uint256 capital, uint256 directos,address referer) {

    Investor storage usuario = investors[_user];
    Hand storage hands = usuario.hands;

    if(_hand == 0){
      return (personasBinary(_user,  _hand), hands.lExtra, hands.lReclamados, usuario.invested, misDirectos(_user, _hand).length, hands.lReferer);

    }else{
      return (personasBinary(_user,  _hand), hands.rExtra, hands.rReclamados, usuario.invested, misDirectos(_user, _hand).length, hands.rReferer);

    }

  }

  function misDirectos(address _user, uint256 _hand) public view returns(address[] memory){

    if(_hand == 0){
      return (investors[_user].directosL);

    }else{
      return (investors[_user].directosR);

    }

  }

  function depositos(address _user) public view returns(uint256[] memory, uint256[] memory, bool[] memory, bool[] memory, uint256 , uint256){
    Investor storage usuario = investors[_user];

    uint256[] memory amount;
    uint256[] memory time;
    bool[] memory pasive;
    bool[] memory activo;
    uint256 total;
    uint256 totalValue;
    
    for (uint i = 0; i < usuario.depositos.length; i++) {
      amount = actualizarArrayUint256(amount);
      time = actualizarArrayUint256(time);
      pasive = actualizarArrayBool(pasive);
      activo = actualizarArrayBool(activo);

      Deposito storage dep = usuario.depositos[i];

      time[i] = dep.inicio;
      
      uint finish = dep.inicio + tiempo();
      uint since = usuario.paidAt > dep.inicio ? usuario.paidAt : dep.inicio;
      uint till = block.timestamp > finish ? finish : block.timestamp;

      if (since != 0 && since < till) {
        if (dep.pasivo) {
          total += dep.amount * (till - since) / tiempo() ;
        } 
        activo[i] = true;
      }

      amount[i] = dep.amount;
      pasive[i] = dep.pasivo;  

      totalValue += dep.valor;

    }

    return (amount, time, pasive, activo, total, totalValue);

  }

  function rewardReferers(address yo, uint256 amount, uint256[] memory array, bool _sal) internal {

    address[] memory referi;
    referi = column(yo, array.length);
    uint256 a;
    Investor storage usuario;

    for (uint256 i = 0; i < array.length; i++) {

      if (array[i] != 0) {
        usuario = investors[referi[i]];
        if (usuario.registered && usuario.amount > 0){
          if ( referi[i] != address(0) ) {

            a = amount.mul(array[i]).div(1000);
            if (usuario.amount > a) {

              discountDeposits(referi[i], a);

              if(_sal){
                usuario.balanceSal += a;
              }else{
                usuario.balanceRef += a;
                usuario.totalRef += a;
              }
              
              totalRefRewards += a;
              
            }else{

              if(_sal){
                usuario.balanceSal += usuario.amount;
              }else{
                usuario.balanceRef += usuario.amount;
                usuario.totalRef += usuario.amount;
              }

              totalRefRewards += usuario.amount;

              discountDeposits(referi[i], usuario.amount);
              
              
            }
            
          }else{
            break;
          }
        }
        
      } else {
        break;
      }
      
    }
  }

  function discountDeposits(address _user, uint256 _valor) internal { 

    Investor storage usuario = investors[_user];
    Deposito storage dep;
    
    for (uint i = 0; i < usuario.depositos.length; i++) {

      if(_valor == 0)break;

      dep = usuario.depositos[i];

      if(_valor > dep.amount ){
        _valor = _valor-dep.amount;
        delete dep.amount;
        
      }else{
        dep.amount = dep.amount-_valor;
        delete _valor;
        
      }
         
    }
  }

  function registro(address _sponsor, uint8 _hand) public{
    if( _hand > 1) revert();
    
    Investor storage usuario = investors[_msgSender()];

    if(usuario.registered)revert();

    if(precioRegistro > 0){

      if( !USDT_Contract.transferFrom(_msgSender(), address(this), precioRegistro))revert();

      if (activerFee >= 2){
        for (uint256 i = 0; i < walletRegistro.length; i++) {
          USDT_Contract.transfer(walletRegistro[i], precioRegistro.mul(porcientoRegistro[i]).div(100));
        }
        
      }

    }

    usuario.registered = true;
    padre[_msgSender()] = _sponsor;

    if (_sponsor != address(0) ){
      Investor storage sponsor = investors[_sponsor];
      
      if ( _hand == 0 ) {

        sponsor.directosL.push(_msgSender());
          
        if (sponsor.hands.lReferer == address(0) ) {

          sponsor.hands.lReferer = _msgSender();
          
        } else {

          address[] memory network;

          network = actualizarNetwork(network);
          network[0] = sponsor.hands.lReferer;
          sponsor = investors[insertion(network, _hand)];
          sponsor.hands.lReferer = _msgSender();
          
        }
      }else{

        sponsor.directosR.push(_msgSender());

        if ( sponsor.hands.rReferer == address(0) ) {

          sponsor.hands.rReferer = _msgSender();
          
        } else {

          address[] memory network;
          network = actualizarNetwork(network);
          network[0] = sponsor.hands.rReferer;

          sponsor = investors[insertion(network, _hand)];
          sponsor.hands.rReferer = _msgSender();
          
        }
      }
      
    }
    
    totalInvestors++;

    rangoReclamado[_msgSender()] = espaciosRango;
    idToAddress[lastUserId] = _msgSender();
    addressToId[_msgSender()] = lastUserId;
    
    lastUserId++;

  }

  function buyPlan(uint256 _plan) public {

    if(_plan <= 0 )revert();

    Investor storage usuario = investors[_msgSender()];

    if ( usuario.registered) {

      uint256 _value = plan * _plan;

      if( USDT_Contract.allowance(_msgSender(), address(this)) < _value)revert();
      if( !USDT_Contract.transferFrom(_msgSender(), address(this), _value) )revert();
      
      if (padre[_msgSender()] != address(0) ){
        if (usuario.depositos.length < inversiones ){
          
          rewardReferers(_msgSender(), _value, primervez, false);
          
        }else{
          rewardReferers(_msgSender(), _value, porcientos, false);

        }
      }

      usuario.depositos.push(Deposito(block.timestamp,_value.mul(porcent.div(100)),_value, true));
      usuario.invested += _value;
      usuario.amount += _value.mul(porcent.div(100));

      uint256 left;
      uint256 rigth;
      
      (left, rigth) = corteBinario(_msgSender());
    
      if ( left != 0 && rigth != 0 ) {

        if(left < rigth){
          usuario.hands.lReclamados += left;
          usuario.hands.rReclamados += left;
            
        }else{
          usuario.hands.lReclamados += rigth;
          usuario.hands.rReclamados += rigth;
            
        }
        
      }

      totalInvested += _value;

      for (uint256 i = 0; i < wallet.length; i++) {
        USDT_Contract.transfer(wallet[i], _value.mul(valor[i]).div(100));
      }

    } else {
      revert();
    }
    
  }
  
  function withdrawableBinary(address any_user) public view returns (uint256 left, uint256 rigth, uint256 amount) {
    Investor storage user = investors[any_user];
      
    if ( user.hands.lReferer != address(0)) {
        
      address[] memory network;

      network = actualizarNetwork(network);

      network[0] = user.hands.lReferer;

      network = allnetwork(network);
      
      for (uint i = 0; i < network.length; i++) {
      
        user = investors[network[i]];
        left += user.invested.div(factorPuntos);
      }
        
    }
    user = investors[any_user];

    left += user.hands.lExtra;
    left -= user.hands.lReclamados;
      
    if ( user.hands.rReferer != address(0)) {
        
        address[] memory network;

        network = actualizarNetwork(network);

        network[0] = user.hands.rReferer;

        network = allnetwork(network);
        
        for (uint i = 0; i < network.length; i++) {
        
          user = investors[network[i]];
          rigth += user.invested.mul(multiPuntos).div(factorPuntos);
        }
        
    }

    user = investors[any_user];

    rigth += user.hands.rExtra;
    rigth -= user.hands.rReclamados;

    if (misDirectos(any_user,0).length+misDirectos(any_user,1).length >= directosBinario){

      if (left < rigth) {
        if (left.mul(porcentPuntosBinario).div(100) <= user.amount ) {
          amount = left.mul(porcentPuntosBinario).mul(multiPuntos).div(100) ;
            
        }else{
          amount = user.amount;
            
        }
        
      }else{
        if (rigth.mul(porcentPuntosBinario).div(100) <= user.amount ) {
          amount = rigth.mul(porcentPuntosBinario).div(100) ;
            
        }else{
          amount = user.amount;
            
        }
      }
    }
  
  }

  function withdrawableRange(address any_user) public view returns (uint256 amount) {
    Investor memory user = investors[any_user];

    uint256 left = user.hands.lReclamados;
    left += user.hands.lExtra;

    uint256 rigth = user.hands.rReclamados;
    rigth += user.hands.rExtra;

    if (left < rigth) {

      amount = left ;
      
    }else{

      amount = rigth;

    }
  
  }

  function newRecompensa() public {

    if (!onOffWitdrawl)revert("WP");

    uint256 amount = withdrawableRange(_msgSender());

    for (uint256 index = 0; index < gananciasRango.length; index++) {

      if(amount >= puntosRango[index] && !rangoReclamado[_msgSender()][index]){

        USDT_Contract.transfer(_msgSender(), gananciasRango[index]);
        rangoReclamado[_msgSender()][index] = true;
      }
      
    }

  }

  function personasBinary(address _user, uint256 _hand) public view returns (uint256 miTeam) {
    Investor memory referer = investors[_user];

    if(_hand == 0){
      if ( referer.hands.lReferer != address(0)) {

      address[] memory network;

      network = actualizarNetwork(network);

      network[0] = referer.hands.lReferer;

      network = allnetwork(network);

      for (uint i = 0; i < network.length; i++) {
        
        referer = investors[network[i]];
        miTeam++;
      }
        
    }

    }else{
      if ( referer.hands.rReferer != address(0)) {
          
        address[] memory network;

        network = actualizarNetwork(network);

        network[0] = referer.hands.rReferer;

        network = allnetwork(network);
        
        for (uint b = 0; b < network.length; b++) {
          
          referer = investors[network[b]];
          miTeam++;
        }
      }

    }
    
    

  }

  function actualizarNetwork(address[] memory oldNetwork)public pure returns ( address[] memory) {
    address[] memory newNetwork =   new address[](oldNetwork.length+1);

    for(uint i = 0; i < oldNetwork.length; i++){
        newNetwork[i] = oldNetwork[i];
    }
    
    return newNetwork;
  }

  function actualizarArrayBool(bool[] memory old)public pure returns ( bool[] memory) {
    bool[] memory newA =   new bool[](old.length+1);

    for(uint i = 0; i < old.length; i++){
        newA[i] = old[i];
    }
    
    return newA;
  }

  function actualizarArrayUint256(uint256[] memory old)public pure returns ( uint256[] memory) {
    uint256[] memory newA =   new uint256[](old.length+1);

    for(uint i = 0; i < old.length; i++){
        newA[i] = old[i];
    }
    
    return newA;
  }

  function allnetwork( address[] memory network ) public view returns ( address[] memory) {
    Investor storage user;

    for (uint i = 0; i < network.length; i++) {

      user = investors[network[i]];
      
      address userLeft = user.hands.lReferer;
      address userRigth = user.hands.rReferer;

      for (uint u = 0; u < network.length; u++) {
        if (userLeft == network[u]){
          userLeft = address(0);
        }
        if (userRigth == network[u]){
          userRigth = address(0);
        }
      }

      if( userLeft != address(0) ){
        network = actualizarNetwork(network);
        network[network.length-1] = userLeft;
      }

      if( userRigth != address(0) ){
        network = actualizarNetwork(network);
        network[network.length-1] = userRigth;
      }

    }

    return network;
  }

  function insertion(address[] memory network, uint256 _hand) public view returns ( address wallett) {

    Investor memory user;

    if(_hand == 0){

      
      for (uint i = 0; i < network.length; i++) {

        user = investors[network[i]];
        
        address userLeft = user.hands.lReferer;

        if( userLeft == address(0) ){
          return  network[i];
        }

        network = actualizarNetwork(network);
        network[network.length-1] = userLeft;

      }
      insertion(network, 0);

    }else{
      for (uint i = 0; i < network.length; i++) {
        user = investors[network[i]];

        address userRigth = user.hands.rReferer;

        if( userRigth == address(0) ){
          return network[i];
        }

        network = actualizarNetwork(network);
        network[network.length-1] = userRigth;

      }
      insertion(network, 1);

    }

  }


  function withdrawable(address any_user) public view returns (uint256) {

    Investor memory investor2 = investors[any_user];

    uint256 binary;
    
    uint256 left;
    uint256 rigth;

    uint256[] memory amount;
    uint256[] memory time;
    bool[] memory pasive;
    bool[] memory activo;
    uint256 total;

    (left, rigth, binary) = withdrawableBinary(any_user);

    (amount, time, pasive, activo, total,) = depositos(any_user);

    total += binary+investor2.balanceRef+investor2.balanceSal;

    if (total > investor2.amount) {
      total = investor2.amount;
    }

    return total;

  }

  function corteBinario(address any_user) public view returns (uint256, uint256) {

    uint256 binary;
    uint256 left;
    uint256 rigth;

    (left, rigth, binary) = withdrawableBinary(any_user);

    return (left, rigth);

  }

  function withdraw() public {

    if (!onOffWitdrawl)revert();

    uint256 _value = withdrawable(_msgSender());

    if( USDT_Contract.balanceOf(address(this)) < _value )revert();
    if( _value < MIN_RETIRO )revert();

    Investor storage usuario = investors[_msgSender()];

    if(usuario.paidAt+timerOut > block.timestamp)revert("TO");

    usuario.withdrawn += _value;

    if(_value > MAX_RETIRO){
      GanaMax += _value-MAX_RETIRO;
      _value = MAX_RETIRO;
    }

    if ( activerFee >= 1 ) {

      USDT_Contract.transfer(walletFee, _value.mul(valorFee).div(100));
      
    }

    USDT_Contract.transfer(_msgSender(), _value.mul(descuento).div(100));

    rewardReferers(_msgSender(), _value, porcientosSalida, true);

    uint256 binary;
    uint256 left;
    uint256 rigth;

    (left, rigth, binary) = withdrawableBinary(_msgSender());

    discountDeposits(_msgSender(), binary);

    (left, rigth) = corteBinario(_msgSender());
    
    if ( left != 0 && rigth != 0 ) {

      if(left < rigth){
        usuario.hands.lReclamados += left;
        usuario.hands.rReclamados += left;
          
      }else{
        usuario.hands.lReclamados += rigth;
        usuario.hands.rReclamados += rigth;
          
      }
      
    }

    if(_value >= usuario.amount){
      delete usuario.amount;
    }else{
      usuario.amount = usuario.amount.sub(_value);
    }

    usuario.paidAt = block.timestamp;
    delete usuario.balanceRef;
    delete usuario.balanceSal;

    totalRefWitdrawl += _value;

  }

/// admin functions

  function asignFreeMembership(address _user, address _sponsor, uint8 _hand ) public onlyAdmin {

    if( _hand > 1) revert();
    
    Investor storage usuario = investors[_user];

    if(usuario.registered)revert("UR");

    usuario.registered = true;
    padre[_user] = _sponsor;

    if (_sponsor != address(0) ){
      Investor storage sponsor = investors[_sponsor];
      
      if ( _hand == 0 ) {

        sponsor.directosL.push(_user);
          
        if (sponsor.hands.lReferer == address(0) ) {

          sponsor.hands.lReferer = _user;
          
        } else {

          address[] memory network;

          network = actualizarNetwork(network);
          network[0] = sponsor.hands.lReferer;
          sponsor = investors[insertion(network, _hand)];
          sponsor.hands.lReferer = _user;
          
        }
      }else{

        sponsor.directosR.push(_user);

        if ( sponsor.hands.rReferer == address(0) ) {

          sponsor.hands.rReferer = _user;
          
        } else {

          address[] memory network;
          network = actualizarNetwork(network);
          network[0] = sponsor.hands.rReferer;

          sponsor = investors[insertion(network, _hand)];
          sponsor.hands.rReferer = _user;
          
        }
      }
      
    }
    
    totalInvestors++;

    rangoReclamado[_user] = espaciosRango;
    idToAddress[lastUserId] = _user;
    addressToId[_user] = lastUserId;
    
    lastUserId++;

  }

  function asignarPlan(address _user ,uint256 _plan, bool _depago) public onlyAdmin returns (bool){
    if(_plan <= 0 )revert();

    Investor storage usuario = investors[_user];

    if(!usuario.registered)revert();

    uint256 _value = plan * _plan;

    usuario.depositos.push(Deposito(block.timestamp, _value.mul(porcent.div(100)),_value, _depago));
    usuario.amount += _value.mul(porcent.div(100));
    //usuario.invested += _value;

    return true;
  }

  function asignarPuntosBinarios(address _user ,uint256 _puntosLeft, uint256 _puntosRigth) public onlyLeader returns (bool){
    Investor storage usuario = investors[_user];
    require(usuario.registered, "UNR");

    if(_puntosLeft > 0){
      usuario.hands.lExtra += _puntosLeft;
    }

    if(_puntosRigth > 0){
      usuario.hands.rExtra += _puntosRigth;
    }

    return true;
    
  }

  function setTiempo(uint256 _dias) public onlyOwner returns(uint256){
    dias = _dias;
    return (_dias);
  }

  function setRetorno(uint256 _porcentaje) public onlyOwner returns(uint256){
    porcent = _porcentaje;
    return (porcent);
  }

  function setPrecioRegistro(uint256 _precio, uint256[] memory _porcentaje) public onlyOwner returns(bool){
    precioRegistro = _precio;
    porcientoRegistro = _porcentaje;
    return true;
  }

  function controlWitdrawl(bool _true_false) public onlyOwner returns(bool){
    onOffWitdrawl = _true_false;
    return (_true_false);
  }

  function ChangeTokenPrincipal(address _tokenTRC20) public onlyOwner returns (bool){
    USDT_Contract = TRC20_Interface(_tokenTRC20);
    tokenPricipal = _tokenTRC20;
    return true;
  }

  function setPrimeravezPorcientos(uint256 _nivel, uint256 _value) public onlyOwner returns(uint256[] memory){
    primervez[_nivel] = _value;
    return primervez;
  }

  function setPorcientos(uint256 _nivel, uint256 _value) public onlyOwner returns(uint256[] memory){
    porcientos[_nivel] = _value;
    return porcientos;
  }

  function setPorcientosSalida(uint256 _nivel, uint256 _value) public onlyOwner returns(uint256[] memory){
    porcientosSalida[_nivel] = _value;
    return porcientosSalida;
  }

  function setDescuento(uint256 _descuento) public onlyOwner returns(bool){
    descuento = _descuento;
    return true;
  }

  function setTimerOut(uint256 _timerOut) public onlyOwner returns(bool){
    timerOut = _timerOut;
    return true;
  }

  function setWalletstransfers(address[] memory _wallets, uint256[] memory _valores) public onlyOwner returns(bool){
    wallet = _wallets;
    valor = _valores;
    return true;
  }

  function setWalletFee(address _wallet, uint256 _fee , uint256 _activerFee ) public onlyOwner returns(bool){
    walletFee = _wallet;
    valorFee = _fee;
    activerFee = _activerFee;
    return true;
  }

  function setPuntosPorcentajeBinario(uint256 _porcentaje) public onlyOwner returns(uint256){
    porcentPuntosBinario = _porcentaje;
    return _porcentaje;
  }

  function setMIN_RETIRO(uint256 _min) public onlyOwner returns(uint256){
    MIN_RETIRO = _min;
    return _min;
  }

  function setPlan(uint256 _value) public onlyOwner returns(bool){
    plan = _value;
    return true;
  }

  function setTiempoUnidades(uint256 _unidades) public onlyOwner returns(uint256){
    unidades = _unidades;
    return (_unidades);
  }

  function redimToken() public onlyOwner {
    USDT_Contract.transfer(owner, USDT_Contract.balanceOf(address(this)));
  }

  function redimBNB() public onlyOwner {
    owner.transfer(address(this).balance);
  }

  fallback() external payable {}

  receive() external payable {}

}