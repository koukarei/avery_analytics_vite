export interface ProgramBase {
    name: string;
    description: string;
    feedback: string;
}

export interface Program extends ProgramBase {
    id: number;
}

export interface ProgramListParam {
    skip?: number;
    limit?: number;
}