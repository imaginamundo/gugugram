export function draggable(node: HTMLElement, handleSelector: string) {
	let isDragging = false;
	let startX: number;
	let startY: number;
	let initialX: number;
	let initialY: number;

	function onMouseDown(e: MouseEvent) {
		// Event delegation: check if the click was on the handle or a child of it
		const target = e.target as HTMLElement;
		const handle = node.querySelector(handleSelector);
		
		if (!handle || !handle.contains(target)) return;

		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;

		const style = window.getComputedStyle(node);
		
		// For <dialog>, we need to ensure we have real numbers.
		// If the dialog is centered via margin: auto, we should get its current offset.
		const rect = node.getBoundingClientRect();
		initialX = rect.left;
		initialY = rect.top;

		// Force the node to stay where it is when we start moving it
		node.style.position = "fixed";
		node.style.margin = "0";
		node.style.left = `${initialX}px`;
		node.style.top = `${initialY}px`;

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
		
		// Prevent text selection while dragging
		e.preventDefault();
	}

	function onMouseMove(e: MouseEvent) {
		if (!isDragging) return;

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		node.style.left = `${initialX + dx}px`;
		node.style.top = `${initialY + dy}px`;
	}

	function onMouseUp() {
		isDragging = false;
		window.removeEventListener("mousemove", onMouseMove);
		window.removeEventListener("mouseup", onMouseUp);
	}

	node.addEventListener("mousedown", onMouseDown);

	// Also add a global style to indicate the handle is draggable if it exists
	const observer = new MutationObserver(() => {
		const handle = node.querySelector(handleSelector) as HTMLElement;
		if (handle) {
			handle.style.cursor = "move";
		}
	});

	observer.observe(node, { childList: true, subtree: true });

	return {
		destroy() {
			node.removeEventListener("mousedown", onMouseDown);
			observer.disconnect();
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		}
	};
}
