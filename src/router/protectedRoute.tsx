// components/ProtectedRoute.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/auth/boxed-signin');
                return;
            }

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

                const response = await fetch(`${import.meta.env.VITE_API_URL_FASTAPI}/verify-token`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error('Token verification failed');
                }

                // Token is valid
                setIsLoading(false);
            } catch (error) {
                console.error("Token verification failed:", error);
                localStorage.removeItem('token');
                navigate('/auth/boxed-signin');
            }
        };

        verifyToken();
    }, [navigate]);

    if (isLoading) {
        return <div>Loading...</div>; // Or your custom loading component
    }

    return children;
};

export default ProtectedRoute;
