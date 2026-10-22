import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { FormIcon } from "@/components/snapp/forms/figma-form-icons";
import { usePortalContainer } from "@/runtime/PortalContainer";

const Combobox = ComboboxPrimitive.Root;

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
	return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger({
	appearance = "default",
	className,
	children,
	...props
}: ComboboxPrimitive.Trigger.Props & { appearance?: "default" | "field" }) {
	return (
		<ComboboxPrimitive.Trigger
			aria-label="Toggle options"
			data-slot="combobox-trigger"
			className={cn(
				"[&_svg:not([class*='size-'])]:size-4",
				appearance === "field" &&
					"flex h-10.25 w-full cursor-pointer items-center justify-between gap-0 rounded-lg border border-snapp-border-primary bg-snapp-surface-primary px-3.75 font-sans text-sm leading-5 font-normal text-snapp-text-secondary outline-none focus-visible:border-snapp-border-brand data-popup-open:border-snapp-border-brand disabled:cursor-not-allowed disabled:bg-snapp-control-disabled disabled:text-snapp-control-disabled-text",
				className
			)}
			{...props}
		>
			{children ?? (
				<FormIcon
					name="chevronDownField"
					className="pointer-events-none"
				/>
			)}
		</ComboboxPrimitive.Trigger>
	);
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
	return (
		<ComboboxPrimitive.Clear
			data-slot="combobox-clear"
			render={<InputGroupButton variant="ghost" size="icon-xs" />}
			className={cn(className)}
			{...props}
		>
			<FormIcon name="dismiss12" className="pointer-events-none" />
		</ComboboxPrimitive.Clear>
	);
}

function ComboboxInput({
	className,
	children,
	disabled = false,
	showTrigger = true,
	showClear = false,
	trailingIcon,
	triggerClassName,
	muted = false,
	...props
}: ComboboxPrimitive.Input.Props & {
	showTrigger?: boolean;
	showClear?: boolean;
	trailingIcon?: React.ReactNode;
	triggerClassName?: string;
	muted?: boolean;
}) {
	return (
		<InputGroup
			className={cn(
				"h-10.25 w-full rounded-lg border-snapp-border-primary bg-snapp-surface-primary font-sans shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-snapp-border-brand has-[[data-slot=input-group-control]:focus-visible]:ring-0 **:data-[slot=input-group-control]:h-10.25 **:data-[slot=input-group-control]:px-3.75 **:data-[slot=input-group-control]:font-sans **:data-[slot=input-group-control]:text-sm **:data-[slot=input-group-control]:leading-5 **:data-[slot=input-group-control]:placeholder:text-snapp-text-secondary data-popup-open:border-snapp-border-brand",
				className
			)}
		>
			<ComboboxPrimitive.Input
				render={
					<InputGroupInput
						disabled={disabled}
						className={cn(muted && "text-snapp-text-secondary")}
					/>
				}
				{...props}
			/>
			<InputGroupAddon align="inline-end" className="pr-3.75">
				{showTrigger ? (
					<InputGroupButton
						size="icon-xs"
						variant="ghost"
						asChild
						data-slot="input-group-button"
						className={cn(
							"size-5 group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent",
							triggerClassName
						)}
						disabled={disabled}
					>
						<ComboboxTrigger>
							{trailingIcon ? (
								<span
									aria-hidden="true"
									data-slot="combobox-trailing-icon"
									className="pointer-events-none flex size-6 shrink-0 items-center justify-center text-snapp-icon-primary [&_svg:not([class*='size-'])]:size-4.5"
								>
									{trailingIcon}
								</span>
							) : null}
						</ComboboxTrigger>
					</InputGroupButton>
				) : trailingIcon ? (
					<span
						aria-hidden="true"
						data-slot="combobox-trailing-icon"
						className="pointer-events-none flex size-6 shrink-0 items-center justify-center text-snapp-icon-primary [&_svg:not([class*='size-'])]:size-4.5"
					>
						{trailingIcon}
					</span>
				) : null}
				{showClear && <ComboboxClear disabled={disabled} />}
			</InputGroupAddon>
			{children}
		</InputGroup>
	);
}

