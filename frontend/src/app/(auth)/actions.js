"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(prevState, formData) {
	console.debug({ prevState });
	console.debug({ formData });

	const request = await fetch(
		`${process.env.BACKEND_API_ENDPOINT}/auth/login`,
		{
			method: "POST",
			body: formData,
		},
	);

	const response = await request.json();
	console.debug({ response });

	if (response?.token) {
		await saveSessionData(response.token);
		return redirect("/");
	}

	return response;
}

export async function register(prevState, formData) {
	console.debug({ prevState });
	console.debug({ formData });

	const response = await fetch(
		`${process.env.BACKEND_API_ENDPOINT}/auth/register`,
		{
			method: "POST",
			body: formData,
		},
	);

	const json_response = await response.json();

	console.debug({ response });

	if (json_response?.token) {
		await saveSessionData(json_response.token);
		return redirect("/");
	}

	return json_response;
}

// ------------------------------------------------------------------------------

export async function saveSessionData(token) {
	cookies().set("session", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 365, // One year
		path: "/",
	});
}

export async function getSessionData() {
	const session = cookies().get("session")?.value;

	if (!session) return null;

	return session;
}

export async function logout() {
	console.log("logout...");
	cookies().set("session", "", { expires: new Date(0) });
	redirect("/");
}
