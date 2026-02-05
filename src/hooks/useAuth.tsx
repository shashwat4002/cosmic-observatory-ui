// src/hooks/useAuth.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for authentication
const AuthContext = createContext({});

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Simulate fetching user from an API or local storage
    useEffect(() => {
        const fetchUser = async () => {
            // Fetch user data logic here (e.g. fetch from API)
            const userData = await new Promise(resolve => {
                setTimeout(() => resolve(null), 1000); // Simulate async
            });
            setUser(userData);
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = async (username, password) => {
        // Add your login logic here
        const userData = { username }; // Mock user data
        setUser(userData);
    };

    const logout = async () => {
        // Add your logout logic here
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the Auth context
export const useAuth = () => {
    return useContext(AuthContext);
};
