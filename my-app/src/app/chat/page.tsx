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
    const [typing, setTyping] = useState(false)
    const [usertyping , setUserTyping] = useState('')
    const [roomId, setroomId] = useState('')
    const { userDetail, setUserDetail } = useUser(); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [groupChats, setGroupChats] = useState([])
    const [selectedGroupId, setSelectedGroupId] = useState('')


//Creating Group

const handleCreateGroup = async () => {
    try {
        if (!groupName || selectedEmails.length === 0) {
            alert("Please enter a group name and select members.");
            return;
        }

        const res = await axios.post(
            "http://localhost:8000/chat/creategroupchat",
            { name: groupName, members: selectedEmails },
            { withCredentials: true }
        );

        alert("Group created successfully!");
        setIsModalOpen(false);
        setGroupName("");
        setSelectedEmails([]);
    } catch (error) {
        console.error("Error creating group:", error);
        alert("Failed to create group.");
    }
};

//Getting Group Chat
useEffect(() => {
    axios.get('http://localhost:8000/chat/getgroupchats', { withCredentials: true})
    .then((res)=>{
        setGroupChats(res.data)
    })
    .catch((err)=>{
        console.log(err)
    })
},[])


//Getting Group Data

const handleViewGroup = async(groupId)=>{
    router.push(`/chat?groupid=${groupId}`, { shallow: true });
    setSelectedGroupId(groupId);
    setMessages([]);

    try {
        const res = await axios.get(
            `http://localhost:8000/chat/getgroupmessage/${groupId}`,
            { withCredentials: true }
        );
        setMessages(res.data.chat.messages || []);
    } catch (err) {
        setError(err.response?.data?.message || "Error fetching messages");
        console.error(err);
    }
}


    const handleTyping = () => {
        
        if (!socket) {console.log('socket not found')};
        try {
            socket.emit("typing", { selectedUserId});
        } catch (error) {
            console.log(error)
        }
        
    };

    

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
                        id: user._id
                    });
                    setroomId(user._id)
                  
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

        newSocket.on('typing',(data)=>{
            setTyping(data.typing)
            setUserTyping(data.userId)
            setTimeout(()=>{
                setTyping(false)
            },5000)
        
        })
      

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(()=>{
        if(userDetail &&socket){
            socket.emit('join',userDetail._id)
        }
    } , [userDetail,socket])

    // Fetch user list
    useEffect(() => {
        axios.get("http://localhost:8000/user/getusers", { withCredentials: true })
            .then((res) => setUsers(res.data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
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
                <h2 className="text-xl font-bold mb-3">
                    Groups:
                    </h2>
                    <button  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"  onClick = {()=>setIsModalOpen(true)}>Create Group</button>
                    {groupChats && groupChats.length > 0?(
                        <ul className="space-y-2">
                            {groupChats.map((group) => (
                                <li className='p-3 cursor-pointer rounded-lg bg-white' onClick ={()=>handleViewGroup(group._id) }
                                    key={group._id} 
                                    >
                                    {group.name}
                                </li>
                            ))}
                    
                        </ul>
                    ):(<p>No groups found</p>)}
            </div>
                    
                 {/* Group Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Create Group</h2>
                        <input
                            type="text"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md mb-3"
                        />
                        <h3 className="text-lg font-bold mb-2">Select Members</h3>
                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                            {users.map((user) => (
                                <label key={user._id} className="block">
                                    <input
                                        type="checkbox"
                                        value={user.email}
                                        onChange={(e) => {
                                            const email = e.target.value;
                                            setSelectedEmails((prev) =>
                                                prev.includes(email)
                                                    ? prev.filter((item) => item !== email)
                                                    : [...prev, email]
                                            );
                                        }}
                                        className="mr-2"
                                    />
                                    {user.name} ({user.email})
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded-md mr-2"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateGroup}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Box - Hidden until a user is selected */}
            <div className={`w-2/3 p-4 transition-all ${selectedUserId ? "block" : "hidden md:block"}`}>
                {selectedUserId && !isModalOpen? (
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
                            {typing &&      <div 
                                       
                                        className={`chat ${usertyping === selectedUserId ? "chat-end" : "chat-start"} m-4`}
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
                                           usertyping === selectedUserId 
                                            ? "bg-gray-300 " 
                                            : "bg-blue-500 text-white"
                                        }`}>
                                            User is typing ...
                                        </div>
                                        
                                        
                                    </div>}
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleMessage} className="mt-3 flex">
                            <textarea
                                className="flex-grow p-2 border border-gray-400 rounded-md"
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value)
                                    handleTyping()
                                
                                }}
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
