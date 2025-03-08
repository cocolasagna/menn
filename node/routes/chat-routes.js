const express = require('express')
const ChatRouter = express.Router()
const controls = require('../controller/chat-controller')
const authenticateToken = require('../middleware/authmiddleware')

ChatRouter.post('/sendmessage',authenticateToken, controls.sendMessageToUser)
ChatRouter.get('/getusermessage/:targetuserid' , authenticateToken,controls.getMessageforUser )


module.exports = ChatRouter

