import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.text();

            if (!response.ok) {
                try {
                    const json = JSON.parse(data);
                    throw new Error(json.error || 'Error al iniciar sesión');
                } catch (e) {
                    throw new Error('Error del servidor: ' + (data || response.statusText));
                }
            }

            const parsedData = JSON.parse(data);
            localStorage.setItem('token', parsedData.token);
            localStorage.setItem('user', JSON.stringify(parsedData.user));
            setUser(parsedData.user);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (name, email, password, username) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, username }),
            });

            const data = await response.text();

            if (!response.ok) {
                try {
                    const json = JSON.parse(data);
                    throw new Error(json.error || 'Error al registrarse');
                } catch (e) {
                    throw new Error('Error del servidor: ' + (data || response.statusText));
                }
            }
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const searchUser = async (username) => {
        const response = await fetch(`${API_URL}/user/search?username=${username}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    };

    const sendLinkRequest = async (targetUserId) => {
        const response = await fetch(`${API_URL}/user/request-link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ targetUserId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    };

    const getRequests = async () => {
        const response = await fetch(`${API_URL}/user/requests`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    };

    const respondToRequest = async (requestId, action) => {
        const response = await fetch(`${API_URL}/user/respond-link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ requestId, action }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        if (action === 'accept') {
            const updatedUser = { ...user, partnerId: 'linked' };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            searchUser,
            sendLinkRequest,
            getRequests,
            respondToRequest,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
