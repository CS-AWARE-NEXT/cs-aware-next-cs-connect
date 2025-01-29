package controller

import (
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/service"
	"github.com/gofiber/fiber/v2"
)

type IncidentSynthethicController struct {
	authService   *service.AuthService
	graphEndpoint string
}

func NewIncidentSynthethicController(
	authService *service.AuthService,
	graphEndpoint string,
) *IncidentSynthethicController {
	return &IncidentSynthethicController{
		authService:   authService,
		graphEndpoint: graphEndpoint,
	}
}

func (ic *IncidentSynthethicController) GetIncidentsSynthethic(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")

	tableData := model.PaginatedTableData{
		Columns: incidentsSynthethicPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, incident := range incidentsSynthethicMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(incident))
	}
	return c.JSON(tableData)
}

func (ic *IncidentSynthethicController) GetIncidentsSynthethicByOrganizationId(organizationId string) []model.Incident {
	return incidentsSynthethicMap[organizationId]
}

func (ic *IncidentSynthethicController) GetIncidentSynththic(c *fiber.Ctx) error {
	return c.JSON(ic.getIncidentSynthethicByID(c))
}

func (ic *IncidentSynthethicController) GetIncidentSynthethicGraph(c *fiber.Ctx, vars map[string]string) error {
	graphController := NewGraphController(ic.authService, ic.graphEndpoint)
	return graphController.GetGraph(c, vars)
}

func (ic *IncidentSynthethicController) GetIncidentSynthethicTable(c *fiber.Ctx) error {
	incidentId := c.Params("incidentId")
	return c.JSON(model.TableData{
		Caption: incidentsSynthethicTableData.Caption,
		Headers: incidentsSynthethicTableData.Headers,
		Rows:    incidentsSynthethicTableRowsMap[incidentId],
	})
}

func (ic *IncidentSynthethicController) GetIncidentSynthethicTextBox(c *fiber.Ctx) error {
	incidentId := c.Params("incidentId")
	return c.JSON(fiber.Map{"text": incidentsSynthethicTextBoxDataMap[incidentId]})
}

func (ic *IncidentSynthethicController) getIncidentSynthethicByID(c *fiber.Ctx) model.Incident {
	organizationId := c.Params("organizationId")
	incidentId := c.Params("incidentId")
	for _, incident := range incidentsSynthethicMap[organizationId] {
		if incident.ID == incidentId {
			return incident
		}
	}
	return model.Incident{}
}

var incidentsSynthethicMap = map[string][]model.Incident{
	"5": {
		{
			ID:          "03acf120-f08e-40c5-846e-b1c15d80e49e",
			Name:        "Hacked Wordpress Homepage",
			Description: "The homepage of our WordPress website was hacked.",
		},
	},
	"6": {
		{
			ID:          "64f3426b-d757-44fe-af73-ce8cef1be3af",
			Name:        "Phishing Attack Stealing Credentials",
			Description: "Employees were victims of a phishing attack stealing their credentials.",
		},
	},
	"7": {
		{
			ID:          "a67a0081-b6cd-4044-b3e0-d22183cfde35",
			Name:        "Disclosure of Sensitive Information",
			Description: "Sensitive information was disclosed to unauthorized parties.",
		},
	},
	"8": {
		{
			ID:          "1b105086-1d72-40ac-848a-3f43e6ab80b7",
			Name:        "Leakage of Staff Information",
			Description: "Employees were victims of a social engineering attack.",
		},
	},
}

var incidentsSynthethicTextBoxDataMap = map[string]string{
	"03acf120-f08e-40c5-846e-b1c15d80e49e": `On May 23, 2024, the homepage of our WordPress website was hacked.
	Unauthorized changes were detected, including the appearance of malicious content and redirects to an external site.
	Multiple alerts were received from users indicating that the homepage was displaying unusual content and redirecting to a suspicious external website.`,
	"64f3426b-d757-44fe-af73-ce8cef1be3af": `A phishing attack successfully tricked employees into revealing their login credentials.
	Attackers gathered valuable information on interconnected organizations, setting the stage for further attacks.`,
	"1b105086-1d72-40ac-848a-3f43e6ab80b7": `Emails crafted to appear as urgent municipal updates lead to the leakage of senstive information about hospital staff.
	Emails and messages were sent by impersonating people from the municipality.
	The breach resulted in the exposure of sensitive data, creating potential risks of identity theft.`,
	"a67a0081-b6cd-4044-b3e0-d22183cfde35": `Attackers impersonating colleagues from the municipality sent emails to employees, tricking them into revealing sensitive information.`,
}

