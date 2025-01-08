package controller

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/service"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
	"github.com/gofiber/fiber/v2"
)

type PolicyController struct {
	policyRepository *repository.PolicyRepository
	postRepository   *repository.PostRepository
	authService      *service.AuthService
	endpoint         string
}

func NewPolicyController(
	policyRepository *repository.PolicyRepository,
	postRepository *repository.PostRepository,
	authService *service.AuthService,
	endpoint string,
) *PolicyController {
	return &PolicyController{
		policyRepository: policyRepository,
		postRepository:   postRepository,
		authService:      authService,
		endpoint:         endpoint,
	}
}

func (pc *PolicyController) GetPolicies(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	rows := []model.PaginatedTableRow{}
	policies, err := pc.policyRepository.GetPoliciesByOrganization(organizationId)
	if err != nil {
		log.Printf("Could not get policies: %s", err.Error())
		if err == util.ErrNotFound {
			return c.JSON(model.PaginatedTableData{
				Columns: policyColumns,
				Rows:    rows,
			})
		}
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Could not get policies",
		})
	}
	for _, policy := range policies {
		rows = append(rows, model.PaginatedTableRow{
			ID:          policy.ID,
			Name:        policy.Name,
			Description: policy.Description,
		})
	}
	return c.JSON(model.PaginatedTableData{
		Columns: policyColumns,
		Rows:    rows,
	})
}

func (pc *PolicyController) GetPolicy(c *fiber.Ctx) error {
	id := c.Params("policyId")
	if policy, err := pc.policyRepository.GetPolicyByID(id); err == nil {
		return c.JSON(policy)
	}
	return c.JSON(model.Policy{})
}

// func (pc *PolicyController) GetPolicyDos(c *fiber.Ctx) error {
// 	policyId := c.Params("policyId")
// 	return c.JSON(model.ListData{
// 		Items: policiesDosMap[policyId],
// 	})
// }

// func (pc *PolicyController) GetPolicyDonts(c *fiber.Ctx) error {
// 	policyId := c.Params("policyId")
// 	return c.JSON(model.ListData{
// 		Items: policiesDontsMap[policyId],
// 	})
// }

func (pc *PolicyController) GetPolicyTemplate(c *fiber.Ctx) error {
	return pc.GetPolicy(c)
}

func (pc *PolicyController) GetTenMostCommonPolicies(c *fiber.Ctx) error {
	return c.JSON(model.ListData{
		Items: tenMostCommonPolicies,
	})
}

func (pc *PolicyController) SavePolicy(c *fiber.Ctx) error {
	var policy model.Policy
	err := json.Unmarshal(c.Body(), &policy)
	if err != nil {
		return c.JSON(fiber.Map{
			"error": "Not a valid policy provided",
		})
	}
	policyID := ""
	if policy.ID == "" {
		policy.ID = util.GenerateUUID()
		pc.policyRepository.SavePolicy(model.PolicyTemplate{
			Policy: model.Policy{
				ID:             policy.ID,
				Name:           policy.Name,
				Description:    policy.Description,
				OrganizationId: policy.OrganizationId,
				Exported:       "false",
			},
		})
		policyID = policy.ID
	} else {
		splitted := strings.Split(policy.ID, "_")
		oldID := splitted[0]
		newID := splitted[1]
		pc.policyRepository.DeletePolicyByID(oldID)
		pc.policyRepository.SavePolicy(model.PolicyTemplate{
			Policy: model.Policy{
				ID:             newID,
				Name:           policy.Name,
				Description:    policy.Description,
				OrganizationId: policy.OrganizationId,
				Exported:       policy.Exported,
			},
		})
		policyID = newID
	}
	return c.JSON(fiber.Map{
		"id":             policyID,
		"name":           policy.Name,
		"description":    policy.Description,
		"organizationId": policy.OrganizationId,
	})
}

func (pc *PolicyController) DeletePolicy(c *fiber.Ctx) error {
	policyId := c.Params("policyId")
	pc.policyRepository.DeletePolicyByID(policyId)
	return c.JSON(fiber.Map{
		"deleted": policyId,
	})
}

