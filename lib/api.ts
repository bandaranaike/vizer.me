import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/auth', // Replace with your NestJS backend
});

export const checkEmail = async (email: string) => {
    const res = await api.post('/check-email', {email});
    return res.data;
};

export const register = async (email: string, name: string, password: string) => {
    const res = await api.post('/register', {email, name, password});
    return res.data;
};

export const login = async (email: string, password: string) => {
    const res = await api.post('/login', {email, password});
    return res.data;
};
