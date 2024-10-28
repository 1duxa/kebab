import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "./Header.css";

export default function Header() {
    const { logout,isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const loginName:string | null = localStorage.getItem("loginName");
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }
    return (
        <div className="header-wrap">
            <Link to="/about" className="header-item">Про нас</Link>
            <Link to="/order" className="header-item">Зробити замовлення</Link>
            <Link to="/support" className="header-item">Підтримка</Link>
            <Link to="/me" className="header-item">{loginName}</Link>
            <p className="header-item" onClick={handleLogout}>Вихід</p>
        </div>
    );
}
