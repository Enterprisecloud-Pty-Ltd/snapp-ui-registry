import type * as React from "react";
import { Fragment } from "react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface FeatureBreadcrumbItem {
	id: string;
	label: React.ReactNode;
	onSelect?: () => void;
	current?: boolean;
}

interface FeatureBreadcrumbProps
	extends Omit<React.ComponentProps<typeof Breadcrumb>, "children"> {
	icon?: React.ReactNode;
	items: FeatureBreadcrumbItem[];
	collapseAncestors?: boolean;
}

function FeatureBreadcrumb({
	className,
	icon,
	items,
	collapseAncestors = true,
	...props
}: FeatureBreadcrumbProps) {
	if (items.length === 0) return null;
	return (
		<Breadcrumb
			appearance="feature"
			className={cn("w-fit", className)}
			data-slot="snapp-feature-breadcrumb"
			{...props}
		>
			<BreadcrumbList appearance="feature">
				{icon ? (
					<BreadcrumbItem aria-hidden="true">{icon}</BreadcrumbItem>
				) : null}
				{items.map((item, index) => {
					const current = item.current ?? index === items.length - 1;
					const collapsed =
						collapseAncestors && index < items.length - 3;
					const label = collapsed ? (
						<>
							<span aria-hidden="true">...</span>
							<span className="sr-only">{item.label}</span>
						</>
					) : (
						item.label
					);
					return (
						<Fragment key={item.id}>
							<BreadcrumbSeparator
								appearance={
									current ? "feature-current" : "feature"
								}
							>
								/
							</BreadcrumbSeparator>
							<BreadcrumbItem className="min-w-0">
								{item.onSelect ? (
									<button
										aria-current={
											current ? "page" : undefined
										}
										className={cn(
											"max-w-64 truncate rounded-sm bg-transparent text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-snapp-border-highlight",
											current &&
												"font-bold text-snapp-text-brand"
										)}
										onClick={item.onSelect}
										title={
											collapsed &&
											typeof item.label === "string"
												? item.label
												: undefined
										}
										type="button"
									>
										{label}
									</button>
								) : (
									<BreadcrumbPage
										aria-current={
											current ? "page" : undefined
										}
										appearance={
											current
												? "feature-current"
												: "feature"
										}
									>
										{label}
									</BreadcrumbPage>
								)}
							</BreadcrumbItem>
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

export { FeatureBreadcrumb };
export type { FeatureBreadcrumbItem, FeatureBreadcrumbProps };
