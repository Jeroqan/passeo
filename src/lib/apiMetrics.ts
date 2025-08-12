import { NextRequest, NextResponse } from 'next/server';
import { httpRequests } from './metrics';

type ApiHandler = (
  req: NextRequest,
  context: { params: any }
) => Promise<Response | NextResponse>;

export function withApiMetrics(handler: ApiHandler) {
  return async (
    req: NextRequest,
    context: { params: any }
  ): Promise<Response | NextResponse> => {
    const { pathname } = req.nextUrl;
    let response: Response | NextResponse;
    try {
      response = await handler(req, context);
      httpRequests.inc({
        method: req.method,
        route: pathname,
        status_code: response.status,
      });
      return response;
    } catch (error) {
      httpRequests.inc({
        method: req.method,
        route: pathname,
        status_code: 500,
      });
      // Hatayı yeniden fırlatarak Next.js'in normal hata işleme mekanizmasının
      // çalışmasına izin veriyoruz.
      throw error;
    }
  };
} 