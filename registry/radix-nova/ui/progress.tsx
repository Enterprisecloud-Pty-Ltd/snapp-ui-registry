"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Progress({
	className,
	value,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			className={cn(
				"relative flex h-2 w-full items-center overflow-hidden rounded-full bg-snapp-surface-secondary",
				className,
			)}
			value={value}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot="progress-indicator"
				className="size-full flex-1 bg-snapp-surface-blue transition-transform motion-reduce:transition-none"
				style={{
					transform: `translateX(-${100 - Math.min(100, Math.max(0, value || 0))}%)`,
				}}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
