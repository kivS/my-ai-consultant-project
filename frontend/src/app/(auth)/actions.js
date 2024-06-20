"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData) {
	console.log({ formData });

	const response = await fetch(
		`${process.env.BACKEND_API_ENDPOINT}/auth/login`,
		{
			method: "POST",
			body: formData,
		},
	).then((res) => {
		console.log(res);
		return res.json();
	});

	console.log({ response });

	if (response?.token) {
		await saveSessionData(response.token);
		redirect("/");
	}
}

export async function register(formData) {
	console.log(formData);

	const response = await fetch(
		`${process.env.BACKEND_API_ENDPOINT}/auth/register`,
		{
			method: "POST",
			body: formData,
		},
	).then((res) => {
		console.log(res);
		return res.json();
	});

	console.log({ response });

	return "ok";
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
