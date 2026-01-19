// lib/user-context.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the user object
export interface User {
  id: string;
  name: string;
  avatar: string; // initials or profile image
  title: string; // professional title
  verificationStatus: "verified" | "pending" | "rejected";
  rating: number;
  reviewCount: number;
}

// Define the context type
interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

// Create context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: "1",
    name: "John Doe",
    avatar: "J",
    title: "Electrician — Home Repairs",
    verificationStatus: "verified",
    rating: 4.8,
    reviewCount: 15,
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for consuming the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
