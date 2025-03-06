"use client"
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function Chat() {
    const [socket, setSocket] = useState(null);

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
        <div>Chat Page</div>
    );
}
