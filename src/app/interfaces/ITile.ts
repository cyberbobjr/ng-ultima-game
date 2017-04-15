export interface ITile {
    name: string;
    rule: string;
    id: number;
    frames?: string;
    currentFrame: number;
    image: HTMLImageElement;
}
