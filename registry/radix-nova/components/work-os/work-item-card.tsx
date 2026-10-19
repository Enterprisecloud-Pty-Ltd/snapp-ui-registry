import type { ComponentProps } from "react";
import bug from "@/assets/snapp/work/33d87.svg";
import task from "@/assets/snapp/work/658d0.svg";
import itemIcon from "@/assets/snapp/work/f68ac.svg";
import { ProgressMeter } from "@/components/snapp/work-os/progress-meter";
import { TimeBadge } from "@/components/snapp/work-os/time-badge";
import type { WorkItem } from "@/components/snapp/work-os/work-item.types";
import { cn } from "@/lib/utils";

interface WorkItemCardProps extends ComponentProps<"div"> {
	item: WorkItem;
}

/** Backlog work card, distinct from a scheduling TaskListItem. */
function WorkItemCard({ item, className, ...props }: WorkItemCardProps) {
	const typeAsset = { bug, clipboard: task, book: itemIcon, none: undefined }[
		item.icon
	];
	return (
		<div
			className={cn(
				"flex w-[323.667px] max-w-full flex-col items-start justify-center gap-1 rounded-snapp-rounded inset-ring-1 inset-ring-snapp-border-primary bg-snapp-surface-primary p-2 font-snapp-body font-normal text-snapp-text-primary",
				className,
			)}
			data-slot="snapp-work-item-card"
			{...props}
		>
			<div className="flex w-full items-center gap-2">
				<div className="flex shrink-0 self-stretch items-start">
					{typeAsset ? (
						<img src={typeAsset} alt="" width={40} height={20} />
					) : (
						<span className="h-5 w-10" aria-hidden="true" />
					)}
				</div>
				<div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5 pt-0.5 text-snapp-xs leading-snapp-xxs">
					<p className="w-full text-snapp-text-brand">{item.action}</p>
					<p className="flex w-full items-center gap-1 whitespace-nowrap text-snapp-text-secondary">
						<span>{item.id}</span>
						<span>{item.name}</span>
					</p>
					{(item.assignments ?? (item.assignment ? [item.assignment] : [])).map(
						(assignment, index) => (
							<p
								key={`${index}:${assignment}`}
								className="whitespace-nowrap text-snapp-text-secondary"
							>
								{assignment}
							</p>
						),
					)}
				</div>
				<div className="flex shrink-0 self-stretch flex-col items-end">
					<TimeBadge time={item.time} tone={item.tone} />
				</div>
			</div>
			<ProgressMeter
				className="w-full pl-12"
				label={item.capacity}
				tone={item.tone}
				value={item.progress}
			/>
		</div>
	);
}

export { WorkItemCard };
export type { WorkItemCardProps };
export type {
	WorkItem,
	WorkItemIcon,
	WorkItemTone,
} from "@/components/snapp/work-os/work-item.types";
