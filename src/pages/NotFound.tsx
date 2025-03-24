
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "with search params:",
      location.search
    );

    // Extract and display URL parameters for debugging
    const params = new URLSearchParams(location.search);
    const paramsObj: Record<string, string> = {};
    params.forEach((value, key) => {
      paramsObj[key] = value;
    });
    setUrlParams(paramsObj);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
          <p className="text-2xl text-gray-700 mb-6">Oops! Page not found</p>
          <p className="text-gray-600 mb-4">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-md text-left mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Technical details:</p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Path:</span> {location.pathname}
            </p>
            {location.search && (
              <div className="mt-2">
                <p className="text-sm font-semibold text-gray-700">URL Parameters:</p>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {Object.keys(urlParams).length > 0 
                    ? JSON.stringify(urlParams, null, 2) 
                    : "No parameters"}
                </pre>
              </div>
            )}
          </div>
          
          <a 
            href="/" 
            className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
