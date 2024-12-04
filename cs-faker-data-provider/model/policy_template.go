package model

import "encoding/json"

type PolicyTemplate struct {
	Policy
	Purpose                  []string `json:"purpose"`
	Elements                 []string `json:"elements"`
	Need                     []string `json:"need"`
	RolesAndResponsibilities []string `json:"rolesAndResponsibilities"`
	References               []string `json:"references"`
	Tags                     []string `json:"tags"`
}

type PolicyTemplateField struct {
	PolicyID string `json:"policyId"`
	Field    string `json:"field"`
	Value    string `json:"value"`
}

type UpdatePolicyTemplateRequest struct {
	PolicyTemplateField
	OrganizationName string `json:"organizationName"`
}

type UpdatePolicyTemplateResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type JSONPolicy struct {
	Policy JSONPolicyTemplate `json:"policy"`
	Tags   []string           `json:"tags"`
}

func (jpt *JSONPolicy) String() string {
	if b, err := json.Marshal(jpt); err == nil {
		return string(b)
	}
	return "Could not stringify JSONPolicyTemplate"
}

type JSONPolicyTemplate struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Organization string `json:"organization"`

	// EcosystemID  string `json:"ecosystemId"`

	DateCreated string `json:"date_created"`
	LastUpdated string `json:"last_updated"`

	Purpose                  string   `json:"purpose"`
	Elements                 string   `json:"elements"`
	Need                     string   `json:"need"`
	RolesAndResponsibilities string   `json:"roles_and_responsibilities"`
	References               string   `json:"references"`
	Tags                     []string `json:"tags"`
}
