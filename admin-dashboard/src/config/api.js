const BASE_DOMAIN = 'https://nonsolidified-annika-criminally.ngrok-free.dev/api';
export const API_BASE_URL = `${BASE_DOMAIN}/admin`;
export const BOOKING_API_URL = `${BASE_DOMAIN}/booking`;
export const AUTH_API_URL = `${BASE_DOMAIN}/auth`;

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
        }
    };
};
