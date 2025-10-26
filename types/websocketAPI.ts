export type websocketParams = {
  ws_token: string;
  leaderboard_id: number;
}

export type RoundStart = {
    model: string;
    program: string;
    leaderboard_id: number;
    created_at: Date;
}

export type RoundUpdateName = {
    id: number;
    display_name?: string;
}

export type MessageSend = {
    content: string;
    created_at: Date;
    is_hint: boolean;
}

export type GenerationStart = {
    round_id: number;
    created_at: Date;
    generated_time: number;
    sentence: string;
}

export type websocketRequest = {
    action: 'start' | 'resume' | 'hint' | 'change_display_name' | 'submit' | 'evaluate' | 'end';
    program?: string;
    obj?: RoundStart | RoundUpdateName | MessageSend | GenerationStart;
}

export type ResponseLeaderboard = {
    id: number;
    image: string;
}

export type ResponseRound = {
    id: number;
    display_name?: string;
    generated_time: number;
    generations: number[];
}

export type MessageReceived = {
    id: number;
    sender: 'user' | 'assistant';
    content: string;
    created_at: Date;
    is_hint?: boolean;
}

export type Chat = {
    id: number;
    messages: MessageReceived[];
}
export type ResponseGeneration = {
    id: number;
    interpreted_image?: string;
    evaluation_msg?: string;
    generated_time?: number;
    sentence?: string;
    correct_sentence?: string;
    is_completed?: boolean;
    image_similarity?: number;
    duration?: number;
}

export type websocketResponse = {
    feedback?: string;
    leaderboard?: ResponseLeaderboard;
    round?: ResponseRound;
    chat?: Chat;
    generation?: ResponseGeneration;
}

export type wsTokenResponse = {
    ws_token: string;
}