export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CAPTAIN = 'CAPTAIN',
  PLAYER = 'PLAYER',
}

export enum Position {
  SPIKER = 'Spiker',
  SETTER = 'Setter',
  DEFENDER = 'Defender',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface PlayerProfile {
  id: string;
  userId: string;
  name: string;
  position: Position;
  imageUrl?: string;
  teamId?: string; // Captain's user ID
  overallRating: number;
  isSold: boolean;
  price?: number;
}

export interface Rating {
  id: string;
  playerId: string;
  raterId: string;
  serving: number;
  passing: number;
  setting: number;
  spiking: number;
  blocking: number;
  defense: number;
  overall: number;
  timestamp: number;
}

export interface AuctionSettings {
  ratingWindowOpen: boolean;
  auctionPhaseActive: boolean;
}
