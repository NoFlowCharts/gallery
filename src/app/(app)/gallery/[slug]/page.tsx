import Footer from "@/components/Footer";
import Button from "@/components/Button";

const images = [
    "/gallery/img1.jpg",
    "/gallery/img2.jpg",
    "/gallery/img3.jpg",
    "/gallery/img4.jpg",
    "/gallery/img5.jpg",
    "/gallery/img6.jpg",
    "/gallery/img7.jpg",
    "/gallery/img8.jpg",
];

const GalleryPage = () => {
    return (
        <>
            <div className="w-full h-screen px-5 pb-10 flex items-end">
                <div className="w-full max-w-[990px]">
                    <div className="flex flex-col gap-4 w-full">
                        <h1>
                            Campfire Bratislava
                        </h1>
                        <Button text="View gallery" />
                    </div>
                    <div className="w-full max-w-[990px] gap-5">
                        <span>
                            Johny Wolf
                        </span>
                    </div>
                </div>
            </div>
            <div
                className="
                    w-full px-5 pb-20
                    columns-1
                    sm:columns-2
                    md:columns-3
                    lg:columns-4
                    gap-4
                "
            >
                {images.map((src, index) => (
                    <div
                        key={index}
                        className="mb-4 break-inside-avoid overflow-hidden rounded-md"
                    >
                        <img
                            src={src}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
            <Footer />
        </>
    )
}
export default GalleryPage;