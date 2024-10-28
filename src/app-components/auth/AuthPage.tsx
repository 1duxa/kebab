import  { FormEvent, useState } from 'react';
import { useAuth } from './AuthProvider';
import "./AuthPage.css"
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastProvider';
const AuthPage = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const {showMessage} = useToast();

    const handleSubmit = async (e:FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/main'); 
        } catch (error) {
            showMessage('Failed to login \n'+ error);
        }
    };

    return (
        <div className="login-form-wrapper">
            <div className='login-form'>
                <h2 className='login-h'>Login</h2>
                <form onSubmit={handleSubmit} className='login-block'>
                    <div className='username'>
                        <label>
                            Username:
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className='password'>
                        <label>
                            Password:
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>
                    </div>
                    <button className='submit' type="submit">Login</button>
                </form>
                <p className='login-register'>Not registered? <Link to="/register">Register</Link></p>
            </div>
        </div>
    );
};

export default AuthPage;
