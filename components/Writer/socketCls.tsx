import { WebSocketClient } from "../../util/websocketClient";
import type { RoundStart, MessageSend, GenerationStart, websocketRequest, websocketResponse } from "../../types/websocketAPI";
import type { MessageReceived } from "../../types/websocketAPI";
import { wsAPI } from "../../api/WritingWS";

type writingClsData = {
    feedback: string;
    leaderboard_id: number;
    leaderboard_image: string;
    round_id: number | null;
    past_generation_ids: number[];
    writing_generation_id: number | null;
    generation_time: number;
    chat_messages: MessageReceived[];
    correct_sentence: string;
    evaluation_msg: string;
    interpreted_image: string;
    duration: number;
}

export class socketCls {
    private client: WebSocketClient | null = null;
    private wsLink: string | null = null;
    private messageHandler?: (data: unknown) => void;
    private sendQueue: websocketRequest[] = [];

    currentAction: 'none' | 'start' | 'resume' | 'hint' | 'submit' | 'evaluate' | 'end' = 'none';

    writingData: writingClsData = {
        feedback: '',
        leaderboard_id: 0,
        leaderboard_image: '',
        round_id: null,
        past_generation_ids: [],
        writing_generation_id: null,
        generation_time: 0,
        chat_messages: [],
        correct_sentence: '',
        evaluation_msg: '',
        interpreted_image: '',
        duration: 0,
    }

