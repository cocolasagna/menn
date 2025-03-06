"use client"
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';


export default function Chat() {
    const [socket, setSocket] = useState(null);
    const [message,setMessage] = useState('')


    const handleMessage = (e)=>{
            e.preventDefault()
            socket.emit('message',message)
        axios.get('http://localhost:8000/chat/getmessage').then((res)=>{
            console.log(res.data)
        
        })
    }

    useEffect(() => {
        const newSocket = io("http://localhost:8000", { withCredentials: true });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server, socket ID:', newSocket.id);
        });

        // Cleanup function to disconnect socket when component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, []); // Empty dependency array ensures it runs only once

    return (
        <div>
            <form onSubmit={handleMessage}>

                <input type = 'textfield 'value={message} onChange={(e) => setMessage(e.target.value)}></input>
                <button type='submit'>Send</button>
            </form>
        </div>
    );
}
