package controller

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
	"github.com/gofiber/fiber/v2"
)

func GetIssues(c *fiber.Ctx) error {
	rows := []model.IssuePaginatedTableRow{}
	for _, issue := range issues {
		rows = append(rows, model.IssuePaginatedTableRow{
			ID:                        issue.ID,
			Name:                      issue.Name,
			ObjectivesAndResearchArea: issue.ObjectivesAndResearchArea,
		})
	}
	return c.JSON(model.IssuePaginatedTableData{
		Columns: columns,
		Rows:    rows,
	})
}

func GetIssue(c *fiber.Ctx) error {
	id := c.Params("issueId")
	if issue, err := getIssueByID(id); err == nil {
		return c.JSON(issue)
	}
	return c.JSON(model.Issue{})
}

func SaveIssue(c *fiber.Ctx) error {
	var issue model.Issue
	err := json.Unmarshal(c.Body(), &issue)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Not a valid issue provided",
		})
	}
	exists := exists(issue.Name)
	if exists {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": fmt.Sprintf("Issues with name %s already exists", issue.Name),
		})
	}
	filledIssue := fillIssue(issue)
	issues = append(issues, filledIssue)
	return c.JSON(fiber.Map{
		"id":   filledIssue.ID,
		"name": filledIssue.Name,
	})
}

func fillIssue(issue model.Issue) model.Issue {
	issue.ID = util.GenerateUUID()

	outcomes := []model.IssueOutcome{}
	for _, outcome := range issue.Outcomes {
		outcome.ID = util.GenerateUUID()
		outcomes = append(outcomes, outcome) 
	}
	issue.Outcomes = outcomes

	attachments := []model.IssueAttachment{}
	for _, attachment := range issue.Attachments {
		attachment.ID = util.GenerateUUID()
		attachments = append(attachments, attachment) 
	}
	issue.Attachments = attachments

	roles := []model.IssueRole{}
	for _, role := range issue.Roles {
		role.ID = util.GenerateUUID()
		roles = append(roles, role) 
	}
	issue.Roles = roles

	return issue
}

func getIssueByID(id string) (model.Issue, error) {
	for _, issue := range issues {
		if issue.ID == id {
			return issue, nil
		}
	}
	return model.Issue{}, errors.New("not found")
}

func exists(name string) bool {
	for _, issue := range issues {
		if issue.Name == name {
			return true
		}
	}
	return false
}

var issues = []model.Issue{}

var columns = []model.PaginatedTableColumn{
	{
		Title: "Name",
	},
	{
		Title: "Objectives And Research Area",
	},
}
