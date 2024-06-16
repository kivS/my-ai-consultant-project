"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

// export async function login(formData: FormData) {
export async function login(formData) {
	const supabase = createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		// email: formData.get("email") as string,
		email: formData.get("email"),
		
	};

	const { error } = await supabase.auth.signInWithOtp(data);

	if (error) {
		redirect("/error");
	}

	revalidatePath("/", "layout");
	redirect("/");
}

// export async function signup(formData: FormData) {
export async function signup(formData) {
	const supabase = createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		// email: formData.get("email") as string,
		email: formData.get("email"),
		// password: formData.get("password") as string,
		password: formData.get("password"),
	};

	const { error } = await supabase.auth.signUp(data);

	if (error) {
		redirect("/error");
	}

	revalidatePath("/", "layout");
	redirect("/");
}
