import { redirect } from "next/navigation";
import { getSessionData, login } from "../actions";
import LoginForm from "./login_form";

export default async function LoginPage() {
	const session = await getSessionData();
	if (session) redirect("/");
	console.log({ session });

	return (
		<div>
			<LoginForm />
		</div>
	);
}
