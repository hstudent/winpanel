export interface ServerEndpoint {
  name: string;
  protocol: 'http' | 'https';
  ip: string;
  port: number;
}
