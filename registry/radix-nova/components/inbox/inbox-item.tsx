import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface InboxItemProps extends Omit<ComponentProps<"button">, "title"> {
	sender: string;
	initials: string;
	time: string;
	category: string;
	priority?: string;
	title: string;
	preview: string;
	selected?: boolean;
	readState?: "read" | "unread";
}

function InboxItem({
	sender,
	initials,
	time,
	category,
	priority,
	title,
	preview,
	selected = false,
	readState,
	className,
	...props
}: InboxItemProps) {
	return (
		<button
			type="button"
			data-slot="snapp-inbox-item"
			aria-pressed={selected}
			className={cn(
				"flex w-74.5 max-w-full flex-col items-start border-b border-snapp-border-primary px-4 py-3 text-left font-snapp-body font-normal focus-visible:outline-2 focus-visible:outline-snapp-border-highlight",
				selected && "border-snapp-border-brand bg-snapp-surface-secondary",
				className,
			)}
			{...props}
		>
			<span className="flex w-full items-start gap-2">
				<span className="flex size-6 shrink-0 items-center justify-center rounded-snapp-full bg-snapp-surface-accent text-snapp-xxs leading-snapp-xxxs text-snapp-grey-0">
					{initials}
				</span>
				<span className="flex min-w-0 flex-1 flex-col items-start">
					<span className="flex w-full items-center gap-2">
						<span className="h-4.5 min-w-0 flex-1 overflow-hidden text-snapp-xs leading-snapp-xxs font-bold whitespace-nowrap text-snapp-text-brand">
							{sender}
						</span>
						<span className="shrink-0 text-snapp-xxs leading-snapp-xxxs text-snapp-text-secondary">
							{time}
						</span>
						{readState && (
							<span
								aria-label={readState}
								className={cn(
									"size-1.5 shrink-0 rounded-snapp-full",
									readState === "unread"
										? "bg-snapp-surface-brand"
										: "bg-snapp-surface-disabled",
								)}
							/>
						)}
					</span>
					<span className="flex w-full items-center gap-1 text-snapp-xxs leading-snapp-xxxs">
						<span className="text-snapp-text-amber">{category}</span>
						{priority && <span className="text-[#f04438]">● {priority}</span>}
					</span>
					<span className="w-full truncate text-snapp-xs leading-snapp-xxs font-bold text-snapp-text-brand">
						{title}
					</span>
					<span className="h-3.25 w-full truncate text-snapp-xxs leading-snapp-xxxs text-snapp-text-secondary">
						{preview}
					</span>
				</span>
			</span>
		</button>
	);
}

export { InboxItem };
export type { InboxItemProps };
