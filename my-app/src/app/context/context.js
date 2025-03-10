"use client";
import { createContext, useContext, useState } from "react";

const UserContext = createContext(null); // Initialize as null

export function UserProvider({ children }) {
  const [userDetail, setUserDetail] = useState(null); // Initial value is null or empty object

  return (
    <UserContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext); // Return the context object directly
}
