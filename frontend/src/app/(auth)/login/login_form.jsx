"use client";

import { useFormStatus, useFormState } from "react-dom";
import { login } from "../actions";
import Link from "next/link";

export default function LoginForm() {
	const [state, formAction] = useFormState(login, null);

	return (
		<form id="loginForm" action={formAction}>
			<FieldsetElement state={state} />
		</form>
	);
}

function FieldsetElement({ state }) {
	const { pending } = useFormStatus();

	return (
		<fieldset className="flex flex-col gap-4">
			<div>
				<label htmlFor="email">Email:</label>
				<input type="email" id="email" name="email" required />
			</div>

			<div>
				<label htmlFor="password">Password:</label>
				<input type="password" id="password" name="password" required />
			</div>

			<div>
				Or{" "}
				<Link href="/register" className="text-cyan-400">
					register
				</Link>{" "}
				an account
			</div>

			<div>
				<button type="submit">{pending ? "Login..." : "Login"}</button>
			</div>
			{state?.error ? (
				<p className="p-2 font-semibold border rounded w-56 text-center text-pretty text-red-500">
					{state.error}
				</p>
			) : null}
		</fieldset>
	);
}
