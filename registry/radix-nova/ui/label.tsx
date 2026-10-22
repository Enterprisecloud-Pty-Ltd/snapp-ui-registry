import type * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Label({
	appearance = "default",
	className,
	...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
	appearance?: "default" | "form-field" | "inter";
}) {
	return (
		<LabelPrimitive.Root
			data-slot="label"
			className={cn(
				"flex items-center gap-2 font-sans text-sm leading-5 font-normal text-snapp-text-brand select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
				appearance === "form-field" && "gap-0",
				appearance === "inter" &&
					"font-snapp-inter font-medium text-snapp-inter-text",
				className
			)}
			{...props}
		/>
	);
}

export { Label };
