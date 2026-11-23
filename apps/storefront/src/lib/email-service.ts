/**
 * Muschio Haute Parfumerie — Transactional Email Service
 * 
 * Re-exports the unified EmailService from @muschio/api for clean monorepo architecture,
 * ensuring storefront backward compatibility while maintaining single-source-of-truth domain logic.
 */

export { EmailService } from "@muschio/api";
export type { SendEmailParams, EmailServiceStatus } from "@muschio/api";
