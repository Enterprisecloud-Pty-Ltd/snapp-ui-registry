"use client";

import type * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FormIcon } from "@/components/snapp/forms/figma-form-icons";
import { usePortalContainer } from "@/runtime/PortalContainer";

type DialogSize = "default" | "sm" | "md" | "lg" | "form";
type DialogSectionSize = "default" | "form";

function Dialog({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	const portalContainer = usePortalContainer();
	return (
		<DialogPrimitive.Portal
			container={portalContainer ?? undefined}
			data-slot="dialog-portal"
			{...props}
		/>
	);
}

function DialogClose({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-overlay"
			className={cn(
				"fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
				className
			)}
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	overlayClassName,
	showCloseButton = true,
	size = "default",
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	overlayClassName?: string;
	showCloseButton?: boolean;
	size?: DialogSize;
}) {
	return (
		<DialogPortal>
			<DialogOverlay className={overlayClassName} />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				data-size={size}
				className={cn(
					"group/dialog-content fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] min-w-0 max-w-180 -translate-x-1/2 -translate-y-1/2 flex-col gap-6 overflow-x-hidden overflow-y-auto rounded-lg bg-snapp-surface-primary p-6 font-sans text-sm leading-5 text-snapp-text-primary shadow-2xl outline-none data-[size=sm]:max-w-120 data-[size=md]:max-w-150 data-[size=form]:overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
					className
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close data-slot="dialog-close" asChild>
						<Button
							variant="ghost"
							className="absolute top-6 right-6 size-6 rounded p-0 text-snapp-text-brand hover:bg-snapp-surface-secondary"
							size="icon-sm"
						>
							<FormIcon name="dismiss24" />
							<span className="sr-only">Close</span>
						</Button>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({
	className,
	size = "default",
	...props
}: React.ComponentProps<"div"> & { size?: DialogSectionSize }) {
	return (
		<div
			data-slot="dialog-header"
			data-size={size}
			className={cn(
				"flex w-full shrink-0 flex-col gap-0.5 pr-6",
				className
			)}
			{...props}
		/>
	);
}

function DialogBody({
	className,
	size = "default",
	...props
}: React.ComponentProps<"div"> & { size?: DialogSectionSize }) {
	return (
		<div
			data-slot="dialog-body"
			data-size={size}
			className={cn(
				"min-w-0 data-[size=form]:flex data-[size=form]:min-h-0 data-[size=form]:flex-1 data-[size=form]:flex-col data-[size=form]:gap-6 data-[size=form]:overflow-x-hidden data-[size=form]:overflow-y-auto",
				className
			)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	showCloseButton = false,
	size = "default",
	children,
	...props
}: React.ComponentProps<"div"> & {
	showCloseButton?: boolean;
	size?: DialogSectionSize;
}) {
	return (
		<div
			data-slot="dialog-footer"
			data-size={size}
			className={cn(
				"flex w-full shrink-0 flex-wrap items-center justify-end gap-4",
				className
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close asChild>
					<Button variant="outline">Close</Button>
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

function DialogTitle({
	className,
	size = "default",
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & {
	size?: DialogSectionSize;
}) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			data-size={size}
			className={cn(
				"font-sans text-lg leading-6 font-bold text-snapp-text-brand",
				className
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn(
				"font-sans text-xs leading-4 font-normal text-snapp-text-secondary *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
				className
			)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
