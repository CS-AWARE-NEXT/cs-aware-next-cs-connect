import {SectionInfo} from './organization';

export type ExerciseAssignment = {
    exerciseId: string;
    assignment: Assignment;
    incidents: SectionInfo[];
};

export type Assignment = {
    descriptionName: string;
    descriptionParts: string[];

    instructionName: string;
    instructions: string[];

    registrationAccessProcessName: string;
    registrationAccessProcess: string[];

    attackName: string;
    attackParts: string[];

    questionName: string;
    questions: string[];

    openQuestionName: string;
    openQuestions: string[];

    educationName: string;
    educationMaterial: string[];
};