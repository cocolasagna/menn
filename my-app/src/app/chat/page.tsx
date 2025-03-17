"use client";
import { useEffect, useState  } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { io } from "socket.io-client";
import axios from "axios";
import { useUser } from "../context/context";
import CreateGroupChat from './components/createGroupChat'
import { useDispatch, useSelector } from "react-redux";
import { setMessages,addMessages , clearMessages } from "../store/slices/chatSlice";
import { addNotifications , clearNotifications , setNotifications } from "../store/slices/notificationSlice";



export default function Chat() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const chatid = searchParams.get("chatId");
    const groupid = searchParams.get("groupid"); // For group chats

    //Search
    const [searchTerm, setSearchTerm] = useState("");
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState("");
   
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(chatid || null);
    const [selectedGroupId, setSelectedGroupId] = useState(groupid || null); // Track selected group
    const [error, setError] = useState("");
    const [typing, setTyping] = useState(false);
    const [usertyping, setUserTyping] = useState('');
    const [roomId, setRoomId] = useState('');
    const { userDetail, setUserDetail } = useUser() 
    const [previousTargetUserId, setPreviousTargetUserId] = useState(null);



    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [groupChats, setGroupChats] = useState([]);
    


    //Reducers
    const messages = useSelector((state) => state.chat.messages);
    const notifications = useSelector((state)=>state.notifications.notifications)

    const [files, setFiles] = useState([]);



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
                   // router.push('/login')
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

            //setMessages((prev) => [...prev, newMessage]); // Update UI instantly
            dispatch(addMessages(newMessage))
        });

        newSocket.on('newNotifications', (newNotifications)=>{
            dispatch(addNotifications(newNotifications))
        })

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



    // Fetch users and Groups
    useEffect(() => {
        axios.get("http://localhost:8000/user/getusers", { withCredentials: true })
            .then((res) => setUsers(res.data))
            .catch((err) => console.error(err));


        axios.get('http://localhost:8000/chat/getgroupchats', { withCredentials: true })
            .then((res) => setGroupChats(res.data))
            .catch((err) => console.error(err));

    }, []);


    // Fetch messages for group or individual chat
    useEffect(() => {
      const fetchMessages = async () => {
        dispatch(clearMessages());
          try {
              let res;
              if (selectedGroupId) {
                  res = await axios.get(
                      `http://localhost:8000/chat/getgroupmessage/${selectedGroupId}`,
                      { withCredentials: true }
                  )
                  
                  if (res.data.chat && res.data.chat.messages) {
                  
                      //setMessages(res.data.chat.messages);
                      dispatch(setMessages(res.data.chat.messages))
                  }
              } else if (selectedUserId) {
                  console.log("Selected User ID:", selectedUserId);
                  res = await axios.get(
                      `http://localhost:8000/chat/getusermessage/${selectedUserId}`,
                      { withCredentials: true }
                  );
                  if (res.data.chat && res.data.chat.messages) {
                      //setMessages(res.data.chat.messages);
                      dispatch(setMessages(res.data.chat.messages))
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
                    { groupId: selectedGroupId, message },
                    { withCredentials: true }
                );

               
            } else {
                await axios.post(
                    "http://localhost:8000/chat/sendmessage",
                    { targetuserid: selectedUserId, message },
                    { withCredentials: true }
                );
               
            }

            setMessage(""); 
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };



    // Handle selecting a group
    const handleViewGroup = async (groupId) => {
        router.push(`/chat?groupid=${groupId}`)
        setSelectedGroupId(groupId);
        socket.emit('joinGroupRoom' , groupId)
        setSelectedUserId(null);
        dispatch(clearMessages())
    };


    const handleViewPrivate = async (targetUserId) => {
        if (targetUserId !== previousTargetUserId) { // Only clear messages when ID changes
            dispatch(clearMessages());
            setPreviousTargetUserId(targetUserId);
        }
    
        router.push(`/chat?chatId=${targetUserId}`);
        setSelectedGroupId(null);
        socket.emit("joinPrivateRoom", { targetUserId, userId: userDetail.id });
        setSelectedUserId(targetUserId);
    };


//Searching for Users and Groups 
const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredGroups = groupChats.filter(groupChats =>
    groupChats.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


//File Uploads

const handleFileChange = (e) => {
    setFiles(e.target.files); // Stores selected files
  };

  const handleSubmitFile = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      console.log("No files selected");
      return;
    }

    const form = new FormData();

    for (let i = 0; i < files.length; i++) {
      form.append("files", files[i]); 
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/chat/uploadfile",
        form,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Upload success:", response.data);
      setFiles([])
    } catch (error) {
      console.error("Upload error:", error);
    }
}

    return (
       
        <div className="flex h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">

            {/* User List */}
            <div className="w-1/3 bg-gray-200 p-4 overflow-y-auto">
          
                <h2 className="text-xl font-bold mb-3">
                    Welcome, {userDetail ? userDetail.name : "Loading..."}
                </h2>

                <input
               
          type="text"
          placeholder="Search users or groups..."
          className="w-full p-2 rounded-lg border-2 border-black mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

                <h2 className="text-xl font-bold mb-3">Users:</h2>
                {filteredUsers.length > 0 ? (
                    <ul className="space-y-2">
                        {filteredUsers.map((user) => (
                            <li 
                                key={user._id} 
                                onClick={ ()=>handleViewPrivate(user._id)}
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

                <div className="flex space-x-1 justify-between pt-4">
                <h2 className="text-xl font-bold mb-3">Groups:</h2>
                <div className="pb-5">
                <button 
                    className="ml-2 px-4 py-2 bg-amber-300 text-white rounded-md hover:bg-amber-400" 
                    onClick={() => setIsModalOpen(true)}
                >
                    +
                </button>
                </div>
                </div>

                {filteredGroups.length > 0 ? (
                    <ul className="space-y-2">
                        {filteredGroups.map((group) => (
                            <li 
                                key={group._id} 
                                onClick={() => handleViewGroup(group._id)}
                                className= {`p-3 cursor-pointer rounded-lg ${
                                    selectedGroupId === group._id ? "bg-blue-500 text-white" : "bg-white"
                                }`}
                            >
                                {group.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No groups found</p>
                )}

                <div className="mt-4 " >
                    <div className="flex justify-between">
                    <h2 >
                    Notifications:
                    </h2>
                    <button onClick={() => dispatch(clearNotifications())} className="ml-2 px-4 py-2 rounded  bg-red-200 hover:bg-red-500">x</button>
                    </div>
                    {notifications && notifications.length > 0 ?(<ul>{notifications.map((notification ,index)=>(
                        <li key = {index}>
                          
                            {notification}
                            
                            
                        </li>
                    ))}</ul>):(null) }
                </div>
          
               
            
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
                                    userDetail &&(
                                    <div 
                                        key={index} 
                                        className={`chat ${msg.sender === userDetail.id ? "chat-end" : "chat-start"} m-4`}
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
                                        <div className={`chat-bubble p-3 ${msg.sender === userDetail.id ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )) : ((
                                <p>No messages yet</p>
                            ))}
                        </div>

                    

                        {/* Input */}
                        <form onSubmit={handleMessage} className="flex mt-3">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-l-lg"
                                placeholder="Type your message..."
                            />
                            <input>
                            
                            </input>

                            <button 
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                            >
                                Send
                            </button>
                        </form>
                        <form onSubmit = {handleSubmitFile }>
                            <input type="file" multiple onChange={handleFileChange}  />
                            <button type="submit">Send File</button>

                        </form>

                    </div>
                ) : (
                    <p>Select a user or group to start chatting</p>
                )}
                
            </div>
           

            {/* Group Creation Modal */}
            {isModalOpen && <CreateGroupChat users={users} setIsModalOpen={setIsModalOpen} />

            }
        
        </div>

    );
}