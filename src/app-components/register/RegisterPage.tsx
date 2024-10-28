import React, { FormEvent, useState } from 'react';
import { useToast } from '../../components/ToastProvider';
import { Link } from 'react-router-dom';
import './RegisterPage.css';
import { invoke } from '@tauri-apps/api/core';

const RegisterPage: React.FC = () => {
    const { showMessage } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await invoke('register_user', { login: username, password: password });
            showMessage('Registration successful, please login.');
        } catch (error) {
            console.error('Failed to register', error);
            showMessage(`Failed to register: ${error}`);
        }
    };

    return (
        <div className="register-form-wrapper">
            <div className="register-form">
                <h2 className="register-h">Register</h2>
                <form onSubmit={handleSubmit} className="register-block">
                    <div className="username">
                        <label>
                            Username:
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="password">
                        <label>
                            Password:
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>
                    </div>
                    <button className="submit" type="submit">Register</button>
                </form>
                <p className='register-login'>Already registered? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
};

export default RegisterPage;
