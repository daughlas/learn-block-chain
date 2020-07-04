const vorpal = require('vorpal')()
const Blockchain = require('./blockchain')
const blockchain = new Blockchain()
const Table = require('cli-table')

const table = new Table({
  head: ['TH 1 label', 'TH 2 label'],
  colWidths: [10, 20]
})

// 原始值: [{name: 'woniu', age: 18}, {name: 'imooc', age: 22}]
function formatLog(data) {
  if (!Array.isArray(data)) {
    data = [data]
  }
  const first = data[0]
  const head = Object.keys(first)
  const table = new Table({
    head: head,
    colWidths: new Array(head.length).fill(20)
  })
  const res = data.map(v => {
    return head.map(h => JSON.stringify(v[h], null, 2))
  })
  table.push(...res)
  console.log(table.toString())
}

vorpal
  .command('balance <address>', '查询余额')
  .action((args, callback) => {
    const balance = blockchain.balance(args.address)
    if (balance) {
      formatLog({address: args.address, balance})
    }
    callback()
  })

vorpal
  .command('detail <index>', '查看区块详情')
  .action((args, callback) => {
    const block = blockchain.blockchain[args.index]
    console.log(JSON.stringify(block, null ,2))
    callback()
  })

vorpal
  .command('trans <from> <to> <amount>', '挖矿')
  .action((args, callback) => {
    let trans = blockchain.transfer(args.from, args.to, args.amount)
    if (trans) {
      formatLog(trans)
    }
    callback()
  })

vorpal
  .command('mine <address>', '挖矿')
  .action((args, callback) => {
    const newBlock = blockchain.mine(args.address)
    if (newBlock) {
      formatLog(newBlock)
    }
    callback()
  })

vorpal
  .command('chain', '查看区块链')
  .action((args, callback) => {
    formatLog(blockchain.blockchain)
    callback()
  })

console.log('Welcome to ljw-block-chain')

vorpal.exec('help')

vorpal
  .delimiter('ljw-block-chain => ')
  .show()