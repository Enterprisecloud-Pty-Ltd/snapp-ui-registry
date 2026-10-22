"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { wrapHugText } from "@/components/ui/hug-text";
import {
	focusTabsOnEntry,
	handleTabsArrowNavigation,
	useTabsFocusTimer,
} from "@/components/ui/tabs.keyboard";

const TabsKeyboardContext = React.createContext<{
	loop: boolean;
	pending: ReturnType<typeof useTabsFocusTimer>;
	onShiftTab: () => void;
} | null>(null);

function Tabs({
	className,
	orientation = "horizontal",
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			orientation={orientation}
			data-slot="tabs"
			data-orientation={orientation}
			className={cn(
				"group/tabs flex gap-2 data-horizontal:flex-col",
				className
			)}
			{...props}
		/>
	);
}

const tabsListVariants = cva(
	"group/tabs-list inline-flex w-fit items-center gap-1 rounded-full bg-snapp-surface-primary p-2 font-sans text-sm leading-5 font-normal text-snapp-text-brand group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
	{
		variants: {
			variant: {
				default: "bg-snapp-surface-primary",
				line: "h-12 gap-4 rounded-none border-b border-snapp-border-primary bg-snapp-surface-primary p-0",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

function TabsList({
	appearance = "default",
	className,
	variant = "default",
	loop = true,
	onMouseDown,
	onFocus,
	onBlur,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
	VariantProps<typeof tabsListVariants> & {
		appearance?: "default" | "header";
	}) {
	const clickFocus = React.useRef(false);
	const tabbingBackOut = React.useRef(false);
	const pending = useTabsFocusTimer();
	const keyboard = React.useMemo(
		() => ({
			loop,
			pending,
			onShiftTab: () => {
				tabbingBackOut.current = true;
			},
		}),
		[loop, pending]
	);
	return (
		<TabsKeyboardContext.Provider value={keyboard}>
			<TabsPrimitive.List
				loop={loop}
				data-slot="tabs-list"
				data-variant={variant}
				className={cn(
					tabsListVariants({ variant }),
					appearance === "header" && "border-0",
					className
				)}
				{...props}
				onMouseDown={(event) => {
					onMouseDown?.(event);
					if (!event.defaultPrevented) clickFocus.current = true;
				}}
				onFocus={(event) => {
					onFocus?.(event);
					if (event.defaultPrevented) return;
					const list = event.currentTarget;
					if (
						event.target === list &&
						!clickFocus.current &&
						!tabbingBackOut.current &&
						"host" in list.getRootNode()
					) {
						event.preventDefault();
						focusTabsOnEntry(list);
					}
					clickFocus.current = false;
				}}
				onBlur={(event) => {
					onBlur?.(event);
					if (!event.defaultPrevented) tabbingBackOut.current = false;
				}}
			/>
		</TabsKeyboardContext.Provider>
	);
}

function TabsTrigger({
	appearance = "default",
	className,
	children,
	onKeyDown,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
	appearance?: "default" | "header" | "header-emphasis";
}) {
	const keyboard = React.useContext(TabsKeyboardContext);
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"relative inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border-0 px-4 py-2 font-sans text-sm leading-5 font-normal whitespace-nowrap text-snapp-text-brand outline-none transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:bg-snapp-surface-secondary focus-visible:ring-2 focus-visible:ring-snapp-border-highlight focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
				"group-data-[variant=default]/tabs-list:data-[state=active]:bg-snapp-surface-brand group-data-[variant=default]/tabs-list:data-[state=active]:text-snapp-text-invert",
				"group-data-[variant=line]/tabs-list:h-full group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:py-0 group-data-[variant=line]/tabs-list:text-snapp-text-soft group-data-[variant=line]/tabs-list:hover:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:font-bold group-data-[variant=line]/tabs-list:data-[state=active]:text-snapp-text-brand",
				"after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-snapp-border-highlight after:opacity-0 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:right-0 group-data-vertical/tabs:after:left-auto group-data-vertical/tabs:after:h-auto group-data-vertical/tabs:after:w-0.5",
				appearance === "header" && "gap-2",
				appearance === "header-emphasis" &&
					"gap-2 group-data-[variant=line]/tabs-list:text-snapp-text-brand",
				className
			)}
			{...props}
			onKeyDown={(event) => {
				onKeyDown?.(event);
				if (!event.defaultPrevented && keyboard) {
					handleTabsArrowNavigation(
						event,
						keyboard.loop,
						keyboard.pending,
						keyboard.onShiftTab
					);
				}
			}}
		>
			{props.asChild ? children : wrapHugText(children)}
		</TabsPrimitive.Trigger>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("flex-1 text-sm outline-none", className)}
			{...props}
		/>
	);
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
