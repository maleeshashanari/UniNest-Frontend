
import { Link } from "react-router-dom";

function Home() {

    return (
        <div className="min-h-screen bg-primary">

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-24">

                <div className="max-w-2xl">

                    <h1 className="text-5xl font-bold text-secondary leading-tight">
                        Find Your Perfect
                        <span className="text-accent"> Student Accommodation</span>
                    </h1>

                    <p className="text-gray-600 text-lg mt-6 leading-relaxed">
                        Discover comfortable and affordable places to stay.
                        UniNest makes finding your next student accommodation
                        easier and more convenient.
                    </p>

                    <div className="flex gap-4 mt-8">

                        <Link
                            to="/register"
                            className="bg-accent text-white px-7 py-3 rounded-lg font-semibold hover:bg-sky-600"
                        >
                            Get Started
                        </Link>

                        <Link
                            to="/login"
                            className="border-2 border-secondary text-secondary px-7 py-3 rounded-lg font-semibold hover:bg-secondary hover:text-white"
                        >
                            Login
                        </Link>

                    </div>

                </div>

            </section>

            {/* Features Section */}
            <section className="bg-white py-16">

                <div className="max-w-7xl mx-auto px-6">

                    <h2 className="text-3xl font-bold text-secondary text-center">
                        Why Choose UniNest?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 mt-12">

                        <div className="p-7 bg-primary rounded-xl">
                            <h3 className="text-xl font-bold text-secondary">
                                Find Accommodation
                            </h3>
                            <p className="text-gray-600 mt-3">
                                Discover suitable accommodation options
                                for your student life.
                            </p>
                        </div>

                        <div className="p-7 bg-primary rounded-xl">
                            <h3 className="text-xl font-bold text-secondary">
                                Affordable Places
                            </h3>
                            <p className="text-gray-600 mt-3">
                                Explore accommodation options that
                                match your budget.
                            </p>
                        </div>

                        <div className="p-7 bg-primary rounded-xl">
                            <h3 className="text-xl font-bold text-secondary">
                                Easy Management
                            </h3>
                            <p className="text-gray-600 mt-3">
                                Manage your student account easily
                                through your dashboard.
                            </p>
                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Home;