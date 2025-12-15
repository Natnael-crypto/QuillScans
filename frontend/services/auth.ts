import api from "@/lib/axios";
import { LoginPayload, MeResponse, RegisterPayload } from "@/types/auth";



export async function getMe(): Promise<MeResponse> {
    try {
        const { data } = await api.get<MeResponse>("/api/auth/me");
        return data;
    } catch (err: any) {
        if (err.response?.status === 401) {
            return { authenticated: false };
        }
        throw err;
    }
}





export async function loginUser(payload: LoginPayload): Promise<void> {
    await api.post("/api/login", payload);
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
    await api.post("/api/register", payload);
}
