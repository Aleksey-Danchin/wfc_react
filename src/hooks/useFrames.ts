import { useEffect, useState } from "react";
import {
	cutFrames,
	deserializeFrameDatas,
	imageToDataUrl,
	serializeFrameDatas,
} from "../lib/util";

export const useFrames = ({
	image,
	size,
	offset = size,
	rotate = false,
	isPersist = false,
	skip = false,
}: {
	image: HTMLImageElement;
	size: number;
	offset?: number;
	rotate?: boolean;
	isPersist?: boolean;
	skip?: boolean;
}) => {
	const [isCutted, setIsCatted] = useState(false);
	const [isCutting, setIsCatting] = useState(false);
	const [frameDatas, setFrameDatas] = useState<FrameData[]>([]);
	const [isError, setIsError] = useState(false);
	const [error, setError] = useState<null | any>(null);

	useEffect(() => {
		if (skip) {
			return;
		}

		(async () => {
			try {
				let imageDataUrl = "";
				let persisted = false;

				if (isPersist) {
					imageDataUrl = imageToDataUrl(image);
					const json = localStorage.getItem(imageDataUrl);

					if (json) {
						const dataFrames = deserializeFrameDatas(json);
						setFrameDatas(dataFrames);
						persisted = true;
					}
				}

				if (!persisted) {
					setIsCatting(true);

					const frameDatas = await cutFrames(
						image,
						size,
						offset,
						rotate
					);

					setFrameDatas(frameDatas);

					if (isPersist) {
						localStorage.setItem(
							imageDataUrl,
							serializeFrameDatas(frameDatas)
						);
					}
				}

				setIsCatted(true);
			} catch (error: any) {
				console.error(error);

				setError(error);
				setIsError(true);
			}

			setIsCatting(false);
		})();
	}, [image, isPersist, offset, rotate, size, skip]);

	return {
		image,
		size,
		offset,
		rotate,
		isPersist,
		isCutted,
		isCutting,
		frameDatas,
		isError,
		error,
	};
};
