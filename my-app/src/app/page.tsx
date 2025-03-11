"use client"
import { useEffect, useState } from "react";
import { useUser } from "./context/context"; // Assuming you are using context to store userDetail
import axios from "axios";
import Link from "next/link";

export default function Home() {
  const { userDetail, setUserDetail } = useUser();
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if the userDetail is already set
    if (!userDetail) {
      axios
        .get("http://localhost:8000/user/getuserdetail", { withCredentials: true })
        .then((response) => {
          const user = response.data.user;
          setUserDetail({
            name: user.name,
            email: user.email,
            id : user._id
          });
        })
        .catch((error) => {
          setError("Error fetching user details");
         
        //  window.location.href = ('/login')
          console.error("Error fetching user details:", error);
          
        });
    }
  }, [userDetail, setUserDetail]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
  <div className="max-w-4xl w-full space-y-8">
    {/* Welcome Title Section */}
    <div className="mb-12">
      <div className="flex items-baseline space-x-4">
        <h1 className="font-bold text-6xl md:text-8xl text-blue-600 transform hover:scale-105 transition-transform">
          Welcome!
        </h1>
        <h4 className="font-semibold text-xl md:text-2xl text-gray-700 mt-2">
          to Realtime Chat Application
        </h4>
      </div>
    </div>

    {/* User Content Section */}
    {userDetail ? (
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto hover:shadow-2xl transition-shadow">
        <h2 className="text-2xl font-medium text-gray-800 mb-2">
          👋 Welcome back, <span className="text-blue-600">{userDetail.name}</span>
        </h2>
        <p className="text-gray-600 mb-4">{userDetail.email}</p>
        <Link 
          href="/chat"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>Start Chatting</span>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M10 0l10 10-10 10-1.176-1.176L16.149 11H0V9h16.149L8.824 1.176 10 0z"/>
          </svg>
        </Link>
      </div>
    ) : (
      <div className="text-center">
        <Link 
          href="/signup"
          className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-semibold px-8 py-4 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
        >
          🚀 Join Now - Start Chatting!
        </Link>
      </div>
    )}
  </div>
</div>
  )
}
