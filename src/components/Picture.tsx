import { FC, useContext } from "react";
import { PreloaderContext } from "./PreloaderContext";
import { Figura } from "./Figura";
import { isImage } from "../lib/util";

export interface PictureProps {
	image: string | HTMLImageElement;

	x: number;
	y: number;
	width?: number;
	height?: number;

	sourceWidth?: number;
	sourceHeight?: number;
	sourceX?: number;
	sourceY?: number;
}

export const Picture: FC<PictureProps> = ({
	image,
	x,
	y,
	width,
	height,
	sourceHeight,
	sourceWidth,
	sourceX,
	sourceY,
}) => {
	const { images } = useContext(PreloaderContext);

	if (!(image instanceof HTMLImageElement)) {
		image = images[image];
	}

	if (!image || !isImage(image)) {
		return null;
	}

	const picture = image;

	return (
		<Figura
			render={(canvas, context) => {
				context.beginPath();
				context.drawImage(
					picture,
					sourceX ?? 0,
					sourceY ?? 0,
					sourceWidth ?? picture.width,
					sourceHeight ?? picture.height,
					x,
					y,
					width ?? picture.width,
					height ?? picture.height
				);
			}}
		/>
	);
};
