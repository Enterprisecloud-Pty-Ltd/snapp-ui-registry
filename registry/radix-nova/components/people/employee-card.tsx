import type { ComponentProps, ReactNode } from "react";
import up from "@/assets/snapp/work/d6a3e.svg";
import down from "@/assets/snapp/work/0879c.svg";
import sectionUp from "@/assets/snapp/work/53a5b.svg";
import sectionDown from "@/assets/snapp/work/17bc7.svg";
import { cn } from "@/lib/utils";

interface EmployeeCardProps extends ComponentProps<"section"> {
	name: string;
	initials: string;
	roleName: string;
	completed: number;
	total: number;
	/** Optional independently measured percentage; defaults to completed / total. */
	progressPercentage?: number;
	optionalCompleted?: number;
	optionalTotal?: number;
	state?: "closed" | "expanded" | "minimal";
	onStateChange?: (state: "closed" | "expanded" | "minimal") => void;
	certifications?: ReactNode;
	optionalCertifications?: ReactNode;
	certificationsLabel?: string;
	optionalLabel?: string;
}

/** Presentation only: consumers supply Course rows and own completion and expansion state. */
function EmployeeCard({
	name,
	initials,
	roleName,
	completed,
	total,
	progressPercentage,
	optionalCompleted = 0,
	optionalTotal = 0,
	state = "closed",
	onStateChange,
	certifications,
	optionalCertifications,
	certificationsLabel = "Certifications",
	optionalLabel = "Optional Certification",
	className,
	...props
}: EmployeeCardProps) {
	const derivedProgress = total > 0 ? (completed / total) * 100 : 0;
	const requestedProgress = progressPercentage ?? derivedProgress;
	const progress = Number.isFinite(requestedProgress)
		? Math.min(100, Math.max(0, requestedProgress))
		: 0;
	return (
		<section
			data-slot="snapp-employee-card"
			data-state={state}
			className={cn(
				"flex w-[312.5px] flex-col items-start gap-4 rounded-lg inset-ring-1 inset-ring-[#e5e7eb] bg-white p-4.25 font-snapp-body font-normal shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]",
				className,
			)}
			{...props}
		>
			<div className="flex w-[270.5px] max-w-full items-start gap-3">
				<span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e94435] font-[Inter,sans-serif] text-base leading-6 text-white">
					{initials}
				</span>
				<div className="min-w-0 flex-1">
					<h3 className="text-snapp-lg leading-snapp-sm font-bold text-[#0a0a0a]">
						{name}
					</h3>
					<p className="text-snapp-sm leading-snapp-xs text-[#4a5565]">
						{roleName}
					</p>
				</div>
				<button
					type="button"
					aria-label={`${state === "minimal" ? "Expand" : "Collapse"} ${name}`}
					aria-expanded={state !== "minimal"}
					disabled={!onStateChange}
					onClick={() =>
						onStateChange?.(state === "minimal" ? "closed" : "minimal")
					}
					className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-snapp-border-highlight"
				>
					<img
						src={state === "minimal" ? down : up}
						alt=""
						width={20}
						height={20}
					/>
				</button>
			</div>
			<div className="flex h-9 w-full flex-col gap-2">
				<p className="flex h-5 items-center justify-between text-snapp-sm leading-snapp-xs">
					<span className="text-[#364153]">Progress</span>
					<span className="text-[#0a0a0a]">
						{completed}/{total}
					</span>
				</p>
				<div
					role="progressbar"
					aria-label={`Certification progress for ${name}`}
					aria-valuenow={progress}
					aria-valuemin={0}
					aria-valuemax={100}
					className="h-2 w-full overflow-hidden rounded-full bg-[#e5e7eb]"
				>
					<div
						className="h-full bg-[#0073de]"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
			{state !== "minimal" && (
				<>
					<div className="flex w-[270.5px] max-w-full flex-col items-start gap-3">
						<p
							className={cn(
								"flex items-center gap-2 text-snapp-sm leading-snapp-xs text-[#364153]",
								state === "expanded" && "h-4",
							)}
						>
							{certificationsLabel}
							{state === "expanded" && (
								<img src={sectionUp} alt="" width={16} height={16} />
							)}
						</p>
						<div className="flex w-full flex-col items-start gap-2.5">
							{certifications}
						</div>
					</div>
					<div className="flex w-full flex-col items-start gap-4">
						<button
							type="button"
							aria-expanded={state === "expanded"}
							disabled={!onStateChange}
							onClick={() =>
								onStateChange?.(state === "expanded" ? "closed" : "expanded")
							}
							className={cn(
								"flex h-4 items-center gap-2 text-snapp-sm leading-snapp-xs text-[#364153] focus-visible:outline-2 focus-visible:outline-snapp-border-highlight",
								state === "closed" &&
									"ml-auto text-snapp-xs leading-snapp-xxs text-[#6a7282]",
							)}
						>
							{optionalLabel} {optionalCompleted}/{optionalTotal}
							<img
								src={state === "expanded" ? sectionUp : sectionDown}
								alt=""
								width={16}
								height={16}
							/>
						</button>
						{state === "expanded" && (
							<div className="flex w-full flex-col items-start gap-2.5">
								{optionalCertifications}
							</div>
						)}
					</div>
				</>
			)}
		</section>
	);
}

export { EmployeeCard };
export type { EmployeeCardProps };
