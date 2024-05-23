package controller

import (
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2"
)

type IncidentSynthethicController struct{}

func NewIncidentSynthethicController() *IncidentSynthethicController {
	return &IncidentSynthethicController{}
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

func (ic *IncidentSynthethicController) GetIncidentSynthethicGraph(c *fiber.Ctx) error {
	graphController := NewGraphController()
	return graphController.GetGraph(c)
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
}

var incidentsSynthethicTextBoxDataMap = map[string]string{
	"03acf120-f08e-40c5-846e-b1c15d80e49e": `On May 23, 2024, the homepage of our WordPress website was hacked.
	Unauthorized changes were detected, including the appearance of malicious content and redirects to an external site.
	Multiple alerts were received from users indicating that the homepage was displaying unusual content and redirecting to a suspicious external website.`,
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
			Name: "ipv4-addr",
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
