import app from './server.js';

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running locally at http://localhost:${PORT}`);
});
