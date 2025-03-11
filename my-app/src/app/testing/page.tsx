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
    const groupid = searchParams.get("groupid"); // For group chats

    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(chatid || null);
    const [selectedGroupId, setSelectedGroupId] = useState(groupid || null); // Track selected group
    const [error, setError] = useState("");
    const [typing, setTyping] = useState(false);
    const [usertyping, setUserTyping] = useState('');
    const [roomId, setRoomId] = useState('');
    const { userDetail, setUserDetail } = useUser(); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [groupChats, setGroupChats] = useState([]);

    // Fetch user details if not present
    useEffect(() => {
        if (!userDetail) {
            axios
                .get("http://localhost:8000/user/getuserdetail", { 
                    withCredentials: true 
                })
                .then((response) => {
                    const user = response.data.user;
                    setUserDetail({
                        name: user.name,
                        email: user.email,
                        id: user._id
                    });
                    setRoomId(user._id);
                })
                .catch((error) => {
                    console.error("Error fetching user:", error);
                });
        }
    }, [userDetail, setUserDetail]);

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

        newSocket.on('typing', (data) => {
            setTyping(data.typing);
            setUserTyping(data.userId);
            setTimeout(() => {
                setTyping(false);
            }, 5000);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (userDetail && socket) {
            socket.emit('join', userDetail._id);
        }
    }, [userDetail, socket]);

    // Fetch users
    useEffect(() => {
        axios.get("http://localhost:8000/user/getusers", { withCredentials: true })
            .then((res) => setUsers(res.data))
            .catch((err) => console.error(err));
    }, []);

    // Fetch messages for group or individual chat
    useEffect(() => {
      const fetchMessages = async () => {
          setMessages([]); // Clear messages before fetching new ones
          try {
              let res;
              if (selectedGroupId) {
                  res = await axios.get(
                      `http://localhost:8000/chat/getgroupmessage/${selectedGroupId}`,
                      { withCredentials: true }
                  )
                  if (res.data.chat && res.data.chat.messages) {
                      setMessages(res.data.chat.messages);
                  }
              } else if (selectedUserId) {
                  console.log("Selected User ID:", selectedUserId);
                  res = await axios.get(
                      `http://localhost:8000/chat/getusermessage/${selectedUserId}`,
                      { withCredentials: true }
                  );
                  if (res.data.chat && res.data.chat.messages) {
                      setMessages(res.data.chat.messages);
                  }
              }
          } catch (err) {
              setError(err.response?.data?.message || "Error fetching messages");
              console.error("Error fetching messages:", err);
          }
      };
  
      if (selectedUserId || selectedGroupId) {
          fetchMessages();
      }
  
  }, [selectedUserId, selectedGroupId]);

    // Function to handle sending message
    const handleMessage = async (e) => {
        e.preventDefault();
        if ((!selectedUserId && !selectedGroupId) || !message.trim()) return;
        try {
            if (selectedGroupId) {
                await axios.post(
                    "http://localhost:8000/chat/sendgroupmessage",
                    { targetgroupid: selectedGroupId, message },
                    { withCredentials: true }
                );
            } else {
                await axios.post(
                    "http://localhost:8000/chat/sendmessage",
                    { targetuserid: selectedUserId, message },
                    { withCredentials: true }
                );
            }

            setMessage(""); // Clear input field
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    // Handle creating a group chat
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

    // Handle selecting a group
    const handleViewGroup = async (groupId) => {
        router.push(`/chat?groupid=${groupId}`, { shallow: true });
        setSelectedGroupId(groupId);
        setSelectedUserId(null);
        setMessages([]);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
            {/* User List */}
            <div className="w-1/3 bg-gray-200 p-4 overflow-y-auto">
                <h2 className="text-xl font-bold mb-3">
                    Welcome, {userDetail ? userDetail.name : "Loading..."}
                </h2>
                <h2 className="text-xl font-bold mb-3">Users:</h2>
                {users.length > 0 ? (
                    <ul className="space-y-2">
                        {users.map((user) => (
                            <li 
                                key={user._id} 
                                onClick={() => {
                                    setSelectedGroupId(null);
                                    setSelectedUserId(user._id);
                                }}
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

                <h2 className="text-xl font-bold mb-3">Groups:</h2>
                <button 
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" 
                    onClick={() => setIsModalOpen(true)}
                >
                    Create Group
                </button>

                {groupChats.length > 0 ? (
                    <ul className="space-y-2">
                        {groupChats.map((group) => (
                            <li 
                                key={group._id} 
                                onClick={() => handleViewGroup(group._id)}
                                className="p-3 cursor-pointer rounded-lg bg-white"
                            >
                                {group.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No groups found</p>
                )}
            </div>

            {/* Chat Box */}
            <div className={`w-2/3 p-4 transition-all ${selectedUserId || selectedGroupId ? "block" : "hidden md:block"}`}>
                {selectedUserId || selectedGroupId ? (
                    <div className="flex flex-col h-full">
                        <h3 className="text-lg font-bold mb-3">Chat</h3>

                        {/* Message List */}
                        <div className="flex-grow overflow-y-auto border border-gray-300 p-3 rounded-lg bg-white">
                            { messages.length > 0 ? (
                                messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`chat ${msg.sender === (selectedUserId || selectedGroupId) ? "chat-end" : "chat-start"} m-4`}
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
                                        <div className={`chat-bubble p-3 ${msg.sender === (selectedUserId || selectedGroupId) ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No messages yet</p>
                            )}
                        </div>

                        {/* Typing Indicator */}
                        {typing && usertyping !== roomId && (
                            <div className="text-sm text-gray-500 mt-2">
                                Someone is typing...
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleMessage} className="flex mt-3">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-l-lg"
                                placeholder="Type your message..."
                            />
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                ) : (
                    <p>Select a user or group to start chatting</p>
                )}
            </div>

            {/* Group Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
                    <div className="w-96 mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-3">Create Group</h2>
                        <div>
                            <label className="block mb-2">Group Name:</label>
                            <input 
                                type="text" 
                                value={groupName} 
                                onChange={(e) => setGroupName(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md mb-4" 
                            />
                        </div>

                        <div>
                            <label className="block mb-2">Select Members:</label>
                            <select 
                                multiple 
                                value={selectedEmails} 
                                onChange={(e) => setSelectedEmails(Array.from(e.target.selectedOptions, option => option.value))}
                                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                            >
                                {users.map((user) => (
                                    <option key={user._id} value={user.email}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleCreateGroup}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Create Group
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mt-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
