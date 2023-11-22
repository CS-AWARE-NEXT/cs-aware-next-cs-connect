import {SectionInfo} from './organization';

export type ExerciseAssignment = {
    exerciseId: string;
    assignment: Assignment;
    incidents: SectionInfo[];
};

export type Assignment = {
    descriptionName: string;
    descriptionParts: string[];
    attackName: string;
    attackParts: string[];
    questionName: string;
    questions: string[];
    educationName: string;
    educationMaterial: string[];
};