import type { ComponentProps } from "react";
import trophy from "@/assets/snapp/work/489fc.svg";
import { cn } from "@/lib/utils";

interface AchievementsProps extends ComponentProps<"div"> {
	weekCount: number;
	monthCount: number;
	weekLabel?: string;
	monthLabel?: string;
	label?: string;
}

function Achievements({
	weekCount,
	monthCount,
	weekLabel = "This Week",
	monthLabel = "This Month",
	label = "Finished:",
	className,
	...props
}: AchievementsProps) {
	return (
		<div
			data-slot="snapp-achievements"
			className={cn(
				"flex h-12 w-84.5 items-center gap-4 bg-snapp-surface-primary pl-4 font-snapp-body text-snapp-sm leading-snapp-xs text-snapp-text-brand shadow-[inset_1px_0_0_var(--snapp-border-primary)]",
				className,
			)}
			{...props}
		>
			<img src={trophy} alt="" width={20} height={20} className="shrink-0" />
			<p className="flex shrink-0 items-center gap-1 whitespace-nowrap">
				<span>{label}</span>
				<span>{weekLabel}</span>
				<strong className="font-bold">{weekCount}</strong>
			</p>
			<p className="flex shrink-0 items-center gap-1 whitespace-nowrap">
				<span>{monthLabel}</span>
				<strong className="font-bold">{monthCount}</strong>
			</p>
		</div>
	);
}

export { Achievements };
export type { AchievementsProps };
