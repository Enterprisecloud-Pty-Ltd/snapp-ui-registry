import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugText, wrapHugText } from "@/components/ui/hug-text";
import { NavigationIcon } from "@/components/snapp/navigation/navigation-icons";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
	return (
		<nav
			role="navigation"
			aria-label="pagination"
			data-slot="pagination"
			className={cn(
				"flex w-fit font-sans text-sm leading-5 font-normal text-snapp-text-brand",
				className,
			)}
			{...props}
		/>
	);
}

function PaginationContent({
	className,
	...props
}: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot="pagination-content"
			className={cn("m-0 flex list-none items-center gap-1 p-0", className)}
			{...props}
		/>
	);
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
	return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
	React.ComponentProps<"a">;

function PaginationLink({
	className,
	isActive,
	children,
	size = "icon",
	...props
}: PaginationLinkProps) {
	return (
		<Button
			asChild
			variant={isActive ? "outline" : "ghost"}
			size={size}
			className={cn(
				"h-9 min-w-9 gap-1 rounded-lg border-0 bg-transparent p-2 font-sans text-sm leading-5 font-normal text-snapp-text-brand shadow-none hover:bg-snapp-surface-secondary data-[active=true]:bg-snapp-surface-primary data-[active=true]:ring-1 data-[active=true]:ring-snapp-border-brand data-[active=true]:ring-inset",
				className,
			)}
		>
			<a
				aria-current={isActive ? "page" : undefined}
				data-slot="pagination-link"
				data-active={isActive}
				{...props}
			>
				{wrapHugText(children)}
			</a>
		</Button>
	);
}

function PaginationPrevious({
	className,
	text = "Previous",
	...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
	return (
		<PaginationLink
			aria-label="Go to previous page"
			size="default"
			className={cn("px-3", className)}
			{...props}
		>
			<NavigationIcon name="paginationChevron" />
			{text ? <HugText>{text}</HugText> : null}
		</PaginationLink>
	);
}

function PaginationNext({
	className,
	text = "Next",
	...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
	return (
		<PaginationLink
			aria-label="Go to next page"
			size="default"
			className={cn("px-3", className)}
			{...props}
		>
			{text ? <HugText>{text}</HugText> : null}
			<NavigationIcon name="paginationChevron1" />
		</PaginationLink>
	);
}

function PaginationEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			aria-hidden
			data-slot="pagination-ellipsis"
			className={cn(
				"flex size-9 items-center justify-center rounded-lg p-2.5",
				className,
			)}
			{...props}
		>
			<NavigationIcon name="paginationMore" />
			<span className="sr-only">More pages</span>
		</span>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
