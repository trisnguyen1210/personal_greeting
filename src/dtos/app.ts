export type AppConfig = {
   port: number
   proxy: string | void
   apiRateLimit: number
   apiRateLimitWindowMs: number
   userCsvPathPattern: string
   blacklistUserCsvPath: string
   apiKey: string
   corsOrigin: string
   corsMethods: string
}
