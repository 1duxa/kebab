import { useNavigate } from "react-router-dom";
import "./Banner.css"
import { useAuth } from "../auth/AuthProvider";


export default function Banner(){
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    if(!isAuthenticated){
        return null;
    }
    const handleSubmit = async () => {
        navigate('/main'); 
    };
    return(
    <div className="main-body">
        <div id="banner">
            <p onClick={handleSubmit} className="halal-kebab-logo">Halal Kebab</p>
            <video src="./halal.webm" autoPlay  muted loop id="halal-video" onClick={handleSubmit}>
            </video>
        </div>
    </div>
    );
}