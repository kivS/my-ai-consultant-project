export async function GET(request) {
	const searchParams = request.nextUrl.searchParams;

	const token = searchParams.get("token");

	if (!token) {
		return Response.json({ status: "Token not present" }, { status: 400 });
	}

	const formData = new FormData();
	formData.append("token", token);

	const response = await fetch(
		`${process.env.BACKEND_API_ENDPOINT}/auth/verify-email`,
		{
			method: "POST",
			body: formData,
		},
	).then((res) => {
		console.log(res);
		return res.json();
	});

	console.log({ response });

	console.log(searchParams);
	return Response.json(response);
}
