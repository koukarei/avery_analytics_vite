import { VocabularyBase, Vocabulary } from "../types/leaderboard";
import { DictionaryResponse } from "../types/dictionaryAPI"
import { authAxios } from "./axios";

export class VocabularyAPI {

  static async addNewVocabulary(leaderboard_id: number,vocabulary: VocabularyBase): Promise<Vocabulary> {
    const response = await authAxios.put(
        `leaderboards/${leaderboard_id}/vocabulary/`,
        vocabulary,
        { headers: sessionStorage.getItem("access_token")
            ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
            : {},
        }
    );
    return response.data;
  }

  static async fetchVocabularyDetails(word: string): Promise<DictionaryResponse | null> {
    const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    return response.json();
  }
}