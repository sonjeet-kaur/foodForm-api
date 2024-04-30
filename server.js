require('dotenv').config()
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const Web3 = require('web3');
const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');


process.on('uncaughtException', err => {
        console.log('UNCAUGHT EXCEPTION! Shutting down...');
        console.log(err.name, err.message);
        process.exit(1);
});

const app = require('./app');

mongoose.set('strictQuery', false);

mongoose.connect(process.env.DATABASE, {
        // useNewUrlParser: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 9000
        // strictQuery: false
}).then(() => console.log('DB connection successful!'));



async function checkPools(){
        const abi = [{"inputs":[{"internalType":"contract IERC20","name":"_token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_registerAddress","type":"address"},{"indexed":true,"internalType":"address","name":"_receiverAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"_receiveAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_timestamp","type":"uint256"}],"name":"DirectIncome","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_receiverAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"_level","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"_receiveAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_timestamp","type":"uint256"}],"name":"LevelIncome","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_receiverAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"_count","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"_receiveAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_timestamp","type":"uint256"}],"name":"PoolIncome","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_registerAddress","type":"address"},{"indexed":true,"internalType":"address","name":"_sponsorAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"_packageAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_timestamp","type":"uint256"}],"name":"Register","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_tokenAddress","type":"address"},{"indexed":true,"internalType":"address","name":"_receiverAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"_receiveAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_timestamp","type":"uint256"}],"name":"WithdrawLostTokens","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"lockAdminAdd","type":"event"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"check_user","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"createUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimalNumber","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"directIncome","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPoolUpline","outputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getUpline","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"isUserExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"levelIncome","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lockAdmin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"packageAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolIncome","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"poolUsers","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"address","name":"uplineAddress","type":"address"},{"internalType":"uint256","name":"count","type":"uint256"},{"internalType":"uint256","name":"created_at","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolUsersArray","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"address","name":"uplineAddress","type":"address"},{"internalType":"uint256","name":"count","type":"uint256"},{"internalType":"uint256","name":"created_at","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_sponsor_id","type":"address"}],"name":"register","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"setLockAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_level","type":"uint256"}],"name":"shareLevelIncome","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalUsers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"unsetLockAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"userCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"address","name":"sponsorAddress","type":"address"},{"internalType":"uint256","name":"packageAmount","type":"uint256"},{"internalType":"uint256","name":"directs","type":"uint256"},{"internalType":"uint256","name":"created_at","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"usersArray","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"address","name":"sponsorAddress","type":"address"},{"internalType":"uint256","name":"packageAmount","type":"uint256"},{"internalType":"uint256","name":"directs","type":"uint256"},{"internalType":"uint256","name":"created_at","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"_receiver","type":"address"}],"name":"withdrawLostTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}];
        var contract = new web3.eth.Contract(abi,
                "0x1542c61649CFDB58E96a538030B20530B7a8Ae1A");
        // console.log(contract); 
        const userCount = await contract.methods.userCount().call();
        for (let index = 0; index < userCount; index++) {
                // console.log(index)
                let mainData = await contract.methods.poolUsersArray(index).call();
                //console.log('s',mainData);                
        }
      
}     


checkPools();

const server = app.listen(port, () => {
        console.log(`App running on port ${port}...`);
});



