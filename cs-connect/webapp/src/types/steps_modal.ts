export interface StepData {
    title: string;
    options: StepValue[];
}

export interface StepValue {
    name: string;
    description?: string;
    id: string;
    organizationId: string;
    parentId: string;
}