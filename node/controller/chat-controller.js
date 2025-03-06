

const getMessage = (req,res)=>{
    socket.on('message',(data)=>{
        console.log('response',data)
    })
}


module.exports = {getMessage};