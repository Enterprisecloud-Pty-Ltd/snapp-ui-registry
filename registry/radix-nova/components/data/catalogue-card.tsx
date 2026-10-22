import type { ComponentProps } from "react";
import folderBack from "@/assets/snapp/work/b6fd8.svg";
import folderPaper from "@/assets/snapp/work/0dca3.svg";
import folderIcon from "@/assets/snapp/work/31d84.svg";
import documentIcon from "@/assets/snapp/work/dcef3.svg";
import { cn } from "@/lib/utils";

interface CatalogueCardProps extends Omit<ComponentProps<"button">, "title"> {
	variant?: "folder" | "item";
	category?: string;
	title?: string;
	description: string;
}

/** Navigation card for a folder group or a single service. Data and navigation are caller supplied. */
function CatalogueCard({
	variant = "folder",
	category,
	title,
	description,
	className,
	...props
}: CatalogueCardProps) {
	const folder = variant === "folder";
	return (
		<button
			type="button"
			data-slot="snapp-catalogue-card"
			data-variant={variant}
			className={cn(
				"relative flex flex-col items-start gap-4 rounded-snapp-large text-left font-snapp-body font-normal drop-shadow-snapp-inbox focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snapp-border-highlight",
				folder
					? "h-41.5 w-60 justify-end overflow-hidden"
					: "w-105 max-w-full bg-snapp-surface-primary p-6",
				className
			)}
			{...props}
		>
			{folder && (
				<>
					<img
						src={folderBack}
						alt=""
						width={240}
						height={166}
						className="absolute top-0 left-0"
					/>
					<img
						src={folderPaper}
						alt=""
						width={208}
						height={139}
						className="absolute top-4.75 left-1/2 -translate-x-1/2"
					/>
				</>
			)}
			<span
				className={cn(
					"relative flex w-full flex-col items-start",
					folder
						? "h-35 rounded-snapp-large inset-ring-1 inset-ring-snapp-grey-150 bg-snapp-grey-0 p-6.25"
						: "gap-2"
				)}
			>
				<span
					className={cn(
						"flex w-full flex-col items-start",
						folder ? "min-h-0 flex-1" : "shrink-0"
					)}
				>
					<span className="flex w-full items-end gap-2">
						<img
							src={folder ? folderIcon : documentIcon}
							alt=""
							width={16}
							height={16}
							className="shrink-0"
						/>
						{category !== undefined && (
							<span className="text-snapp-xs leading-snapp-xxs font-semibold whitespace-nowrap text-snapp-text-blue">
								{category}
							</span>
						)}
					</span>
				</span>
				<span className="flex w-full shrink-0 flex-col items-start text-snapp-sm leading-snapp-xs text-snapp-text-brand">
					{!folder && title && (
						<span className="w-full font-bold">{title}</span>
					)}
					<span className="w-full">{description}</span>
				</span>
			</span>
		</button>
	);
}

export { CatalogueCard };
export type { CatalogueCardProps };
