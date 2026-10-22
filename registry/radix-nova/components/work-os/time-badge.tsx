import clock from "@/assets/snapp/work/6ce07.svg";
import type { WorkItemTone } from "@/components/snapp/work-os/work-item.types";
import { cn } from "@/lib/utils";

interface TimeBadgeProps {
	time: string;
	tone?: WorkItemTone;
	className?: string;
}

function TimeBadge({ time, tone = "green", className }: TimeBadgeProps) {
	return (
		<div
			className={cn(
				"flex w-21.5 items-center gap-1 rounded-snapp-rounded inset-ring-1 inset-ring-snapp-border-primary p-1 font-snapp-body text-snapp-xs leading-snapp-xxs font-normal text-snapp-text-secondary",
				tone === "red" && "text-snapp-text-red",
				className
			)}
			data-slot="snapp-time-badge"
		>
			<img
				src={clock}
				alt=""
				width={16}
				height={16}
				className="shrink-0"
			/>
			<span className="whitespace-nowrap">{time}</span>
		</div>
	);
}

export { TimeBadge };
export type { TimeBadgeProps };
