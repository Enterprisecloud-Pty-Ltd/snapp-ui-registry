import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CalendarDayProps extends ComponentProps<"div"> {
	day: ReactNode;
	totalTime?: string;
	version?: "dark" | "light";
}

/** Calendar cell; pass scheduled TaskListItem tiles as children. */
function CalendarDay({
	day,
	totalTime,
	version = "dark",
	children,
	className,
	...props
}: CalendarDayProps) {
	return (
		<div
			data-slot="snapp-calendar-day"
			data-version={version}
			className={cn(
				"flex min-h-[90.333px] w-[141.714px] flex-col items-start gap-1.5 px-3 pt-3.25 pb-3 font-snapp-body shadow-[inset_0_1px_0_rgba(42,44,46,0.15)]",
				version === "light" ? "bg-white" : "bg-[rgba(42,44,46,0.05)]",
				className,
			)}
			{...props}
		>
			<div className="flex w-full items-start gap-4 text-snapp-xxs leading-snapp-xxxs font-bold text-[rgba(42,44,46,0.5)]">
				<span>{day}</span>
				{totalTime !== undefined && (
					<span className="min-w-0 flex-1 text-right">{totalTime}</span>
				)}
			</div>
			{children}
		</div>
	);
}

export { CalendarDay };
export type { CalendarDayProps };
