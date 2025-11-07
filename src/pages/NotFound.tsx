import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h1 className="text-6xl font-bold text-brahmin-primary mb-4">404</h1>
          <p className="text-2xl text-gray-600 mb-6">Page not found</p>
          <p className="text-gray-500 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been removed, 
            renamed, or doesn't exist.
          </p>
          <Link to="/">
            <Button className="bg-brahmin-primary hover:bg-brahmin-dark text-white">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