var incidentsSynthethicTableData = model.TableData{
	Caption: "History",
	Headers: []model.TableHeader{
		{
			Dim:  4,
			Name: "Step",
		},
		{
			Dim:  8,
			Name: "Data",
		},
	},
	Rows: []model.TableRow{},
}

var incidentsSynthethicTableRowsMap = map[string][]model.TableRow{
	"03acf120-f08e-40c5-846e-b1c15d80e49e": {
		{
			ID:   "53bf2a7b-e4f9-408a-909a-489e990df0bb",
			Name: "detection",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "detection",
				},
				{
					Dim:   8,
					Value: `Initial scans confirmed that the WordPress homepage was compromised.`,
				},
			},
		},
		{
			ID:   "1435950a-af77-406d-9206-891ffacb1864",
			Name: "investigation",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "investigation",
				},
				{
					Dim:   8,
					Value: `Analysis of server logs revealed unauthorized access via a vulnerable plugin, which had not been updated.`,
				},
			},
		},
		{
			ID:   "4bc36dec-7e8b-4720-8c04-999750e4fb47",
			Name: "action",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "action",
				},
				{
					Dim:   8,
					Value: `The compromised plugin was disabled.`,
				},
			},
		},
		{
			ID:   "8e72460c-e0dc-40f2-965f-2e52bb50ca8b",
			Name: "resolution",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "resolution",
				},
				{
					Dim:   8,
					Value: `The site was restored from the most recent clean backup.`,
				},
			},
		},
	},
	"64f3426b-d757-44fe-af73-ce8cef1be3af": {
		{
			ID:   "cc5fc224-8ce6-4ec4-a2c2-e356fabb4141",
			Name: "detection",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "detection",
				},
				{
					Dim:   8,
					Value: `Suspicious messages were received by employees under the name of their colleagues.`,
				},
			},
		},
		{
			ID:   "919baa62-6c85-4fdf-9dfc-8a6d35f226ef",
			Name: "investigation",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "investigation",
				},
				{
					Dim:   8,
					Value: `Internal analysis revealed employees were victims of a phishing attack.`,
				},
			},
		},
		{
			ID:   "271e5908-328b-45a7-a570-b06cee3168f1",
			Name: "action",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "action",
				},
				{
					Dim:   8,
					Value: `All compromised accounts were disabled in favor of the creation of new ones.`,
				},
			},
		},
	},
	"1b105086-1d72-40ac-848a-3f43e6ab80b7": {
		{
			ID:   "06bc7983-f586-4215-bf08-d44d156fc9e2",
			Name: "investigation",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "investigation",
				},
				{
					Dim:   8,
					Value: `Internal investigation revealed employees received messages impersonating people from the municipality.`,
				},
			},
		},
		{
			ID:   "0bbb8377-5d50-4aa5-b837-11a780882699",
			Name: "action",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "action",
				},
				{
					Dim:   8,
					Value: `All passwords were updated following the leakage.`,
				},
			},
		},
	},
	"a67a0081-b6cd-4044-b3e0-d22183cfde35": {
		{
			ID:   "7e360405-49f4-4d92-bdcf-078320264290",
			Name: "detection",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "detection",
				},
				{
					Dim:   8,
					Value: `Employees received emails impersonating people from the municipality.`,
				},
			},
		},
		{
			ID:   "e5bf09af-c042-478a-9973-8dff95c52a58",
			Name: "investigation",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "investigation",
				},
				{
					Dim:   8,
					Value: `Employees were tricked into revealing sensitive information.`,
				},
			},
		},
	},
}

var incidentsSynthethicPaginatedTableData = model.PaginatedTableData{
	Columns: []model.PaginatedTableColumn{
		{
			Title: "Name",
		},
		{
			Title: "Description",
		},
	},
	Rows: []model.PaginatedTableRow{},
}
