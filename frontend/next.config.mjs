/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	trailingSlash: true,
	compiler: {
		removeConsole:
			process.env.NODE_ENV === "production" ? { exclude: ["debug"] } : false,
	},
};

export default nextConfig;
