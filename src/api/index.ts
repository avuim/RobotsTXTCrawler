import { ApiServer } from './ApiServer';

/**
 * Startet den API-Server
 */
export function startApiServer(port: number = 3001): void {
  const apiServer = new ApiServer(port);
  apiServer.start();
}
