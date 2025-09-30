import type { Lerpable } from './SpringTween';

const convertSRgbToLinear = (c: number): number => {
    c /= 255;
    if (c <= 0.04045) return c / 12.92;
    return ((c + 0.055) / 1.055) ** 2.4;
};

const convertLinearToSRgb = (c: number): number => {
    if (c <= 0.0031308) return c * 12.92;
    return 1.055 * c ** (1 / 2.4) - 0.055;
};

const convertLinearRgbToXyz = (
    r: number,
    g: number,
    b: number,
): [number, number, number] => {
    const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
    const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
    const z = 0.0193339 * r + 0.119192 * g + 0.9503041 * b;
    return [x, y, z];
};

const convertXyzToLinearRgb = (
    x: number,
    y: number,
    z: number,
): [number, number, number] => {
    const r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
    const g = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
    const b = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
    return [r, g, b];
};

const convertXyzToOKLab = (
    x: number,
    y: number,
    z: number,
): [number, number, number] => {
    // XYZ to LMS transformation
    const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s = 0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z;

    // Apply cube root
    const l_ = Math.sign(l) * Math.abs(l) ** (1 / 3);
    const m_ = Math.sign(m) * Math.abs(m) ** (1 / 3);
    const s_ = Math.sign(s) * Math.abs(s) ** (1 / 3);

    // LMS to OKLab
    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

    return [L, a, b];
};

const convertOKLabToXyz = (
    l: number,
    a: number,
    b: number,
): [number, number, number] => {
    // OKLab to LMS
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    // Apply cube
    const l_cubed = l_ ** 3;
    const m_cubed = m_ ** 3;
    const s_cubed = s_ ** 3;

    // LMS to XYZ
    const x =
        1.2268798733 * l_cubed -
        0.5578149965 * m_cubed +
        0.2813910456 * s_cubed;
    const y =
        -0.0405801784 * l_cubed +
        1.1122568696 * m_cubed -
        0.0716766787 * s_cubed;
    const z =
        -0.0763812845 * l_cubed -
        0.4214819784 * m_cubed +
        1.5861632204 * s_cubed;

    return [x, y, z];
};

const convertRgbToOKLab = (
    r: number,
    g: number,
    b: number,
): [number, number, number] => {
    const linearR = convertSRgbToLinear(r);
    const linearG = convertSRgbToLinear(g);
    const linearB = convertSRgbToLinear(b);

    const [x, y, z] = convertLinearRgbToXyz(linearR, linearG, linearB);
    return convertXyzToOKLab(x, y, z);
};

const convertOKLabToRgb = (
    l: number,
    a: number,
    b: number,
): [number, number, number] => {
    const [x, y, z] = convertOKLabToXyz(l, a, b);
    const [linearR, linearG, linearB] = convertXyzToLinearRgb(x, y, z);

    const r = Math.max(
        0,
        Math.min(255, Math.round(convertLinearToSRgb(linearR) * 255)),
    );
    const g = Math.max(
        0,
        Math.min(255, Math.round(convertLinearToSRgb(linearG) * 255)),
    );
    const b_rgb = Math.max(
        0,
        Math.min(255, Math.round(convertLinearToSRgb(linearB) * 255)),
    );

    return [r, g, b_rgb];
};

const convertOKLabToOklch = (
    l: number,
    a: number,
    b: number,
): [number, number, number] => {
    const c = Math.sqrt(a * a + b * b);
    let h = Math.atan2(b, a) * (180 / Math.PI);

    if (h < 0) {
        h += 360;
    }

    return [l, c, h];
};

const convertOklchToOKLab = (
    l: number,
    c: number,
    h: number,
): [number, number, number] => {
    const hRad = h * (Math.PI / 180);
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);
    return [l, a, b];
};

export interface SerializedOklchColor {
    l: number;
    c: number;
    h: number;
}

export class OklchColor implements Lerpable<OklchColor> {
    public l: number; // lightness
    public c: number; // chroma
    public h: number; // hue

    private constructor(l: number, c: number, h: number) {
        this.l = l;
        this.c = c;
        this.h = h;
    }

    lerp(other: OklchColor, t: number): OklchColor & Lerpable<OklchColor> {
        // Handle hue interpolation properly (shortest path on color wheel)
        let h1 = this.h;
        let h2 = other.h;

        if (Math.abs(h2 - h1) > 180) {
            if (h2 > h1) {
                h1 += 360;
            } else {
                h2 += 360;
            }
        }

        const l = this.l + (other.l - this.l) * t;
        const c = this.c + (other.c - this.c) * t;
        let h = h1 + (h2 - h1) * t;

        // Normalize hue to 0-360 range
        h = h % 360;
        if (h < 0) h += 360;

        return new OklchColor(l, c, h);
    }

    subtract(other: OklchColor): OklchColor & Lerpable<OklchColor> {
        const l = this.l - other.l;
        const c = this.c - other.c;
        const h = this.h - other.h;
        return new OklchColor(l, c, h);
    }

    add(other: OklchColor): OklchColor & Lerpable<OklchColor> {
        const l = this.l + other.l;
        const c = this.c + other.c;
        const h = this.h + other.h;
        return new OklchColor(l, c, h);
    }

    scale(scalar: number): OklchColor & Lerpable<OklchColor> {
        const l = this.l * scalar;
        const c = this.c * scalar;
        const h = this.h * scalar;
        return new OklchColor(l, c, h);
    }

    magnitude(): number {
        return Math.sqrt(this.l * this.l + this.c * this.c + this.h * this.h);
    }

    zero(): OklchColor & Lerpable<OklchColor> {
        return new OklchColor(0, 0, 0);
    }

    public static new(l: number, c: number, h: number): OklchColor {
        return new OklchColor(l, c, h);
    }

    public static fromSerialized(obj: SerializedOklchColor): OklchColor {
        return new OklchColor(obj.l, obj.c, obj.h);
    }

    public static fromOKLab(l: number, a: number, b: number): OklchColor {
        const [L, c, h] = convertOKLabToOklch(l, a, b);
        return new OklchColor(L, c, h);
    }

    public static fromRGB(r: number, g: number, b: number): OklchColor {
        const [l, a, b_] = convertRgbToOKLab(r, g, b);
        return OklchColor.fromOKLab(l, a, b_);
    }

    public static fromInt(color: number): OklchColor {
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        return OklchColor.fromRGB(r, g, b);
    }

    public static fromHex(hex: string): OklchColor {
        const strippedHex = hex.startsWith('#') ? hex.slice(1) : hex;
        if (strippedHex.length !== 6) {
            throw new Error('Invalid hex color format. Expected 6 characters.');
        }
        const r = parseInt(strippedHex.slice(0, 2), 16);
        const g = parseInt(strippedHex.slice(2, 4), 16);
        const b = parseInt(strippedHex.slice(4, 6), 16);
        return OklchColor.fromRGB(r, g, b);
    }

    public toSerialized(): SerializedOklchColor {
        return {
            l: this.l,
            c: this.c,
            h: this.h,
        };
    }

    public toOKLab(): [number, number, number] {
        return convertOklchToOKLab(this.l, this.c, this.h);
    }

    public toRGB(): [number, number, number] {
        const [l, a, b] = this.toOKLab();
        return convertOKLabToRgb(l, a, b);
    }

    public toHex(): string {
        const [r, g, b] = this.toRGB();
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    public stringify(): string {
        return `oklch(${this.l.toFixed(3)} ${this.c.toFixed(3)} ${this.h.toFixed(1)})`;
    }
}
