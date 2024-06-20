"use server";

import { getSessionData } from "./(auth)/actions";

export async function getUserData() {
	try {
		const user = await make_get_request("/auth/get-user");
		return user;
	} catch (error) {
		console.log(error);
		return null;
	}
}

async function make_get_request(endpoint) {
	const session = await getSessionData();

	if (!session) {
		return null;
	}

	const response = await fetch(
		`${process.env.BACKEND_API_ENDPOINT}${endpoint}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${session}`,
			},
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch user data");
	}

	const json_response = await response.json();
	return json_response;
}
