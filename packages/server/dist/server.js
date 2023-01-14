/*
 * Copyright (c) 2022 Nango, all rights reserved.
 */
// Import environment variables (if running server locally).
import * as dotenv from 'dotenv';
if (process.env['SERVER_RUN_MODE'] !== 'DOCKERIZED') {
    dotenv.config({ path: '../../.env' });
}
import { authServer, getOauthCallbackUrl, getPort } from '@nangohq/auth';
import express from 'express';
import cors from 'cors';
let port = getPort();
let app = express();
app.use(express.json());
app.use(cors());
authServer.setup(app);
app.use((error, _, response, __) => {
    console.log(error);
    const status = error.status || 500;
    response.status(status).send(error.message);
});
app.listen(port, () => {
    console.log(`✅ Pizzly Server is listening on port ${port}. OAuth callback URL: ${getOauthCallbackUrl()}`);
});
//# sourceMappingURL=server.js.map