    constructor(
        leaderboard_id: number,
    ){
        wsAPI.fetchWsToken().then( token  => {
            if (token?.ws_token) {
                const wsToken = token.ws_token;
                const wsLink = (import.meta as unknown as { env: { VITE_WS_URL: string } }).env.VITE_WS_URL + `/${leaderboard_id}?token=${wsToken}`;
                this.wsLink = wsLink;
                const client = new WebSocketClient({urls: [wsLink]});
                this.client = client;
                client.open();
                client.subscribe(wsLink, (data: unknown) => {
                    if (this.messageHandler) this.messageHandler(data);
                });
                
                this.flushQueue();
                
                window.addEventListener('beforeunload', this.handleBeforeUnload);
                const backTogalleryButton = document.getElementById('back-gallery-button-icon');
                if (backTogalleryButton) {
                    backTogalleryButton.addEventListener('click', this.close);
                }
                const navigationBar = document.getElementById('navigation-bar-list');
                if (navigationBar) {
                    navigationBar.addEventListener('click', this.close);
                }

                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.addEventListener('click', this.close);
                }
                
            }
        }).catch( err => {
            console.error('Failed to fetch ws token:', err);
        });
    }

    private flushQueue() {
        if (!this.client || !this.wsLink) return;
        while (this.sendQueue.length > 0) {
            const msg = this.sendQueue.shift();
            if (msg) {
                try {
                    this.client.send(this.wsLink, msg);
                } catch (err) {
                    console.error('Error sending queued message, re-queueing:', err);
                    this.sendQueue.unshift(msg); // put it back and stop to avoid tight loop
                    break;
                }
            }
        }
    }

    private send = (message: websocketRequest) => {
        if (this.client && this.wsLink) {
            try {
                this.client.send(this.wsLink, message);
                return;
            } catch (err) {
                console.error('WebSocketClient.send failed, queuing message:', err);
                this.sendQueue.push(message);
                return;
            }
        }
        // client not ready yet — queue for later
        this.sendQueue.push(message);
    }

    private receive = (callback: (data: websocketResponse) => void) => {
        // store handler and subscribe if client is available
        this.messageHandler = (data: unknown) => {
            const parsed = data as websocketResponse;
            callback(parsed);
        };
        if (this.client && this.wsLink && this.messageHandler) {
            this.client.subscribe(this.wsLink, this.messageHandler);
        }
    }

    private handleBeforeUnload = () => {
        if (this.client && this.wsLink) {
            this.client.close();
        }
    }

    send_user_action = (
        object?: RoundStart| MessageSend | GenerationStart
    ) => {
        let message: websocketRequest | null = null
        switch (this.currentAction) {
            case 'start':
                if (!object) {
                    throw new Error('RoundStart object is required to start a round.');
                }
                this.writingData.leaderboard_id = object && 'leaderboard_id' in object ? object.leaderboard_id : 0;
                if (this.writingData.leaderboard_id === 0) {
                    throw new Error('leaderboard_id is required to start a round.');
                }
                message = {
                    action: 'start',
                    program: sessionStorage.getItem('program') || 'none',
                    obj: object as RoundStart
                }
                break

            case 'resume':
                if (!object) {
                    throw new Error('RoundStart object is required to resume a round.');
                }
                this.writingData.leaderboard_id = object && 'leaderboard_id' in object ? object.leaderboard_id : 0;
                if (this.writingData.leaderboard_id === 0) {
                    throw new Error('leaderboard_id is required to start a round.');
                }
                message = {
                    action: 'resume',
                    program: sessionStorage.getItem('program') || 'none',
                    obj: object as RoundStart
                }
                break
                
            case 'hint':
                if (!object) {
                    throw new Error('MessageSend object is required to provide a hint.');
                }
                message = {
                    action: 'hint',
                    program: sessionStorage.getItem('program') || 'none',
                    obj: object as MessageSend
                }
                break
            case 'submit':
                if (!object) {
                    throw new Error('GenerationStart object is required to submit a writing.');
                }
                message = {
                    action: 'submit',
                    program: sessionStorage.getItem('program') || 'none',
                    obj: object as GenerationStart
                }
                break
            case 'evaluate':
                message = {
                    action: 'evaluate'
                }
                break
            case 'end':
                message = {
                    action: 'end'
                }
                break
            default:
                message = null
                break
        }

        if (message) {
            this.send(message)
        }
    }
    receive_response(): Promise<writingClsData> {
        return new Promise((resolve, reject) => {
            this.receive((data: websocketResponse) => {
                try {
                    // handle the received data

                    switch (this.currentAction) {
                        case 'start':
                            if (data.round && data.leaderboard && data.generation && data.chat) {
                                this.writingData.feedback = data.feedback ? data.feedback : '';
                                this.writingData.round_id = data.round.id;
                                this.writingData.leaderboard_id = data.leaderboard.id;
                                this.writingData.leaderboard_image = data.leaderboard.image;
                                this.writingData.past_generation_ids = data.round.generations ? data.round.generations : [];
                                this.writingData.writing_generation_id = data.generation.id;
                                this.writingData.generation_time = data.generation.generated_time ? data.generation.generated_time : 0;
                                this.writingData.chat_messages = data.chat.messages ? data.chat.messages : [];
                            }
                            break;
                        case 'resume':
                            if (data.round && data.leaderboard && data.generation && data.chat) {
                                this.writingData.feedback = data.feedback ? data.feedback : '';
                                this.writingData.round_id = data.round.id;
                                this.writingData.leaderboard_id = data.leaderboard.id;
                                this.writingData.leaderboard_image = data.leaderboard.image;
                                this.writingData.past_generation_ids = data.round.generations ? data.round.generations : [];
                                this.writingData.writing_generation_id = data.generation.id;
                                this.writingData.generation_time = data.generation.generated_time ? data.generation.generated_time : 0;
                                this.writingData.chat_messages = data.chat.messages ? data.chat.messages : [];
                                this.writingData.duration = data.generation.duration ? data.generation.duration : 0;
                            }
                            break;
                        case 'hint':
                            if (data.chat && data.chat.messages) {
                                this.writingData.chat_messages = data.chat.messages;
                            }
                            break;
                        case 'submit':
                            if (data.generation && data.chat && data.chat.messages) {
                                this.writingData.writing_generation_id = data.generation.id
                                this.writingData.chat_messages = data.chat.messages;
                                this.writingData.correct_sentence = data.generation.correct_sentence ? data.generation.correct_sentence : '';
                                this.writingData.duration = data.generation.duration ? data.generation.duration : 0;
                            }
                            break;
                        case 'evaluate':
                            if (data.round && data.round.generated_time && data.generation) {
                                this.writingData.past_generation_ids = this.writingData.writing_generation_id ? [...this.writingData.past_generation_ids, this.writingData.writing_generation_id] : this.writingData.past_generation_ids;
                                this.writingData.writing_generation_id = null; // reset writing_generation_id to allow new generation on next submit
                                this.writingData.generation_time = data.round.generated_time;
                                this.writingData.evaluation_msg = data.generation.evaluation_msg ? data.generation.evaluation_msg : '';
                                this.writingData.interpreted_image = data.generation.interpreted_image ? data.generation.interpreted_image : '';
                                this.writingData.duration = 0;
                            }
                            break;
                        case 'end':
                            // no specific data to handle for 'end' action as of now
                            break;
                        default:
                            break;
                    }

                    // resolve with the updated writingData so callers can await it
                    resolve(this.writingData);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    close = () => {
        if (this.client && this.wsLink && this.messageHandler) {
            this.client.unsubscribe(this.wsLink, this.messageHandler);
            window.removeEventListener('beforeunload', this.handleBeforeUnload);
        }
        if (this.client) {
            this.client.close();
        }
    }
    
}