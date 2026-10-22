import { cn } from "@/lib/utils";

function Skeleton({
	appearance = "default",
	className,
	...props
}: React.ComponentProps<"div"> & {
	appearance?: "default" | "hero-search" | "icon" | "text";
}) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				"animate-pulse rounded-md bg-snapp-skeleton-soft motion-reduce:animate-none",
				appearance === "hero-search" && "rounded-full",
				appearance === "icon" && "bg-snapp-skeleton-icon",
				appearance === "text" && "bg-snapp-skeleton-line",
				className
			)}
			{...props}
		/>
	);
}

interface SkeletonGroupProps
	extends Omit<
		React.ComponentProps<"div">,
		"aria-busy" | "aria-label" | "role"
	> {
	"aria-label": string;
	"data-slot"?: string;
}

function SkeletonGroup({
	appearance = "default",
	"aria-label": ariaLabel,
	className,
	"data-slot": dataSlot = "skeleton-group",
	...props
}: SkeletonGroupProps & { appearance?: "default" | "landing" }) {
	return (
		<div
			{...props}
			aria-busy="true"
			aria-label={ariaLabel}
			className={cn(
				appearance === "landing" && "bg-snapp-surface-primary",
				className
			)}
			data-slot={dataSlot}
			role="status"
		/>
	);
}

export { Skeleton, SkeletonGroup };
export type { SkeletonGroupProps };
