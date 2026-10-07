import { useEffect, useState } from "react";

// Every image dropped into src/assets/slider/ becomes a slide, ordered by file
// name (slide1, slide2, ...).
const slideModules = import.meta.glob<string>(
    "../assets/slider/*.{png,jpg,jpeg,webp,avif}",
    { eager: true, import: "default" }
);
const slides = Object.keys(slideModules)
    .sort()
    .map((key) => slideModules[key]);

const SLIDE_DELAY_MS = 3000;

const LoginSlider = () => {
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (slides.length < 2) return;
        const timer = setInterval(
            () => setActive((i) => (i + 1) % slides.length),
            SLIDE_DELAY_MS
        );
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="login-slider">
            {slides.map((src, i) => (
                <img
                    key={src}
                    src={src}
                    alt="The Leela"
                    className={`slide-image${i === active ? " active" : ""}`}
                />
            ))}

            {slides.length > 1 && (
                <div className="slider-dots">
                    {slides.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            aria-label={`Show slide ${i + 1}`}
                            className={`slider-dot${i === active ? " active" : ""}`}
                            onClick={() => setActive(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LoginSlider;
