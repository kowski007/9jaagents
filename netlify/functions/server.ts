import { Handler } from '@netlify/functions';

// Simple serverless function that serves the built server
export const handler: Handler = async (event, context) => {
  // Import the server dynamically to avoid bundling issues
  const { default: serverHandler } = await import('../../dist/index.js');
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  // Create a simple response for API health check
  if (event.path === '/api/health') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        path: event.path 
      }),
    };
  }

  // For now, return a simple response indicating the API is being set up
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'API is being configured',
      method: event.httpMethod,
      path: event.path,
      timestamp: new Date().toISOString()
    }),
  };
};