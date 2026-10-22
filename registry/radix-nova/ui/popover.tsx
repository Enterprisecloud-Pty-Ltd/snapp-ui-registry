import type * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { usePortalContainer } from "@/runtime/PortalContainer";

function Popover({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
	appearance = "default",
	className,
	align = "center",
	sideOffset = 4,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
	appearance?:
		| "default"
		| "filter"
		| "calendar"
		| "header-navigation"
		| "header-action"
		| "header-chat"
		| "header-user";
}) {
	const portalContainer = usePortalContainer();
	return (
		<PopoverPrimitive.Portal container={portalContainer ?? undefined}>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				align={align}
				sideOffset={sideOffset}
				className={cn(
					"z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
					appearance === "filter" &&
						"w-91 gap-2 max-w-snapp-filter-max rounded-lg border border-snapp-border-primary bg-snapp-surface-primary px-2.75 py-1.75 font-sans text-sm leading-5 font-normal text-snapp-text-primary shadow-snapp-flyout ring-0",
					appearance === "calendar" &&
						"w-62.5 rounded-md border border-snapp-inter-border bg-white p-0 shadow-snapp-inter-popover ring-0",
					appearance === "header-navigation" &&
						"w-auto max-w-snapp-filter-max gap-0 rounded-lg border-0 bg-snapp-surface-primary p-6 text-snapp-text-brand shadow-snapp-landing-card ring-0",
					appearance === "header-action" &&
						"w-auto max-w-snapp-filter-max gap-0 rounded-lg border-0 bg-snapp-surface-primary p-2 text-snapp-text-brand shadow-snapp-landing-card ring-0",
					appearance === "header-chat" &&
						"w-92.5 max-w-snapp-filter-max gap-0 rounded-lg border-0 bg-snapp-surface-primary p-0 text-snapp-text-brand shadow-snapp-landing-card ring-0",
					appearance === "header-user" &&
						"w-auto max-w-snapp-filter-max gap-0 rounded-lg border-0 bg-snapp-surface-primary p-4 text-snapp-text-brand shadow-snapp-landing-card ring-0",
					className
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
}

function PopoverAnchor({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
	return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="popover-header"
			className={cn("flex flex-col gap-0.5 text-sm", className)}
			{...props}
		/>
	);
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
	return (
		<div
			data-slot="popover-title"
			className={cn("font-medium", className)}
			{...props}
		/>
	);
}

function PopoverDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="popover-description"
			className={cn("text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
};
