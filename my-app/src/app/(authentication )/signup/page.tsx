"use client"
import { useState } from "react";
import { useRouter} from "next/navigation";
import Link from 'next/link'
import axios from "axios";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email,setEmail] = useState("")
    const [name,setName] = useState("")
    const router = useRouter();
    const [error,setError] = useState('')

    const handleGoogleLogin = async () => {
        try {
          const response =  window.location.href = 'http://localhost:8000/user/auth/google';
         
        } catch (error) {
            setError(error.response.data.message)
        }
    }

    const handleSignup = async (e) => {
        
        e.preventDefault();
try {
    const response = await axios.post(
        'http://localhost:8000/user/signup',
        {username, password, email,name},
        { withCredentials: true }
      );
      router.push('/login');
    } catch (err) {
        setError(err.response.data.message)
    }
    }
  

    return (
        <div>
            <h1>Signup Page</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSignup}>
                Username:<input
                    type="username"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                /><br></br>
                Email:<input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                /><br></br>
                 Name:<input
                    type="name"
                    placeholder="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                /><br></br>
                 <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br></br>
                <button type="submit">Signup</button>
            </form>

            <button onClick={handleGoogleLogin}>Signup with google</button><br>
            </br>
            <h4>Already have an account?     <Link href="/login">Login</Link></h4>
         
        </div>
    )
}