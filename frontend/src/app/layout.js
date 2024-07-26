import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Nabu One - Streamline Database Design, Management, and Evolution",
	description: "Streamline Database Design, Management, and Evolution",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body
				className={cn("font-sans antialiased", inter.className)}
				suppressHydrationWarning
			>
				<Providers
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<div className="flex flex-col min-h-screen">
						<Header />
						<main className="flex flex-col flex-1 bg-muted/50">{children}</main>
					</div>
					<TailwindIndicator />
				</Providers>
			</body>
		</html>
	);
}
