const express = require('express')
const ChatRouter = express.Router()
const controls = require('../controller/chat-controller')
const authenticateToken = require('../middleware/authmiddleware')

ChatRouter.post('/sendmessage',authenticateToken, controls.sendMessageToUser)
ChatRouter.get('/getusermessage/:targetuserid' , authenticateToken,controls.getMessageforUser )
ChatRouter.post('/creategroupchat', authenticateToken, controls.createGroupChat)
ChatRouter.get('/getgroupchats',authenticateToken,controls.getGroupChats)
ChatRouter.get('/getgroupmessage/:groupId',authenticateToken, controls.getMessageforGroup)
ChatRouter.post('/sendmessageingroup',authenticateToken, controls.sendMessageToGroup)

module.exports = ChatRouter

