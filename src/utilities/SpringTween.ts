const randomId = () => Math.floor(Math.random() * 1000000);

const INVISIBLE_THRESHOLD = 0.01;

export interface Lerpable<T> {
    lerp(other: T, t: number): T & Lerpable<T>;
    subtract(other: T): T & Lerpable<T>;
    add(other: T): T & Lerpable<T>;
    scale(scalar: number): T & Lerpable<T>;
    magnitude(): number;
    zero(): T & Lerpable<T>;
}

// Type guard to check if a value is lerpable
function isLerpable<T>(value: T | number): value is T & Lerpable<T> {
    return (
        typeof value === 'object' &&
        value !== null &&
        'lerp' in value &&
        'subtract' in value &&
        'add' in value &&
        'scale' in value &&
        'magnitude' in value &&
        'zero' in value
    );
}

export class SpringTween<T extends number | Lerpable<T>> {
    private static readonly MAX_STEP = 0.016;

    private mass: number = 1;
    private tension: number = 170;
    private friction: number = 26;
    private velocity: T;
    private initialValue: T;
    private targetValue: T;
    private currentValue: T;
    private cachedLerpable: boolean = false;
    private hasFinished: boolean = true;

    private animationFrameId: number | null = null;
    private lastTimestamp: number | null = null;

    private updateListeners: Map<number, (value: T) => void> = new Map();
    private finishListeners: Map<number, () => void> = new Map();
    private canRemoveListeners: Map<number, () => void> = new Map();

    private constructor(initialValue: T) {
        this.initialValue = initialValue;
        this.currentValue = initialValue;
        this.targetValue = initialValue;
        this.cachedLerpable = isLerpable(initialValue);

        // Initialize velocity based on type
        if (this.cachedLerpable) {
            this.velocity = (initialValue as T & Lerpable<T>).zero();
        } else {
            this.velocity = 0 as T;
        }
    }

    private isLerpable(_: T): _ is T & Lerpable<T> {
        return this.cachedLerpable;
    }

    public static create: {
        <T extends Lerpable<T>>(initialValue: T): SpringTween<T>;
        <T extends number>(initialValue: T): SpringTween<number>;
    } = <T extends number | Lerpable<T>>(initialValue: T): SpringTween<T> => {
        return new SpringTween<T>(initialValue);
    };

    private setAnimationFrame() {
        this.animationFrameId = requestAnimationFrame(this.update.bind(this));
    }

    private update = (timestamp: number): void => {
        if (this.lastTimestamp == null) {
            this.lastTimestamp = timestamp;
            this.setAnimationFrame();
            return;
        }

        let dt = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        if (dt > 0.25) dt = 0.25; // tab came back from background, etc.

        while (dt > 0) {
            const step = Math.min(dt, SpringTween.MAX_STEP);

            if (
                this.isLerpable(this.currentValue) &&
                this.isLerpable(this.targetValue) &&
                this.isLerpable(this.velocity)
            ) {
                // Lerpable physics calculation
                const disp = this.currentValue.subtract(this.targetValue);
                const accel = disp
                    .scale(-this.tension)
                    .subtract(this.velocity.scale(this.friction))
                    .scale(1 / this.mass);

                const velocity = this.velocity.add(accel.scale(step));
                this.velocity = velocity;
                this.currentValue = this.currentValue.add(velocity.scale(step));
            } else {
                // Number physics calculation
                const disp =
                    (this.currentValue as number) -
                    (this.targetValue as number);
                const accel =
                    (-this.tension * disp -
                        this.friction * (this.velocity as number)) /
                    this.mass;

                this.velocity = ((this.velocity as number) + accel * step) as T;
                this.currentValue = ((this.currentValue as number) +
                    (this.velocity as number) * step) as T;
            }

            dt -= step;
        }

        for (const cb of this.updateListeners.values()) cb(this.currentValue);

        // If it's close to finish
        if (this.isFinished()) {
            this.hasFinished = true;
            for (const cb of this.finishListeners.values()) cb();
        }

        const settled = this.isSettled();

        if (settled) {
            this.currentValue = this.targetValue; // snap exactly

            // Reset velocity to zero
            if (this.isLerpable(this.currentValue)) {
                this.velocity = this.currentValue.zero();
            } else {
                this.velocity = 0 as T;
            }

            this.finish(); // should cancel rAF and null lastTimestamp
        } else {
            this.setAnimationFrame();
        }
    };

