export type ApiRes<T> = {
   success: boolean
   error?: string
   data: T[]
}
