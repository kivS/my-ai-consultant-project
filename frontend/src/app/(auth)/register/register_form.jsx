"use client";

import { useFormStatus, useFormState } from "react-dom";
import { register } from "../actions";

export default function RegisterForm() {
	const [state, formAction] = useFormState(register, null);

	return (
		<form id="signUpForm" action={formAction}>
			<FieldsetElement state={state} />
		</form>
	);
}

function FieldsetElement({ state }) {
	const { pending } = useFormStatus();

	return (
		<fieldset
			className="flex flex-col gap-4 w-80"
			inert={pending ? pending.toString() : undefined}
		>
			<h1 className="text-center mb-10 text-3xl font-semibold">
				Register account
			</h1>

			<div className="flex flex-col gap-2">
				<label htmlFor="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					className="h-8 p-2"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label htmlFor="password">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					className="h-8 p-2"
				/>
			</div>

			<div className="flex justify-center">
				<button type="submit" className="rounded border p-2">
					{pending ? "Creating..." : "Register"}
				</button>
			</div>

			{state?.error ? (
				<p className="p-2 font-semibold border rounded text-center text-pretty text-red-500">
					{state.error}
				</p>
			) : null}
		</fieldset>
	);
}
