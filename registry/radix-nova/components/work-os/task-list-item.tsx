import type { ComponentProps } from "react";

import bugIcon from "@/assets/snapp/work/69e44.svg";
import taskIcon from "@/assets/snapp/work/dda9c.svg";
import itemIcon from "@/assets/snapp/work/f382f.svg";
import clockIcon from "@/assets/snapp/work/558f7.svg";
import menuIcon from "@/assets/snapp/work/d602c.svg";
import mutedBugIcon from "@/assets/snapp/work/f51f0.svg";
import secondaryClockIcon from "@/assets/snapp/work/c4431.svg";
import secondaryMenuIcon from "@/assets/snapp/work/198bd.svg";
import draggedClockIcon from "@/assets/snapp/work/28ae1.svg";
import tinyClockIcon from "@/assets/snapp/work/66936.svg";
import { cn } from "@/lib/utils";

type TaskListItemState =
	| "high"
	| "mid"
	| "low"
	| "dragged"
	| "placing"
	| "minimal"
	| "list"
	| "tiny";

interface TaskListItemProps extends Omit<ComponentProps<"div">, "title"> {
	recordId: string;
	title: string;
	clientName?: string;
	time?: string;
	state?: TaskListItemState;
	icons?: ("bug" | "task" | "item")[];
	onTimeClick?: () => void;
	onMenuClick?: () => void;
}

/** Scheduling tile. The application owns selection, drag operations and record access. */
function TaskListItem({
	recordId,
	title,
	clientName,
	time,
	state = "high",
	icons = ["bug"],
	onTimeClick,
	onMenuClick,
	className,
	...props
}: TaskListItemProps) {
	const compact = state === "minimal" || state === "list";
	const full = ["high", "mid", "low", "dragged"].includes(state);
	const dragged = state === "dragged";
	const high = state === "high";
	const secondary = state === "mid" || state === "low";
	const tiny = state === "tiny";
	const glyphs = { bug: bugIcon, task: taskIcon, item: itemIcon };

	return (
		<div
			data-slot="snapp-task-list-item"
			data-state={state}
			className={cn(
				"relative flex w-75 max-w-full flex-col items-start justify-center inset-ring-1 font-snapp-body font-normal",
				high
					? "gap-2 rounded-snapp-rounded inset-ring-snapp-border-primary bg-snapp-surface-primary p-3"
					: "rounded-md inset-ring-[rgba(42,44,46,0.15)] bg-white p-3",
				full && !high && "gap-2",
				dragged && "inset-ring-[rgba(42,44,46,0.34)] bg-[rgba(42,44,46,0.05)]",
				state === "placing" &&
					"h-28.25 gap-2 border-2 border-dashed border-[rgba(42,44,46,0.34)] inset-ring-0 bg-[rgba(42,44,46,0.05)]",
				state === "list" && "px-3 py-1.5",
				tiny && "rounded-3xl py-0.5 pr-1 pl-2",
				className,
			)}
			{...props}
		>
			{state !== "placing" && (
				<div
					className={cn(
						"flex w-full",
						tiny ? "items-center gap-1" : "flex-col items-start",
						["high", "mid", "low"].includes(state) && "gap-0.5",
					)}
				>
					{!tiny && (
						<div className={cn("flex w-full items-center", compact && "gap-1")}>
							<p
								className={cn(
									"min-w-0 flex-1 text-snapp-sm leading-snapp-xs text-snapp-text-brand",
									compact && "flex-none font-bold text-snapp-text-primary",
									state === "list" && "text-snapp-xxs leading-snapp-xxxs",
									dragged && "text-[rgba(42,44,46,0.15)]",
								)}
							>
								{recordId}
							</p>
							{compact && (
								<p
									className={cn(
										"min-w-0 flex-1 text-snapp-sm leading-snapp-xs text-[rgba(42,44,46,0.8)]",
										state === "list" && "text-snapp-xs leading-snapp-xxs",
									)}
								>
									{clientName}
								</p>
							)}
							{high &&
								icons.map((icon) => (
									<img
										key={icon}
										src={glyphs[icon]}
										alt=""
										width={16}
										height={16}
										className="shrink-0"
									/>
								))}
							{secondary && (
								<img
									src={mutedBugIcon}
									alt=""
									width={16}
									height={16}
									className="shrink-0"
								/>
							)}
							{dragged && (
								<span
									aria-hidden="true"
									className="size-2.5 shrink-0 rounded-3xl bg-[rgba(42,44,46,0.15)]"
								/>
							)}
							{state === "minimal" && (
								<>
									<span className="ml-auto text-snapp-xs leading-snapp-xxs text-snapp-text-primary">
										{time}
									</span>
									<img
										src={tinyClockIcon}
										alt=""
										width={12}
										height={12}
										className="shrink-0"
									/>
								</>
							)}
						</div>
					)}
					<p
						className={cn(
							"w-full text-snapp-xs text-snapp-text-secondary",
							!dragged && "leading-snapp-xxs",
							tiny && "min-w-0 flex-1 text-snapp-text-primary",
							secondary || compact ? "text-[rgba(42,44,46,0.5)]" : "",
							dragged &&
								"text-snapp-xxs leading-[normal] text-[rgba(42,44,46,0.15)]",
						)}
					>
						{tiny ? `${recordId} ${title}` : title}
					</p>
					{full && (
						<p
							className={cn(
								"w-full text-snapp-xs text-snapp-text-primary",
								!dragged && "leading-snapp-xxs",
								dragged &&
									"text-snapp-xxs leading-[normal] text-[rgba(42,44,46,0.15)]",
							)}
						>
							{clientName}
						</p>
					)}
					{tiny && (
						<img
							src={tinyClockIcon}
							alt=""
							width={12}
							height={12}
							className="shrink-0"
						/>
					)}
				</div>
			)}
			{full && (
				<div
					className={cn(
						"flex w-full items-center gap-3 border-t pt-2 text-snapp-xs text-snapp-text-primary",
						!dragged && "leading-snapp-xxs",
						high ? "border-snapp-border-primary" : "border-[#f3f4f6]",
						dragged &&
							"border-[rgba(42,44,46,0.15)] text-snapp-xxs leading-[normal] text-[rgba(42,44,46,0.15)]",
					)}
				>
					<p className="min-w-0 flex-1">{time}</p>
					{onTimeClick ? (
						<button
							type="button"
							onClick={onTimeClick}
							aria-label={`Track time for ${recordId}`}
							className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-border-highlight"
						>
							<img
								src={
									dragged
										? draggedClockIcon
										: secondary
											? secondaryClockIcon
											: clockIcon
								}
								alt=""
								width={dragged ? 12 : 16}
								height={dragged ? 12 : 16}
							/>
						</button>
					) : (
						<img
							src={
								dragged
									? draggedClockIcon
									: secondary
										? secondaryClockIcon
										: clockIcon
							}
							alt=""
							width={dragged ? 12 : 16}
							height={dragged ? 12 : 16}
							className="shrink-0"
						/>
					)}
					{!dragged &&
						(onMenuClick ? (
							<button
								type="button"
								onClick={onMenuClick}
								aria-label={`Actions for ${recordId}`}
								className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-border-highlight"
							>
								<img
									src={secondary ? secondaryMenuIcon : menuIcon}
									alt=""
									width={16}
									height={16}
								/>
							</button>
						) : (
							<img
								src={secondary ? secondaryMenuIcon : menuIcon}
								alt=""
								width={16}
								height={16}
								className="shrink-0"
							/>
						))}
				</div>
			)}
		</div>
	);
}

export { TaskListItem };
export type { TaskListItemProps, TaskListItemState };
