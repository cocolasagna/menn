"use client"
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';


export default function Chat() {
    const [socket, setSocket] = useState(null);
    const [message,setMessage] = useState('')
    const [messages,setMessages] = useState([])
    const [isTyping,setIsTyping] = useState(false)
    const [targetuserid ,setTargetUserId] = useState('')
    const [chatid , setChatId ] = useState('')
    const [users, setUsers] = useState([])
    const [selecteduserid,setSelectedUserId] = useState(null)
    const [error,setError] = useState('')

    const handleMessage = (e)=>{
            e.preventDefault()
            
        axios.post('http://localhost:8000/chat/sendmessage',{targetuserid:'67cbecb536b8ba0540e8b331', message},{withCredentials:true}).then((res)=>{
            console.log(res.data)
        
        })
    }

    const handleClick = (userId)=>{
        setSelectedUserId(userId)
axios.get(`http://localhost:8000/chat/getusermessage/${userId}` , {withCredentials:true}).then((response)=>{
    try {
        setMessages(response.data)
        
    } catch (error) {
        setError(error.response.data.message)
       
    }
    console.log('message',messages)
    console.log('error',error)
})

    }

    const handleTyping = ()=>{
        if(newSocket && targetuserid){
            newSocket.emit('typing',targetuserid)
        }
    }


    useEffect(() => {
        const newSocket = io("http://localhost:8000", { withCredentials: true });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server, socket ID:', newSocket.id);
        });

        newSocket.on('newMessage', (message)=>{
            console.log('new message',message)
        })

   
        return () => {
            newSocket.disconnect();
        };
    }, []);
    
    useEffect(() => {
        axios.get('http://localhost:8000/user/getusers', {withCredentials:true}).then((res)=>{
            setUsers(res.data)
        })
       
    }, []);




    return (
        <div>

{users && users.length > 0 ? (
        <ul>
            {users.map((user) => (
                <li key={user._id} onClick={()=>handleClick(user._id)}>{user._id}:{user.name}</li> // Replace 'name' with the actual property of the user object you want to display
            ))}
        </ul>
    ) : (
        <p>No users found</p>
    )}
            <form onSubmit={handleMessage}>
               
                <input type = 'textfield 'value={message} onChange={(e) => setMessage(e.target.value)}></input>
                <button type='submit'>Send</button>
            </form>
        </div>
    );
}
