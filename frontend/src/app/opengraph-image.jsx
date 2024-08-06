import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Nabubit";
export const size = {
	width: 1200,
	height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
	return new ImageResponse(
		// ImageResponse JSX element
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#fff",
				fontSize: 32,
				fontWeight: 600,
			}}
		>
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="72"
				height="72"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class=""
			>
				<path d="M12 12V4a1 1 0 0 1 1-1h6.297a1 1 0 0 1 .651 1.759l-4.696 4.025" />
				<path d="m12 21-7.414-7.414A2 2 0 0 1 4 12.172V6.415a1.002 1.002 0 0 1 1.707-.707L20 20.009" />
				<path d="m12.214 3.381 8.414 14.966a1 1 0 0 1-.167 1.199l-1.168 1.163a1 1 0 0 1-.706.291H6.351a1 1 0 0 1-.625-.219L3.25 18.8a1 1 0 0 1 .631-1.781l4.165.027" />
			</svg>

			<div style={{ marginTop: 5, fontWeight: 600, fontSize: 60 }}>
				Nabubit.com
			</div>

			<div style={{ marginTop: 30, fontSize: 30 }}>
				Your Database Design Copilot
			</div>
		</div>,
		// ImageResponse options
		{
			// For convenience, we can re-use the exported opengraph-image
			// size config to also set the ImageResponse's width and height.
			...size,
			// fonts: [
			// 	{
			// 		name: "Inter",
			// 		// data: await interSemiBold,
			// 		style: "normal",
			// 		weight: 400,
			// 	},
			// ],
		},
	);
}
