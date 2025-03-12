import { useState } from "react";
import axios from "axios";

export default function CreateGroupChat({users , setIsModalOpen}){


    
        const [groupName, setGroupName] = useState("");
        const [selectedEmails, setSelectedEmails] = useState([]);
        const [groupChats, setGroupChats] = useState([]);

        //Handle CheckBox
        const handleCheckboxChange = (email) => {
            setSelectedEmails((prev) =>
                prev.includes(email)
                    ? prev.filter((item) => item !== email)
                    : [...prev, email]
            );
        };

        // Handle creating a group chat
        const handleCreateGroup = async () => {
            try {
                if (!groupName || selectedEmails.length === 0) {
                    alert("Please enter a group name and select members.");
                    return;
                }
                console.log('emails' , selectedEmails)
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

    return (
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
                {users.map((user) => (
                            <label key={user._id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedEmails.includes(user.email)}
                                    onChange={() => handleCheckboxChange(user.email)}
                                />
                                {user.name} ({user.email})
                            </label>
                        ))}
            </div>
            <div className=" justify-around flex">
            <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                Create Group
            </button>
            <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-gray-600 "
            >
                Cancel
            </button>
            </div>
        </div>
    </div>
    )

}