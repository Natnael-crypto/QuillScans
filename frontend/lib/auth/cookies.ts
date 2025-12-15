import { cookies } from "next/headers";

const ACCESS_TOKEN = "sb-access-token";
const REFRESH_TOKEN = "sb-refresh-token";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
};

export async function setAuthCookies(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
) {
    const cookieStore = await cookies();

    cookieStore.set(ACCESS_TOKEN, accessToken, {
        ...cookieOptions,
        maxAge: expiresIn, // seconds
    });

    cookieStore.set(REFRESH_TOKEN, refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();

    cookieStore.delete(ACCESS_TOKEN);
    cookieStore.delete(REFRESH_TOKEN);
}

export async function getAuthCookies() {
    const cookieStore = await cookies();

    return {
        accessToken: cookieStore.get(ACCESS_TOKEN)?.value,
        refreshToken: cookieStore.get(REFRESH_TOKEN)?.value,
    };
}
