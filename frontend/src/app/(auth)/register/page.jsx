import { redirect } from "next/navigation";
import { getSessionData } from "../actions";
import RegisterForm from "./register_form";

export default async function LoginPage() {
	const session = await getSessionData();
	if (session) redirect("/");
	console.debug({ session });

	return (
		<div>
			<RegisterForm />
		</div>
	);
}