function ComboboxContent({
	appearance = "default",
	className,
	side = "bottom",
	sideOffset = 8,
	align = "start",
	alignOffset = 0,
	anchor,
	collisionAvoidance,
	collisionBoundary,
	collisionPadding,
	positionMethod,
	...props
}: ComboboxPrimitive.Popup.Props &
	Pick<
		ComboboxPrimitive.Positioner.Props,
		| "side"
		| "align"
		| "sideOffset"
		| "alignOffset"
		| "anchor"
		| "collisionAvoidance"
		| "collisionBoundary"
		| "collisionPadding"
		| "positionMethod"
	> & { appearance?: "default" | "popup-choice" }) {
	const portalContainer = usePortalContainer();
	const viewportBoundary = portalContainer?.ownerDocument.documentElement;

	return (
		<ComboboxPrimitive.Portal container={portalContainer ?? undefined}>
			<ComboboxPrimitive.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
				anchor={anchor}
				collisionAvoidance={collisionAvoidance}
				collisionBoundary={collisionBoundary ?? viewportBoundary}
				collisionPadding={collisionPadding}
				positionMethod={positionMethod ?? "fixed"}
				className="isolate z-50"
			>
				<ComboboxPrimitive.Popup
					data-slot="combobox-content"
					data-chips={!!anchor}
					className={cn(
						"group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-lg border border-snapp-border-primary! bg-popover! font-snapp-body text-sm text-popover-foreground! shadow-snapp-flyout! duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						appearance === "popup-choice" &&
							"flex flex-col gap-2 p-1.75",
						className
					)}
					{...props}
				/>
			</ComboboxPrimitive.Positioner>
		</ComboboxPrimitive.Portal>
	);
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
	return (
		<ComboboxPrimitive.List
			data-slot="combobox-list"
			className={cn(
				"no-scrollbar max-h-[min(calc(--spacing(72)-(--spacing(9))),calc(var(--available-height)-(--spacing(9))))] scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain flex flex-col gap-2 p-2! data-empty:p-0!",
				className
			)}
			{...props}
		/>
	);
}

function ComboboxItem({
	className,
	children,
	...props
}: ComboboxPrimitive.Item.Props) {
	return (
		<ComboboxPrimitive.Item
			data-slot="combobox-item"
			className={cn(
				"relative flex h-7! min-h-7! w-full cursor-pointer items-center gap-2 rounded py-1! pr-8! pl-2! font-sans text-sm leading-5 font-normal text-snapp-text-secondary outline-hidden select-none data-highlighted:bg-snapp-surface-secondary data-highlighted:text-snapp-text-secondary data-selected:bg-snapp-surface-secondary data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			{...props}
		>
			{children}
			<ComboboxPrimitive.ItemIndicator
				render={
					<span className="pointer-events-none absolute right-2 flex h-4 w-5 items-center justify-center" />
				}
			>
				<FormIcon name="selection20" className="pointer-events-none" />
			</ComboboxPrimitive.ItemIndicator>
		</ComboboxPrimitive.Item>
	);
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
	return (
		<ComboboxPrimitive.Group
			data-slot="combobox-group"
			className={cn(className)}
			{...props}
		/>
	);
}

function ComboboxLabel({
	className,
	...props
}: ComboboxPrimitive.GroupLabel.Props) {
	return (
		<ComboboxPrimitive.GroupLabel
			data-slot="combobox-label"
			className={cn(
				"px-2 py-1.5 text-xs text-muted-foreground",
				className
			)}
			{...props}
		/>
	);
}

/**
 * Renders the Combobox's internally filtered items. Use this component, or a
 * render-function child of ComboboxList, instead of mapping the root items
 * array directly.
 */
function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
	return (
		<ComboboxPrimitive.Collection
			data-slot="combobox-collection"
			{...props}
		/>
	);
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
	return (
		<ComboboxPrimitive.Empty
			data-slot="combobox-empty"
			className={cn(
				"hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex",
				className
			)}
			{...props}
		/>
	);
}

function ComboboxSeparator({
	className,
	...props
}: ComboboxPrimitive.Separator.Props) {
	return (
		<ComboboxPrimitive.Separator
			data-slot="combobox-separator"
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	);
}

function ComboboxChips({
	className,
	...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
	ComboboxPrimitive.Chips.Props) {
	return (
		<ComboboxPrimitive.Chips
			data-slot="combobox-chips"
			className={cn(
				"flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
				className
			)}
			{...props}
		/>
	);
}

function ComboboxChip({
	className,
	children,
	showRemove = true,
	...props
}: ComboboxPrimitive.Chip.Props & {
	showRemove?: boolean;
}) {
	return (
		<ComboboxPrimitive.Chip
			data-slot="combobox-chip"
			className={cn(
				"flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
				className
			)}
			{...props}
		>
			{children}
			{showRemove && (
				<ComboboxPrimitive.ChipRemove
					render={<Button variant="ghost" size="icon-xs" />}
					className="-ml-1 opacity-50 hover:opacity-100"
					data-slot="combobox-chip-remove"
				>
					<FormIcon
						name="dismiss12"
						className="pointer-events-none"
					/>
				</ComboboxPrimitive.ChipRemove>
			)}
		</ComboboxPrimitive.Chip>
	);
}

function ComboboxChipsInput({
	className,
	...props
}: ComboboxPrimitive.Input.Props) {
	return (
		<ComboboxPrimitive.Input
			data-slot="combobox-chip-input"
			className={cn("min-w-16 flex-1 outline-none", className)}
			{...props}
		/>
	);
}

function useComboboxAnchor() {
	return React.useRef<HTMLDivElement | null>(null);
}

export {
	Combobox,
	ComboboxInput,
	ComboboxContent,
	ComboboxList,
	ComboboxItem,
	ComboboxGroup,
	ComboboxLabel,
	ComboboxCollection,
	ComboboxEmpty,
	ComboboxSeparator,
	ComboboxChips,
	ComboboxChip,
	ComboboxChipsInput,
	ComboboxTrigger,
	ComboboxValue,
	useComboboxAnchor,
};
