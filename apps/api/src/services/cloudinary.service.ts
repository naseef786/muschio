import crypto from "node:crypto";
import { ApiError } from "../middleware/error-handler";

export interface CloudinaryUploadOptions {
  file: string; // Base64 data URI, HTTP/HTTPS URL, or local file buffer as data URI
  folder?: string;
  publicId?: string;
  tags?: string[];
  overwrite?: boolean;
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
}

export interface CloudinaryAsset {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
}

export class CloudinaryService {
  private static getCredentials() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "zwkad4sz";
    const apiKey = process.env.CLOUDINARY_API_KEY || "287343912324243";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "YFAeE_1UdoL5Xlr05jOYspbNQnA";

    return { cloudName, apiKey, apiSecret };
  }

  /**
   * Uploads an image to Cloudinary (from a URL or base64 data URI)
   */
  static async uploadImage(options: CloudinaryUploadOptions): Promise<CloudinaryUploadResult> {
    const { cloudName, apiKey, apiSecret } = this.getCredentials();
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const folder = options.folder || "muschio/general";
    const body: Record<string, any> = {
      file: options.file,
      folder,
      overwrite: options.overwrite ?? true,
    };

    if (options.publicId) {
      body.public_id = options.publicId;
    }

    if (options.tags && options.tags.length > 0) {
      body.tags = options.tags.join(",");
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new ApiError(
        response.status || 500,
        "CLOUDINARY_UPLOAD_ERROR",
        data.error?.message || "Failed to upload image to Cloudinary",
      );
    }

    return {
      url: data.url,
      secureUrl: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
      createdAt: data.created_at,
    };
  }

  /**
   * Deletes an image from Cloudinary by its public ID
   */
  static async deleteImage(publicId: string): Promise<{ result: string }> {
    const { cloudName, apiKey, apiSecret } = this.getCredentials();
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_id: publicId }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new ApiError(
        response.status || 500,
        "CLOUDINARY_DELETE_ERROR",
        data.error?.message || "Failed to delete image from Cloudinary",
      );
    }

    return { result: data.result || "ok" };
  }

  /** Lists uploaded image assets for the authenticated admin media picker. */
  static async listImages(options: { prefix?: string; maxResults?: number; nextCursor?: string } = {}) {
    const { cloudName, apiKey, apiSecret } = this.getCredentials();
    const params = new URLSearchParams({
      type: "upload",
      max_results: String(Math.min(Math.max(options.maxResults || 40, 1), 100)),
    });
    if (options.prefix) params.set("prefix", options.prefix);
    if (options.nextCursor) params.set("next_cursor", options.nextCursor);

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?${params.toString()}`;
    const response = await fetch(endpoint, { headers: { Authorization: `Basic ${auth}` } });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new ApiError(response.status || 500, "CLOUDINARY_LIBRARY_ERROR", data.error?.message || "Failed to load the Cloudinary media library");
    }

    return {
      assets: (data.resources || []).map((asset: any): CloudinaryAsset => ({
        publicId: asset.public_id,
        secureUrl: asset.secure_url,
        width: asset.width,
        height: asset.height,
        format: asset.format,
        bytes: asset.bytes,
        createdAt: asset.created_at,
      })),
      nextCursor: data.next_cursor,
    };
  }

  /**
   * Generates a signed payload for client-side direct uploads to Cloudinary
   */
  static generateSignature(folder = "muschio/uploads") {
    const { cloudName, apiKey, apiSecret } = this.getCredentials();
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    };
  }

  /**
   * Formats a CDN URL with automatic WebP/AVIF format and responsive sizing
   */
  static getOptimizedUrl(
    publicIdOrUrl: string,
    options?: { width?: number; height?: number; crop?: string; quality?: string },
  ): string {
    const { cloudName } = this.getCredentials();

    if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
      if (publicIdOrUrl.includes("res.cloudinary.com")) {
        // Already a Cloudinary URL, inject transformations if requested
        const parts = publicIdOrUrl.split("/image/upload/");
        if (parts.length === 2 && options) {
          const transforms = [
            options.width ? `w_${options.width}` : null,
            options.height ? `h_${options.height}` : null,
            options.crop ? `c_${options.crop}` : "c_limit",
            options.quality || "q_auto",
            "f_auto",
          ]
            .filter(Boolean)
            .join(",");
          return `${parts[0]}/image/upload/${transforms}/${parts[1]}`;
        }
      }
      return publicIdOrUrl;
    }

    // Public ID provided
    const transforms = [
      options?.width ? `w_${options.width}` : null,
      options?.height ? `h_${options.height}` : null,
      options?.crop ? `c_${options.crop}` : "c_limit",
      options?.quality || "q_auto",
      "f_auto",
    ]
      .filter(Boolean)
      .join(",");

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicIdOrUrl}`;
  }
}
