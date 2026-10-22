import type * as React from "react";
import { cn } from "@/lib/utils";
import {
	navigationAssets,
	type NavigationIconName,
} from "./navigation-icon-sources";

function NavigationIcon({
	name,
	className,
	...props
}: Omit<React.ComponentProps<"span">, "children"> & {
	name: NavigationIconName;
}) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"inline-flex shrink-0 items-center justify-center",
				className
			)}
			data-slot="snapp-navigation-icon"
			{...props}
		>
			<img
				alt=""
				className="block max-w-none shrink-0"
				draggable={false}
				src={navigationAssets[name]}
			/>
		</span>
	);
}

export { NavigationIcon };
export type { NavigationIconName };
