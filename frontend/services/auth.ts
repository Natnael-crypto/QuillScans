import api from "@/lib/axios";
import { LoginPayload, MeResponse, RegisterPayload, UpdateProfilePayload } from "@/types/auth";



export async function getMe(): Promise<MeResponse> {
    try {
        const { data } = await api.get<MeResponse>("/api/auth/me");
        return data;
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
            const status = (err.response as { status: number })?.status;
            if (status === 401) {
                return { authenticated: false };
            }
        }
        throw err;
    }
}





export async function loginUser(payload: LoginPayload): Promise<void> {
    await api.post("/api/login", payload);
}


export async function logout(): Promise<void> {
    await api.post("/api/logout");
}


export async function registerUser(payload: RegisterPayload): Promise<void> {
    await api.post("/api/register", payload);
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<void> {
    await api.patch("/api/profile", payload);
}
