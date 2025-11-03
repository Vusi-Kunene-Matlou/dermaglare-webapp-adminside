import React, { useState } from "react";

// 1. Define a type for the Page object structure
interface Page {
  name:
    | "Dashboard"
    | "Product Management"
    | "Order Management"
    | "User Management";
  icon: string;
}

// 2. Type the main component using React.FC (Functional Component)
const AdminLogin: React.FC = () => {
  // 3. Use state to manage authentication and page navigation, explicitly typing useState
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page["name"]>("Dashboard");

  // 4. Handle a mock login event. Typing the event as React.FormEvent<HTMLFormElement>
  const handleLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // In a real app, this is where credential validation would happen.
    setIsLoggedIn(true);
  };

  // Handle the logout event.
  const handleLogout = (): void => {
    setIsLoggedIn(false);
  };

  // 5. Define the pages and their corresponding icons, explicitly typing the array
  const pages: Page[] = [
    {
      name: "Dashboard",
      icon: "M2 3a1 1 0 011-1h18a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM10 11H6v-4h4v4zM18 11h-4v-4h4v4zM10 18H6v-4h4v4zM18 18h-4v-4h4v4z",
    },
    {
      name: "Product Management",
      icon: "M17.5 13.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM12 21.5V13a1 1 0 011-1h6a1 1 0 011 1v8.5a1 1 0 01-1 1H13a1 1 0 01-1-1zM6 13h4v4H6v-4zm-4 0h4v4H2v-4zM6 19h4v4H6v-4zm-4 0h4v4H2v-4zM22 6.5V2h-4.5V6H22zM2 6.5V2h4.5V6H2z",
    },
    {
      name: "Order Management",
      icon: "M9 13H5a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2zM15 13h4a2 2 0 002-2V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 002 2zM9 21H5a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2zM15 21h4a2 2 0 002-2v-4a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 002 2z",
    },
    {
      name: "User Management",
      icon: "M18 20a4 4 0 00-4-4H8a4 4 0 00-4 4M12 12a4 4 0 100-8 4 4 0 000 8z",
    },
  ];

  // Render the content based on the current page selected.
  const renderPage = (): React.ReactElement => {
    switch (currentPage) {
      case "Dashboard":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl">
              <div>
                <h3 className="text-sm text-gray-200 font-medium">
                  Total Sales
                </h3>
                <p className="text-3xl font-bold mt-1 text-white">R45,231</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 17a5 5 0 110-10 5 5 0 010 10z" />
                </svg>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl">
              <div>
                <h3 className="text-sm text-gray-200 font-medium">
                  New Customers
                </h3>
                <p className="text-3xl font-bold mt-1 text-white">89</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 17a5 5 0 110-10 5 5 0 010 10z" />
                </svg>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl">
              <div>
                <h3 className="text-sm text-gray-200 font-medium">
                  Products Sold
                </h3>
                <p className="text-3xl font-bold mt-1 text-white">1,250</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 17a5 5 0 110-10 5 5 0 010 10z" />
                </svg>
              </div>
            </div>
          </div>
        );
      case "Product Management":
        return (
          <h1 className="text-3xl font-bold text-gray-800">
            Product Management
          </h1>
        );
      case "Order Management":
        return (
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        );
      case "User Management":
        return (
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        );
      default:
        // Use an exhaustive check for the currentPage string union if needed,
        // but for now, we'll return a default element.
        return (
          <h1 className="text-3xl font-bold text-gray-800">Page Not Found</h1>
        );
    }
  };

  // If not logged in, show the login page.
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 relative overflow-hidden">
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fadeIn 0.8s ease-out forwards;
            }

            @keyframes bg-gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .animate-bg-gradient {
              background: linear-gradient(-45deg, #1A202C, #2D3748, #00A3A2, #007F7F);
              background-size: 400% 400%;
              animation: bg-gradient 15s ease infinite;
            }

            @keyframes rotate-in {
              from { opacity: 0; transform: rotate(15deg) scale(0.9); }
              to { opacity: 1; transform: rotate(0deg) scale(1); }
            }
            .animate-rotate-in {
              animation: rotate-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
            }

            @keyframes glow-pulse {
              0% { box-shadow: 0 0 5px #00A3A2, 0 0 10px #00A3A2; }
              50% { box-shadow: 0 0 20px #00A3A2, 0 0 30px #00A3A2; }
              100% { box-shadow: 0 0 5px #00A3A2, 0 0 10px #00A3A2; }
            }
            .animate-glow {
              animation: glow-pulse 2s ease-in-out infinite alternate;
            }
          `}
        </style>
        <div className="absolute inset-0 z-0 animate-bg-gradient"></div>
        <div className="relative z-10 p-8 rounded-xl shadow-2xl w-full max-w-md bg-white/10 backdrop-blur-md animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-2 text-center text-white">
            Admin Login
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Access the Dermaglare Admin Portal
          </p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-200 text-sm font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-2 border-transparent focus:outline-none focus:border-[#00A3A2] transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-200 text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-2 border-transparent focus:outline-none focus:border-[#00A3A2] transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#00A3A2] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#007F7F] transition-colors shadow-lg transform hover:scale-105"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If logged in, show the main dashboard layout.
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 animate-fade-in">
      <style>
        {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fadeIn 0.8s ease-out forwards;
            }

            @keyframes slideInLeft {
              from { opacity: 0; transform: translateX(-50px); }
              to { opacity: 1; transform: translateX(0); }
            }
            .animate-slide-in-left {
              animation: slideInLeft 0.8s ease-out forwards;
            }
            
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(50px); }
              to { opacity: 1; transform: translateX(0); }
            }
            .animate-slide-in-right {
              animation: slideInRight 0.8s ease-out forwards;
            }

            @keyframes glow-pulse {
              0% { box-shadow: 0 0 5px #00A3A2, 0 0 10px #00A3A2; }
              50% { box-shadow: 0 0 20px #00A3A2, 0 0 30px #00A3A2; }
              100% { box-shadow: 0 0 5px #00A3A2, 0 0 10px #00A3A2; }
            }
            .animate-glow {
              animation: glow-pulse 2s ease-in-out infinite alternate;
            }
          `}
      </style>
      {/* Sidebar Navigation */}
      <div className="md:w-64 bg-gray-900 p-6 shadow-2xl text-white flex-shrink-0 animate-slide-in-left">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#00A3A2] rounded-full flex items-center justify-center mr-2 animate-glow">
              <span className="font-bold text-white text-xl">D</span>
            </div>
            <span className="text-2xl font-bold">Dermaglare</span>
          </div>
        </div>
        <nav>
          {pages.map((page) => (
            <button
              key={page.name}
              // Casting to 'string' is necessary because page.name is a union type
              onClick={() => setCurrentPage(page.name)}
              className={`flex items-center w-full py-3 px-4 rounded-xl transition-all duration-300 mb-2 ${
                currentPage === page.name
                  ? "bg-[#00A3A2] text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-800 hover:text-[#00A3A2]"
              }`}
            >
              <svg
                className="w-6 h-6 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d={page.icon} />
              </svg>
              <span className="font-medium">{page.name}</span>
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center w-full py-3 px-4 rounded-xl text-red-400 hover:bg-gray-800 transition-colors mt-auto font-medium"
        >
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.586 16.586a2 2 0 102.828-2.828L12 7.172 8.586 10.586a2 2 0 102.828 2.828L12 12l3.586 4.586zM12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
          </svg>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto animate-slide-in-right">
        <header className="flex flex-col md:flex-row items-center justify-between pb-6 mb-6 border-b border-gray-300">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">
            {currentPage}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                className="w-full pl-12 pr-4 py-2 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00A3A2] transition-colors"
                placeholder="Search..."
              />
              <svg
                className="w-6 h-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21.71 20.29l-4.59-4.59A9 9 0 1011 20a9 9 0 005.7-2.09l4.59 4.59a1 1 0 001.42-1.42zM4 11a7 7 0 1114 0 7 7 0 01-14 0z" />
              </svg>
            </div>
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        <main>{renderPage()}</main>
      </div>
    </div>
  );
};

export default AdminLogin;
