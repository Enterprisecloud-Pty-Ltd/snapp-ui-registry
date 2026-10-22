import type * as React from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
	return (
		<div
			data-slot="table-container"
			className="relative w-full overflow-x-auto"
		>
			<table
				data-slot="table"
				className={cn(
					"w-full border-collapse caption-bottom font-snapp-body text-snapp-sm leading-snapp-xs font-normal text-snapp-text-primary",
					className
				)}
				{...props}
			/>
		</div>
	);
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
	return (
		<thead
			data-slot="table-header"
			className={cn(
				"bg-snapp-surface-secondary text-snapp-text-brand",
				className
			)}
			{...props}
		/>
	);
}

function TableBody({
	appearance = "default",
	className,
	...props
}: React.ComponentProps<"tbody"> & { appearance?: "default" | "catalogue" }) {
	return (
		<tbody
			data-slot="table-body"
			className={cn(
				"bg-snapp-surface-primary",
				appearance === "catalogue" && "bg-transparent",
				className
			)}
			{...props}
		/>
	);
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
	return (
		<tfoot
			data-slot="table-footer"
			className={cn(
				"border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
				className
			)}
			{...props}
		/>
	);
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
	return (
		<tr
			data-slot="table-row"
			className={cn(
				"data-[state=selected]:bg-snapp-surface-secondary",
				className
			)}
			{...props}
		/>
	);
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				"p-2 text-left align-middle font-normal text-snapp-text-brand",
				className
			)}
			{...props}
		/>
	);
}

function TableCell({
	appearance = "default",
	className,
	...props
}: React.ComponentProps<"td"> & { appearance?: "default" | "catalogue" }) {
	return (
		<td
			data-slot="table-cell"
			className={cn(
				"p-2 align-middle",
				appearance === "catalogue" && "bg-transparent p-0",
				className
			)}
			{...props}
		/>
	);
}

function TableCaption({
	className,
	...props
}: React.ComponentProps<"caption">) {
	return (
		<caption
			data-slot="table-caption"
			className={cn("mt-4 text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
};
