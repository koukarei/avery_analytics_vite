import React, { useState, useContext, type ChangeEvent, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { LoadingSpinner } from '../Common/LoadingSpinner';

import type { ChatMessage, ChatStats, GenerationDetail, Round } from '../../types/studentWork';
import { LeaderboardRoundContext } from '../../providers/LeaderboardProvider';
import { GenerationDetailContext, GenerationImageContext, GenerationEvaluationContext } from '../../providers/GenerationProvider';
import { ChatStatsContext } from '../../providers/ChatProvider';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { useLocalization } from '../../contexts/localizationUtils';

import { parseGrammarMistakes, parseSpellingMistakes } from '../../util/WritingMistake';
import { compareWriting } from '../../util/CompareWriting';   
import { MarkdownViewer } from '../../util/showMD';

interface RoundColumn {
  id: 'student_name' | 'created_at' | 'number_of_writings' | 'number_of_messages_sent' | 'duration' | 'first_writing' | 'last_writing';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: RoundColumn[] = [
  { id: 'student_name', label: 'galleryView.Tab.leaderboard.tableHeader.student_name', minWidth: 170 },
  { id: 'created_at', label: 'galleryView.Tab.leaderboard.tableHeader.created_at', minWidth: 100 },
  {
    id: 'number_of_writings',
    label: 'galleryView.Tab.leaderboard.tableHeader.number_of_writings',
    minWidth: 100,
    format: (value: number) => value.toFixed(0),
  },
  {
    id: 'number_of_messages_sent',
    label: 'galleryView.Tab.leaderboard.tableHeader.number_of_messages_sent',
    minWidth: 100,
    format: (value: number) => value.toFixed(0),
  },
  {
    id: 'duration',
    label: 'galleryView.Tab.leaderboard.tableHeader.duration',
    minWidth: 100,
    format: (value: number) => {
      if (typeof value === 'number') {
          const hours = Math.floor(value / 3600);
          const minutes = Math.floor((value % 3600) / 60);
          const seconds = value % 60;
          return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;
      }
      return "No Duration";
    }
  },
  {
    id: 'first_writing',
    label: 'galleryView.Tab.leaderboard.tableHeader.first_writing',
    minWidth: 170,
    align: 'right',
  },
  {
    id: 'last_writing',
    label: 'galleryView.Tab.leaderboard.tableHeader.last_writing',
    minWidth: 170,
    align: 'right',
  }
];

interface Data {
  id: number;
  student_name: string;
  display_name: string;
  is_current_user: boolean;
  created_at: string;
  number_of_writings: number;
  number_of_messages_sent: number;
  first_writing: string;
  last_writing: string;
  duration: number;
  engagement_score: number;
  generation_ids: number[];
};

function createData(
  roundData: Round,
  currentUser_profile_id: number | null,
  chatStats: ChatStats | null,
  firstWritingDetail: GenerationDetail | null,
  lastWritingDetail: GenerationDetail | null
): Data {
  const id = roundData.id;
  const is_current_user = currentUser_profile_id ? roundData.player?.id === currentUser_profile_id : false;;
  const student_name = roundData.player?.display_name ? roundData.player.display_name : '';
  const display_name = roundData.display_name || '';
  const created_at = roundData.created_at ? new Date(roundData.created_at).toLocaleDateString() : "N/A";

  const number_of_messages_sent = chatStats ? chatStats.n_user_messages : 0;
  
  const first_writing = firstWritingDetail ? firstWritingDetail.sentence : "";
  const last_writing = lastWritingDetail ? lastWritingDetail.sentence : "";

  const generation_ids = roundData.generations.filter(gen => gen.is_completed).map(gen => gen.id);
  const number_of_writings = generation_ids.length;

  const duration = roundData.generations.map(gen => gen.is_completed ? gen.duration : 0).reduce((a, b) => a + b, 0);

  const engagement_score = (number_of_writings + number_of_messages_sent * 0.8) / (number_of_writings > 0 ? duration /60 : 1);

  return { id, student_name, display_name, is_current_user, created_at, number_of_writings, number_of_messages_sent, first_writing, last_writing, duration, engagement_score, generation_ids };
};

interface WritingColumn {
  id: 'sentence' | 'correct_sentence' | 'img_feedback' | 'awe_feedback' | 'grammar_errors' | 'spelling_errors' | 'duration';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
};


const writingColumns: readonly WritingColumn[] = [
  { id: 'sentence', label: 'Sentence', minWidth: 170 },
  { id: 'correct_sentence', label: 'Corrected\u00a0Sentence', minWidth: 170 },
  { 
    id: 'img_feedback', 
    label: 'Image\u00a0Feedback', 
    minWidth: 170,
  },
  { id: 'awe_feedback', label: 'AWE\u00a0Feedback', minWidth: 170 },
  { id: 'duration', label: 'Duration', minWidth: 100, align: 'right' },
  { id: 'grammar_errors', label: 'Grammar\u00a0Errors', minWidth: 170 },
  { id: 'spelling_errors', label: 'Spelling\u00a0Errors', minWidth: 170 },
];

interface WritingData {
  sentence: string;
  correct_sentence: string;
  img_feedback: string;
  awe_feedback: string;
  duration: string;
  grammar_errors: string[] | null;
  spelling_errors: string[] | null;
};

function createWritingData(
  generationData: GenerationDetail,
  image: string | null,
  evaluation_msg: ChatMessage | null
): WritingData {
  const sentence = generationData.sentence;
  const correct_sentence = generationData.correct_sentence? generationData.correct_sentence : "N/A";
  const img_feedback = image || "No Image";
  const awe_feedback = evaluation_msg?.content || "No Feedback";

  const hours = Math.floor(generationData.duration / 3600);
  const minutes = Math.floor((generationData.duration % 3600) / 60);
  const seconds = generationData.duration % 60;
  const duration = `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;

  const grammar_errors_arr = parseGrammarMistakes(generationData.grammar_errors);
  const spelling_errors_arr = parseSpellingMistakes(generationData.spelling_errors);

  const grammar_errors = grammar_errors_arr.length > 0 ? grammar_errors_arr.map(mistake => ([mistake.extracted_text, "=>", mistake.correction].join("\u00a0"))) : ["No Grammar Errors"];
  const spelling_errors = spelling_errors_arr.length > 0 ? spelling_errors_arr.map(mistake => ([mistake.word,"=>", mistake.correction].join("\u00a0"))) : ["No Spelling Errors"];

  return { sentence, correct_sentence, img_feedback, awe_feedback, duration, grammar_errors, spelling_errors };
}

interface RenderTableRowProps {
  open: boolean;
  errorKey: string | null;
  writingRows: WritingData[];
  isLoading?: boolean;
}

const RenderTableRow: React.FC<RenderTableRowProps> = ({
  open,
  errorKey,
  writingRows,
  isLoading
}) => {
  const { t } = useLocalization();

  const renderWritingTableCell = (column: WritingColumn, row: WritingData, value: string | number | null | string[]) => {
    
    switch (column.id) {
      case 'correct_sentence': {
        return (<span>{
          compareWriting(row.sentence, row.correct_sentence)
        }</span>);
      }
      case 'img_feedback': {
        return value ? <img src={value as string} alt="Interpreted" style={{ maxWidth: '100px', maxHeight: '100px' }} /> : "No Image";
      }
      case 'awe_feedback': {
        return typeof value === 'string'
          ? <MarkdownViewer content={value} />
          : "No Feedback";
        }
      case 'grammar_errors': {
        if (Array.isArray(value)) {
          return (
            value.length > 1 ? (
              <ul>
                {value.map((mistake, index) => (
                  <li key={index}>{index + 1}. {mistake}</li>
                ))}
              </ul>) : (
                <span>{value[0]}</span>
              )
          );
        } else {
          return "No Grammar Errors";
        }
      }
      case 'spelling_errors': {
        if (Array.isArray(value)) {
          return (
          <ul>
            {value.map((mistake, index) => (
              <li key={index}>{mistake}</li>
            ))}
          </ul>);
        } else {
          return "No Spelling Errors";
        }
      }

      default:
        return column.format && typeof value === 'number'
          ? column.format(value)
          : value;
    }
  };

  const renderSmallTable = (open: boolean, errorKey: string | null) => {
    
    if (errorKey) {
      return (
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <p className="text-xl text-gray-400">{t(errorKey)}</p>
        </TableCell>
      </TableRow>
    )}

    if (isLoading) {
      return (
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <LoadingSpinner />
        </TableCell>
      </TableRow>
    )}

    if (writingRows.length === 0) {
      return (
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <p className="text-xl text-gray-400">{t('student_work.no_writings')}</p>
        </TableCell>
      </TableRow>
    )}

    return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1 }}>
            <Typography variant="h6" gutterBottom component="div">
              {t('galleryView.Tab.leaderboard.history')}
            </Typography>
            <Table size="small" aria-label="writing-history">
              <TableHead>
                <TableRow>
                  {writingColumns.map((column) => (
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
                {writingRows.map((row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {writingColumns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {renderWritingTableCell(column, row, value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  )}

  return (
    <>
      {renderSmallTable(open, errorKey)}
    </>
  );
}

const RoundRow: React.FC<{ rank: number; showStudentNames: boolean; row: Data }> = ({ rank, showStudentNames, row }) => {
  const [open, setOpen] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { fetchDetail } = useContext(GenerationDetailContext);
  const { fetchImage } = useContext(GenerationImageContext);
  const { fetchEvaluation } = useContext(GenerationEvaluationContext);
  const [ writingRows, setWritingRows] = useState<WritingData[]>([]);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const { t } = useLocalization();

  const renderTableCell = (column: RoundColumn, row: Data, value: string | number ) => {
    switch (column.id) {
      case 'student_name': {
        const display_name = showStudentNames ? value : row.display_name ? row.display_name : t('galleryView.Tab.leaderboard.anonymous');
        return `${display_name}${row.is_current_user ? ` (${t('galleryView.Tab.leaderboard.you')})` : ''}`;
      }
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

  useEffect(() => {
    setErrorKey(null);
    if (clicked) {
      setIsLoading(true);
      const fetchWritingRows = async () => {
        try {
          const results = await Promise.all(
            row.generation_ids.map(async (id) => {
              const detail = await fetchDetail(id).catch(e => {
                setErrorKey('error.fetch_generation_detail');
                console.error("Failed to fetch generation detail: ", e);
                return null;
              });
              if (!detail) return null;

              const [image, evaluation_msg] = await Promise.all([
                fetchImage({ generation_id: id }),
                fetchEvaluation(id)
              ]);
              return createWritingData(detail, image, evaluation_msg);
            })
          );
          const validRows = results.filter((row): row is WritingData => row !== null);
          setWritingRows(validRows);
        } catch (e) {
          setErrorKey(t('error.fetch_generation'));
          console.error("Unexpected error:", e);
        } finally {
          setIsLoading(false);
        }
      };

      fetchWritingRows();
    }
  }, [clicked]);

  const handleClick = () => {
    setClicked(true);
    setOpen(!open);
  }

  return (
    <>
      <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={handleClick}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{rank}</TableCell>
        {columns.map((column) => {
          const value = row[column.id];
          return (
            <TableCell key={column.id} align={column.align}>
              {renderTableCell(column, row, value)}
            </TableCell>
          );
        })}
      </TableRow>
      {
        open ? (
          <RenderTableRow 
            open={open} 
            errorKey={errorKey} 
            writingRows={writingRows} 
            isLoading={isLoading}
          />
        ) : null
      }

      </>
  );
}

interface StudentWorkTableProps {
  leaderboard_id: number;
  program_name: string;
  showStudentNames: boolean;
}

const StudentWorkTable: React.FC<StudentWorkTableProps> = ({
  leaderboard_id,
  program_name,
  showStudentNames
}) => {
  const [ page, setPage ] = useState(0);
  const [ rowsPerPage, setRowsPerPage ] = useState(10);
  const { currentUser } = useContext(AuthUserContext);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const { loading, fetchRounds } = useContext(LeaderboardRoundContext);
  const { fetchDetail } = useContext(GenerationDetailContext);
  const [ errorKey, setErrorKey ] = useState<string | null>(null);
  const { fetchStats } = useContext(ChatStatsContext);
  const [ rows, setRows ] = useState<Data[]>([]);
  const { t } = useLocalization();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    setErrorKey(null);
    fetchRounds(leaderboard_id, { program: program_name }, currentUser?.is_admin || false )
      .then(async (rounds) => {
        if (!rounds || rounds.length === 0) {
          setErrorKey('error.no_rounds');
          return;
        } 

        const newRows: Data[] = [];
        setIsLoading(true);
        await Promise.all(rounds.map(async (round) => {
            let firstWritingDetail: GenerationDetail | null = null;
            let lastWritingDetail: GenerationDetail | null = null;
            let rowChatStats: ChatStats | null = null;
            
            try {
              const generations = round.generations.filter(gen => gen.is_completed);
              if (generations.length > 1) {
                [firstWritingDetail, lastWritingDetail] = await Promise.all([
                  fetchDetail(generations[0].id),
                  fetchDetail(generations[generations.length - 1].id)
                ]);
              } else if (generations.length === 1) {
                firstWritingDetail = await fetchDetail(generations[0].id);
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

            const currentUser_profile_id = currentUser?.id || null;

            const row = createData(
              round,
              currentUser_profile_id,
              rowChatStats,
              firstWritingDetail,
              lastWritingDetail,
            );

            newRows.push(row);
          }));
          setRows(newRows);
          setIsLoading(false);
      })
      .catch(err => {
        setErrorKey('error.fetch_rounds');
        console.error("Failed to fetch rounds: ", err);
      });
      
  }, [leaderboard_id, program_name, showStudentNames]);

  function renderRows(rows: Data[], t: (key: string) => string) {
    if (isLoading || loading) {
      return <LoadingSpinner />;
    }

    if (errorKey) {
      return <p className="text-xl text-gray-400">{t(errorKey)}</p>;
    }

    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="student work table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>{t('galleryView.Tab.leaderboard.tableHeader.rank')}</TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {t(column.label)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .sort((a, b) => b.engagement_score - a.engagement_score)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <RoundRow rank={index + 1} showStudentNames={showStudentNames} key={row.id} row={row} />
                ))}
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