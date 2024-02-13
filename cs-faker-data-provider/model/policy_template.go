package model

type PolicyTemplate struct {
	Policy
	Purpose                  []string `json:"purpose"`
	Elements                 []string `json:"elements"`
	Need                     []string `json:"need"`
	RolesAndResponsibilities []string `json:"rolesAndResponsibilities"`
	References               []string `json:"references"`
	Tags                     []string `json:"tags"`
}

type PolicyTemplateFied struct {
	PolicyID string `json:"policyId"`
	Field    string `json:"field"`
	Value    string `json:"value"`
}
