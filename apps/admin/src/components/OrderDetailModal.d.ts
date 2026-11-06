import React from "react";
export interface OrderDetailModalProps {
    order: any | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus: (orderId: string, status: string, trackingNumber?: string, carrier?: string, reason?: string) => Promise<void>;
    onResendNotification: (orderId: string, channel: "whatsapp" | "email") => Promise<void>;
}
export declare const OrderDetailModal: React.FC<OrderDetailModalProps>;
//# sourceMappingURL=OrderDetailModal.d.ts.map