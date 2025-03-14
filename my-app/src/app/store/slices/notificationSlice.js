import {createSlice} from '@reduxjs/toolkit'

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState:{
        notifications:[]
    } ,
    reducers:{
        setNotifications:(state,action)=>{
            state.notifications = action.payload
        },
        addNotifications:(state,action)=>{
            state.notifications.push(action.payload)
        } , 
        clearNotifications: (state) => {
            state.notifications = [];
          },

        }
    
        }
    
)

export const {setNotifications,addNotifications,clearNotifications} = notificationsSlice.actions

export default notificationsSlice.reducer