func (pc *PolicyController) SavePolicyTemplate(c *fiber.Ctx) error {
	policyId := c.Params("policyId")
	newPolicyTemplate := model.PolicyTemplate{}
	err := json.Unmarshal(c.Body(), &newPolicyTemplate)
	if err != nil {
		return c.JSON(fiber.Map{
			"error": "Not a valid policy template provided",
		})
	}
	pc.policyRepository.DeletePolicyByID(policyId)
	pc.policyRepository.SavePolicy(newPolicyTemplate)
	return c.JSON(fiber.Map{
		"id":   newPolicyTemplate.ID,
		"name": newPolicyTemplate.Name,
	})
}

func (pc *PolicyController) UpdatePolicyTemplate(c *fiber.Ctx, vars map[string]string) error {
	var policyTemplateField model.UpdatePolicyTemplateRequest
	err := json.Unmarshal(c.Body(), &policyTemplateField)
	if err != nil {
		return c.JSON(model.UpdatePolicyTemplateResponse{
			Success: false,
			Message: "Not a valid policy template field provided",
		})
	}

	policyTemplate, err := pc.policyRepository.GetPolicyByID(policyTemplateField.PolicyID)
	if err != nil {
		return c.JSON(model.UpdatePolicyTemplateResponse{
			Success: false,
			Message: "Policy template not found",
		})
	}

	switch strings.ToLower(policyTemplateField.Field) {
	case "purpose":
		if policyTemplate.Purpose == nil {
			policyTemplate.Purpose = []string{}
		}
		for _, purpose := range policyTemplate.Purpose {
			if purpose == policyTemplateField.Value {
				return c.JSON(model.UpdatePolicyTemplateResponse{
					Success: false,
					Message: "Purpose already exists",
				})
			}
		}
		policyTemplate.Purpose = append(policyTemplate.Purpose, policyTemplateField.Value)
	case "elements":
		if policyTemplate.Elements == nil {
			policyTemplate.Elements = []string{}
		}
		for _, element := range policyTemplate.Elements {
			if element == policyTemplateField.Value {
				return c.JSON(model.UpdatePolicyTemplateResponse{
					Success: false,
					Message: "Element already exists",
				})
			}
		}
		policyTemplate.Elements = append(policyTemplate.Elements, policyTemplateField.Value)
	case "need":
		if policyTemplate.Need == nil {
			policyTemplate.Need = []string{}
		}
		for _, need := range policyTemplate.Need {
			if need == policyTemplateField.Value {
				return c.JSON(model.UpdatePolicyTemplateResponse{
					Success: false,
					Message: "Need already exists",
				})
			}
		}
		policyTemplate.Need = append(policyTemplate.Need, policyTemplateField.Value)
	case "rolesandresponsibilities":
		if policyTemplate.RolesAndResponsibilities == nil {
			policyTemplate.RolesAndResponsibilities = []string{}
		}
		for _, role := range policyTemplate.RolesAndResponsibilities {
			if role == policyTemplateField.Value {
				return c.JSON(model.UpdatePolicyTemplateResponse{
					Success: false,
					Message: "Role already exists",
				})
			}
		}
		policyTemplate.RolesAndResponsibilities = append(policyTemplate.RolesAndResponsibilities, policyTemplateField.Value)
	case "references":
		if policyTemplate.References == nil {
			policyTemplate.References = []string{}
		}
		for _, reference := range policyTemplate.References {
			if reference == policyTemplateField.Value {
				return c.JSON(model.UpdatePolicyTemplateResponse{
					Success: false,
					Message: "Reference already exists",
				})
			}
		}
		policyTemplate.References = append(policyTemplate.References, policyTemplateField.Value)
	case "tags":
		if policyTemplate.Tags == nil {
			policyTemplate.Tags = []string{}
		}
		for _, tag := range policyTemplate.Tags {
			if tag == policyTemplateField.Value {
				return c.JSON(model.UpdatePolicyTemplateResponse{
					Success: false,
					Message: "Tag already exists",
				})
			}
		}
		policyTemplate.Tags = append(policyTemplate.Tags, policyTemplateField.Value)
	case "exported":
		if policyTemplate.Tags == nil || len(policyTemplate.Tags) == 0 {
			return c.JSON(model.UpdatePolicyTemplateResponse{
				Success: false,
				Message: "Policy template must have at least one tag",
			})
		}
		policyTemplate.Exported = "true"
		jsonPolicyExporter := service.NewJSONPolicyExporter(
			*pc.postRepository,
			vars["ecosystemId"],
			pc.endpoint,
			pc.authService,
		)
		jsonPolicy, err := jsonPolicyExporter.ExportPolicy(
			policyTemplate,
			policyTemplateField.OrganizationName,
			vars,
		)
		if err != nil {
			log.Printf("Could not export policy template: %s", err.Error())
			return c.JSON(model.UpdatePolicyTemplateResponse{
				Success: false,
				Message: "Could not export policy template because the external server returned an error",
			})
		}
		log.Printf("Exported policy as %s", jsonPolicy.String())
	default:
		return c.JSON(model.UpdatePolicyTemplateResponse{
			Success: false,
			Message: "Not a valid policy template field provided",
		})
	}
	pc.policyRepository.DeletePolicyByID(policyTemplate.ID)
	_, err = pc.policyRepository.SavePolicy(policyTemplate)
	if err != nil {
		log.Printf("Could not update policy template: %s", err.Error())
		return c.JSON(model.UpdatePolicyTemplateResponse{
			Success: false,
			Message: "Could not update policy template",
		})
	}

	return c.JSON(model.UpdatePolicyTemplateResponse{
		Success: true,
		Message: "Policy template updated",
	})
}

