// components/ProtectedRoute.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();


    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            console.log("Token:", token);

            if (!token) {
                navigate('/auth/boxed-signin');
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/verify-token`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Token verification failed');
                }
                console.log(response);
            } catch (error) {
                console.error("Token verification failed:", error);
                localStorage.removeItem('token');
                navigate('/auth/boxed-signin');
            }
        };

        verifyToken();
    }, [navigate]);



    return children;
};

export default ProtectedRoute;
