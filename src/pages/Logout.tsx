
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LogOut, Heart } from "lucide-react";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        toast.success("You have been successfully logged out");
        navigate("/");
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("There was a problem logging you out. Please try again.");
        navigate("/dashboard");
      }
    };
    
    performLogout();
  }, [logout, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50/30">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-primary/20 max-w-md w-full mx-4">
        <div className="flex justify-center mb-6">
          <div className="bg-primary p-4 rounded-full">
            <LogOut className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">
          Logging you out...
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for using BrahminSoulmate. We hope to see you again soon!
        </p>
        <div className="flex items-center justify-center space-x-2 text-red-500">
          <Heart className="h-5 w-5 animate-heartBeat" />
          <span className="text-sm">Until we meet again...</span>
          <Heart className="h-5 w-5 animate-heartBeat" />
        </div>
      </div>
    </div>
  );
};

export default Logout;
