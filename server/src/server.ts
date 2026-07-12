import app from './app';
import { env } from './config/env';
import { connectDb } from './config/db';

const port = env.PORT || 8000;

connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});