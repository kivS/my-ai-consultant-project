import { createServerClient } from "@supabase/ssr";
// import { createServerClient, type CookieOptions } from "@supabase/ssr";

// import { NextResponse } from "next/server";
import { NextResponse} from "next/server";

// export async function updateSession(request: NextRequest) {
export async function updateSession(request) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				// get(name: string) {
				get(name) {
					return request.cookies.get(name)?.value;
				},
				// set(name: string, value: string, options: CookieOptions) {
				set(name, value, options) {
					request.cookies.set({
						name,
						value,
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value,
						...options,
					});
				},
				// remove(name: string, options: CookieOptions) {
				remove(name, options) {
					request.cookies.set({
						name,
						value: "",
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value: "",
						...options,
					});
				},
			},
		},
	);

	await supabase.auth.getUser();

	return response;
}
