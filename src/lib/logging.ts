import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { httpRequests, httpDuration } from './metrics'; // Import metrics
import { ApiError } from './aiDetectionLogic'; // Re-using a common error type

type ApiHandler = (
  req: NextRequest
) => Promise<NextResponse | Response>;

/**
 * A higher-order function to wrap Next.js API route handlers
 * with structured logging for requests and responses.
 *
 * It adds a unique `requestId` to each request, logs incoming requests,
 * and logs completed requests with their duration and status.
 *
 * @param handler The API route handler function to wrap.
 * @returns A new handler function with logging capabilities.
 */
export function withLogging(handler: ApiHandler) {
  return async (req: NextRequest) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();
    const { method, nextUrl } = req;
    const route = nextUrl.pathname;

    const endTimer = httpDuration.startTimer({ method, route });

    logger.info({ requestId, method, path: route }, 'Incoming request');

    try {
      const response = await handler(req);
      const duration = Date.now() - start;
      const statusCode = response.status;
      
      logger.info({ requestId, status: statusCode, duration }, 'Request completed');
      httpRequests.inc({ method, route, status_code: statusCode });
      endTimer({ status_code: statusCode });

      return response;

    } catch (error: any) {
      const duration = Date.now() - start;
      const statusCode = error.status || 500;

      logger.error({ requestId, status: statusCode, duration, error: { message: error.message } }, 'Request failed');
      httpRequests.inc({ method, route, status_code: statusCode });
      endTimer({ status_code: statusCode });
      
      return NextResponse.json(
        { error: error.message || 'An internal server error occurred.' },
        { status: statusCode }
      );
    }
  };
} 