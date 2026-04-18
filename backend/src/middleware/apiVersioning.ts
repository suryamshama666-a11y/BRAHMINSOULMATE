/**
 * API Versioning Middleware
 * Ensures backward compatibility and graceful API evolution
 */
import { Request, Response, NextFunction } from 'express';

export interface VersionedRequest extends Request {
  apiVersion?: string;
}

// Supported API versions
export const SUPPORTED_VERSIONS = ['v1', 'v2'];
export const DEFAULT_VERSION = 'v1';

/**
 * API Versioning middleware
 * Extracts version from header or URL and validates it
 */
export function apiVersioning(req: VersionedRequest, res: Response, next: NextFunction): void {
  // Extract version from Accept header (e.g., Accept: application/vnd.api+json; version=v1)
  const acceptHeader = req.headers.accept || '';
  const versionMatch = acceptHeader.match(/version=(v\d+)/);
  
  // Or extract from URL path (e.g., /api/v1/profiles)
  const urlMatch = req.path.match(/^\/api\/(v\d+)\//);
  
  // Or extract from custom header
  const headerVersion = req.headers['x-api-version'] as string;
  
  // Determine API version
  const version = versionMatch?.[1] || urlMatch?.[1] || headerVersion || DEFAULT_VERSION;
  
  // Validate version
  if (!SUPPORTED_VERSIONS.includes(version)) {
    res.status(400).json({
      success: false,
      error: `Unsupported API version: ${version}`,
      supported_versions: SUPPORTED_VERSIONS,
      documentation: 'https://api.brahminsoulmateconnect.com/docs'
    });
    return;
  }
  
  // Attach version to request
  req.apiVersion = version;
  
  // Set response headers
  res.setHeader('X-API-Version', version);
  res.setHeader('X-API-Supported-Versions', SUPPORTED_VERSIONS.join(', '));
  
  next();
}

/**
 * Version-aware response wrapper
 */
export function versionedResponse<T>(req: VersionedRequest, res: Response, data: T): void {
  const version = req.apiVersion || DEFAULT_VERSION;
  res.json(data);
}

/**
 * Middleware to enforce minimum API version for certain routes
 */
export function requireMinVersion(minVersion: string) {
  return (req: VersionedRequest, res: Response, next: NextFunction): void => {
    const currentVersion = req.apiVersion || DEFAULT_VERSION;
    
    if (compareVersions(currentVersion, minVersion) < 0) {
      res.status(426).json({
        success: false,
        error: `Minimum API version ${minVersion} required`,
        current_version: currentVersion,
        required_version: minVersion,
        upgrade_guide: 'https://api.brahminsoulmateconnect.com/docs/upgrade'
      });
      return;
    }
    
    next();
  };
}

/**
 * Compare two version strings
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const num1 = parseInt(v1.replace('v', ''), 10);
  const num2 = parseInt(v2.replace('v', ''), 10);
  
  if (num1 < num2) return -1;
  if (num1 > num2) return 1;
  return 0;
}