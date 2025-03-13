declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    MONGODB_USERNAME: string;
    MONGODB_PASSWORD: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 