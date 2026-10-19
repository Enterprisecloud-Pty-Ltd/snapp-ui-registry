import type { ComponentProps, ReactNode } from "react";
import focusIcon from "@/assets/snapp/work/4bb4a.svg";
import overdueIcon from "@/assets/snapp/work/a7955.svg";
import taskIcon from "@/assets/snapp/work/234ca.svg";
import bugIcon from "@/assets/snapp/work/18d12.svg";
import itemIcon from "@/assets/snapp/work/e7672.svg";
import delimiter from "@/assets/snapp/work/8b1d2.svg";
import { cn } from "@/lib/utils";

interface ProductivityPanelItem {
	id: string;
	name: string;
	type: "task" | "bug" | "item";
	onClick?: () => void;
}
interface ProductivityPanelProps extends ComponentProps<"aside"> {
	collapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	focusTime: string;
	overdueTime: string;
	focusItems: ProductivityPanelItem[];
	overdueItems: ProductivityPanelItem[];
	focusLabel?: string;
	overdueLabel?: string;
	footer?: ReactNode;
}

function ProductivityList({ items }: { items: ProductivityPanelItem[] }) {
	const icons = { task: taskIcon, bug: bugIcon, item: itemIcon };
	return (
		<ul className="w-full text-snapp-text-primary">
			{items.map((item) => (
				<li
					key={item.id}
					className="flex h-7 w-full items-center overflow-hidden rounded-snapp-rounded"
				>
					{item.onClick ? (
						<button
							type="button"
							onClick={item.onClick}
							className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1 text-left focus-visible:outline-2 focus-visible:outline-snapp-border-highlight"
						>
							<img
								src={icons[item.type]}
								alt=""
								width={20}
								height={20}
								className="shrink-0"
							/>
							<span className="shrink-0">{item.id}</span>
							<span className="truncate">{item.name}</span>
						</button>
					) : (
						<div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1">
							<img
								src={icons[item.type]}
								alt=""
								width={20}
								height={20}
								className="shrink-0"
							/>
							<span className="shrink-0">{item.id}</span>
							<span className="truncate">{item.name}</span>
						</div>
					)}
				</li>
			))}
		</ul>
	);
}

function ProductivityPanel({
	collapsed = false,
	onCollapsedChange,
	focusTime,
	overdueTime,
	focusItems,
	overdueItems,
	focusLabel = "Focus List",
	overdueLabel = "Overdue",
	footer,
	className,
	...props
}: ProductivityPanelProps) {
	const heading = (icon: string, label: string, time: string) => (
		<div className="flex w-full flex-col gap-2">
			<div className="flex h-8 items-center gap-2">
				<img src={icon} alt="" width={20} height={20} className="shrink-0" />
				<span className="min-w-0 flex-1">{label}</span>
				<span className="shrink-0">{time}</span>
			</div>
			<div className="relative h-0 w-full overflow-visible">
				<img
					src={delimiter}
					alt=""
					className="absolute -top-px left-0 max-w-none"
				/>
			</div>
		</div>
	);
	return (
		<aside
			data-slot="snapp-productivity-panel"
			data-state={collapsed ? "collapsed" : "open"}
			className={cn(
				"flex min-h-257.75 w-84.5 flex-col bg-snapp-surface-secondary font-snapp-body text-snapp-sm leading-snapp-xs font-normal text-snapp-text-brand",
				collapsed && "w-13",
				className,
			)}
			{...props}
		>
			<section
				className={cn(
					"flex flex-col items-start gap-4 px-4 py-3",
					!collapsed && "w-full shadow-[inset_0_-1px_0_var(--snapp-border-primary)]",
				)}
			>
				{collapsed ? (
					<button
						type="button"
						aria-label="Expand productivity panel"
						aria-expanded={false}
						disabled={!onCollapsedChange}
						onClick={() => onCollapsedChange?.(false)}
						className="flex h-8 w-5 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-snapp-border-highlight"
					>
						<img src={focusIcon} alt="" width={20} height={20} />
					</button>
				) : (
					<>
						{onCollapsedChange ? (
							<button
								type="button"
								aria-label="Collapse productivity panel"
								aria-expanded={true}
								onClick={() => onCollapsedChange(true)}
								className="w-full text-left focus-visible:outline-2 focus-visible:outline-snapp-border-highlight"
							>
								{heading(focusIcon, focusLabel, focusTime)}
							</button>
						) : (
							heading(focusIcon, focusLabel, focusTime)
						)}
						<ProductivityList items={focusItems} />
					</>
				)}
			</section>
			<section className="flex min-h-0 w-full flex-1 flex-col items-start gap-4 px-4 py-6">
				{!collapsed && (
					<>
						{heading(overdueIcon, overdueLabel, overdueTime)}
						<ProductivityList items={overdueItems} />
					</>
				)}
			</section>
			{footer}
		</aside>
	);
}

export { ProductivityPanel };
export type { ProductivityPanelProps, ProductivityPanelItem };
