import Carousel from '../components/carousel/Carousel';
import { useAuth } from './auth/AuthProvider';
import './Main.css';
import { useNavigate } from 'react-router-dom';

export default function Main() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    return (
        <div className='main-content'>
            <div className='content-container'>
                <div id="header-wrap">
                    <h1>Вітаємо!</h1>
                    <p>Популярні товари сьогодні</p>    
                </div>
                <div className='carousel-wrap'>
                    <Carousel/>
                </div>
            </div>
        </div>
    );
}
