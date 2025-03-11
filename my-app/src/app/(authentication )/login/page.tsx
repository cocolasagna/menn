"use client"
import { useState } from "react";
import { useRouter} from "next/navigation";
import axios from "axios";
export default function testing(){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [error,setError] = useState('')

    const handleGoogleLogin = async () => {
        try {
          const response =  window.location.href = 'http://localhost:8000/user/auth/google';
         
        } catch (error) {
            setError(error.response.data.message)
        }
    }

    const handleLogin = async (e) => {
        console.log('button clicked')
        e.preventDefault();
try {
    const response = await axios.post(
        'http://localhost:8000/user/login',
        {username, password},
        { withCredentials: true }
      );
      router.push('/');
    } catch (err) {
        setError(err.response.data.message)
    }
    }
  

return(
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
        <div className = 'w-full max-w-md p-6 border-4 bg-white border-gray-300  rounded-lg shadow-lg'>
            <div className="mb-4 text-center pb-3 border-b-2">
                <h1 className = "text-2xl font-semibold">Login</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-4 ">
                <div>
                    <label className="block font-medium">Username:</label>
                    <input type= "text" placeholder="Username"  value={username }
                    onChange={(e) => setUsername(e.target.value)}
                    className = "w-full p-2 border rounded-md "  />

                </div>
                <div>
                    <label className="block font-medium">Password:</label>
                    <input type = "password" placeholder="Enter Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                     className="w-full p-2 border rounded-md"  />
                </div>
               
                    <button type = "submit" className= 'w-full p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600'type="submit">Login</button>
               
            </form>
            <button onClick={handleGoogleLogin} className="w-full mt-3 p-2 text-white bg-red-500 rounded-md hover:bg-red-600">Login from Google</button>

        </div>
    </div>
)

}


