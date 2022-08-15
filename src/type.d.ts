export type keyPair = {
    list: number,
    keyList: keyItem[]
};

export type keyItem = {
    basicKey: string;
    basicKeyCode: number;
    secondKey: string;
    description: string;
    highlight: boolean;
    LeftOrRight?: string;
}
