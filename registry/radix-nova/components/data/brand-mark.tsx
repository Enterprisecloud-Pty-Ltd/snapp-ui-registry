import type { ComponentProps } from "react";
import ecLight from "@/assets/snapp/brand/2e5e5.svg";
import ecDark from "@/assets/snapp/brand/f4c1f.svg";
import snappLogo from "@/assets/snapp/brand/f9e47.svg";
import snappSymbol from "@/assets/snapp/brand/098c7.svg";

interface BrandMarkProps
	extends Omit<ComponentProps<"img">, "src" | "width" | "height"> {
	mark: "ec-light" | "ec-dark" | "snapp-logo" | "snapp-symbol";
}
const marks = {
	"ec-light": {
		src: ecLight,
		width: 400,
		height: 51.5846,
		alt: "Enterprisecloud",
	},
	"ec-dark": {
		src: ecDark,
		width: 400,
		height: 51.5846,
		alt: "Enterprisecloud",
	},
	"snapp-logo": { src: snappLogo, width: 196.66, height: 50.4, alt: "SNAPP" },
	"snapp-symbol": {
		src: snappSymbol,
		width: 47.9643,
		height: 50.4043,
		alt: "SNAPP",
	},
};

function BrandMark({ mark, alt, ...props }: BrandMarkProps) {
	const asset = marks[mark];
	return (
		<img
			data-slot="snapp-brand-mark"
			{...asset}
			alt={alt ?? asset.alt}
			{...props}
		/>
	);
}

export { BrandMark };
export type { BrandMarkProps };
