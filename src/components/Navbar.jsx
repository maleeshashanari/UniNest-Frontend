
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );

    // Update navbar after login or logout
    useEffect(() => {
        const updateUser = () => {
            setUser(JSON.parse(localStorage.getItem("user")));
        };

        window.addEventListener("authChanged", updateUser);

        return () => {
            window.removeEventListener("authChanged", updateUser);
        };
    }, []);

    // Logout user
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.dispatchEvent(new Event("authChanged"));

        navigate("/login");
    };

    return (
        <nav className="bg-secondary text-white shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <Link to="/" className="text-2xl font-bold">
                    Uni<span className="text-accent">Nest</span>
                </Link>

                {/* Navigation links */}
                <div className="flex items-center gap-6">

                    <Link to="/" className="hover:text-accent">
                        Home
                    </Link>

                    {user ? (
                        <>
                            <Link
                                to={user.role === "admin"
                                    ? "/admin/dashboard"
                                    : "/student/dashboard"}
                                className="hover:text-accent"
                            >
                                Dashboard
                            </Link>

                            <span className="text-primary text-sm">
                                {user.firstName}
                            </span>

                            <button
                                onClick={handleLogout}
                                className="bg-accent px-4 py-2 rounded-lg hover:bg-sky-500"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-accent">
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="bg-accent px-4 py-2 rounded-lg hover:bg-sky-500"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>
            </div>
        </nav>
    );
}

export default Navbar;