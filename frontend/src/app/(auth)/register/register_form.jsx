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
			className="flex flex-col gap-4"
			inert={pending ? pending.toString() : undefined}
		>
			<div>
				<label htmlFor="email">Email:</label>
				<input type="email" id="email" name="email" required />
			</div>

			<div>
				<label htmlFor="password">Password:</label>
				<input type="password" id="password" name="password" required />
			</div>

			<div>
				<button type="submit">{pending ? "Creating..." : "Register"}</button>
			</div>

			{state?.error ? (
				<p className="p-2 font-semibold border rounded w-56 text-center text-pretty text-red-500">
					{state.error}
				</p>
			) : null}
		</fieldset>
	);
}
