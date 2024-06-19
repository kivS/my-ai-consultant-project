"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData) {
	console.log({ formData });

	const response = await fetch("http://localhost:4000/auth/login", {
		method: "POST",
		body: formData,
	}).then((res) => {
		console.log(res);
		return res.json();
	});

	console.log({ response });

	if (response?.token) {
		cookies().set("session", response?.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 5, // Five minutes
			path: "/",
		});

      redirect("/")
	}

}

export async function getSessionData() {
	const session = cookies().get("session")?.value;

   if (!session) return null;

	return session
}

export async function logout() {
	 cookies().set("session", "", { expires: new Date(0) });
}
