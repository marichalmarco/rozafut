import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Home Page', message: 'Welcome to the Home Page!' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Page', message: 'This is the About Page.' });
});

// Export app for Vercel (no app.listen)
export default app;
