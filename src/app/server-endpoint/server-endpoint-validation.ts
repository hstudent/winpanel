import { ServerEndpoint } from '../model/server-endpoint';

export function getServerEndpointUrl(endpoint: ServerEndpoint): string {
  return `${endpoint.protocol}://${endpoint.ip}:${endpoint.port}`;
}

export function isValidServerEndpoint(endpoint: ServerEndpoint): boolean {
  // 1. Проверка существования endpoint
  if (!endpoint) {
    return false;
  }

  // 2. Проверка обязательных полей на наличие и тип
  if (typeof endpoint.name !== 'string' || endpoint.name.trim().length === 0) {
    return false;
  }

  if (!['http', 'https'].includes(endpoint.protocol)) {
    return false;
  }

  // 3. Валидация IP-адреса
  if (!isValidIpAddress(endpoint.ip)) {
    return false;
  }

  // 4. Валидация порта
  if (!isValidPort(endpoint.port)) {
    return false;
  }

  return true;
}

// Вспомогательная функция для валидации IP-адреса
function isValidIpAddress(ip: string): boolean {
  // Регулярное выражение для IPv4
  const ipv4Pattern =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  return typeof ip === 'string' && ipv4Pattern.test(ip);
}

// Вспомогательная функция для валидации порта
function isValidPort(port: number): boolean {
  // Проверяем, что это целое число в допустимом диапазоне
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}
