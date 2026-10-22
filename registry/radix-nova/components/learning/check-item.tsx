import type { ComponentProps, ReactNode } from "react";
import checkmark from "@/assets/snapp/work/73dfa.svg";
import { cn } from "@/lib/utils";

interface CheckItemProps extends Omit<ComponentProps<"div">, "title"> {
	title: string;
	code?: string;
	date: ReactNode;
	state?: "default" | "selected" | "completed";
	statusLabel?: string;
	onCompletedChange?: (completed: boolean) => void;
}

function CheckItem({
	title,
	code,
	date,
	state = "default",
	statusLabel,
	onCompletedChange,
	className,
	...props
}: CheckItemProps) {
	const completed = state === "completed";
	const checkbox = (
		<span
			className={cn(
				"flex size-4 shrink-0 items-center justify-center rounded-snapp-minimal",
				completed
					? "bg-snapp-surface-green"
					: "border border-snapp-border-primary p-px"
			)}
		>
			{completed && <img src={checkmark} alt="" width={12} height={12} />}
		</span>
	);
	return (
		<div
			data-slot="snapp-check-item"
			data-state={state}
			className={cn(
				"flex h-18.5 w-98.5 max-w-full flex-col items-start justify-center gap-2 rounded-snapp-standard inset-ring-1 bg-snapp-surface-primary p-4 font-snapp-body font-normal",
				state === "selected"
					? "inset-ring-snapp-border-highlight"
					: "inset-ring-snapp-border-primary",
				className
			)}
			{...props}
		>
			<div className="flex items-center gap-2">
				{onCompletedChange ? (
					// biome-ignore lint/a11y/useSemanticElements: The supplied Figma checkbox uses button keyboard activation, its exact glyph, and the checkbox role with aria-checked.
					<button
						type="button"
						role="checkbox"
						aria-checked={completed}
						aria-label={`Complete ${title}`}
						onClick={() => onCompletedChange(!completed)}
						className="rounded-snapp-minimal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-border-highlight"
					>
						{checkbox}
					</button>
				) : (
					checkbox
				)}
				<p className="flex h-4.5 items-center gap-1 text-snapp-sm leading-snapp-xs">
					<span className="text-snapp-text-brand">{title}</span>
					{code && (
						<span className="text-snapp-text-secondary">
							{code}
						</span>
					)}
				</p>
			</div>
			<div className="flex w-full items-center gap-2 text-snapp-xs leading-snapp-xxs">
				<p
					className={cn(
						"min-w-0 flex-1",
						completed
							? "text-snapp-text-green"
							: "text-snapp-text-secondary"
					)}
				>
					{statusLabel ?? (completed ? "Completed" : "Issued")}
				</p>
				<span className="w-21 shrink-0 text-right text-snapp-text-secondary">
					{date}
				</span>
			</div>
		</div>
	);
}

export { CheckItem };
export type { CheckItemProps };
