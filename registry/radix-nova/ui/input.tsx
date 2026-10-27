import type * as React from "react";
import { cn } from "@/lib/utils";

// Figma measures the 16px content inset from the outside of its inside stroke.
// Keep the native border and subtract its pixel from the CSS padding.
function Input({
	appearance = "default",
	className,
	type,
	variant = "default",
	readOnly,
	disabled,
	...props
}: React.ComponentProps<"input"> & {
	variant?: "default" | "form" | "inter";
} & {
	appearance?:
		| "default"
		| "navigation"
		| "navigation-tree"
		| "navigation-global"
		| "number-select";
}) {
	return (
		<input
			type={type}
			data-slot="input"
			data-variant={variant}
			readOnly={readOnly}
			disabled={disabled}
			className={cn(
				"h-10.25 w-full min-w-0 cursor-text rounded-lg border border-snapp-border-primary bg-snapp-surface-primary px-3.75 py-0 font-sans text-sm leading-5 font-normal text-snapp-text-primary outline-none placeholder:text-snapp-text-secondary focus-visible:border-snapp-border-brand disabled:cursor-not-allowed disabled:bg-snapp-control-disabled disabled:text-snapp-control-disabled-text disabled:placeholder:text-snapp-control-disabled-text aria-invalid:border-snapp-surface-red file:mr-2 file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-normal",
				variant === "inter" &&
					"h-9 rounded-md border-snapp-inter-border px-2.75 py-1 font-snapp-inter text-sm leading-5 text-snapp-inter-text shadow-snapp-inter-control placeholder:text-[#737373]",
				appearance === "navigation" &&
					"h-5 min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 font-sans text-sm leading-5 font-normal text-snapp-text-primary shadow-none placeholder:text-snapp-text-secondary focus-visible:ring-0",
				appearance === "navigation-tree" &&
					"h-5 min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 font-sans text-sm leading-5 font-normal text-snapp-text-primary shadow-none placeholder:text-snapp-text-soft focus-visible:ring-0",
				appearance === "navigation-global" &&
					"h-auto min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 font-snapp-ibm text-base leading-snapp-normal font-normal text-snapp-text-primary shadow-none placeholder:text-snapp-text-secondary focus-visible:ring-0",
				appearance === "number-select" &&
					"shrink-0 appearance-none text-center text-snapp-text-secondary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
				// Read-only values remain focusable and copyable, with legible text.
				readOnly &&
					!disabled &&
					"cursor-default bg-snapp-control-disabled caret-transparent select-text",
				className
			)}
			{...props}
		/>
	);
}

export { Input };
