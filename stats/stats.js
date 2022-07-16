const Moralis = require('moralis/node')
const fs = require('fs')
require('dotenv').config()

const contractAddr = '0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258'

async function getAllOwners() {
  await Moralis.start({
    serverUrl: process.env.SERVER_URL,
    appId: process.env.APPID,
  })
  let cursor = null
  let owners = {}
  let res
  let accountedTokens = []

  do {
    res = await Moralis.Web3API.token.getContractNFTTransfers({
      address: contractAddr,
      from: Moralis.account,
      chain: 'eth',
      limit: 100,
      cursor: cursor,
    })
    console.log(
      `Page response: ${res.page} of ${Math.ceil(res.total / res.page_size)}, ${
        res.total
      } total`,
    )

    for (const transfer of res.result) {
      if (
        !owners[transfer.to_address] &&
        !accountedTokens.includes(transfer.token_id)
      ) {
        owners[transfer.to_address] = {
          address: transfer.to_address,
          amount: Number(transfer.amount),
          tokenId: [transfer.token_id],
          prices: [Number(transfer.value)],
          dates: [transfer.block_timestamp],
        }
        accountedTokens.push(transfer.token_id)
      } else if (!accountedTokens.includes(transfer.token_id)) {
        let smol = owners[transfer.to_address]
        smol.amount++
        smol.tokenId.push(transfer.tokenId)
        smol.prices.push(Number(transfer.value))
        smol.dates.push(transfer.block_timestamp)

        accountedTokens.push(transfer.token_id)
      }
    }
    cursor = res.cursor
  } while (cursor != '' && cursor != null)

  const ownersJson = JSON.stringify(owners)

  fs.writeFile('moonbirdsOwners.json', jsonContentOwners, 'utf8', function (
    err,
  ) {
    if (err) {
      console.log('JSON Write Error')
      return console.log(err.message)
    }
    console.log('JSON Write Success')
  })
}

getAllOwners()
