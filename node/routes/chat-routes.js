const express = require('express')
const ChatRouter = express.Router()
const controls = require('../controller/chat-controller')
const authenticateToken = require('../middleware/authmiddleware')
const multer = require('multer')
const upload = multer({ storage:controls.storage })

ChatRouter.post('/sendmessage',authenticateToken, controls.sendMessageToUser)
ChatRouter.get('/getusermessage/:targetuserid' , authenticateToken,controls.getMessageforUser )
ChatRouter.post('/creategroupchat', authenticateToken, controls.createGroupChat)
ChatRouter.get('/getgroupchats',authenticateToken,controls.getGroupChats)
ChatRouter.get('/getgroupmessage/:groupId',authenticateToken, controls.getMessageforGroup)
ChatRouter.post('/sendgroupmessage',authenticateToken, controls.sendMessageToGroup)
ChatRouter.post('/uploadfile',authenticateToken, upload.array('files',4),controls.uploadfile)

module.exports = ChatRouter

