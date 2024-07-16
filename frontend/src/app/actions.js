"use server";

import { wait } from "@/lib/utils";
import { getSessionData, logout } from "./(auth)/actions";
import { database_whiteboard_output_schema } from "@/lib/chat/actions";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { getMutableAIState } from "ai/rsc";




/**
 * 
 * @returns {boolean}
 */
export async function isUserRateLimited(){
	const result = await make_get_request("/auth/is-user-rate-limited")
	console.debug({isUserRateLimited: result})
	return result
}


export async function getCurrentDatabaseWhiteboard(chatId){
	const result = await make_get_request(`/chats/${chatId}`);
	return result?.database_whiteboard?.whiteboard;

}

export async function updateChatDatabaseWhiteboard(chatId, initialNodes) {
	const payload = {
		database_whiteboard: {
			whiteboard: {
				initialNodes,
			},
		},
	};

	// console.debug({ payload: JSON.stringify(payload, null, 2) });
	try {		
		const result = await make_put_request(
			`/chats/${chatId}/update_whiteboard`,
			payload,
		);
		return result;
	} catch (error) {
		console.error("Error updating the database whiteboard: ", error)
	}
}

export async function getChats() {
	const result = await make_get_request("/chats");
	return result;
}

export async function getChat(chatId) {
	const result = await make_get_request(`/chats/${chatId}`);
	return result;
}

export async function saveChatMessages(chatId, messages) {
	const payload = { messages: messages };
	const result = await make_put_request(`/chats/${chatId}`, payload);
	return result;
}

export async function createChat(payload) {
	const chat = await make_post_request("/chats", payload);
	return chat;
}

export async function getUserData() {
	try {
		const user = await make_get_request("/auth/get-user");
		return user;
	} catch (error) {
		console.log(error);
		return null;
	}
}

async function make_put_request(endpoint, payload) {
	const session = await getSessionData();

	if (!session) {
		return null;
	}

	const response = await fetch(
		`${process.env.BACKEND_API_ENDPOINT}${endpoint}`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${session}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		},
	);

	if (!response.ok) {
		throw new Error("Failed to create chat");
	}

	const json_response = await response.json();
	return json_response;
}

async function make_post_request(endpoint, payload) {
	const session = await getSessionData();

	if (!session) {
		return null;
	}

	const response = await fetch(
		`${process.env.BACKEND_API_ENDPOINT}${endpoint}`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${session}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		},
	);

	if (!response.ok) {
		throw new Error("Failed to create chat");
	}

	const json_response = await response.json();
	return json_response;
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
