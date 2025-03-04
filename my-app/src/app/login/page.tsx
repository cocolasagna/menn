"use client"
import { useState } from "react";
import { useRouter} from "next/navigation";
import axios from "axios";

export default function Login() {
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
  

    return (
        <div>
            <h1>Login Page</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleLogin}>
               Username: <input
                    type="username"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                /><br></br>
                Password:<input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br></br>
                <button type="submit">Login</button>
            </form>

            <button onClick={handleGoogleLogin}>Login with google</button>
        </div>
    )
}