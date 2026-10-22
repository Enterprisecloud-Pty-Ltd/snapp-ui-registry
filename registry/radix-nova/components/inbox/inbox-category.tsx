import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface InboxCategoryProps extends ComponentProps<"button"> {
	label: string;
	count?: number;
	selected?: boolean;
}

function InboxCategory({
	label,
	count,
	selected = false,
	disabled,
	className,
	...props
}: InboxCategoryProps) {
	return (
		<div
			data-slot="snapp-inbox-category"
			className={cn(
				"flex h-6 w-74.5 max-w-full flex-col items-start gap-3 px-4 font-snapp-body font-normal",
				className
			)}
		>
			<button
				type="button"
				disabled={disabled}
				aria-current={selected ? "page" : undefined}
				className={cn(
					"flex w-full shrink-0 items-center rounded-snapp-rounded px-2 py-1 text-left text-snapp-sm leading-snapp-xs text-snapp-text-brand focus-visible:outline-2 focus-visible:outline-snapp-border-highlight",
					selected && "bg-snapp-surface-secondary",
					disabled && "text-snapp-text-disabled"
				)}
				{...props}
			>
				<span className="min-w-0 flex-1">{label}</span>
				{count !== undefined && (
					<span
						className={cn(
							"flex size-4 shrink-0 items-center justify-center rounded-snapp-category text-center text-snapp-xxs leading-snapp-xxxs",
							disabled
								? "bg-snapp-grey-200 text-snapp-text-disabled"
								: "bg-snapp-surface-brand text-snapp-text-invert"
						)}
					>
						{count}
					</span>
				)}
			</button>
		</div>
	);
}

export { InboxCategory };
export type { InboxCategoryProps };
