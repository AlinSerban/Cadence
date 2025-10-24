import { type RegisterPayload, type LoginPayload } from "../types/auth";
const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:3000";
//const ENDPOINT = "http://localhost:3000";
export async function register(data: RegisterPayload) {
  const res = await fetch(`${ENDPOINT}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function login(data: LoginPayload) {
  const res = await fetch(`${ENDPOINT}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function getProfile(accessToken: string) {
  const res = await fetch(`${ENDPOINT}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error("Not authorized");
  return res.json();
}

export async function refreshAccessToken() {
  const res = await fetch(`${ENDPOINT}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Refresh failed");
  return res.json();
}

// export async function logout() {
//   const res = await fetch("http://localhost:3000/api/auth/logout", {
//     method: "POST",
//     credentials: "include",
//   });

//   if (!res.ok) throw new Error("Failed to log out");
//   return res.json();
// }
