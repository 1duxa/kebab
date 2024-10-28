import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function SupportPage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();


    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }
    return (
        <div >
           supportsupport
        </div>
    );
}
