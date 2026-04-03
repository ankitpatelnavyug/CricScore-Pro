export type UserRole = 'admin' | 'organizer' | 'manager' | 'scorer' | 'player' | 'viewer';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  mobile?: string;
  role: UserRole;
  battingStyle?: string;
  bowlingStyle?: string;
  playerRole?: string;
  stats?: PlayerStats;
}

export interface PlayerStats {
  matches: number;
  runs: number;
  wickets: number;
  balls: number;
  ballsBowled: number;
  runsConceded: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  average: number;
  economy: number;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  captainId?: string;
  wicketKeeperId?: string;
  managerId: string;
  playerIds: string[];
  stats: TeamStats;
}

export interface TeamStats {
  played: number;
  wins: number;
  losses: number;
  nrr: number;
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  format: 'T20' | 'ODI' | 'Test' | 'Custom';
  overs: number;
  venue: string;
  date: string;
  status: 'upcoming' | 'live' | 'completed' | 'abandoned';
  tossWinnerId?: string;
  tossDecision?: 'bat' | 'bowl';
  scorerId?: string;
  currentInnings: number;
  scorecard: Scorecard;
}

export interface Scorecard {
  innings: Innings[];
}

export interface Innings {
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: Extras;
  batting: BattingPerformance[];
  bowling: BowlingPerformance[];
}

export interface Extras {
  wide: number;
  noBall: number;
  bye: number;
  legBye: number;
}

export interface BattingPerformance {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out: boolean;
  howOut?: string;
}

export interface BowlingPerformance {
  playerId: string;
  overs: number;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
}
