"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { usePortalContainer } from "@/runtime/PortalContainer"

type DialogSize = "default" | "sm" | "form"
type DialogSectionSize = "default" | "form"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  const portalContainer = usePortalContainer()
  return <DialogPrimitive.Portal container={portalContainer ?? undefined} data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
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
  )
}

function DialogContent({
  className,
  children,
  overlayClassName,
  showCloseButton = true,
  size = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  overlayClassName?: string
  showCloseButton?: boolean
  size?: DialogSize
}) {
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-size={size}
        className={cn(
          "group/dialog-content fixed top-1/2 left-1/2 z-50 min-w-0 w-full max-w-snapp-dialog -translate-x-1/2 -translate-y-1/2 overflow-x-hidden rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:grid data-[size=default]:gap-4 data-[size=default]:p-4 data-[size=default]:sm:max-w-sm data-[size=sm]:grid data-[size=sm]:gap-4 data-[size=sm]:p-4 data-[size=sm]:sm:max-w-xs data-[size=form]:flex data-[size=form]:max-h-[calc(100vh-2rem)] data-[size=form]:flex-col data-[size=form]:gap-6 data-[size=form]:overflow-hidden data-[size=form]:rounded-lg data-[size=form]:p-6 data-[size=form]:sm:max-w-180 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2 group-data-[size=form]/dialog-content:top-6 group-data-[size=form]/dialog-content:right-6 group-data-[size=form]/dialog-content:size-6 group-data-[size=form]/dialog-content:rounded-sm group-data-[size=form]/dialog-content:p-0 group-data-[size=form]/dialog-content:text-snapp-text-brand group-data-[size=form]/dialog-content:hover:bg-snapp-surface-secondary"
              size="icon-sm"
            >
              <XIcon className="group-data-[size=form]/dialog-content:size-5.5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
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
        "flex flex-col gap-2 data-[size=form]:h-8 data-[size=form]:shrink-0 data-[size=form]:flex-row data-[size=form]:items-center data-[size=form]:justify-between data-[size=form]:gap-0",
        className
      )}
      {...props}
    />
  )
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
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  size?: DialogSectionSize
}) {
  return (
    <div
      data-slot="dialog-footer"
      data-size={size}
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end data-[size=form]:mx-0 data-[size=form]:mb-0 data-[size=form]:shrink-0 data-[size=form]:flex-row data-[size=form]:items-start data-[size=form]:justify-end data-[size=form]:gap-4 data-[size=form]:rounded-none data-[size=form]:border-0 data-[size=form]:bg-transparent data-[size=form]:p-0",
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
  )
}

function DialogTitle({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & {
  size?: DialogSectionSize
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      data-size={size}
      className={cn(
        "text-base leading-none font-medium data-[size=form]:text-[18px] data-[size=form]:leading-normal data-[size=form]:font-semibold data-[size=form]:text-snapp-text-brand data-[size=form]:select-none",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
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
}
