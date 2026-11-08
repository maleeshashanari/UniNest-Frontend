
function StudentDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="min-h-screen bg-primary p-8">

            <div className="max-w-7xl mx-auto">

                {/* Welcome Section */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-secondary">
                        Welcome, {user?.firstName}!
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Welcome to your UniNest student dashboard.
                    </p>

                </div>

                {/* Dashboard Cards */}
                <div className="grid md:grid-cols-3 gap-6">

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-gray-500">
                            Available Accommodations
                        </h2>

                        <p className="text-3xl font-bold text-secondary mt-3">
                            0
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-gray-500">
                            My Bookings
                        </h2>

                        <p className="text-3xl font-bold text-secondary mt-3">
                            0
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-gray-500">
                            Saved Accommodations
                        </h2>

                        <p className="text-3xl font-bold text-secondary mt-3">
                            0
                        </p>
                    </div>

                </div>

                {/* Main Content */}
                <div className="bg-white p-8 rounded-xl shadow-sm mt-8">

                    <h2 className="text-xl font-bold text-secondary">
                        Getting Started
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Start exploring student accommodations and
                        find a comfortable place to stay.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default StudentDashboard;
