import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { PreloaderContext } from "./PreloaderContext";
import { loadImage } from "./util";

export interface PreloaderProps {
	images: Record<string, string>;
	children?: ReactNode | ReactNode[];
}

export const Preloader: FC<PreloaderProps> = ({ images, children }) => {
	const [loading, setLoading] = useState(true);

	const imagesRef = useRef(images);

	const [bankImages, setBankImages] = useState<
		Record<string, HTMLImageElement>
	>({});

	useEffect(() => {
		const names = Object.keys(imagesRef.current);

		if (names.length) {
			setLoading(true);
		}

		(async () => {
			const bank = await Promise.all(
				names.map(async (name) => {
					const image = await loadImage(imagesRef.current[name]);
					return [name, image];
				})
			);

			setBankImages(Object.fromEntries(bank));
			setLoading(false);
		})();
	}, [images]);

	if (loading) {
		return <h1>Loading . . .</h1>;
	}

	return (
		<PreloaderContext.Provider value={{ images: bankImages }}>
			{children}
		</PreloaderContext.Provider>
	);
};
