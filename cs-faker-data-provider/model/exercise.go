package model

type ExerciseAssignment struct {
	Assignment Assignment                   `json:"assignment"`
	Incidents  []IncidentWithOrganizationId `json:"incidents"`
}

type Assignment struct {
	DescriptionName  string   `json:"descriptionName"`
	DescriptionParts []string `json:"descriptionParts"`

	AttackName  string   `json:"attackName"`
	AttackParts []string `json:"attackParts"`

	QuestionName string   `json:"questionName"`
	Questions    []string `json:"questions"`

	EducationName     string   `json:"educationName"`
	EducationMaterial []string `json:"educationMaterial"`
}
