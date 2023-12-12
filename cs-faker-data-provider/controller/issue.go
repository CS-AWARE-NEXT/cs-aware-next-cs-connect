package controller

import (
	"encoding/json"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
	"github.com/gofiber/fiber/v2"
)

type IssueController struct {
	issueRepository *repository.IssueRepository
}

func NewIssueController(issueRepository *repository.IssueRepository) *IssueController {
	return &IssueController{
		issueRepository: issueRepository,
	}
}

func (ic *IssueController) GetIssues(c *fiber.Ctx) error {
	rows := []model.IssuePaginatedTableRow{}
	issues, err := ic.issueRepository.GetIssues()
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": "Could not get issues",
		})
	}
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

func (ic *IssueController) GetIssue(c *fiber.Ctx) error {
	id := c.Params("issueId")
	if issue, err := ic.issueRepository.GetIssueByID(id); err == nil {
		return c.JSON(issue)
	}
	return c.JSON(model.Issue{})
}

func (ic *IssueController) SaveIssue(c *fiber.Ctx) error {
	var issue model.Issue
	err := json.Unmarshal(c.Body(), &issue)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Not a valid issue provided",
		})
	}
	exists := ic.ExistsIssueByName(issue.Name)
	if exists {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": fmt.Sprintf("Issue with name '%s' already exists", issue.Name),
		})
	}
	savedIssue, err := ic.issueRepository.SaveIssue(fillIssue(issue, false))
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": fmt.Sprintf("Could not save issue due to %s", err.Error()),
		})
	}
	return c.JSON(fiber.Map{
		"id":   savedIssue.ID,
		"name": savedIssue.Name,
	})
}

func (ic *IssueController) UpdateIssue(c *fiber.Ctx) error {
	id := c.Params("issueId")
	var issue model.Issue
	err := json.Unmarshal(c.Body(), &issue)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Not a valid issue provided",
		})
	}

	updatedIssue, err := ic.issueRepository.UpdateIssue(id, fillIssue(issue, true))
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": fmt.Sprintf("Could not update issue due to %s", err.Error()),
		})
	}
	return c.JSON(fiber.Map{
		"id":   updatedIssue.ID,
		"name": updatedIssue.Name,
	})
}

func (ic *IssueController) DeleteIssue(c *fiber.Ctx) error {
	id := c.Params("issueId")
	if err := ic.issueRepository.DeleteIssueByID(id); err != nil {
		return c.JSON(fiber.Map{
			"error": fmt.Sprintf("Could not delete issue due to %s", err.Error()),
		})
	}

	return c.JSON(fiber.Map{})
}

func (ic *IssueController) ExistsIssueByName(name string) bool {
	return ic.issueRepository.ExistsIssueByName(name)
}

func fillIssue(issue model.Issue, skipID bool) model.Issue {
	if !skipID {
		issue.ID = util.GenerateUUID()
	}

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

var columns = []model.PaginatedTableColumn{
	{
		Title: "Name",
	},
	{
		Title: "Objectives And Research Area",
	},
}
