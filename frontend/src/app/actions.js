"use server";

import { wait } from "@/lib/utils";
import { getSessionData, logout } from "./(auth)/actions";
import { database_whiteboard_output_schema } from "@/lib/chat/actions";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";



export async function importSchema(chatId, schema){

	// Given the schema, schema.rb(rails) for now, we need to:
	// Convert into into a representation of the database whiteboard
	// Save the whiteboard representation in the chat whiteboard
	console.log({chatId})

	const db_whiteboard_response = await generateObject({
		model: openai("gpt-3.5-turbo"),
		mode: "auto",
		schema: database_whiteboard_output_schema,
		temperature: 0,
		system: `\
	You are a bot that  given a Ruby on Rails schema.rb(current state of the database) 
	into the database whiteboard schema representation. the schema is in json.
`,
		prompt: schema,
	});

	console.debug(db_whiteboard_response);

	console.debug({db_whiteboard_response: JSON.stringify(db_whiteboard_response, null, 2)})

	const update_whiteboard_respone = await updateChatDatabaseWhiteboard(chatId, db_whiteboard_response.object.initialNodes)
	console.debug({update_whiteboard_respone})
	return update_whiteboard_respone
}

/**
 * 
 * @returns {boolean}
 */
export async function isUserRateLimited(){
	const result = await make_get_request("/auth/is-user-rate-limited")
	console.debug({isUserRateLimited: result})
	return result
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
