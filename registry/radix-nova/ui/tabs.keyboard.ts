import * as React from "react";

function ownedTabs(list: HTMLElement) {
	return Array.from(
		list.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]')
	).filter(
		(tab) =>
			tab.closest('[role="tablist"]') === list &&
			!tab.hasAttribute("disabled") &&
			!tab.hasAttribute("data-disabled") &&
			tab.getAttribute("aria-disabled") !== "true"
	);
}

function focusedElement(node: HTMLElement) {
	const root = node.getRootNode();
	return "activeElement" in root ? root.activeElement : null;
}

function focusFirst(candidates: HTMLElement[]) {
	const previouslyFocused = candidates[0]
		? focusedElement(candidates[0])
		: null;
	for (const candidate of candidates) {
		if (!candidate.isConnected) continue;
		if (candidate === previouslyFocused) return;
		candidate.focus();
		// document.activeElement remains the host when focus is inside a shadow.
		// A consumer onFocus may deliberately redirect focus; preserve that too.
		if (focusedElement(candidate) !== previouslyFocused) return;
	}
}

function focusTabsOnEntry(list: HTMLElement) {
	const tabs = ownedTabs(list);
	const selected = tabs.find(
		(tab) => tab.getAttribute("aria-selected") === "true"
	);
	const current = tabs.find((tab) => tab.tabIndex === 0);
	focusFirst(
		Array.from(new Set([selected, current, ...tabs])).filter(
			(tab): tab is HTMLElement => Boolean(tab)
		)
	);
}

function useTabsFocusTimer() {
	const pending = React.useRef<{ view: Window; id: number } | null>(null);
	React.useEffect(
		() => () => {
			if (pending.current)
				pending.current.view.clearTimeout(pending.current.id);
		},
		[]
	);
	return pending;
}

/** Keep Radix selection/roving state; repair only its owner-root focus lookup. */
function handleTabsArrowNavigation(
	event: React.KeyboardEvent<HTMLElement>,
	loop: boolean,
	pending: ReturnType<typeof useTabsFocusTimer>,
	onShiftTab: () => void
) {
	if (event.key === "Tab" && event.shiftKey) {
		onShiftTab?.();
		return;
	}
	if (
		event.target !== event.currentTarget ||
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey
	)
		return;
	const source = event.currentTarget;
	const list = source.closest<HTMLElement>('[role="tablist"]');
	const view = source.ownerDocument.defaultView;
	if (!list || !view) return;
	const vertical = list.getAttribute("aria-orientation") === "vertical";
	const rtl = view.getComputedStyle(list).direction === "rtl";
	let intent: "first" | "last" | "previous" | "next";
	if (event.key === "Home" || event.key === "PageUp") intent = "first";
	else if (event.key === "End" || event.key === "PageDown") intent = "last";
	else if (vertical && event.key === "ArrowUp") intent = "previous";
	else if (vertical && event.key === "ArrowDown") intent = "next";
	else if (!vertical && event.key === "ArrowLeft")
		intent = rtl ? "next" : "previous";
	else if (!vertical && event.key === "ArrowRight")
		intent = rtl ? "previous" : "next";
	else return;

	event.preventDefault();
	if (!ownedTabs(list).includes(source)) return;
	if (pending.current) pending.current.view.clearTimeout(pending.current.id);
	// Like Radix, defer arrow focus until React finishes the key event batch.
	const id = view.setTimeout(() => {
		pending.current = null;
		if (
			!list.isConnected ||
			!source.isConnected ||
			focusedElement(source) !== source
		)
			return;
		let candidates = ownedTabs(list);
		if (!candidates.includes(source)) return;
		if (intent === "last" || intent === "previous") candidates.reverse();
		if (intent === "previous" || intent === "next") {
			const index = candidates.indexOf(source);
			if (index < 0) return;
			candidates = loop
				? [
						...candidates.slice(index + 1),
						...candidates.slice(0, index + 1),
					]
				: candidates.slice(index + 1);
		}
		focusFirst(candidates);
	}, 0);
	pending.current = { view, id };
}

export { focusTabsOnEntry, handleTabsArrowNavigation, useTabsFocusTimer };
