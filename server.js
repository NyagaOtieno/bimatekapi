const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Route imports
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/quotes', require('./routes/quotes.routes'));
app.use('/api/policies', require('./routes/policies.routes'));
app.use('/api/claims', require('./routes/claims.routes'));
app.use('/api/clients', require('./routes/clients.routes'));

// 👇 Add this to show status at "/"
app.get('/', (req, res) => {
  res.send('✅ Bimatek API is running. Use /api/* endpoints.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
