const Redis = require('ioredis')

const redis = new Redis({
    host: "localhost", 
    port : 6379
})


redis.on('connect',()=>{
    console.log('Connected to redis successfully')

})


redis.on('error',(error)=>{
    console.log('Redis error', error)
})

module.exports = redis;