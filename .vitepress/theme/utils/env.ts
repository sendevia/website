/**
 * 判断当前是否在客户端环境
 * @returns 如果是客户端环境返回 true，否则返回 false
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * 判断当前是否在服务器端环境
 * @returns 如果是服务器端环境返回 true，否则返回 false
 */
export function isServer(): boolean {
  return !isClient();
}

/**
 * 判断当前是否在开发环境
 * @returns 如果是开发环境返回 true，否则返回 false
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * 判断当前是否在生产环境
 * @returns 如果是生产环境返回 true，否则返回 false
 */
export function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}
