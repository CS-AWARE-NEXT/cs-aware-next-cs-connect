package model

type ExerciseAssignment struct {
	ExerciseID string                       `json:"exerciseId"`
	Assignment Assignment                   `json:"assignment"`
	Incidents  []IncidentWithOrganizationId `json:"incidents"`
}

type Assignment struct {
	DescriptionName  string   `json:"descriptionName"`
	DescriptionParts []string `json:"descriptionParts"`

	InstructionName string   `json:"instructionName"`
	Instructions    []string `json:"instructions"`

	RegistrationAccessProcessName string   `json:"registrationAccessProcessName"`
	RegistrationAccessProcess     []string `json:"registrationAccessProcess"`

	AttackName  string   `json:"attackName"`
	AttackParts []string `json:"attackParts"`

	QuestionName string   `json:"questionName"`
	Questions    []string `json:"questions"`

	OpenQuestionName string   `json:"openQuestionName"`
	OpenQuestions    []string `json:"openQuestions"`

	EducationName     string   `json:"educationName"`
	EducationMaterial []string `json:"educationMaterial"`
}
