import {createSlice} from '@reduxjs/toolkit'

const chatSlice = createSlice({
    name: 'chat',
    initialState:{
        messages:[]
    } ,
    reducers:{
        setMessages:(state,action)=>{
            state.messages = action.payload
        },
        addMessages:(state,action)=>{
            state.messages.push(action.payload)
        } , 
        clearMessages: (state) => {
            state.messages = [];
          },

        }
    
        }
    
)

export const {setMessages,addMessages , clearMessages} = chatSlice.actions

export default chatSlice.reducer

