import { getJson } from 'serpapi';

if (!process.env.SERPAPI_API_KEY) {
  throw new Error('SERPAPI_API_KEY is not defined');
}

export async function searchKeywords(keyword: string) {
  const response = await getJson({
    api_key: process.env.SERPAPI_API_KEY,
    engine: 'google',
    q: keyword,
    google_domain: 'google.com.tr',
    gl: 'tr',
    hl: 'tr',
  });

  return response;
} 