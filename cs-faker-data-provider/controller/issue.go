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
	rows := []model.PaginatedTableRow{}
	for _, issue := range issues {
		rows = append(rows, model.PaginatedTableRow{
			ID:          issue.ID,
			Name:        issue.Name,
			Description: issue.Description,
		})
	}
	return c.JSON(model.PaginatedTableData{
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
	issue.ID = util.GenerateUUID()
	issues = append(issues, issue)
	return c.JSON(fiber.Map{
		"id":   issue.ID,
		"name": issue.Name,
	})
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
		Title: "Description",
	},
}
