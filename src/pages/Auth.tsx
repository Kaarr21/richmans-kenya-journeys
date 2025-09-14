import { AuthPageDjango } from "@/components/AuthPageDjango";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/admin');
  };

  return <AuthPageDjango onAuthSuccess={handleAuthSuccess} />;
};

export default Auth;