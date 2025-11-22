import Vapi from '@vapi-ai/web';

const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
if (!apiKey) {
  throw new Error('NEXT_PUBLIC_VAPI_API_KEY environment variable is not defined');
}

export const vapi = new Vapi(apiKey);