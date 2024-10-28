import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useToast } from '../../components/ToastProvider'

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { showMessage } = useToast();
    useEffect(() => {
        const savedAuth = localStorage.getItem('isAuthenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const userExists:boolean = await invoke('login_user', { login: username, password: password });
            
            if (userExists) {
                const userRole:string = await invoke('get_user_role', { login: username, password: password });
                setIsAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('loginName', username);
                localStorage.setItem('userRole', userRole);

                showMessage('Login successful');
            } else {
                showMessage('Invalid username or password');
            }
        } catch (error) {
            console.error('Failed to login', error);
            showMessage(`Failed to login: ${error}`);
        }
    };

    const logout = async () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        showMessage('You have been logged out');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