var tenMostCommonPolicies = []model.ListItem{
	{
		ID:   "93a8af1d-8831-4197-89c0-6d9c9cea8063",
		Text: `Malware — or malicious software — is any program or code that is created with the intent to do harm to a computer, network or server. [Read more](https://www.crowdstrike.com/cybersecurity-101/malware/).`,
	},
	{
		ID:   "7c608e85-2595-47f8-9395-97e55aa586b2",
		Text: `A Denial-of-Service (DoS) attack is a malicious, targeted attack that floods a network with false requests in order to disrupt business operations. [Read more](https://www.crowdstrike.com/cybersecurity-101/denial-of-service-dos-attacks/).`,
	},
	{
		ID:   "fe3ab78a-66d0-4079-932a-db0577ce2284",
		Text: `Phishing is a type of cyberattack that uses email, SMS, phone, social media, and social engineering techniques to entice a victim to share sensitive information or to download a malicious file that will install viruses on their computer or phone. [Read more](https://www.crowdstrike.com/cybersecurity-101/phishing/).`,
	},
	{
		ID:   "aef58afe-d5ae-49de-a3fd-fe2c14ac9c48",
		Text: `Spoofing is a technique through which a cybercriminal disguises themselves as a known or trusted source to be able to engage with the target and access their systems or devices with the ultimate goal of stealing information, extorting money or installing malware or other harmful software on the device. [Read more](https://www.crowdstrike.com/cybersecurity-101/spoofing-attacks/).`,
	},
	{
		ID:   "458b4ac2-8347-439d-9174-583a5a501d55",
		Text: `In identity-based attacks valid user’s credentials have been compromised and an adversary is masquerading as that user. Findings show that 80% of all breaches use compromised identities and can take up to 250 days to identify. [Read more](https://www.crowdstrike.com/cybersecurity-101/identity-security/identity-based-attacks/).`,
	},
	{
		ID:   "11815b28-1396-4dfd-b71e-15248653111f",
		Text: `Code injection attacks consist of an attacker injecting malicious code into a vulnerable computer or network to change its course of action. [Read more](https://www.crowdstrike.com/cybersecurity-101/malicious-code/).`,
	},
	{
		ID:   "c58dc14f-0b22-40ec-bc6c-5829fbeb0ca0",
		Text: `A supply chain attack is a type of cyberattack that targets a trusted third-party vendor who offers services or software vital to the supply chain. [Read more](https://www.crowdstrike.com/cybersecurity-101/malicious-code/).`,
	},
	{
		ID:   "508f3dd8-6995-4a0b-be90-d5bc2ac26333",
		Text: `Insider threats are internal actors such as current or former employees that pose danger to an organization because they have direct access to the company network, sensitive data, and intellectual property (IP), as well as knowledge of business processes, company policies or other information that would help carry out such an attack. [Read more](https://www.crowdstrike.com/cybersecurity-101/insider-threats/).`,
	},
	{
		ID:   "bdded11e-395b-46a0-be31-4d3ac72505ef",
		Text: "DNS Tunneling is a type of cyberattack that leverages domain name system (DNS) queries and responses to bypass traditional security measures and transmit data and code within the network.",
	},
	{
		ID:   "bf400185-76df-4003-973e-124436d19cf3",
		Text: `An IoT attack is any cyberattack that targets an Internet of Things (IoT) device or network. [Read more](https://www.crowdstrike.com/cybersecurity-101/internet-of-things-iot-security/).`,
	},
}

