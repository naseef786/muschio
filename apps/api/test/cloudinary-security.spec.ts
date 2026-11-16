import { afterEach, describe, expect, it, vi } from "vitest";
import { CloudinaryService } from "../src/services/cloudinary.service";

describe("Cloudinary credential security", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed when credentials are missing", () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
    vi.stubEnv("CLOUDINARY_API_KEY", "");
    vi.stubEnv("CLOUDINARY_API_SECRET", "");

    expect(() => CloudinaryService.generateSignature()).toThrow(
      "Cloudinary credentials are not fully configured",
    );
  });

  it("generates signatures from environment credentials", () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test-cloud");
    vi.stubEnv("CLOUDINARY_API_KEY", "test-api-key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "test-api-secret");

    const result = CloudinaryService.generateSignature("test-folder");

    expect(result.cloudName).toBe("test-cloud");
    expect(result.apiKey).toBe("test-api-key");
    expect(result.folder).toBe("test-folder");
    expect(result.signature).toMatch(/^[a-f0-9]{40}$/);
  });
});
