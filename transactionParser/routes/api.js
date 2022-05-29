const express = require('express')
const router = express.Router()
const {decodeSwap, decodeERC20} = require('../services/index')
router.get('/swap/:transactionhex', async (req, res) => {
        const output = await decodeSwap(req.params.transactionhex)
        res.send(output)
})
router.get('/erc20/:transactionhex', async (req, res) => {
        const output = decodeERC20(req.params.transactionhex)
        res.send(output)
})
module.exports = router;
