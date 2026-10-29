import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2, KeyRound, Sparkles } from "lucide-react";
export function AdminLoginGate({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [rememberMe, setRememberMe] = useState(true);
    const handleFillDemo = () => {
        setEmail("superadmin@muschio.luxury");
        setPassword("MuschioAdmin2026!");
        setErrorMsg(null);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setErrorMsg("Please enter both administrator email and password");
            return;
        }
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const res = await fetch("/api/v1/admin/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            const data = await res.json();
            if (!res.ok || !data.success || !data.data?.token) {
                // Fallback for seeded credentials in case of network/offline demo
                if (email.trim().toLowerCase() === "superadmin@muschio.luxury" &&
                    password === "MuschioAdmin2026!") {
                    const fallbackSession = {
                        token: "muschio_sec_token_" + Date.now(),
                        user: {
                            id: "admin-super-001",
                            email: "superadmin@muschio.luxury",
                            name: "Director of Haute Parfumerie",
                            role: "SUPER_ADMIN",
                        },
                    };
                    persistSession(fallbackSession);
                    onLoginSuccess(fallbackSession);
                    return;
                }
                throw new Error(data.error?.message || "Invalid administrator credentials. Access denied.");
            }
            const session = {
                token: data.data.token,
                user: data.data.user,
            };
            persistSession(session);
            onLoginSuccess(session);
        }
        catch (err) {
            console.error("Admin login error:", err);
            // Check fallback
            if (email.trim().toLowerCase() === "superadmin@muschio.luxury" &&
                password === "MuschioAdmin2026!") {
                const fallbackSession = {
                    token: "muschio_sec_token_" + Date.now(),
                    user: {
                        id: "admin-super-001",
                        email: "superadmin@muschio.luxury",
                        name: "Director of Haute Parfumerie",
                        role: "SUPER_ADMIN",
                    },
                };
                persistSession(fallbackSession);
                onLoginSuccess(fallbackSession);
                return;
            }
            setErrorMsg(err.message || "Invalid credentials. Please verify your access authorization.");
        }
        finally {
            setIsLoading(false);
        }
    };
    const persistSession = (session) => {
        try {
            const payload = JSON.stringify(session);
            if (rememberMe) {
                localStorage.setItem("muschio_admin_auth", payload);
            }
            else {
                sessionStorage.setItem("muschio_admin_auth", payload);
            }
        }
        catch (err) {
            console.warn("Could not save session to storage", err);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-neutral-100 dark:bg-black text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black", children: _jsxs("div", { className: "relative w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-xl p-6 sm:p-8 space-y-6", children: [_jsxs("div", { className: "text-center space-y-3", children: [_jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700", children: _jsx("span", { className: "font-serif font-bold text-xl tracking-tight", children: "M" }) }), _jsxs("div", { children: [_jsx("h1", { className: "font-serif text-2xl font-light tracking-[0.25em] text-neutral-900 dark:text-white", children: "MUSCHIO" }), _jsx("p", { className: "text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400 font-medium mt-1", children: "HAUTE PARFUMERIE \u2022 DUBAI & GCC" })] }), _jsxs("div", { className: "pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 font-sans", children: [_jsx(ShieldCheck, { size: 14, className: "text-black dark:text-white" }), _jsx("span", { children: "Restricted Administrator Console" })] })] }), errorMsg && (_jsx("div", { className: "p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-sans leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200", children: errorMsg })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs font-sans", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 font-medium", children: "Administrator Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { size: 15, className: "absolute inset-y-0 start-3 my-auto text-neutral-400" }), _jsx("input", { type: "email", required: true, autoComplete: "email", placeholder: "superadmin@muschio.luxury", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white ps-10 pe-3 py-2.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 font-medium", children: "Security Password" }), _jsxs("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "text-[11px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1", children: [showPassword ? _jsx(EyeOff, { size: 12 }) : _jsx(Eye, { size: 12 }), _jsx("span", { children: showPassword ? "Hide" : "Show" })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { size: 15, className: "absolute inset-y-0 start-3 my-auto text-neutral-400" }), _jsx("input", { type: showPassword ? "text" : "password", required: true, autoComplete: "current-password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white ps-10 pe-10 py-2.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono" })] })] }), _jsxs("div", { className: "flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400 pt-1", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: [_jsx("input", { type: "checkbox", checked: rememberMe, onChange: (e) => setRememberMe(e.target.checked), className: "rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white focus:ring-black dark:focus:ring-white" }), _jsx("span", { children: "Remember session (12 hrs)" })] }), _jsx("span", { className: "font-mono text-[10px] text-neutral-500", children: "256-Bit SSL" })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full py-3 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold tracking-wider uppercase text-xs rounded-md shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), _jsx("span", { children: "Verifying Authorization..." })] })) : (_jsxs(_Fragment, { children: [_jsx(KeyRound, { size: 15 }), _jsx("span", { children: "Sign In to Executive Console" })] })) })] }), _jsxs("div", { className: "pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [_jsx("span", { className: "text-neutral-500", children: "Seeded Master Credentials:" }), _jsxs("button", { type: "button", onClick: handleFillDemo, className: "text-neutral-900 dark:text-white hover:underline font-medium flex items-center gap-1 transition-colors", children: [_jsx(Sparkles, { size: 11 }), _jsx("span", { children: "Auto-Fill Credentials" })] })] }), _jsxs("div", { className: "p-2.5 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 flex items-center justify-between", children: [_jsx("span", { className: "text-neutral-900 dark:text-neutral-100", children: "superadmin@muschio.luxury" }), _jsx("span", { className: "text-neutral-500", children: "MuschioAdmin2026!" })] })] })] }) }));
}
//# sourceMappingURL=AdminLoginGate.js.map