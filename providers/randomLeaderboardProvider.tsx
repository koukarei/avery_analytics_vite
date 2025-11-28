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
    const [ shuffleLeaderboards, setShuffleLeaderboards] = useState<randomShuffleLeaderboard[]>([]);
    const [ unfinishedLeaderboards, setUnfinishedLeaderboards ] = useState<randomShuffleLeaderboard[]>([]);

    const shufflingLeaderboards = useCallback((lbs: Leaderboard[]) => {
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
        setShuffleLeaderboards(newShuffle);
        setUnfinishedLeaderboards(newShuffle.filter(lb => lb.started && lb.submitted_writing_number < 2));

        return orderedLeaderboards;
    }, []);

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
    };

    useEffect(() => {
        if (shuffleLeaderboards.length === 0) return;
        setCookie('avery.random_leaderboard', JSON.stringify(shuffleLeaderboards), 30);
    }, [shuffleLeaderboards])

    useEffect(() => {
        if (unfinishedLeaderboards.length > 0 || shuffleLeaderboards.length === 0) return;
        const firstNotStarted = shuffleLeaderboards.find(lb => !lb.started);
        if (!firstNotStarted) return;
        updateLeaderboard(firstNotStarted.leaderboard_id, true, 0); // mark first not-started as started
        
    }, [unfinishedLeaderboards])



  return (
    <RandomLeaderboardContext.Provider value={{ 
        shufflingLeaderboards, shuffleLeaderboards, updateLeaderboard, unfinishedLeaderboards
    }}>
      {children}
    </RandomLeaderboardContext.Provider>
  );
};