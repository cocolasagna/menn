"use client";
import styles from './styles.module.css'
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { io } from "socket.io-client";
import axios from "axios";

export default function Chat() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const chatid = searchParams.get("chatid");

    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(chatid || null);
    const [error, setError] = useState("");

    // Function to send a message
    const handleMessage = async (e) => {
        e.preventDefault();
        if (!selectedUserId || !message.trim()) return;

        try {
            const res = await axios.post(
                "http://localhost:8000/chat/sendmessage",
                { targetuserid: selectedUserId, message },
                { withCredentials: true }
            );

            //setMessages((prev) => [...prev, res.data]); 
            setMessage(""); // Clear input field
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    // Function to fetch messages when a user is clicked
    const handleClick = async (userId) => {
        router.push(`/chat?chatid=${userId}`, { shallow: true });
        setSelectedUserId(userId);
        setMessages([]);

        try {
            const res = await axios.get(
                `http://localhost:8000/chat/getusermessage/${userId}`,
                { withCredentials: true }
            );
            setMessages(res.data.chat.messages || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching messages");
            console.error(err);
        }
    };

    // Fetch messages when chatid changes
    useEffect(() => {
        if (!chatid) return;

        const fetchMessages = async () => {
            setMessages([]);
            try {
                const res = await axios.get(
                    `http://localhost:8000/chat/getusermessage/${chatid}`,
                    { withCredentials: true }
                );
                setMessages(res.data.chat.messages || []);
            } catch (err) {
                setError(err.response?.data?.message || "Error fetching messages");
                console.error(err);
            }
        };

        fetchMessages();
    }, [chatid]);

    // WebSocket Connection
    useEffect(() => {
        const newSocket = io("http://localhost:8000", { withCredentials: true });
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to server, socket ID:", newSocket.id);
        });

        newSocket.on("newMessage", (newMessage) => {
            setMessages((prev) => [...prev, newMessage]); // Update UI instantly
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Fetch user list
    useEffect(() => {
        axios.get("http://localhost:8000/user/getusers", { withCredentials: true })
            .then((res) => setUsers(res.data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <h2>Users</h2>
            {users.length > 0 ? (
                <ul>
                    {users.map((user) => (
                        <li key={user._id} onClick={() => handleClick(user._id)}>
                            {user.name}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users found</p>
            )}

            {selectedUserId && (
                <div>
                    <h3>Chat</h3>
                    <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
                        {messages.map((msg, index) => (
                            <p key={index} style={{ textAlign: msg.sender === selectedUserId ? "right" : "left" }}>
                                <strong>{msg.sender === selectedUserId ? "User" : "You"}:</strong> {msg.text}
                            </p>
                        ))}
                    </div>

                    <form onSubmit={handleMessage} style={{ marginTop: "10px" }}>
                        <textarea className='textarea-primary border-r-2 text-black'
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
}
