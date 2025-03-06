const express = require('express')
const ChatRouter = express.Router()
const controls = require('../controller/chat-controller')

ChatRouter.get('/getmessage', controls.getMessage)

module.exports = ChatRouter