// var policiesMap = map[string][]model.Policy{
// 	"1": {
// 		{
// 			ID:          "e39edc4b-5f19-4210-a576-a8e679717a86",
// 			Name:        "Password",
// 			Description: "How to manage passwords",
// 		},
// 		{
// 			ID:          "00b1ce5e-95f6-4466-952e-754efbbc4224",
// 			Name:        "Phishing",
// 			Description: "Measures against phishing",
// 		},
// 		{
// 			ID:          "454a6288-7c0c-4fc7-9ccd-97e7f293eb19",
// 			Name:        "Devices",
// 			Description: "How to keep your devices secure",
// 		},
// 	},
// 	"2": {
// 		{
// 			ID:          "7d33bc3d-dbd9-40a7-8274-670400aa9ba7",
// 			Name:        "Wireless Networks",
// 			Description: "How to correctly work with wireless networks",
// 		},
// 	},
// 	"3": {
// 		{
// 			ID:          "8b74f14d-a7cb-407b-9098-ebced0ee018b",
// 			Name:        "Report",
// 			Description: "Measures for good reporting",
// 		},
// 		{
// 			ID:          "b6178e38-1cfa-4a26-bb14-ec2d57cf55e6",
// 			Name:        "Software",
// 			Description: "How to securily manange software on devices",
// 		},
// 	},
// 	"5": []model.Policy{},
// 	"6": []model.Policy{},
// 	"7": []model.Policy{},
// 	"8": []model.Policy{},
// }

// var policiesTemplateMap = map[string]model.PolicyTemplate{}

// var policiesDosMap = map[string][]model.ListItem{
// 	"e39edc4b-5f19-4210-a576-a8e679717a86": {
// 		{
// 			ID:   "b86f19da-0bda-44c2-8be3-5396a78f273f",
// 			Text: "Use hard-to-guess passwords or passphrases. A password should have a minimum of 10 characters using uppercase letters, lowercase letters, numbers, and special characters. To make it easy for you to remember but hard for an attacker to guess, create an acronym. For example, pick a phrase that is meaningful to you, such as “My son's birthday is 12 December 2004.” Using that phrase as your guide, you might use Msbi12/Dec,4 for your password.",
// 		},
// 		{
// 			ID:   "cad1fd77-2bdd-44c0-8791-14819a90d9ba",
// 			Text: "Use different passwords for different accounts. If one password gets hacked, your other accounts are not compromised.",
// 		},
// 		{
// 			ID:   "00a24dd6-38c4-4ae6-8e42-6f4e2773470b",
// 			Text: "Keep your passwords or passphrases confidential.",
// 		},
// 	},
// 	"00b1ce5e-95f6-4466-952e-754efbbc4224": {
// 		{
// 			ID:   "772dd04c-fdae-4809-a2a2-dfc0edbc7670",
// 			Text: "Pay attention to phishing traps in email and watch for telltale signs of a scam.",
// 		},
// 	},
// 	"454a6288-7c0c-4fc7-9ccd-97e7f293eb19": {
// 		{
// 			ID:   "fd63b9a3-53bb-4c1f-8ea6-a5505b4d26bc",
// 			Text: "Lock your computer and mobile phone when not in use. This protects data from unauthorized access and use.",
// 		},
// 		{
// 			ID:   "dbeebb13-7a2e-4566-b7e8-4364ec51d118",
// 			Text: "Be aware of your surroundings when printing, copying, faxing or discussing sensitive information. Pick up information from printers, copiers, or faxes in a timely manner.",
// 		},
// 	},
// 	"7d33bc3d-dbd9-40a7-8274-670400aa9ba7": {
// 		{
// 			ID:   "fb6d2f7e-84a8-4fda-ad40-dd4b9c65b9b8",
// 			Text: "Do remember that wireless is inherently insecure. Avoid using public Wi-Fi hotspots. When you must, use agency provided virtual private network software to protect the data and the device.",
// 		},
// 	},
// 	"8b74f14d-a7cb-407b-9098-ebced0ee018b": {
// 		{
// 			ID:   "0be62676-2f05-46a2-8db7-78ead21ceefe",
// 			Text: "Report all suspicious activity and cyber incidents to your manager and ISO/designated security representative. Challenge strangers whom you may encounter in the office.  Keep all areas containing sensitive information physically secured and allow access by authorized individuals only.  Part of your job is making sure NYS data is properly safeguarded, and is not damaged, lost or stolen.",
// 		},
// 	},
// 	"b6178e38-1cfa-4a26-bb14-ec2d57cf55e6": {
// 		{
// 			ID:   "3003fba0-cace-4203-b23b-989004149d49",
// 			Text: "Set Windows or Mac updates to auto-download.",
// 		},
// 		{
// 			ID:   "791e5824-c537-46a5-b9ca-ef6753fbc1c6",
// 			Text: "Regularly update your operating system, Web browser, and other major software, using the manufacturers' update features, preferably using the auto update functionality",
// 		},
// 	},
// }

