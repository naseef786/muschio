import React from "react";
export interface AdminAuthSession {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
interface AdminLoginGateProps {
    onLoginSuccess: (session: AdminAuthSession) => void;
}
export declare function AdminLoginGate({ onLoginSuccess }: AdminLoginGateProps): React.JSX.Element;
export {};
//# sourceMappingURL=AdminLoginGate.d.ts.map