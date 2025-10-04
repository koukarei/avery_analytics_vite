import { useState, useContext, ChangeEvent, useCallback, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';

import type { ChatMessage, ChatStats, GenerationDetail, Round } from '../../types/studentWork';
import { LeaderboardRoundContext } from '../../providers/LeaderboardProvider';
import { GenerationDetailContext, GenerationImageContext, GenerationEvaluationContext } from '../../providers/GenerationProvider';
import { ChatStatsContext } from '../../providers/ChatProvider';
import { useLocalization } from '../../contexts/localizationUtils';

import { parseGrammarMistakes, parseSpellingMistakes, type GrammarMistake, type SpellingMistake } from '../../util/WritingMistake';
import { compareWriting } from '../../util/CompareWriting';   

const LoadingSpinner: React.FC = () => {
  const { t } = useLocalization();
  return (
    <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
      <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-slate-600">{t('loading.text')}</p>
    </div>
  );
};

interface RoundColumn {
  id: 'student_name' | 'created_at' | 'number_of_writings' | 'number_of_messages_sent' | 'first_writing' | 'last_writing';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: readonly RoundColumn[] = [
  { id: 'student_name', label: 'Student\u00a0Name', minWidth: 170 },
  { id: 'created_at', label: 'Created\u00a0At', minWidth: 100 },
  {
    id: 'number_of_writings',
    label: 'Number\u00a0of\u00a0Writings',
    minWidth: 100,
    format: (value: number) => value.toFixed(0),
  },
  {
    id: 'number_of_messages_sent',
    label: 'Number\u00a0of\u00a0Messages\u00a0Sent',
    minWidth: 100,
    format: (value: number) => value.toFixed(0),
  },
  {
    id: 'first_writing',
    label: 'First\u00a0Writing',
    minWidth: 170,
    align: 'right',
  },
  {
    id: 'last_writing',
    label: 'Last\u00a0Writing',
    minWidth: 170,
    align: 'right',
  },
];

interface Data {
  id: number;
  student_name: string;
  created_at: string;
  number_of_writings: number;
  number_of_messages_sent: number;
  first_writing: string;
  last_writing: string;
};

function createData(
  roundData: Round,
  chatStats: ChatStats | null,
  firstWritingDetail: GenerationDetail | null,
  lastWritingDetail: GenerationDetail | null
): Data {
  const id = roundData.id;
  const student_name = roundData.player.display_name;
  const created_at = roundData.created_at ? new Date(roundData.created_at).toLocaleDateString() : "N/A";
  const number_of_writings = roundData.generations.length;

  const number_of_messages_sent = chatStats ? chatStats.n_user_messages : 0;
  
  const first_writing = firstWritingDetail ? firstWritingDetail.sentence : "";
  const last_writing = lastWritingDetail ? lastWritingDetail.sentence : "";
  
  return { id, student_name, created_at, number_of_writings, number_of_messages_sent, first_writing, last_writing };
};

interface WritingColumn {
  id: 'sentence' | 'correct_sentence' | 'img_feedback' | 'awe_feedback' | 'grammar_errors' | 'spelling_errors';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
};

interface WritingData {
  sentence: string;
  correct_sentence: string;
  img_feedback: string;
  awe_feedback: string;
  grammar_errors: GrammarMistake[] | null;
  spelling_errors: SpellingMistake[] | null;
};

function createWritingData(
  generationData: GenerationDetail,
  image: string | null,
  evaluation_msg: ChatMessage | null
): WritingData {
  const sentence = generationData.sentence;
  const correct_sentence = generationData.corrected_sentence;
  const img_feedback = image || "No Image";
  const awe_feedback = evaluation_msg?.content || "No Feedback";

  const grammar_errors = parseGrammarMistakes(generationData.grammar_errors);
  const spelling_errors = parseSpellingMistakes(generationData.spelling_errors);
  return { sentence, correct_sentence, img_feedback, awe_feedback, grammar_errors, spelling_errors };
}

const StudentWorkTable: React.FC<{ leaderboard_id: number, program_name: string }> = ({
  leaderboard_id,
  program_name
}) => {
  const [ page, setPage ] = useState(0);
  const [ rowsPerPage, setRowsPerPage ] = useState(10);
  const { loading, fetchRounds } = useContext(LeaderboardRoundContext);
  const { loading: loadingFetchDetail, fetchDetail } = useContext(GenerationDetailContext);
  const [ errorKey, setErrorKey ] = useState<string | null>(null);
  const { loading: loadingFetchStats, fetchStats } = useContext(ChatStatsContext);
  const [ rows, setRows ] = useState<Data[]>([]);
  const { t } = useLocalization();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    setErrorKey(null);
    fetchRounds(leaderboard_id, { program: program_name } )
      .then(async (rounds) => {
        if (!rounds || rounds.length === 0) {
          setErrorKey('error.no_rounds');
          return;
        } 

        const newRows: Data[] = [];

        await Promise.all(rounds.map(async (round) => {
            let firstWritingDetail: GenerationDetail | null = null;
            let lastWritingDetail: GenerationDetail | null = null;
            let rowChatStats: ChatStats | null = null;
            
            try {
              if (round.generations.length > 1) {
                [firstWritingDetail, lastWritingDetail] = await Promise.all([
                  fetchDetail(round.generations[0].id),
                  fetchDetail(round.generations[round.generations.length - 1].id)
                ]);
              } else if (round.generations.length === 1) {
                firstWritingDetail = await fetchDetail(round.generations[0].id);
                lastWritingDetail = firstWritingDetail;
              }
            } catch (e) {
              setErrorKey('error.fetch_generation_detail');
              console.error("Failed to fetch generation detail: ", e);
            }
            
            try {
              rowChatStats = await fetchStats(round.id);
            } catch (e) {
              console.error("Failed to fetch chat stats: ", e);
              setErrorKey('error.fetch_chat_stats');
            }
            
            const row = createData(
              round,
              rowChatStats,
              firstWritingDetail,
              lastWritingDetail,
            );

            newRows.push(row);
          }));
          setRows(newRows);
      })
      .catch(err => {
        setErrorKey('error.fetch_rounds');
        console.error("Failed to fetch rounds: ", err);
      });
      
  }, [fetchRounds, leaderboard_id, program_name]);

  const renderTableCell = (column: RoundColumn, row: Data, value: any) => {
    switch (column.id) {
      case 'last_writing': {
        return (<span>{
          compareWriting(row.first_writing, row.last_writing)
        }</span>);
      }
      default:
        return column.format && typeof value === 'number'
          ? column.format(value)
          : value;
    }
  };


  function renderRows(rows: Data[], t: (key: string) => string) {
    if (loading || loadingFetchDetail || loadingFetchStats) {
      return <LoadingSpinner />;
    }

    if (errorKey) {
      return <p className="text-xl text-gray-400">{t(errorKey)}</p>;
    }

    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer className='h-full'>
          <Table stickyHeader aria-label="student work table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {renderTableCell(column, row, value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    )
  }

  return (
    <div>
      {renderRows(rows, t)}
    </div>
  );
}
export default StudentWorkTable;