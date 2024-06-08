import { useCallback, useEffect, useRef, useState } from "react";

export function useScrollAnchor() {
	const messagesRef = useRef(null);
	const scrollRef = useRef(null);
	const visibilityRef = useRef(null);

	const [isAtBottom, setIsAtBottom] = useState(true);
	const [isVisible, setIsVisible] = useState(false);

	const scrollToBottom = useCallback(() => {
		if (messagesRef.current) {
			messagesRef.current.scrollIntoView({
				block: "end",
				behavior: "smooth",
			});
		}
	}, []);

	useEffect(() => {
		// debugger;
		if (messagesRef.current) {
			if (isAtBottom && !isVisible) {
				console.log({ isAtBottom });
				console.log({ isVisible });
				messagesRef.current.scrollIntoView({
					block: "end",
				});
			}
		}
	}, [isAtBottom, isVisible]);

	useEffect(() => {
		const { current } = scrollRef;

		if (current) {
			const handleScroll = (event) => {
				const target = event.target;
				const offset = 25;
				const isAtBottom =
					target.scrollTop + target.clientHeight >=
					target.scrollHeight - offset;

				setIsAtBottom(isAtBottom);
			};

			current.addEventListener("scroll", handleScroll, {
				passive: true,
			});

			return () => {
				current.removeEventListener("scroll", handleScroll);
			};
		}
	}, []);

	useEffect(() => {
		if (visibilityRef.current) {
			const observer = new IntersectionObserver(
				(entries) => {
					// biome-ignore lint/complexity/noForEach: <explanation>
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							setIsVisible(true);
						} else {
							setIsVisible(false);
						}
					});
				},
				{
					rootMargin: "0px 0px -150px 0px",
				},
			);

			observer.observe(visibilityRef.current);

			return () => {
				observer.disconnect();
			};
		}
	});

	return {
		messagesRef,
		scrollRef,
		visibilityRef,
		scrollToBottom,
		isAtBottom,
		isVisible,
	};
}
