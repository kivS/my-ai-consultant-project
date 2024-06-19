import { redirect } from "next/navigation";
import { getSessionData, login } from "../actions";

export default async function LoginPage() {
	const session = await getSessionData();
	if (session) redirect("/");
	console.log({ session });

	return (
		<div>
			<form id="loginForm" action={login}>
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
						<button type="submit">Login</button>
					</div>
				</fieldset>
			</form>
		</div>
	);
}
