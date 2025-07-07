import { Handler } from '@netlify/functions';
import { app } from '../../server/index';

// Convert Express app to Netlify function
export const handler: Handler = async (event, context) => {
  // Handle CORS preflight requests
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

  return new Promise((resolve, reject) => {
    const req = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers,
      body: event.body,
      query: event.queryStringParameters || {},
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader: function(name: string, value: string) {
        this.headers[name] = value;
      },
      status: function(code: number) {
        this.statusCode = code;
        return this;
      },
      json: function(data: any) {
        this.headers['Content-Type'] = 'application/json';
        this.body = JSON.stringify(data);
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
        });
      },
      send: function(data: any) {
        this.body = typeof data === 'string' ? data : JSON.stringify(data);
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
        });
      },
    };

    try {
      // Process the request through the Express app
      app(req as any, res as any, () => {
        reject(new Error('Request not handled'));
      });
    } catch (error) {
      reject(error);
    }
  });
};