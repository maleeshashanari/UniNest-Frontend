import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">

            <div className="w-full max-w-md">

                <Link
                    to="/"
                    className="mb-8 flex items-center justify-center gap-2"
                >
                    <div className="rounded-xl bg-primary-600 p-2 text-white">
                        <GraduationCap size={28} />
                    </div>

                    <span className="text-2xl font-bold text-ink">
                        UniNest
                    </span>
                </Link>

                <div className="rounded-2xl border border-border bg-white p-7 shadow-lg sm:p-9">

                    <div className="mb-7 text-center">
                        <h1 className="text-2xl font-bold text-ink">
                            {title}
                        </h1>

                        <p className="mt-2 text-sm text-muted">
                            {subtitle}
                        </p>
                    </div>

                    {children}

                </div>

                <p className="mt-6 text-center text-xs text-muted">
                    © {new Date().getFullYear()} UniNest. All rights reserved.
                </p>

            </div>
        </div>
    );
}