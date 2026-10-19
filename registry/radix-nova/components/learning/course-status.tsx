import type { ComponentProps, ReactNode } from "react";
import checkmark from "@/assets/snapp/work/3add4.svg";
import notice from "@/assets/snapp/work/32bdb.svg";
import warning from "@/assets/snapp/work/a6bf4.svg";
import { cn } from "@/lib/utils";

type CourseStatusState = "default" | "complete" | "notice" | "warning";
interface CourseStatusProps extends ComponentProps<"div"> {
	name: string;
	date: ReactNode;
	state?: CourseStatusState;
}
function CourseStatus({
	name,
	date,
	state = "default",
	className,
	...props
}: CourseStatusProps) {
	const icon = { default: undefined, complete: checkmark, notice, warning }[
		state
	];
	return (
		<div
			data-slot="snapp-course-status"
			data-state={state}
			className={cn(
				"flex w-[333.667px] max-w-full flex-col items-start gap-2 rounded-lg inset-ring-1 p-3 font-snapp-body text-snapp-sm leading-snapp-xs font-normal",
				state === "default" &&
					"inset-ring-snapp-border-primary bg-snapp-surface-primary text-snapp-text-secondary",
				state === "complete" &&
					"inset-ring-snapp-border-green bg-snapp-surface-green-soft text-snapp-text-green",
				state === "notice" &&
					"inset-ring-snapp-border-amber bg-snapp-surface-amber-soft text-snapp-text-amber",
				state === "warning" &&
					"inset-ring-snapp-border-red bg-snapp-surface-red-soft text-snapp-text-red",
				className,
			)}
			{...props}
		>
			<div className="flex w-full items-center gap-2">
				<span className="sr-only">{state}</span>
				{icon ? (
					<img src={icon} alt="" width={16} height={16} className="shrink-0" />
				) : (
					<span
						aria-hidden="true"
						className="size-4 shrink-0 rounded-3xl inset-ring-1 inset-ring-snapp-border-primary"
					/>
				)}
				<span className="min-w-0 flex-1">{name}</span>
				<span className="shrink-0 whitespace-nowrap">{date}</span>
			</div>
		</div>
	);
}

export { CourseStatus };
export type { CourseStatusProps, CourseStatusState };
