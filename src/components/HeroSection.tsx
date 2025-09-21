import { ChevronDown } from 'lucide-react';
import { type FC, useEffect, useRef } from 'react';
import heroImage from '../assets/golden-gate.webp';
import { SpringTween } from '../utilities/SpringTween';

export const HeroSection: FC = () => {
    const fadeInTween = useRef(SpringTween.create(0));
    const heroImageRef = useRef<HTMLImageElement>(null);
    const primaryTextRef = useRef<HTMLHeadingElement>(null);
    const secondaryTextRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        fadeInTween.current.setup({ mass: 1, tension: 120, friction: 30 });
        fadeInTween.current.run(1);

        const onUpdate = fadeInTween.current.onUpdate((value) => {
            if (
                !heroImageRef.current ||
                !primaryTextRef.current ||
                !secondaryTextRef.current
            )
                return;
            primaryTextRef.current.style.opacity = value.toString();
            primaryTextRef.current.style.transform = `translateY(${(1 - value) * 20}px)`;
            secondaryTextRef.current.style.opacity = value.toString();
            secondaryTextRef.current.style.transform = `translateY(${(1 - value) * 10}px)`;
            heroImageRef.current.style.opacity = (value * 0.5).toString();
            heroImageRef.current.style.transform = `scale(${1.05 - value * 0.05})`;
        });

        return () => {
            fadeInTween.current.offUpdate(onUpdate);
        };
    }, []);

    return (
        <section className="h-90 md:min-h-[80vh] flex flex-col justify-center items-center relative overflow-hidden w-full">
            <img
                ref={heroImageRef}
                style={{ opacity: 0 }}
                className="absolute top-0 left-0 w-full h-full object-cover object-center"
                src={heroImage.src}
                aria-hidden="true"
                alt="Golden Gate Bridge in San Francisco, California"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-surface flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-6xl flex flex-col gap-2">
                    <h2
                        ref={secondaryTextRef}
                        className="text-lg md:text-2xl font-semibold text-on-surface-variant"
                    >
                        welcome to bay.works
                    </h2>
                    <h1
                        ref={primaryTextRef}
                        className="text-4xl md:text-6xl font-extrabold text-on-surface leading-tight"
                    >
                        a computer science club based in cupertino.
                    </h1>
                </div>
            </div>
            <div className="absolute bottom-4 md:bottom-8 animate-bounce">
                <ChevronDown className="w-6 h-6 text-on-surface-variant" />
            </div>
        </section>
    );
};
