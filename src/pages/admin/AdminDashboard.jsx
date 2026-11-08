
function AdminDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="min-h-screen bg-primary p-8">

            <div className="max-w-7xl mx-auto">

                {/* Welcome Section */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-secondary">
                        Admin Dashboard
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Welcome back, {user?.firstName}!
                    </p>

                </div>

                {/* Statistics */}
                <div className="grid md:grid-cols-3 gap-6">

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-gray-500">
                            Total Students
                        </h2>

                        <p className="text-3xl font-bold text-secondary mt-3">
                            0
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-gray-500">
                            Total Accommodations
                        </h2>

                        <p className="text-3xl font-bold text-secondary mt-3">
                            0
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-gray-500">
                            Total Bookings
                        </h2>

                        <p className="text-3xl font-bold text-secondary mt-3">
                            0
                        </p>
                    </div>

                </div>

                {/* Management Section */}
                <div className="bg-white p-8 rounded-xl shadow-sm mt-8">

                    <h2 className="text-xl font-bold text-secondary">
                        Management
                    </h2>

                    <div className="grid md:grid-cols-3 gap-5 mt-6">

                        <div className="bg-primary p-5 rounded-lg">
                            <h3 className="font-bold text-secondary">
                                Student Management
                            </h3>

                            <p className="text-gray-600 text-sm mt-2">
                                Manage student accounts.
                            </p>
                        </div>

                        <div className="bg-primary p-5 rounded-lg">
                            <h3 className="font-bold text-secondary">
                                Accommodation Management
                            </h3>

                            <p className="text-gray-600 text-sm mt-2">
                                Manage accommodation listings.
                            </p>
                        </div>

                        <div className="bg-primary p-5 rounded-lg">
                            <h3 className="font-bold text-secondary">
                                Booking Management
                            </h3>

                            <p className="text-gray-600 text-sm mt-2">
                                View and manage bookings.
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;
