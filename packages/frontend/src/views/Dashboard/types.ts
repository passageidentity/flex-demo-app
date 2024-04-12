export enum WebAuthnType {
    Passkey = "passkey",
    SecurityKey = "security_key",
    Platform = "platform",
};

export interface WebAuthnIcons {
    light: string | null;
    dark: string | null;
}

export interface WebAuthnDevice {
    createdAt: Date;
    credId: string;
    friendlyName: string;
    id: string;
    lastLoginAt: Date;
    type: WebAuthnType;
    updatedAt: Date;
    usageCount: number;
    icons: WebAuthnIcons;
}