import type { ReactNode } from "react";
import { privateRouteMetadata } from "../../../lib/page-metadata";

export const metadata = privateRouteMetadata;

export default function WishlistLayout({ children }: { children: ReactNode }) { return children; }
