export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    email: string;
    password: string;
    full_name: string;
    company?: string;
    country?: string;
};


export type MeResponse = {
    authenticated: boolean;
    user?: {
        id: string;
        email: string;
        provider?: string;
        created_at: string;
    };
    profile?: {
        user_id: string;
        full_name: string;
        email: string;
        company?: string;
        country?: string;
        created_at: string;
        updated_at: string;
    };
};

export type UpdateProfilePayload = {
    full_name?: string;
    company?: string;
    country?: string;
};