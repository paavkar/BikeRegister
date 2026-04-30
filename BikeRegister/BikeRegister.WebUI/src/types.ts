type BaseResult = {
    succeeded: boolean;
    statusCode: number | null;
    message: string | null;
    errors: Array<string> | null;
}

export type AuthResult = BaseResult & {
  accessToken: string | null;
  refreshToken: string | null;
  twoFactorRequired: boolean;
  twoFactorUri: string | null;
}

export type UserResult = BaseResult & {
    user: AppUser | null;
}

export type RegistrationResult = BaseResult & {
    registration: Registration | null;
    registrations: Array<Registration> | null;
}

export type AppUser = {
    id: string;
    userName: string;
    email: string;
    phoneNumber: string | null;
    emailConfirmed: boolean;
    twoFactorEnabled: boolean;
    name: string;
    profilePhotoUrl: string | null;

    registeredDate: Date;

    registrations: Array<Registration>;
}

export type RegistrationUser = {
    id: string;
    email: string;
    userName: string;
    phoneNumber: string | null;
    name: string;
    profilePhotoUrl: string | null;
}

export type Registration = {
    id: string;
    model: string | null;
    brand: string;
    modelYear: number | null;
    frameSize: number | null;
    frameSizeUnit: number;
    frameType: number;
    primaryColour: string;
    secondaryColour: string;
    serialNumber: string;
    city: string;
    district: string | null;
    description: string | null;
    isStolen: boolean;
    dateStolen: Date | null;
    user: RegistrationUser;
}

export type SearchFilter = {
    Brand?: string;
    City?: string;
    SerialNumber?: string;
};