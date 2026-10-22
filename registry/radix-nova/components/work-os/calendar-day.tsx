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
				"flex min-h-snapp-calendar-day-height w-snapp-calendar-day-width flex-col items-start gap-1.5 px-3 pt-3.25 pb-3 font-snapp-body shadow-snapp-top-divider",
				version === "light" ? "bg-white" : "bg-snapp-ink-subtle",
				className
			)}
			{...props}
		>
			<div className="flex w-full items-start gap-4 text-snapp-xxs leading-snapp-xxxs font-bold text-snapp-ink-muted">
				<span>{day}</span>
				{totalTime !== undefined && (
					<span className="min-w-0 flex-1 text-right">
						{totalTime}
					</span>
				)}
			</div>
			{children}
		</div>
	);
}

export { CalendarDay };
export type { CalendarDayProps };
