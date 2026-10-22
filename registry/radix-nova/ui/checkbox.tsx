import type * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { FormIcon } from "@/components/snapp/forms/figma-form-icons";

function Checkbox({
	className,
	variant = "default",
	...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
	variant?: "default" | "filter" | "inter";
}) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			data-variant={variant}
			className={cn(
				"peer relative flex size-4 shrink-0 items-center justify-center rounded-xs border border-snapp-border-primary bg-transparent outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-snapp-border-highlight focus-visible:ring-2 focus-visible:ring-snapp-border-highlight/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-snapp-surface-red data-checked:border-snapp-surface-brand data-checked:bg-snapp-surface-brand data-checked:text-white data-indeterminate:border-snapp-surface-brand data-indeterminate:bg-snapp-surface-brand",
				variant === "filter" &&
					"data-checked:border-snapp-surface-green data-checked:bg-snapp-surface-green",
				variant === "inter" &&
					"rounded border-snapp-inter-border bg-white shadow-snapp-inter-control",
				className
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="grid place-content-center text-current transition-none"
			>
				<FormIcon name="checkboxCheck" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
