import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    GraduationCap,
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
    ArrowLeft,
    ChevronDown,
    Search,
    Pencil,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\d{10,15}$/;
const OTHER_OPTION = "Other";

// Same rules as the backend (kept local to this file, not exported)
const validatePassword = (password) => {
    const errors = [];

    if (!password || password.length < 8) errors.push("at least 8 characters");
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
    if (!/\d/.test(password)) errors.push("one number");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("one special character");

    return errors;
};

const PASSWORD_RULES = [
    { label: "8+ characters", test: (p) => p.length >= 8 },
    { label: "Lowercase", test: (p) => /[a-z]/.test(p) },
    { label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
    { label: "Number", test: (p) => /\d/.test(p) },
    { label: "Symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const validateForm = (data) => {
    const errors = {};

    if (!data.firstName.trim()) errors.firstName = "First name is required";
    if (!data.lastName.trim()) errors.lastName = "Last name is required";

    if (data.university === OTHER_OPTION && !data.otherUniversity.trim()) {
        errors.otherUniversity = "Enter the name of your university";
    }

    if (!data.email.trim()) {
        errors.email = "Email address is required";
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
        errors.email = "Enter a valid email, like name@example.com";
    }

    if (!data.phone.trim()) {
        errors.phone = "Phone number is required";
    } else if (!PHONE_REGEX.test(data.phone.trim())) {
        errors.phone = "Use 10 to 15 digits, with no spaces or symbols";
    }

    if (!data.password) {
        errors.password = "Password is required";
    } else if (validatePassword(data.password).length > 0) {
        errors.password = "Password must meet all the requirements below";
    }

    if (!data.confirmPassword) {
        errors.confirmPassword = "Confirm your password";
    } else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
};

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const STEPS = [
    {
        label: "About you",
        icon: User,
        fields: ["firstName", "lastName", "otherUniversity"],
        title: "Let’s start with you",
        text: "Tell us your name and where you study.",
    },
    {
        label: "Contact",
        icon: Mail,
        fields: ["email", "phone"],
        title: "How can we reach you?",
        text: "Owners and UniNest use these to confirm your bookings.",
    },
    {
        label: "Security",
        icon: Lock,
        fields: ["password", "confirmPassword"],
        title: "Secure your account",
        text: "Pick a strong password you don’t use anywhere else.",
    },
];

function Stepper({ step, onGo }) {
    return (
        <ol className="flex items-center" aria-label="Registration progress">
            {STEPS.map((s, i) => {
                const done = i < step;
                const current = i === step;
                const Icon = s.icon;
                const isLast = i === STEPS.length - 1;

                return (
                    <li key={s.label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                        <button
                            type="button"
                            disabled={i > step}
                            onClick={() => onGo(i)}
                            aria-current={current ? "step" : undefined}
                            className="flex items-center gap-2.5 disabled:cursor-default"
                        >
                            <span
                                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-all duration-300 ${
                                    done
                                        ? "border-primary-600 bg-primary-600 text-white"
                                        : current
                                        ? "border-primary-600 bg-primary-600 text-white ring-4 ring-primary-100"
                                        : "border-border bg-background text-muted"
                                }`}
                            >
                                {done ? <Check size={17} /> : <Icon size={17} />}
                            </span>
                            <span
                                className={`hidden text-sm font-medium sm:block ${
                                    current ? "text-ink" : "text-muted"
                                }`}
                            >
                                {s.label}
                            </span>
                        </button>

                        {!isLast && (
                            <span className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                                <span
                                    className={`block h-full bg-primary-600 transition-all duration-500 ${
                                        done ? "w-full" : "w-0"
                                    }`}
                                />
                            </span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

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
/*  Inputs (defined outside Register so they keep focus while typing)  */
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
/*  Password strength                                                  */
/* ------------------------------------------------------------------ */

const STRENGTH_LEVELS = [
    { label: "Too weak", bar: "bg-danger", text: "text-danger" },
    { label: "Too weak", bar: "bg-danger", text: "text-danger" },
    { label: "Weak", bar: "bg-accent-500", text: "text-accent-700" },
    { label: "Fair", bar: "bg-warning", text: "text-amber-700" },
    { label: "Good", bar: "bg-primary-400", text: "text-primary-600" },
    { label: "Strong", bar: "bg-success", text: "text-emerald-700" },
];

function PasswordStrength({ password }) {
    const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
    const empty = password.length === 0;
    const level = STRENGTH_LEVELS[passed];

    return (
        <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
                <div className="flex flex-1 gap-1.5">
                    {PASSWORD_RULES.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                !empty && i < passed ? level.bar : "bg-border"
                            }`}
                        />
                    ))}
                </div>
                <span
                    className={`min-w-[4.5rem] text-right text-xs font-semibold ${
                        empty ? "text-muted" : level.text
                    }`}
                >
                    {empty ? "Strength" : level.label}
                </span>
            </div>

            <ul className="mt-3 flex flex-wrap gap-1.5">
                {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(password);
                    return (
                        <li
                            key={rule.label}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                ok
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-border bg-white text-muted"
                            }`}
                        >
                            {ok ? (
                                <Check size={11} />
                            ) : (
                                <span className="h-1 w-1 rounded-full bg-current" />
                            )}
                            {rule.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  University select (searchable dropdown)                            */
/* ------------------------------------------------------------------ */

const UNIVERSITIES = [
    // State universities
    "Bhiksu University of Sri Lanka",
    "Buddhist and Pali University of Sri Lanka",
    "Eastern University, Sri Lanka",
    "Gampaha Wickramarachchi University of Indigenous Medicine",
    "General Sir John Kotelawala Defence University",
    "Ocean University of Sri Lanka",
    "Open University of Sri Lanka",
    "Rajarata University of Sri Lanka",
    "Sabaragamuwa University of Sri Lanka",
    "South Eastern University of Sri Lanka",
    "University of Colombo",
    "University of Colombo School of Computing (UCSC)",
    "University of Jaffna",
    "University of Kelaniya",
    "University of Moratuwa",
    "University of Peradeniya",
    "University of Ruhuna",
    "University of Sri Jayewardenepura",
    "University of the Visual and Performing Arts",
    "University of Vavuniya",
    "University of Vocational Technology (UNIVOTEC)",
    "Uva Wellassa University",
    "Wayamba University of Sri Lanka",
    // Higher education institutes and private universities
    "Academy of Design (AOD)",
    "American College of Higher Education (ACHE)",
    "Aquinas College of Higher Studies",
    "Asia Pacific Institute of Information Technology (APIIT)",
    "Australian College of Business and Technology (ACBT)",
    "BCI Campus",
    "CINEC Campus",
    "Colombo School of Construction Technology",
    "Esoft Metro Campus",
    "Horizon Campus",
    "ICBT Campus",
    "Imperial Institute of Higher Education",
    "Informatics Institute of Technology (IIT)",
    "Institute of Technology, University of Moratuwa (ITUM)",
    "Kaatsu International University (KIU)",
    "Lyceum Campus",
    "National Institute of Business Management (NIBM)",
    "National Institute of Education (NIE)",
    "Nawaloka College of Higher Studies",
    "NSBM Green University",
    "Royal Institute of Colombo",
    "Saegis Campus",
    "SLIIT (Sri Lanka Institute of Information Technology)",
    "Sri Lanka Institute of Advanced Technological Education (SLIATE)",
    "Sri Lanka Institute of Tourism and Hotel Management (SLITHM)",
    "Sri Lanka Law College",
    "Sri Lanka Technological Campus (SLTC)",
].sort((a, b) => a.localeCompare(b));

function UniversitySelect({ value, onChange, className = "" }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);

    const wrapRef = useRef(null);
    const searchRef = useRef(null);
    const triggerRef = useRef(null);

    const q = query.trim().toLowerCase();
    const filtered = UNIVERSITIES.filter((u) => u.toLowerCase().includes(q));
    // "Other" is always the last option, pinned below the scrolling list
    const options = [...filtered, OTHER_OPTION];

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (open) searchRef.current?.focus();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        wrapRef.current
            ?.querySelector(`[data-index="${active}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [active, open]);

    const openPanel = () => {
        setQuery("");
        setActive(
            value === OTHER_OPTION
                ? UNIVERSITIES.length
                : Math.max(UNIVERSITIES.indexOf(value), 0)
        );
        setOpen(true);
    };

    const choose = (option) => {
        onChange(option);
        setOpen(false);
        triggerRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, options.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault(); // do not submit the form
            choose(options[active]);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
        } else if (e.key === "Tab") {
            setOpen(false);
        }
    };

    const optionClass = (index, selected) =>
        `flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
            index === active ? "bg-primary-50 text-primary-700" : "text-ink"
        } ${selected ? "font-semibold" : ""}`;

    return (
        <div ref={wrapRef} className={`relative ${className}`}>
            <label
                htmlFor="university"
                className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink"
            >
                <span>University</span>
                <span className="text-xs font-normal text-muted">Optional</span>
            </label>

            <div className="relative">
                <GraduationCap
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />

                <button
                    id="university"
                    ref={triggerRef}
                    type="button"
                    onClick={() => (open ? setOpen(false) : openPanel())}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    className={`${inputBase} ${inputOk} pl-11 pr-20 text-left ${
                        open ? "!border-primary-500 !bg-white ring-4 ring-primary-500/10" : ""
                    }`}
                >
                    <span className={`block min-w-0 truncate ${value ? "text-ink" : "text-slate-400"}`}>
                        {value || "Select your university"}
                    </span>
                </button>

                {value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        aria-label="Clear university"
                        className="absolute right-10 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-primary-50 hover:text-primary-600"
                    >
                        <X size={14} />
                    </button>
                )}

                <ChevronDown
                    size={18}
                    className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </div>

            {open && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-primary-900/15">
                    <div className="border-b border-border p-2">
                        <div className="relative">
                            <Search
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                            />
                            <input
                                ref={searchRef}
                                type="text"
                                role="combobox"
                                aria-expanded="true"
                                aria-controls="university-list"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setActive(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search universities..."
                                className="w-full rounded-xl bg-background py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                    </div>

                    <ul
                        id="university-list"
                        role="listbox"
                        className="thin-scroll max-h-52 overflow-y-auto p-1.5"
                    >
                        {filtered.length === 0 && (
                            <li className="px-3 py-3 text-sm text-muted">
                                No match for “{query.trim()}”. Choose Other below to type your
                                university name.
                            </li>
                        )}

                        {filtered.map((uni, i) => (
                            <li
                                key={uni}
                                role="option"
                                aria-selected={value === uni}
                                data-index={i}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => choose(uni)}
                                className={optionClass(i, value === uni)}
                            >
                                <span>{uni}</span>
                                {value === uni && (
                                    <Check size={16} className="shrink-0 text-primary-600" />
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="border-t border-border bg-background p-1.5">
                        <button
                            type="button"
                            role="option"
                            aria-selected={value === OTHER_OPTION}
                            data-index={filtered.length}
                            onMouseEnter={() => setActive(filtered.length)}
                            onClick={() => choose(OTHER_OPTION)}
                            className={optionClass(filtered.length, value === OTHER_OPTION)}
                        >
                            <span className="flex items-center gap-2">
                                <Pencil size={15} className="text-accent-600" />
                                Other (type my university)
                            </span>
                            {value === OTHER_OPTION && (
                                <Check size={16} className="shrink-0 text-primary-600" />
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
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
/*  Live student card (fills in as the person types)                   */
/* ------------------------------------------------------------------ */

function CardLine({ value, className, skeleton }) {
    if (!value) return <span className={`block rounded-full bg-white/20 ${skeleton}`} />;
    return <p className={className}>{value}</p>;
}

function StudentCard({ name, university, email, phone, activated }) {
    return (
        <div className="relative aspect-[1.586/1] w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-6 text-white shadow-2xl shadow-black/40 ring-1 ring-white/25">
            {/* decoration */}
            <div className="pointer-events-none absolute -bottom-14 -right-10 h-44 w-44 rounded-full bg-accent-500" />
            <div className="pointer-events-none absolute -bottom-8 -right-4 h-44 w-44 rounded-full border border-white/40" />
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />

            <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                    <BrandLogo className="h-6" />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium ring-1 ring-white/25">
                        {activated ? <Check size={12} /> : <GraduationCap size={12} />}
                        {activated ? "Active" : "Student"}
                    </span>
                </div>

                {/* chip */}
                <div className="relative h-7 w-10 overflow-hidden rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 ring-1 ring-black/10">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
                    <span className="absolute inset-y-0 left-1/3 w-px bg-black/20" />
                    <span className="absolute inset-y-0 left-2/3 w-px bg-black/20" />
                </div>

                <div className="space-y-1.5 pr-20">
                    <CardLine
                        value={name}
                        className="truncate text-lg font-semibold tracking-tight"
                        skeleton="h-5 w-40"
                    />
                    <CardLine
                        value={university}
                        className="truncate text-xs text-white/80"
                        skeleton="h-3 w-52 max-w-full"
                    />
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-white/80">
                        <span className="flex min-w-0 items-center gap-1.5">
                            <Mail size={11} className="shrink-0" />
                            {email ? (
                                <span className="truncate">{email}</span>
                            ) : (
                                <span className="block h-2.5 w-24 rounded-full bg-white/20" />
                            )}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                            <Phone size={11} />
                            {phone ? (
                                <span>{phone}</span>
                            ) : (
                                <span className="block h-2.5 w-14 rounded-full bg-white/20" />
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CardStage({ card, activated }) {
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
            {/* rippling rings */}
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
                    Your UniNest student card
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/65">
                    It fills in as you type. Finish three quick steps to make it yours.
                </p>
            </div>

            <div className="relative flex items-center justify-center py-6">
                <div
                    ref={cardRef}
                    className="w-full max-w-[24rem] transition-transform duration-200 ease-out will-change-transform"
                    style={{ transform: REST }}
                >
                    <StudentCard {...card} activated={activated} />
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
@keyframes step-in-fwd  { from { opacity: 0; transform: translateX(28px); }  to { opacity: 1; transform: none; } }
@keyframes step-in-back { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: none; } }
.step-fwd  { animation: step-in-fwd  .38s cubic-bezier(.2,.8,.2,1); }
.step-back { animation: step-in-back .38s cubic-bezier(.2,.8,.2,1); }
@media (prefers-reduced-motion: reduce) {
    .step-fwd, .step-back { animation: none; }
}

.thin-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
.thin-scroll::-webkit-scrollbar { width: 6px; }
.thin-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
`;

/* ------------------------------------------------------------------ */
/*  Register page                                                      */
/* ------------------------------------------------------------------ */

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        university: "",
        otherUniversity: "",
    });

    const [step, setStep] = useState(0);
    const [dir, setDir] = useState("fwd");
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activated, setActivated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    /* ---------- toasts ---------- */
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);

    const closeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((type, title, message) => {
        const id = ++toastId.current;
        setToasts((prev) => [...prev.slice(-2), { id, type, title, message }]);
    }, []);

    /* ---------- form logic ---------- */
    const errors = validateForm(formData);
    const showError = (field) => (touched[field] || submitted ? errors[field] : undefined);
    const isOther = formData.university === OTHER_OPTION;
    const lastStep = STEPS.length - 1;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const goTo = (target) => {
        setDir(target > step ? "fwd" : "back");
        setStep(target);
    };

    const goNext = () => {
        const fields = STEPS[step].fields;
        setTouched((prev) => ({
            ...prev,
            ...Object.fromEntries(fields.map((f) => [f, true])),
        }));

        const bad = fields.find((f) => errors[f]);
        if (bad) {
            showToast("error", "Check your details", "Fix the highlighted fields to continue.");
            document.getElementById(bad)?.focus();
            return;
        }

        goTo(step + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step < lastStep) {
            goNext();
            return;
        }

        setSubmitted(true);

        // If something earlier is invalid, jump back to that step
        const badStep = STEPS.findIndex((s) => s.fields.some((f) => errors[f]));
        if (badStep !== -1) {
            showToast("error", "Check your details", "Some fields need attention before you can continue.");
            if (badStep !== step) goTo(badStep);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    // If "Other" was chosen, send the typed name instead
                    university: isOther
                        ? formData.otherUniversity.trim()
                        : formData.university,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Registration failed. Please try again.");
            }

            setActivated(true);
            showToast(
                "success",
                "Account created",
                "Welcome to UniNest! Taking you to the login page..."
            );

            setTimeout(() => navigate("/login"), 1800);
        } catch (err) {
            const isNetwork = err instanceof TypeError;
            showToast(
                "error",
                "Registration failed",
                isNetwork
                    ? "Cannot reach the server. Check your connection and try again."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------- live card data ---------- */
    const card = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        university: isOther ? formData.otherUniversity.trim() : formData.university,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
    };

    const copy = STEPS[step];
    const isFinal = step === lastStep;

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
                                Have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-primary-600 transition hover:text-primary-800"
                                >
                                    Log in
                                </Link>
                            </p>
                        </div>

                        <div className="flex flex-1 flex-col justify-center py-8">
                            <Stepper step={step} onGo={goTo} />

                            <form onSubmit={handleSubmit} noValidate className="mt-9">
                                <div key={step} className={dir === "back" ? "step-back" : "step-fwd"}>
                                    <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">
                                        {copy.title}
                                    </h1>
                                    <p className="mt-2 text-sm text-muted">{copy.text}</p>

                                    <div className="mt-7 space-y-4">
                                        {step === 0 && (
                                            <>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <Field
                                                        label="First name"
                                                        name="firstName"
                                                        icon={User}
                                                        type="text"
                                                        placeholder="John"
                                                        autoComplete="given-name"
                                                        autoFocus
                                                        value={formData.firstName}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={showError("firstName")}
                                                    />
                                                    <Field
                                                        label="Last name"
                                                        name="lastName"
                                                        icon={User}
                                                        type="text"
                                                        placeholder="Perera"
                                                        autoComplete="family-name"
                                                        value={formData.lastName}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={showError("lastName")}
                                                    />
                                                </div>

                                                <UniversitySelect
                                                    value={formData.university}
                                                    onChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            university: value,
                                                            otherUniversity:
                                                                value === OTHER_OPTION
                                                                    ? prev.otherUniversity
                                                                    : "",
                                                        }))
                                                    }
                                                />

                                                {isOther && (
                                                    <Field
                                                        label="Your university name"
                                                        name="otherUniversity"
                                                        icon={Pencil}
                                                        type="text"
                                                        placeholder="Type your university"
                                                        autoFocus
                                                        value={formData.otherUniversity}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={showError("otherUniversity")}
                                                    />
                                                )}
                                            </>
                                        )}

                                        {step === 1 && (
                                            <>
                                                <Field
                                                    label="Email address"
                                                    name="email"
                                                    icon={Mail}
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    autoComplete="email"
                                                    autoFocus
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={showError("email")}
                                                />
                                                <Field
                                                    label="Phone number"
                                                    name="phone"
                                                    icon={Phone}
                                                    type="tel"
                                                    inputMode="numeric"
                                                    placeholder="0771234567"
                                                    autoComplete="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={showError("phone")}
                                                />
                                            </>
                                        )}

                                        {step === 2 && (
                                            <>
                                                <Field
                                                    label="Password"
                                                    name="password"
                                                    icon={Lock}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a password"
                                                    autoComplete="new-password"
                                                    autoFocus
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={showError("password")}
                                                    rightSlot={
                                                        <VisibilityToggle
                                                            visible={showPassword}
                                                            onToggle={() => setShowPassword((v) => !v)}
                                                        />
                                                    }
                                                />
                                                <Field
                                                    label="Confirm password"
                                                    name="confirmPassword"
                                                    icon={Lock}
                                                    type={showConfirm ? "text" : "password"}
                                                    placeholder="Repeat your password"
                                                    autoComplete="new-password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={showError("confirmPassword")}
                                                    rightSlot={
                                                        <VisibilityToggle
                                                            visible={showConfirm}
                                                            onToggle={() => setShowConfirm((v) => !v)}
                                                        />
                                                    }
                                                />
                                                <PasswordStrength password={formData.password} />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* actions */}
                                <div className="mt-8 flex gap-3">
                                    {step > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => goTo(step - 1)}
                                            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-border px-5 text-sm font-semibold text-muted transition hover:bg-background hover:text-ink"
                                        >
                                            <ArrowLeft size={17} />
                                            Back
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`group flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70 ${
                                            isFinal
                                                ? "bg-accent-700 shadow-accent-700/25 hover:bg-[#b3361b] focus-visible:ring-accent-500/30"
                                                : "bg-primary-600 shadow-primary-600/25 hover:bg-primary-700 focus-visible:ring-primary-500/30"
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                {isFinal ? "Create account" : "Continue"}
                                                <ArrowRight
                                                    size={18}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                {/* ================= Live card side ================= */}
                <CardStage card={card} activated={activated} />
            </div>
        </div>
    );
}

export default Register;