const crypto = require('crypto');

const initBlock = { 
  index: 0,
  data: [],
  prevHash: '0',
  hash: '000076b0b009d79eea894aedcaa2325c2984fef49f3c53a3b5fcbc48a581cc52',
  timestamp: 1550374969656,
  nonce: 5492 
}

class Blockchain {
  constructor() {
    this.blockchain = [initBlock]
    this.data = []
    this.difficulty = 6
  }

  // 获取最新区块
  getLastBlock() {
    return this.blockchain[this.blockchain.length -1]
  }

  balance(address) {
    let balance =  0;
    this.blockchain.forEach(block => {
      if (!Array.isArray(block.data)) {
        return 
      }
      block.data.forEach(trans => {
        if (address === trans.from) {
          balance -= trans.amount
        }
        if (address === trans.to) {
          balance += trans.amount
        }
      })
    })
    return balance
  }
  
  // 挖矿 打包交易
  mine(address) {
    // 挖矿结束 矿工奖励 每次挖矿成功给 100
    this.transfer('0', address, 100)
    const newBlock = this.generateNewBlock();
    // 区块合法，并且区块链合法，就新增一下
    if (this.isValidBlock(newBlock) && this.isValidChain()) {
      this.blockchain.push(newBlock)
      this.data = []
      return newBlock
    } else {
      console.log('Error, Invalid Block')
    }
  }
  
  generateNewBlock() {
    // 1. 生成新区块
    // 2. 不停的计算 hash 直到符合条件的哈希值，获得记账权
    let nonce = 0
    const index = this.blockchain.length // 区块索引值
    const data = this.data
    const prevHash = this.getLastBlock().hash
    let timestamp = new Date().getTime()
    let hash  = this.computeHash(index, prevHash, timestamp,data, nonce)

    while (hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      nonce +=1
      hash  = this.computeHash(index, prevHash, timestamp,data, nonce)
      console.log('mine', nonce, hash)
    }
    return {
      index,
      data,
      prevHash,
      hash,
      timestamp,
      nonce
    }
  }

  computeHashForBlock(block) {
    return this.computeHash(block.index, block.prevHash, block.timestamp, block.data, block.nonce)
  }
  
  computeHash(index, prevHash, timestamp, data, nonce) {
    return crypto
      .createHash('sha256')
      .update(index + prevHash + timestamp + data + nonce)
      .digest('hex')
  }
  
  isValidBlock(newBlock, lastBlock=this.getLastBlock()) {
    // 区块的 index = 最新区块的index + 1
    // 新区块的timestamp 大于最后一个区块
    // 最新区块的 prevHash = 最后一个区块的 hash
    // 区块的 hash 值 符合难度要求
    // 新区快 hash 计算正确
    if( newBlock.index !== lastBlock.index + 1) {
      return false
    }
    if (newBlock.timestamp <= lastBlock.timestamp) {
      return false
    }
    if (newBlock.prevHash !== lastBlock.hash) {
      return false
    }
    if (newBlock.hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      return false
    }
    if (newBlock.hash !== this.computeHashForBlock(newBlock)) {
      return false
    }
    return true
  }
  
  isValidChain(chain=this.blockchain) {
    // 校验除了创世区块之外的区块
    for (let i=chain.length - 1; i>=1; i=i-1) {
      if (!this.isValidBlock(chain[i], chain[i-1])) {
        console.log('Error, Invalid Chain')
        return false
      }
    }
    // 校验创世区块
    if (JSON.stringify(chain[0]) !== JSON.stringify(initBlock)) {
      console.log('Error, Invalid Genesis Block')
      return false
    }
    return true
  }

  transfer(from, to, amount) {
    if(from !== '0') {
      // 交易非挖矿
      const balance = this.balance(from)
      if (balance < amount) {
        console.log('not enough balance', from, balance, amount)
        return
      }
    }
    // 签名校验（后面完成）
    const transObj = {from, to, amount}
    this.data.push(transObj)
    return transObj
  }
}

// let bc = new Blockchain()
// bc.mine()
// bc.blockchain[1].nonce = '3123123'
// bc.mine()
// bc.mine()
// bc.mine()
// bc.mine()
// console.log(bc.blockchain)

module.exports = Blockchain