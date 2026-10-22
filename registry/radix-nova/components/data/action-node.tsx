import type { ComponentProps } from "react";
import flash from "@/assets/snapp/work/82d30.svg";
import actionMarkers from "@/assets/snapp/work/eb3b4.svg";
import branch from "@/assets/snapp/work/dee39.svg";
import conditionMarkers from "@/assets/snapp/work/5fa13.svg";
import flag from "@/assets/snapp/work/dc570.svg";
import { cn } from "@/lib/utils";

interface ActionNodeProps extends Omit<ComponentProps<"button">, "title"> {
	kind?: "action" | "condition" | "trigger";
	title: string;
	subtitle: string;
	selected?: boolean;
	onPortClick?: (port: "error" | "success" | "default") => void;
}

/** Flow canvas node. Positioning, connections and execution remain owned by the consuming canvas. */
function ActionNode({
	kind = "action",
	title,
	subtitle,
	selected = false,
	onPortClick,
	className,
	...props
}: ActionNodeProps) {
	const trigger = kind === "trigger";
	const ports: ("error" | "success" | "default")[] =
		kind === "condition"
			? ["error", "success"]
			: ["error", "success", "default"];
	return (
		<div
			data-slot="snapp-action-node"
			data-kind={kind}
			data-state={selected ? "selected" : "default"}
			className={cn(
				"relative w-34 font-snapp-body font-normal",
				trigger ? "h-14" : "h-15.25",
				className
			)}
		>
			<button
				type="button"
				aria-pressed={selected}
				className={cn(
					"absolute inset-x-0 top-0 flex h-14 items-center rounded-lg inset-ring-1 bg-snapp-surface-primary py-3 pr-5 pl-4 text-left focus-visible:outline-2 focus-visible:outline-snapp-border-highlight",
					selected
						? "inset-ring-snapp-border-highlight"
						: "inset-ring-snapp-border-primary"
				)}
				{...props}
			>
				<span className="flex items-center gap-2">
					<img
						src={
							{ action: flash, condition: branch, trigger: flag }[
								kind
							]
						}
						alt=""
						width={20}
						height={20}
						className="shrink-0"
					/>
					<span className="flex w-18 shrink-0 flex-col items-start gap-0.5 overflow-hidden whitespace-nowrap">
						<span className="text-snapp-sm leading-snapp-xs text-snapp-text-brand">
							{title}
						</span>
						<span className="text-snapp-xxs leading-snapp-xxxs text-snapp-text-secondary">
							{subtitle}
						</span>
					</span>
				</span>
			</button>
			{!trigger && (
				<div
					className={cn(
						"absolute top-12.75 h-2.5",
						kind === "condition"
							? "left-11.25 w-10.5"
							: "left-8 w-18.5"
					)}
				>
					<img
						src={
							kind === "condition"
								? conditionMarkers
								: actionMarkers
						}
						alt=""
					/>
					{onPortClick &&
						ports.map((port, index) => (
							<button
								key={port}
								type="button"
								aria-label={`${title}: ${port} connection`}
								onClick={() => onPortClick(port)}
								className="absolute top-0 size-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-border-highlight"
								style={{ left: index * 32 }}
							/>
						))}
				</div>
			)}
		</div>
	);
}

export { ActionNode };
export type { ActionNodeProps };
