import { type FC, type HTMLAttributes, useMemo } from 'react';

interface BluredBorderProps extends HTMLAttributes<HTMLDivElement> {
    steps: number;
    reverse?: boolean;
    blur?: number;
    className?: string;
}

export const BluredBorder: FC<BluredBorderProps> = ({
    steps,
    reverse = false,
    blur = 8,
    className = '',
    ...props
}) => {
    const gradientSteps = useMemo(() => {
        const stepSize = 100 / steps;
        const data: {
            id: number;
            blur: number;
            zIndex: number;
            mask: [number?, number?, number?, number?];
            reverse: boolean;
        }[] = [];
        for (let i = 0; i < steps; i++) {
            const blurSize = blur * 0.5 ** (steps - i - 1);
            data.push({
                id: i,
                blur: blurSize,
                zIndex: i,
                mask: [
                    i * stepSize,
                    (i + 1) * stepSize,
                    (i + 2) * stepSize > 100 ? undefined : (i + 2) * stepSize,
                    (i + 3) * stepSize > 100 ? undefined : (i + 3) * stepSize,
                ],
                reverse,
            });
        }
        return data;
    }, [steps, blur, reverse]);

    return (
        <div {...props} className={className}>
            <div className="absolute inset-0 overflow-hidden">
                {gradientSteps.map((step) => {
                    const maskImage = `linear-gradient(${reverse ? '' : 'to top, '}${(
                        [
                            ['transparent', step.mask[0]],
                            ['black', step.mask[1]],
                            ['black', step.mask[2]],
                            ['transparent', step.mask[3]],
                        ] as const
                    )
                        .filter((v) => v[1] !== undefined)
                        .map((v) => `${v[0]} ${v[1]}%`)
                        .join(', ')})`;
                    return (
                        <div
                            key={step.id}
                            style={{
                                zIndex: step.zIndex + 1,
                                maskImage,
                                WebkitMaskImage: maskImage,
                                backdropFilter: `blur(${step.blur}px)`,
                                WebkitBackdropFilter: `blur(${step.blur}px)`,
                            }}
                            className="absolute h-full w-full"
                        />
                    );
                })}
            </div>
        </div>
    );
};
