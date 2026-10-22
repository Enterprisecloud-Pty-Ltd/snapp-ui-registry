const FILTER_INTERACTION_ATTRIBUTE = "data-snapp-filter-interaction";

function isFilterInteraction(event: Event) {
	return event
		.composedPath()
		.some(
			(node) =>
				typeof Element !== "undefined" &&
				node instanceof Element &&
				node.hasAttribute(FILTER_INTERACTION_ATTRIBUTE)
		);
}

export { FILTER_INTERACTION_ATTRIBUTE, isFilterInteraction };
