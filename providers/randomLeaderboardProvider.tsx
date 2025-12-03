import React, { createContext, useEffect, useState } from "react";
import type { Leaderboard, randomShuffleLeaderboard } from '../types/leaderboard';
import { getCookie, setCookie } from '../util/cookieHelper';


type RandomLeaderboardContextType = {
  shufflingLeaderboards: (lbs: Leaderboard[]) => Promise<Leaderboard[]>;
  shuffleLeaderboards: randomShuffleLeaderboard[];
  updateLeaderboard: (leaderboard_id: number, started?: boolean, submitted_writing_number?: number) => Promise<void>;
  unfinishedLeaderboards: randomShuffleLeaderboard[];
  currentStartedIndex: number;
};

export const RandomLeaderboardContext = createContext({} as RandomLeaderboardContextType);

export const RandomLeaderboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
    const [ shuffleLeaderboards, setShuffleLeaderboards] = useState<randomShuffleLeaderboard[]>([]);
    const [ unfinishedLeaderboards, setUnfinishedLeaderboards ] = useState<randomShuffleLeaderboard[]>([]);
    const [ currentStartedIndex, setCurrentStartedIndex ] = useState<number>(-1);

    const shufflingLeaderboards =async (lbs: Leaderboard[]) => {
        // Build the shuffle list from cookie + any leaderboards not present in cookie.
        const savedOrderRaw = getCookie('avery.random_leaderboard') || '[]';
        const savedOrder = JSON.parse(savedOrderRaw) as randomShuffleLeaderboard[] || [];

        // Normalize saved entries (ensure defaults)
        const normalizedSaved = savedOrder.map(s => ({
          leaderboard_id: s.leaderboard_id,
          started: !!s.started,
          submitted_writing_number: typeof s.submitted_writing_number === 'number' ? s.submitted_writing_number : 0
        }));

        const savedIds = new Set(normalizedSaved.map(s => s.leaderboard_id));
        const newBoards = lbs.filter(lb => !savedIds.has(lb.id));

        // shuffle new boards
        for (let i = newBoards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newBoards[i], newBoards[j]] = [newBoards[j], newBoards[i]];
        }

        // Compose the full shuffle array: cookie order first, then newly shuffled ones
        const newShuffle: randomShuffleLeaderboard[] = [
          ...normalizedSaved,
          ...newBoards.map(lb => ({ leaderboard_id: lb.id, started: false, submitted_writing_number: 0 }))
        ];

        // Ensure there is exactly one "unfinished" (started && submitted_writing_number < 2)
        let unfinished = newShuffle.filter(lb => lb.started && lb.submitted_writing_number < 2);

        if (unfinished.length === 0) {
          // pick first not-started and mark started true
          const firstNotStarted = newShuffle.find(lb => !lb.started);
          if (firstNotStarted) {
            firstNotStarted.started = true;
          }
          unfinished = newShuffle.filter(lb => lb.started && lb.submitted_writing_number < 2);
        } 

        const unfinishedBoards = unfinished
          .map(ulb => lbs.find(lb => lb.id === ulb.leaderboard_id))
          .filter((lb): lb is Leaderboard => !!lb);

        const remaining = lbs.filter(lb => !unfinished.find(u => u.leaderboard_id === lb.id));

        const orderedLeaderboards: Leaderboard[] = [
        ...remaining[0] ? [remaining[0]] : [],
        ...unfinishedBoards,
        ...remaining.slice(1),
        ];

        // Persist and set state (replace with the constructed array)
        await setLeaderboards(newShuffle);
        await (
          async () => {
            setCurrentStartedIndex(orderedLeaderboards.findIndex(lb => lb.id === unfinished[0]?.leaderboard_id));
          }
        )();

        return orderedLeaderboards;
    };

    const updateSingleLeaderboard = async (leaderboard_id: number, started?: boolean, submitted_writing_number?: number) => {
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
        
        await setLeaderboards(updatedList);  
        return;
    };

    const updateLeaderboard = async (leaderboard_id: number, started?: boolean, submitted_writing_number?: number) => {
        await updateSingleLeaderboard(leaderboard_id, started, submitted_writing_number);
        // Ensure there is always one unfinished leaderboard
        if (unfinishedLeaderboards.length > 0 || shuffleLeaderboards.length === 0) return;
        const firstNotStarted = shuffleLeaderboards.find(lb => !lb.started);
        if (!firstNotStarted) return;
        await updateSingleLeaderboard(firstNotStarted.leaderboard_id, true, 0); // mark first not-started as started
        setCurrentStartedIndex(shuffleLeaderboards.findIndex(lb => lb.leaderboard_id === firstNotStarted.leaderboard_id));
    };

    useEffect(() => {
        if (shuffleLeaderboards.length === 0) return;
        setCookie('avery.random_leaderboard', JSON.stringify(shuffleLeaderboards), 30);
    }, [shuffleLeaderboards])

    const setLeaderboards = async (lbs: randomShuffleLeaderboard[]) => {
        setShuffleLeaderboards([...lbs]);
        setUnfinishedLeaderboards(lbs.filter(lb => lb.started && lb.submitted_writing_number < 2));
    };

  return (
    <RandomLeaderboardContext.Provider value={{ 
        shufflingLeaderboards, shuffleLeaderboards, updateLeaderboard, unfinishedLeaderboards, currentStartedIndex
    }}>
      {children}
    </RandomLeaderboardContext.Provider>
  );
};