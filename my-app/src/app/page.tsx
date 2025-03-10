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
          });
        })
        .catch((error) => {
          setError("Error fetching user details");
          console.error("Error fetching user details:", error);
        });
    }
  }, [userDetail, setUserDetail]);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p>{error}</p>}
      {userDetail ? (
        <div>
          <h2>Name: {userDetail.name}</h2>
          <h3>Email: {userDetail.email}</h3>
          <Link href= "/chat">Goto Chat</Link>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
