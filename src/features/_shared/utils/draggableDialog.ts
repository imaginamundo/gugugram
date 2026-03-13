export function draggableDialog(node: HTMLElement) {
	const dialog = node.closest("dialog");
	if (!dialog) {
		console.warn("The draggable action must be used inside a <dialog> element.");
		return;
	}

	node.classList.add("draggable");

	let isDragging = false;
	let currentX = 0;
	let currentY = 0;
	let startX = 0;
	let startY = 0;

	function onPointerDown(e: PointerEvent) {
		const target = e.target as HTMLElement;
		if (target.closest("button")) return;

		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;

		document.body.style.userSelect = "none";
		node.setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging) return;

		currentX += e.clientX - startX;
		currentY += e.clientY - startY;

		dialog!.style.transform = `translate(${currentX}px, ${currentY}px)`;

		startX = e.clientX;
		startY = e.clientY;
	}

	function onPointerUp(e: PointerEvent) {
		isDragging = false;
		document.body.style.userSelect = "";
		node.releasePointerCapture(e.pointerId);
	}

	node.addEventListener("pointerdown", onPointerDown);
	node.addEventListener("pointermove", onPointerMove);
	node.addEventListener("pointerup", onPointerUp);

	return () => {
		node.removeEventListener("pointerdown", onPointerDown);
		node.removeEventListener("pointermove", onPointerMove);
		node.removeEventListener("pointerup", onPointerUp);

		dialog.style.transform = "";
	};
}
