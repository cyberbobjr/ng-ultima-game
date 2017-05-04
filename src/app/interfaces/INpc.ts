export interface ITalkTexts {
    answer1: string;
    answer2: string;
    heal: string;
    job: string;
    keyword1: string;
    keyword2: string;
    look: string;
    name: string;
    pronoun: string;
    yesanswer: string;
    noanswer: string;
    yesnoquestion: string;
}

export interface INpc {
    flag: number;
    humility: number;
    id: number;
    move: number;
    tile1: number;
    tlk_id: number;
    turningaway: number;
    x_pos1: number;
    y_pos1: number;
    talks: ITalkTexts;
}
