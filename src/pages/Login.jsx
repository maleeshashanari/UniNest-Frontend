import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    X,
    Check,
    Loader2,
    ArrowRight,
    GraduationCap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validateForm = ({ email, password }) => {
    const errors = {};

    if (!email.trim()) {
        errors.email = "Email address is required";
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.email = "Enter a valid email, like name@example.com";
    }

    if (!password) errors.password = "Password is required";

    return errors;
};

/* ------------------------------------------------------------------ */
/*  Toast notifications (top-right)                                    */
/* ------------------------------------------------------------------ */

const TOAST_DURATION = 5000;

const TOAST_STYLES = {
    success: { icon: CheckCircle2, iconWrap: "bg-success/10 text-success", bar: "bg-success" },
    error: { icon: XCircle, iconWrap: "bg-danger/10 text-danger", bar: "bg-danger" },
    warning: { icon: AlertTriangle, iconWrap: "bg-warning/10 text-warning", bar: "bg-warning" },
    info: { icon: Info, iconWrap: "bg-primary-100 text-primary-600", bar: "bg-primary-500" },
};

function Toast({ toast, onClose }) {
    const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
    const Icon = style.icon;

    useEffect(() => {
        const timer = setTimeout(() => onClose(toast.id), TOAST_DURATION);
        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    return (
        <div
            role={toast.type === "error" ? "alert" : "status"}
            className="animate-toast-in pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-border bg-white/95 shadow-2xl shadow-primary-900/15 backdrop-blur-xl"
        >
            <div className="flex items-start gap-3 p-4">
                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
                >
                    <Icon size={22} />
                </span>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{toast.title}</p>
                    {toast.message && <p className="mt-0.5 text-sm text-muted">{toast.message}</p>}
                </div>

                <button
                    type="button"
                    onClick={() => onClose(toast.id)}
                    aria-label="Dismiss notification"
                    className="rounded-lg p-1 text-muted transition hover:bg-background hover:text-ink"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="h-1 w-full bg-background">
                <div
                    className={`h-full ${style.bar}`}
                    style={{ animation: `toast-progress ${TOAST_DURATION}ms linear forwards` }}
                />
            </div>
        </div>
    );
}

function ToastContainer({ toasts, onClose }) {
    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-end gap-3 sm:left-auto sm:right-6 sm:top-6 sm:w-96"
        >
            {toasts.map((t) => (
                <Toast key={t.id} toast={t} onClose={onClose} />
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Inputs (defined outside Login so they keep focus while typing)     */
/* ------------------------------------------------------------------ */

const inputBase =
    "flex h-12 w-full items-center rounded-2xl border text-[15px] text-ink placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-4";
const inputOk =
    "border-border bg-background hover:border-slate-300 focus:border-primary-500 focus:ring-primary-500/10";
const inputBad = "border-danger bg-danger/5 focus:border-danger focus:ring-danger/10";

function Field({ label, name, icon: Icon, error, rightSlot, className = "", ...inputProps }) {
    const hasError = Boolean(error);

    return (
        <div className={className}>
            <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
                {label}
            </label>

            <div className="relative">
                <Icon
                    size={18}
                    className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                        hasError ? "text-danger" : "text-muted"
                    }`}
                />

                <input
                    id={name}
                    name={name}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${name}-error` : undefined}
                    className={`${inputBase} pl-11 ${rightSlot ? "pr-12" : "pr-4"} ${
                        hasError ? inputBad : inputOk
                    }`}
                    {...inputProps}
                />

                {rightSlot && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
                )}
            </div>

            {hasError && (
                <p
                    id={`${name}-error`}
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger"
                >
                    <XCircle size={13} className="shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}

function VisibilityToggle({ visible, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={visible ? "Hide password" : "Show password"}
            className="rounded-xl p-2 text-muted transition hover:bg-primary-50 hover:text-primary-600"
        >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  Brand logo (white PNG, falls back to text)                         */
/* ------------------------------------------------------------------ */

function BrandLogo({ className = "h-9" }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <span className="text-xl font-extrabold tracking-tight text-white">
                Uni<span className="text-accent-300">Nest</span>
            </span>
        );
    }

    return (
        <img
            src="/images/logo.png"
            alt="UniNest"
            className={`${className} w-auto object-contain`}
            onError={() => setFailed(true)}
        />
    );
}

/* ------------------------------------------------------------------ */
/*  Live member card: shows your email, hides the password as dots,    */
/*  and unlocks when the login succeeds                                */
/* ------------------------------------------------------------------ */

function StudentCard({ email, passwordLength, verified }) {
    const dots = Math.min(passwordLength, 14);

    return (
        <div className="relative aspect-[1.586/1] w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-6 text-white shadow-2xl shadow-black/40 ring-1 ring-white/25">
            <div className="pointer-events-none absolute -bottom-14 -right-10 h-44 w-44 rounded-full bg-accent-500" />
            <div className="pointer-events-none absolute -bottom-8 -right-4 h-44 w-44 rounded-full border border-white/40" />
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />

            <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                    <BrandLogo className="h-6" />
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors duration-500 ${
                            verified
                                ? "bg-emerald-400/25 ring-emerald-200/60"
                                : "bg-white/15 ring-white/25"
                        }`}
                    >
                        {verified ? <Check size={12} /> : <Lock size={12} />}
                        {verified ? "Verified" : "Locked"}
                    </span>
                </div>

                <div className="relative h-7 w-10 overflow-hidden rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 ring-1 ring-black/10">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
                    <span className="absolute inset-y-0 left-1/3 w-px bg-black/20" />
                    <span className="absolute inset-y-0 left-2/3 w-px bg-black/20" />
                </div>

                <div className="space-y-2.5 pr-20">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="shrink-0 text-white/80" />
                        {email ? (
                            <span className="truncate font-medium">{email}</span>
                        ) : (
                            <span className="block h-3.5 w-44 max-w-full rounded-full bg-white/20" />
                        )}
                    </div>

                    <div className="flex h-5 items-center gap-2 text-sm">
                        <GraduationCap size={14} className="shrink-0 text-white/80" />
                        {dots > 0 ? (
                            <span className="flex items-center gap-1" aria-hidden="true">
                                {Array.from({ length: dots }).map((_, i) => (
                                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
                                ))}
                            </span>
                        ) : (
                            <span className="block h-3 w-28 rounded-full bg-white/20" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CardStage({ card }) {
    const cardRef = useRef(null);
    const REST = "perspective(1000px) rotateY(-8deg) rotateX(4deg)";

    const onMove = (e) => {
        if (!cardRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
    };

    const onLeave = () => {
        if (cardRef.current) cardRef.current.style.transform = REST;
    };

    return (
        <aside
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="relative hidden overflow-hidden rounded-[2rem] bg-gradient-to-b from-primary-800 to-primary-900 lg:flex lg:flex-col lg:justify-between lg:p-10"
        >
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 600 800"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
            >
                {[110, 190, 280, 380, 490, 610].map((r, i) => (
                    <circle
                        key={r}
                        cx="300"
                        cy="400"
                        r={r}
                        stroke="white"
                        strokeOpacity={0.12 - i * 0.015}
                    />
                ))}
            </svg>
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-400/30 blur-3xl" />

            <div className="relative">
                <h2 className="text-2xl font-semibold tracking-tight text-white xl:text-3xl">
                    Good to see you again
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/65">
                    Log in and pick up where you left off. Your card unlocks when you’re in.
                </p>
            </div>

            <div className="relative flex items-center justify-center py-6">
                <div
                    ref={cardRef}
                    className="w-full max-w-[24rem] transition-transform duration-200 ease-out will-change-transform"
                    style={{ transform: REST }}
                >
                    <StudentCard {...card} />
                </div>
            </div>

            <p className="relative text-xs text-white/45">
                &copy; {new Date().getFullYear()} UniNest. All rights reserved.
            </p>
        </aside>
    );
}

/* ------------------------------------------------------------------ */
/*  Page styles                                                        */
/* ------------------------------------------------------------------ */

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

@keyframes toast-progress { from { width: 100%; } to { width: 0%; } }
@keyframes rise-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.rise-in { animation: rise-in .45s cubic-bezier(.2,.8,.2,1); }
@media (prefers-reduced-motion: reduce) { .rise-in { animation: none; } }

.thin-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
.thin-scroll::-webkit-scrollbar { width: 6px; }
.thin-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
`;

/* ------------------------------------------------------------------ */
/*  Login page                                                         */
/* ------------------------------------------------------------------ */

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);

    /* ---------- toasts ---------- */
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);
    const redirectTimer = useRef(null);

    const closeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((type, title, message) => {
        const id = ++toastId.current;
        setToasts((prev) => [...prev.slice(-2), { id, type, title, message }]);
    }, []);

    useEffect(() => () => clearTimeout(redirectTimer.current), []);

    /* ---------- form logic ---------- */
    const errors = validateForm({ email, password });
    const showError = (field) => (touched[field] || submitted ? errors[field] : undefined);

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    // Login user
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const firstError = Object.keys(errors)[0];
        if (firstError) {
            showToast(
                "error",
                "Check your details",
                "Enter a valid email and your password to continue."
            );
            document.getElementById(firstError)?.focus();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Login failed. Please try again.");
            }

            // Save authentication details
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.dispatchEvent(new Event("authChanged"));

            setVerified(true);
            showToast(
                "success",
                "Welcome back!",
                data.user?.firstName
                    ? `Good to see you, ${data.user.firstName}. Taking you to your dashboard...`
                    : "Taking you to your dashboard..."
            );

            // Redirect according to user role (short pause so the success state is seen)
            redirectTimer.current = setTimeout(() => {
                if (data.user.role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/student/dashboard");
                }
            }, 1200);
        } catch (err) {
            const isNetwork = err instanceof TypeError;
            showToast(
                "error",
                "Login failed",
                isNetwork
                    ? "Cannot reach the server. Check your connection and try again."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-dvh bg-white p-3 lg:h-dvh lg:overflow-hidden lg:p-4"
            style={{ fontFamily: "'Sora', ui-sans-serif, system-ui, sans-serif" }}
        >
            <style>{PAGE_CSS}</style>
            <ToastContainer toasts={toasts} onClose={closeToast} />

            <div className="grid min-h-[calc(100dvh-1.5rem)] lg:h-full lg:min-h-0 lg:grid-cols-[7fr_5fr] lg:gap-4">
                {/* ================= Form side ================= */}
                <section className="thin-scroll lg:overflow-y-auto">
                    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-3 py-4 sm:px-4 lg:py-6">
                        {/* top bar */}
                        <div className="flex items-center justify-between">
                            <div className="rounded-xl bg-primary-900 px-4 py-2 lg:hidden">
                                <BrandLogo className="h-6" />
                            </div>
                            <p className="ml-auto text-sm text-muted">
                                New to UniNest?{" "}
                                <Link
                                    to="/register"
                                    className="font-semibold text-primary-600 transition hover:text-primary-800"
                                >
                                    Create account
                                </Link>
                            </p>
                        </div>

                        <div className="flex flex-1 flex-col justify-center py-8">
                            <div className="rise-in">
                                <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
                                    Welcome back
                                </h1>
                                <p className="mt-2 text-sm text-muted">
                                    Log in to your UniNest account.
                                </p>

                                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
                                    <Field
                                        label="Email address"
                                        name="email"
                                        icon={Mail}
                                        type="email"
                                        placeholder="name@example.com"
                                        autoComplete="email"
                                        autoFocus
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={handleBlur}
                                        error={showError("email")}
                                    />

                                    <Field
                                        label="Password"
                                        name="password"
                                        icon={Lock}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={handleBlur}
                                        error={showError("password")}
                                        rightSlot={
                                            <VisibilityToggle
                                                visible={showPassword}
                                                onToggle={() => setShowPassword((v) => !v)}
                                            />
                                        }
                                    />

                                    <button
                                        type="submit"
                                        disabled={loading || verified}
                                        className="group !mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-700 px-6 text-sm font-semibold text-white shadow-lg shadow-accent-700/25 transition hover:bg-[#b3361b] focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Logging in...
                                            </>
                                        ) : verified ? (
                                            <>
                                                <Check size={18} />
                                                Redirecting...
                                            </>
                                        ) : (
                                            <>
                                                Log in
                                                <ArrowRight
                                                    size={18}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= Live card side ================= */}
                <CardStage card={{ email: email.trim(), passwordLength: password.length, verified }} />
            </div>
        </div>
    );
}

export default Login;