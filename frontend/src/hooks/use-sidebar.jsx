"use client";

import * as React from "react";

const LOCAL_STORAGE_KEY = "sidebar";

const SidebarContext = React.createContext(undefined);

export function useSidebar() {
	const context = React.useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebarContext must be used within a SidebarProvider");
	}
	return context;
}

export function SidebarProvider({ children }) {
	const [isSidebarOpen, setSidebarOpen] = React.useState(false);
	const [isLoading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const value = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (value) {
			setSidebarOpen(JSON.parse(value));
		}
		setLoading(false);
	}, []);

	const toggleSidebar = () => {
		setSidebarOpen((value) => {
			const newState = !value;
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
			return newState;
		});
	};

	if (isLoading) {
		return null;
	}

	return (
		<SidebarContext.Provider
			value={{ isSidebarOpen, toggleSidebar, isLoading }}
		>
			{children}
		</SidebarContext.Provider>
	);
}
