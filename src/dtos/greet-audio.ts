export enum Gender {
   MALE = 'MALE',
   FEMALE = 'FEMALE',
   OTHER = 'OTHER',
   UNKNOWN = 'UNKNOWN'
}

export interface IGreetAudio {
   fullName: string
   phone: string
   gender: Gender
   lastUpdate: string
   birthDay: string
}

export type BlacklistedUser = {
   note: string
   phone: string
}
