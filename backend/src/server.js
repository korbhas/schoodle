require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const routes = require('./routes');
const { pool } = require('./db/pool');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || !config.corsOrigins.length || config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Schoodle backend ready' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`[server] Listening on port ${config.port}`);
});

const shutdown = async (signal) => {
  console.log(`[server] Received ${signal}, shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});

module.exports = app;

