import mongoose, { Schema } from 'mongoose'

const ChatSchema = new mongoose.Schema(
    {
        admin:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' , 
            required: true
        } , 
        isGroupChat:{
                type:Boolean
        },
        members:{
            type:Array
        } , 
        name:{
            type:String,
            default:"One on one chat"
        },
        messages:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Message'
        },
       
        
        
   },
   {timestamps:true}
)

const Chat = mongoose.model('Chat', UserSchema);
module.exports = Chat;