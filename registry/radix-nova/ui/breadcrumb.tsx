import type * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

function Breadcrumb({
	appearance = "default",
	className,
	...props
}: React.ComponentProps<"nav"> & { appearance?: "default" | "feature" }) {
	return (
		<nav
			aria-label="breadcrumb"
			data-slot="breadcrumb"
			className={cn(
				appearance === "feature" &&
					"font-sans text-sm leading-5 font-normal",
				className
			)}
			{...props}
		/>
	);
}

function BreadcrumbList({
	appearance = "default",
	className,
	...props
}: React.ComponentProps<"ol"> & { appearance?: "default" | "feature" }) {
	return (
		<ol
			data-slot="breadcrumb-list"
			className={cn(
				"m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm wrap-break-word text-muted-foreground",
				appearance === "feature" &&
					"m-0 flex-nowrap gap-2 rounded-full bg-snapp-surface-secondary px-4 py-2 text-snapp-text-secondary",
				className
			)}
			{...props}
		/>
	);
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
	return (
		<li
			data-slot="breadcrumb-item"
			className={cn("inline-flex items-center gap-1", className)}
			{...props}
		/>
	);
}

function BreadcrumbLink({
	asChild,
	className,
	...props
}: React.ComponentProps<"a"> & {
	asChild?: boolean;
}) {
	const Comp = asChild ? Slot.Root : "a";

	return (
		<Comp
			data-slot="breadcrumb-link"
			className={cn("transition-colors hover:text-foreground", className)}
			{...props}
		/>
	);
}

function BreadcrumbPage({
	appearance = "default",
	className,
	...props
}: React.ComponentProps<"span"> & {
	appearance?: "default" | "feature" | "feature-current";
}) {
	return (
		<span
			data-slot="breadcrumb-page"
			aria-current="page"
			className={cn(
				"font-normal text-foreground",
				appearance === "feature" &&
					"max-w-64 truncate text-snapp-text-secondary",
				appearance === "feature-current" &&
					"max-w-64 truncate font-bold text-snapp-text-brand",
				className
			)}
			{...props}
		/>
	);
}

function BreadcrumbSeparator({
	appearance = "default",
	children,
	className,
	...props
}: React.ComponentProps<"li"> & {
	appearance?: "default" | "feature" | "feature-current";
}) {
	return (
		<li
			data-slot="breadcrumb-separator"
			role="presentation"
			aria-hidden="true"
			className={cn(
				"[&>svg]:size-3.5",
				appearance === "feature" && "font-normal",
				appearance === "feature-current" &&
					"font-normal text-snapp-text-brand",
				className
			)}
			{...props}
		>
			{children ?? <ChevronRightIcon />}
		</li>
	);
}

function BreadcrumbEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="breadcrumb-ellipsis"
			role="presentation"
			aria-hidden="true"
			className={cn(
				"flex size-5 items-center justify-center [&>svg]:size-4",
				className
			)}
			{...props}
		>
			<MoreHorizontalIcon />
			<span className="sr-only">More</span>
		</span>
	);
}

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};
