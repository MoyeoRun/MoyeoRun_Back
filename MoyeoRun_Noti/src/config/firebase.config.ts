export const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  databaseUrl: process.env.FIREBASE_DATABASE_URL,
};
