import type * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

function Accordion({
	appearance = "default",
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & {
	appearance?: "default" | "help-article";
}) {
	return (
		<AccordionPrimitive.Root
			data-slot="accordion"
			className={cn(
				"flex w-full flex-col",
				appearance === "help-article" &&
					"border-b border-snapp-card-border",
				className
			)}
			{...props}
		/>
	);
}

function AccordionItem({
	appearance = "default",
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Item> & {
	appearance?: "default" | "help-article";
}) {
	return (
		<AccordionPrimitive.Item
			data-slot="accordion-item"
			className={cn(
				"not-last:border-b",
				appearance === "help-article" &&
					"border-t border-snapp-card-border not-last:border-b-0",
				className
			)}
			{...props}
		/>
	);
}

function AccordionTrigger({
	appearance = "default",
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
	appearance?: "default" | "help-article";
}) {
	return (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				data-slot="accordion-trigger"
				className={cn(
					"group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
					appearance === "help-article" &&
						"rounded-none border-0 bg-transparent px-4 py-4 text-base font-normal leading-5 text-snapp-text-brand hover:bg-transparent hover:no-underline",
					className
				)}
				{...props}
			>
				{children}
				<ChevronDownIcon
					data-slot="accordion-trigger-icon"
					className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
				/>
				<ChevronUpIcon
					data-slot="accordion-trigger-icon"
					className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
				/>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
}

function AccordionContent({
	appearance = "default",
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> & {
	appearance?: "default" | "help-article";
}) {
	return (
		<AccordionPrimitive.Content
			data-slot="accordion-content"
			className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
			{...props}
		>
			<div
				className={cn(
					"h-(--radix-accordion-content-height) pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
					appearance === "help-article" &&
						"px-4 pb-4 text-sm font-normal leading-4 text-snapp-text-primary",
					className
				)}
			>
				{children}
			</div>
		</AccordionPrimitive.Content>
	);
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
