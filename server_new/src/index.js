const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: path.join(process.cwd(), '../.env') });

const localEnvPath = path.join(process.cwd(), '../.env.local');
//console.log(process.cwd(), localEnvPath);
if (fs.existsSync(localEnvPath)) {
  console.log("Loading local environment variables from .env.local");
  dotenv.config({ path: localEnvPath });

}

const env = process.env
const express = require('express');
const v1Routes = require('./routes/v1/index');
const v2Routes = require('./routes/v2/index');
const app = express();
const cors = require('cors');
const PORT = env.PORT_SERVER || 5000;


const allowedOrigins = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(",") : [];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))
app.use(express.json());

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

app.use(express.static(path.join(process.cwd(), '../client/docs')));

app.use((req, res) => {
  res.status(404).json({success: false, message: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`WEB - Listening on: http://localhost:${PORT} `);
  console.log(`API:V1 - Listening on: http://localhost:${PORT}/api/v1`);
  console.log(`API:V2 - Listening on: http://localhost:${PORT}/api/v2`);

});
