import type { ComponentProps, ReactNode } from "react";
import draggable from "@/assets/snapp/work/cfdce.svg";
import checkmark from "@/assets/snapp/work/73dfa.svg";
import more from "@/assets/snapp/work/fe3f2.svg";
import employeeGrip from "@/assets/snapp/work/2c7aa.svg";
import employeeCheckmark from "@/assets/snapp/work/6210e.svg";
import employeeMore from "@/assets/snapp/work/1fdac.svg";
import { cn } from "@/lib/utils";

interface CourseProps extends Omit<ComponentProps<"div">, "title"> {
	title: string;
	code?: string;
	date: ReactNode;
	completed?: boolean;
	variant?: "default" | "employee";
	statusLabel?: string;
	onCompletedChange?: (completed: boolean) => void;
	onMoreClick?: () => void;
	dragHandleProps?: ComponentProps<"button">;
}

function Course({
	title,
	code,
	date,
	completed = false,
	variant = "default",
	statusLabel,
	onCompletedChange,
	onMoreClick,
	dragHandleProps,
	className,
	...props
}: CourseProps) {
	const employee = variant === "employee";
	const handle = (
		<img
			src={employee ? employeeGrip : draggable}
			alt=""
			width={employee ? 12 : 20}
			height={employee ? 5 : 20}
			className="shrink-0"
		/>
	);
	const moreIcon = (
		<img
			src={employee ? employeeMore : more}
			alt=""
			width={16}
			height={16}
		/>
	);
	const checkbox = (
		<span
			className={cn(
				"flex size-4 shrink-0 items-center justify-center rounded-snapp-minimal",
				completed
					? "bg-snapp-surface-green px-px"
					: "border border-snapp-border-primary px-0.5 py-px"
			)}
		>
			{completed && (
				<img
					src={employee ? employeeCheckmark : checkmark}
					alt=""
					width={12}
					height={12}
				/>
			)}
		</span>
	);
	return (
		<div
			data-slot="snapp-course"
			data-state={completed ? "complete" : "incomplete"}
			className={cn(
				"flex h-8 w-114 flex-col items-start justify-center gap-2 py-0.5 font-snapp-body text-snapp-sm leading-snapp-xs font-normal",
				className
			)}
			{...props}
		>
			<div
				className={cn(
					"flex h-7 w-full items-center gap-2 p-2",
					employee && "h-auto w-snapp-task-progress py-0"
				)}
			>
				{dragHandleProps ? (
					<button
						type="button"
						aria-label={`Reorder ${title}`}
						{...dragHandleProps}
						className={cn(
							"shrink-0 touch-none rounded-sm focus-visible:outline-2 focus-visible:outline-snapp-border-highlight",
							dragHandleProps.className
						)}
					>
						{handle}
					</button>
				) : (
					handle
				)}
				{onCompletedChange ? (
					// biome-ignore lint/a11y/useSemanticElements: The supplied Figma checkbox uses button keyboard activation, its exact glyph, and the checkbox role with aria-checked.
					<button
						type="button"
						role="checkbox"
						aria-label={`Complete ${title}`}
						aria-checked={completed}
						onClick={() => onCompletedChange(!completed)}
						className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-border-highlight"
					>
						{checkbox}
					</button>
				) : (
					checkbox
				)}
				<p className="flex min-w-0 flex-1 items-center gap-1 whitespace-nowrap">
					<span className="shrink-0 text-snapp-text-brand">
						{title}
					</span>
					{code && (
						<span className="shrink-0 text-snapp-text-secondary">
							{code}
						</span>
					)}
				</p>
				<span
					className={cn(
						"shrink-0 whitespace-nowrap",
						completed
							? "text-snapp-text-green"
							: "text-snapp-text-secondary"
					)}
				>
					{statusLabel ?? (completed ? "Completed" : "Issued")}
				</span>
				<div className="flex h-4 shrink-0 items-center justify-end gap-2">
					<span className="w-21 text-right whitespace-nowrap text-snapp-text-secondary">
						{date}
					</span>
					{onMoreClick ? (
						<button
							type="button"
							onClick={onMoreClick}
							aria-label={`Actions for ${title}`}
							className="rounded-sm focus-visible:outline-2 focus-visible:outline-snapp-border-highlight"
						>
							{moreIcon}
						</button>
					) : (
						moreIcon
					)}
				</div>
			</div>
		</div>
	);
}

export { Course };
export type { CourseProps };
