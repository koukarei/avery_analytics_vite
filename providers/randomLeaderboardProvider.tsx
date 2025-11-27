import React, { createContext, useCallback, useEffect, useState } from "react";
import type { Leaderboard, randomShuffleLeaderboard } from '../types/leaderboard';
import { getCookie, setCookie } from '../util/cookieHelper';


type RandomLeaderboardContextType = {
  shufflingLeaderboards: (lbs: Leaderboard[]) => Leaderboard[];
  shuffleLeaderboards: randomShuffleLeaderboard[];
  updateLeaderboard: (leaderboard_id: number, started?: boolean, submitted_writing_number?: number) => void;
  unfinishedLeaderboards: randomShuffleLeaderboard[];
};

export const RandomLeaderboardContext = createContext({} as RandomLeaderboardContextType);

export const RandomLeaderboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
    const [ leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
    const [ shuffleLeaderboards, setShuffleLeaderboards] = useState<randomShuffleLeaderboard[]>([]);
    const [ unfinishedLeaderboards, setUnfinishedLeaderboards ] = useState<randomShuffleLeaderboard[]>([]);

    const shufflingLeaderboards = (lbs: Leaderboard[]) => {
        
        let orderedLeaderboards: Leaderboard[] = [];
        const savedOrder = JSON.parse(getCookie('avery.random_leaderboard') || '[]') as randomShuffleLeaderboard[];
        if (savedOrder.length > 0) {
            savedOrder.filter(order => order.started == false || order.submitted_writing_number < 2 ).forEach(order => {
                const lb = lbs.find(lb => lb.id === order.leaderboard_id);
                if (lb) {
                    orderedLeaderboards.push(lb);
                }
            });
        }
        
        // leaderboard not in cookie
        const new_leaderboards = lbs.filter(lb => !orderedLeaderboards.find(olb => olb.id === lb.id));

        for (let i = new_leaderboards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [new_leaderboards[i], new_leaderboards[j]] = [new_leaderboards[j], new_leaderboards[i]];
        }
        
        orderedLeaderboards = [...orderedLeaderboards, ...new_leaderboards];
        

        const unfinished = shuffleLeaderboards.filter(lb => lb.started && lb.submitted_writing_number < 2);
        setUnfinishedLeaderboards(unfinished);
        
        // put unfinished leaderboards to the front
        orderedLeaderboards = [
            ...unfinished.map(ulb => leaderboards.find(lb => lb.id === ulb.leaderboard_id)).filter(lb => lb !== undefined), 
            ...orderedLeaderboards.filter(lb => !unfinished.find(ulb => ulb.leaderboard_id === lb.id))
        ];
        
        setShuffleLeaderboards([...savedOrder, ...new_leaderboards.map(lb => ({leaderboard_id: lb.id, started: false, submitted_writing_number: 0}))]);
        setLeaderboards([...orderedLeaderboards]);
        return orderedLeaderboards;
    };

    const updateLeaderboard = (leaderboard_id: number, started?: boolean, submitted_writing_number?: number) => {
        const updatedList = shuffleLeaderboards.map(lb => {
            if (lb.leaderboard_id === leaderboard_id) {
                return {
                    ...lb,
                    started: started ?? lb.started,
                    submitted_writing_number: submitted_writing_number ?? lb.submitted_writing_number,
                };
            }
            return lb;
        });
        setShuffleLeaderboards([...updatedList]);
        setUnfinishedLeaderboards(updatedList.filter(lb => lb.started && lb.submitted_writing_number < 2));
        console.log('Updated shuffle leaderboards:', updatedList);
    };

    useEffect(() => {
        setCookie('avery.random_leaderboard', JSON.stringify(shuffleLeaderboards), 30);
    }, [shuffleLeaderboards])



  return (
    <RandomLeaderboardContext.Provider value={{ 
        shufflingLeaderboards, shuffleLeaderboards, updateLeaderboard, unfinishedLeaderboards
    }}>
      {children}
    </RandomLeaderboardContext.Provider>
  );
};