"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";
import {
	FeatureBreadcrumb,
	type FeatureBreadcrumbItem,
} from "@/components/snapp/navigation/feature-breadcrumb";
import {
	NavigationSearch,
	type NavigationSearchProps,
} from "@/components/snapp/navigation/navigation-panels";

interface ToolMenuProps extends React.ComponentProps<"div"> {
	items: FeatureBreadcrumbItem[];
	date?: React.ReactNode;
	searchProps?: NavigationSearchProps | false;
	filters?: React.ReactNode;
}

function ToolMenu({
	items,
	date,
	searchProps,
	filters,
	className,
	children,
	...props
}: ToolMenuProps) {
	return (
		<div
			className={cn(
				"flex min-h-13 w-full min-w-0 items-center gap-6 rounded-full bg-snapp-surface-primary p-2 font-sans text-sm leading-5 font-normal shadow-[0_4px_7.5px_#20232714]",
				className,
			)}
			data-slot="snapp-tool-menu"
			{...props}
		>
			<div className="min-w-0 flex-1 overflow-x-auto">
				<FeatureBreadcrumb items={items} />
			</div>
			{date != null ? (
				<span className="shrink-0 px-3 text-snapp-text-secondary">{date}</span>
			) : null}
			{searchProps === false ? null : (
				<NavigationSearch
					{...searchProps}
					className={cn("w-71 shrink-0", searchProps?.className)}
					rounded
				/>
			)}
			{filters}
			{children}
		</div>
	);
}

export { ToolMenu };
export type { ToolMenuProps };
