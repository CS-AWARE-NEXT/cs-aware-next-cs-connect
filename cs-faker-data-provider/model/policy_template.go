package model

type PolicyTemplate struct {
	Policy
	Purpose  []string `json:"purpose"`
	Elements []string `json:"elements"`
}

type PolicyTemplateFied struct {
	PolicyID string `json:"policyId"`
	Field    string `json:"field"`
	Value    string `json:"value"`
}
