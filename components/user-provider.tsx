"use client";

import { createContext, useContext } from "react";

type UserContextValue = {
  userId: string;
  email: string;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  userId,
  email,
  children,
}: {
  userId: string;
  email: string;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={{ userId, email }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