    private isFinished(): boolean {
        if (this.hasFinished) return false;
        // Check the difference between currentValue and targetValue
        if (
            this.isLerpable(this.currentValue) &&
            this.isLerpable(this.targetValue)
        ) {
            const displacement = this.currentValue.subtract(this.targetValue);
            if (!this.isLerpable(displacement)) return false; // Impossible case
            return displacement.magnitude() < INVISIBLE_THRESHOLD;
        } else if (
            !this.isLerpable(this.currentValue) &&
            !this.isLerpable(this.targetValue)
        ) {
            return (
                Math.abs(
                    (this.currentValue as number) -
                        (this.targetValue as number),
                ) < INVISIBLE_THRESHOLD
            );
        }
        return false;
    }

    private isSettled(): boolean {
        if (
            this.isLerpable(this.currentValue) &&
            this.isLerpable(this.targetValue) &&
            this.isLerpable(this.velocity)
        ) {
            const displacement = this.currentValue.subtract(this.targetValue);
            if (!this.isLerpable(displacement)) return false; // Impossible case
            return (
                displacement.magnitude() < 1e-4 &&
                this.velocity.magnitude() < 1e-4
            );
        } else {
            return (
                Math.abs(
                    (this.currentValue as number) -
                        (this.targetValue as number),
                ) < 1e-4 && Math.abs(this.velocity as number) < 1e-4
            );
        }
    }

    private finish(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.lastTimestamp = null;

        for (const callback of this.canRemoveListeners.values()) {
            callback();
        }
    }

    private cancel() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.lastTimestamp = null;
    }

    public onUpdate(callback: (value: T) => void): number {
        const id = randomId();
        this.updateListeners.set(id, callback);
        return id;
    }

    public onFinish(callback: () => void): number {
        const id = randomId();
        this.finishListeners.set(id, callback);
        return id;
    }

    public onCanRemove(callback: () => void): number {
        const id = randomId();
        this.canRemoveListeners.set(id, callback);
        return id;
    }

    public offUpdate(id: number): this {
        this.updateListeners.delete(id);
        return this;
    }

    public offFinish(id: number): this {
        this.finishListeners.delete(id);
        return this;
    }

    public offCanRemove(id: number): this {
        this.canRemoveListeners.delete(id);
        return this;
    }

    public setup(options: {
        mass: number;
        tension: number;
        friction: number;
        velocity?: T;
        initialValue?: T;
    }): this {
        this.mass = options.mass;
        this.tension = options.tension;
        this.friction = options.friction;

        if (options.velocity !== undefined) {
            if (this.cachedLerpable !== isLerpable(options.velocity)) {
                throw new Error(
                    'Velocity type does not match the type of the SpringTween.',
                );
            }
            this.velocity = options.velocity;
        }

        if (options.initialValue !== undefined) {
            if (this.cachedLerpable !== isLerpable(options.initialValue)) {
                throw new Error(
                    'Initial value type does not match the type of the SpringTween.',
                );
            }
            this.currentValue = options.initialValue;
        }

        return this;
    }

    public run(target: T): this {
        if (this.cachedLerpable !== isLerpable(target)) {
            throw new Error(
                'Target value type does not match the type of the SpringTween.',
            );
        }
        this.hasFinished = false;
        this.targetValue = target;
        this.initialValue = this.currentValue;
        this.cancel();
        this.setAnimationFrame();
        return this;
    }

    public instant(target: T): this {
        if (this.cachedLerpable !== isLerpable(target)) {
            throw new Error(
                'Target value type does not match the type of the SpringTween.',
            );
        }
        this.targetValue = target;
        this.currentValue = target;
        this.hasFinished = true;

        // Reset velocity to zero
        if (this.isLerpable(this.currentValue)) {
            this.velocity = this.currentValue.zero();
        } else {
            this.velocity = 0 as T;
        }

        this.cancel();

        for (const cb of this.updateListeners.values()) cb(this.currentValue);
        for (const cb of this.finishListeners.values()) cb();
        for (const cb of this.canRemoveListeners.values()) cb();

        return this;
    }

    public getCurrentValue(): T {
        return this.currentValue;
    }

    public getInitialValue(): T {
        return this.initialValue;
    }

    public getTargetValue(): T {
        return this.targetValue;
    }
}
