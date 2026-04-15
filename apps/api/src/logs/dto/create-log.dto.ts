import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const SLEEP_DISTURBANCES = [
  'nightmares',
  'insomnia',
  'waking_early',
  'restless',
  'sleep_apnea',
  'other',
] as const;

const ACTIVITY_TYPES = [
  'walking',
  'running',
  'yoga',
  'gym',
  'swimming',
  'cycling',
  'dancing',
  'other',
  'none',
] as const;

const DEPRESSION_SYMPTOMS = [
  'low_energy',
  'hopelessness',
  'loss_of_interest',
  'appetite_changes',
  'difficulty_concentrating',
  'worthlessness',
  'crying_spells',
] as const;

const ANXIETY_SYMPTOMS = [
  'racing_thoughts',
  'restlessness',
  'muscle_tension',
  'irritability',
  'panic_attacks',
  'avoidance',
  'worry',
] as const;

export class CreateLogDto {
  @IsDateString()
  logDate: string;

  @IsInt()
  @Min(1)
  @Max(10)
  moodRating: number;

  @IsInt()
  @Min(1)
  @Max(10)
  anxietyLevel: number;

  @IsInt()
  @Min(1)
  @Max(10)
  stressLevel: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(24)
  sleepHours: number;

  @IsInt()
  @Min(1)
  @Max(10)
  sleepQuality: number;

  @IsOptional()
  @IsArray()
  @IsIn(SLEEP_DISTURBANCES, { each: true })
  sleepDisturbances?: string[];

  @IsOptional()
  @IsIn(ACTIVITY_TYPES)
  activityType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  activityMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  socialInteractions?: number;

  @IsOptional()
  @IsArray()
  @IsIn(DEPRESSION_SYMPTOMS, { each: true })
  depressionSymptoms?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(ANXIETY_SYMPTOMS, { each: true })
  anxietySymptoms?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
