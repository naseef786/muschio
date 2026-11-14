import type { ReactNode } from "react";
import { privateRouteMetadata } from "../../../lib/page-metadata";

export const metadata = privateRouteMetadata;

export default function AccountLayout({ children }: { children: ReactNode }) { return children; }
