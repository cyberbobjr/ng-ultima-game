export interface IBehavior {
    name: string;

    tick(PerformanceNow: number): any;
}