// var policiesDontsMap = map[string][]model.ListItem{
// 	"e39edc4b-5f19-4210-a576-a8e679717a86": {
// 		{
// 			ID:   "723c8d4d-a222-44fa-9de4-cb5f19371135",
// 			Text: "Don't share your passwords or passphrases with others or write them down. You are responsible for all activities associated with your credentials.",
// 		},
// 	},
// 	"00b1ce5e-95f6-4466-952e-754efbbc4224": {
// 		{
// 			ID:   "88e182c9-aff0-4356-a2e9-6b3ad98e271b",
// 			Text: "Don't open mail or attachments from an untrusted source. If you receive a suspicious email, the best thing to do is to delete the message and report it to your manager and to your IT Support vendor",
// 		},
// 		{
// 			ID:   "0a4caeaa-fcb0-4ef3-a0d2-730462329606",
// 			Text: "Don't click on links from an unknown or untrusted source. Cyber attackers often use them to trick you into visiting malicious sites and downloading malware that can be used to steal data and damage networks.",
// 		},
// 	},
// 	"454a6288-7c0c-4fc7-9ccd-97e7f293eb19": {
// 		{
// 			ID:   "c456806f-e67c-4c07-b0ee-f47be7f461e5",
// 			Text: "Don't install unauthorized programs on your work computer. Malicious applications often pose as legitimate software.",
// 		},
// 		{
// 			ID:   "821dbef5-4714-4b4b-abad-4e98b8a4d6da",
// 			Text: "Don't plug in portable devices without permission from your agency management. These devices may be compromised with code just waiting to launch as soon as you plug them into a computer.",
// 		},
// 		{
// 			ID:   "a3e72a7e-27cb-46b3-ae5c-3417a3a2afaa",
// 			Text: "Don't leave devices unattended. Keep all mobile devices, such as laptops and cell phones physically secured. If a device is lost or stolen, report it immediately to your manager and ISO/designated security representative.",
// 		},
// 	},
// 	"7d33bc3d-dbd9-40a7-8274-670400aa9ba7": {
// 		{
// 			ID:   "9611ce8e-db13-4205-bc60-56f998f41426",
// 			Text: "Don't leave wireless or Bluetooth turned on when not in use. Only do so when planning to use and only in a safe environment.",
// 		},
// 		{
// 			ID:   "bf5f204c-a3cf-4af6-8111-5f2b16c34bc2",
// 			Text: "Don't leave wireless or Bluetooth turned on when not in use. Only do so when planning to use and only in a safe environment.",
// 		},
// 	},
// 	"8b74f14d-a7cb-407b-9098-ebced0ee018b": {},
// 	"b6178e38-1cfa-4a26-bb14-ec2d57cf55e6": {
// 		{
// 			ID:   "749bd99f-bcef-4239-a7d7-8756dfbc61e2",
// 			Text: "Do not install P2P file sharing programs which can illegally download copyrighted material.",
// 		},
// 	},
// }

// var policiesPaginatedTableData = model.PaginatedTableData{
// 	Columns: []model.PaginatedTableColumn{
// 		{
// 			Title: "Name",
// 		},
// 		{
// 			Title: "Description",
// 		},
// 	},
// 	Rows: []model.PaginatedTableRow{},
// }

var policyColumns = []model.PaginatedTableColumn{
	{
		Title: "Name",
	},
	// {
	// 	Title: "Description",
	// },
}
