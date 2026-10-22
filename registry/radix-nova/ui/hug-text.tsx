"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Round the label's layout slot, while preserving its natural glyph positions. */
function HugText({
	children,
	className,
	style,
	...props
}: Omit<React.ComponentProps<"span">, "children"> & {
	children: string | number;
}) {
	const contentRef = React.useRef<HTMLSpanElement>(null);
	const [inlineSize, setInlineSize] = React.useState<number>();

	React.useLayoutEffect(() => {
		const content = contentRef.current;
		const view = content?.ownerDocument.defaultView;
		if (!content || !view) return;
		if (
			view.CSS.supports(
				"inline-size",
				"calc-size(max-content, round(up, size, 1px))"
			)
		)
			return;

		const updateSize = (size: number) => {
			if (!Number.isFinite(size)) return;
			const rounded = Math.ceil(size);
			setInlineSize((previous) =>
				previous === rounded ? previous : rounded
			);
		};
		// Computed inline size, unlike a client rect, is unaffected by host transforms.
		const measure = () =>
			updateSize(
				Number.parseFloat(view.getComputedStyle(content).inlineSize)
			);
		measure();
		if (!view.ResizeObserver) return;

		// Observe the natural text, never the rounded parent, to avoid feedback loops.
		const observer = new view.ResizeObserver(([entry]) => {
			if (!entry) return;
			const boxes = entry.contentBoxSize as
				| readonly ResizeObserverSize[]
				| ResizeObserverSize
				| undefined;
			const box = boxes && ("inlineSize" in boxes ? boxes : boxes[0]);
			if (box) updateSize(box.inlineSize);
			else measure();
		});
		observer.observe(content);
		return () => observer.disconnect();
	}, []);

	return (
		<span
			data-slot="hug-text"
			className={cn(
				"inline-flex shrink-0 inline-[calc-size(max-content,round(up,size,1px))]",
				className
			)}
			style={inlineSize === undefined ? style : { ...style, inlineSize }}
			{...props}
		>
			<span
				ref={contentRef}
				data-slot="hug-text-content"
				className="inline-block w-max shrink-0"
			>
				{children}
			</span>
		</span>
	);
}

/** Keep adjacent text in one flex item, including through transparent fragments. */
function wrapHugText(children: React.ReactNode): React.ReactNode {
	if (React.isValidElement(children) && children.type !== React.Fragment)
		return children;
	const result: React.ReactNode[] = [];
	let text = "";
	const flush = () => {
		if (!text) return;
		result.push(<HugText key={`text:${result.length}`}>{text}</HugText>);
		text = "";
	};
	const append = (nodes: React.ReactNode, scope: string) => {
		React.Children.forEach(nodes, (child, index) => {
			if (typeof child === "string" || typeof child === "number") {
				text += child;
			} else if (
				React.isValidElement(child) &&
				child.type === React.Fragment
			) {
				append(
					(child.props as { children?: React.ReactNode }).children,
					`${scope}:${child.key ?? index}`
				);
			} else if (child != null && typeof child !== "boolean") {
				flush();
				result.push(
					<React.Fragment
						// biome-ignore lint/suspicious/noArrayIndexKey: Unkeyed mixed text and fragments need stable output slots during text coalescing.
						key={`node:${scope}:${index}`}
					>
						{child}
					</React.Fragment>
				);
			}
		});
	};
	append(children, "root");
	flush();
	return result;
}

export { HugText, wrapHugText };
