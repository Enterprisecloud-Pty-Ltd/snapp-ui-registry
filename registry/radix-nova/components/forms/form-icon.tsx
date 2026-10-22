import type * as React from "react";
import { cn } from "@/lib/utils";
import { formIconSources, type FormIconName } from "./form-icon-sources";

function FormIcon({
	name,
	className,
	...props
}: Omit<React.ComponentProps<"img">, "src" | "alt"> & { name: FormIconName }) {
	return (
		<img
			alt=""
			aria-hidden="true"
			src={formIconSources[name]}
			className={cn("block max-w-none shrink-0", className)}
			{...props}
		/>
	);
}

export { FormIcon };
export type { FormIconName };
