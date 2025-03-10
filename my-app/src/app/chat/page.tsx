"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { io } from "socket.io-client";
import axios from "axios";
import { useUser } from "../context/context";

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

    const { userDetail, setUserDetail } = useUser(); 

    // Fetch user details if not present
    useEffect(() => {
        if (!userDetail) {
            axios
                .get("http://localhost:8000/user/getuserdetail", { 
                    withCredentials: true 
                })
                .then((response) => {
                    const user = response.data.user;
                    setUserDetail({ // Update context
                        name: user.name,
                        email: user.email,
                    });
                })
                .catch((error) => {
                    console.error("Error fetching user:", error);
                });
        }
    }, [userDetail, setUserDetail]);

    // Function to send a message
    const handleMessage = async (e) => {
        e.preventDefault();
        if (!selectedUserId || !message.trim()) return;

        try {
            await axios.post(
                "http://localhost:8000/chat/sendmessage",
                { targetuserid: selectedUserId, message },
                { withCredentials: true }
            );

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
        <div className="flex h-screen">
            {/* User List */}
            <div className="w-1/3 bg-gray-200 p-4 overflow-y-auto">
                <h2 className="text-xl font-bold mb-3">
                    Welcome, {userDetail ? userDetail.name : "Loading..."}
                </h2>
                <h2 className="text-xl font-bold mb-3">
                    Users:
                </h2>
                {users.length > 0 ? (
                    <ul className="space-y-2">
                        {users.map((user) => (
                            <li 
                                key={user._id} 
                                onClick={() => handleClick(user._id)}
                                className={`p-3 cursor-pointer rounded-lg ${
                                    selectedUserId === user._id ? "bg-blue-500 text-white" : "bg-white"
                                }`}
                            >
                                {user.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users found</p>
                )}
            </div>

            {/* Chat Box - Hidden until a user is selected */}
            <div className={`w-2/3 p-4 transition-all ${selectedUserId ? "block" : "hidden md:block"}`}>
                {selectedUserId ? (
                    <div className="flex flex-col h-full">
                        <h3 className="text-lg font-bold mb-3">Chat</h3>

                        {/* Message List */}
                        <div className="flex-grow overflow-y-auto border border-gray-300 p-3 rounded-lg bg-white">
                            {messages.length > 0 ? (
                                messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`chat ${msg.sender === selectedUserId ? "chat-end" : "chat-start"} m-4`}
                                    >
                                        {/* Avatar */}
                                        <div className="chat-image avatar">
                                            <div className="w-10 rounded-full">
                                                <img 
                                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" 
                                                    alt="User avatar" 
                                                />
                                            </div>
                                        </div>
                                        <div className={`chat-bubble p-3 rounded-lg ${
                                            msg.sender === selectedUserId 
                                            ? "bg-gray-300 " 
                                            : "bg-blue-500 text-white"
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No messages yet</p>
                            )}
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleMessage} className="mt-3 flex">
                            <textarea
                                className="flex-grow p-2 border border-gray-400 rounded-md"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button 
                                type="submit" 
                                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
