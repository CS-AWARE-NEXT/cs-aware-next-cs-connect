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
	savedIssue, err := ic.issueRepository.SaveIssue(fillIssue(issue, nil))
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

	oldIssue, _ := ic.issueRepository.GetIssueByID(id)

	updatedIssue, err := ic.issueRepository.UpdateIssue(id, fillIssue(issue, &oldIssue))
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error": fmt.Sprintf("Could not update issue due to %s", err.Error()),
		})
	}
	return c.JSON(updatedIssue)
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

// For issues to save, UUIDs are generated for all items.
// For issues to update, UUIDs are kept when possible, unless the data of an item changed anyhow.
// In particular, UUIDs are regenerated for roles only if the userID changes.
func fillIssue(issue model.Issue, oldIssue *model.Issue) model.Issue {
	if oldIssue == nil {
		issue.ID = util.GenerateUUID()
	}

	outcomes := []model.IssueOutcome{}
	for _, outcome := range issue.Outcomes {
		outcome.ID = util.GenerateUUID()

		// Keep the ID of unchanged outcomes to prevent old hyperlinks from breaking
		if oldIssue != nil {
			for _, oldOutcome := range oldIssue.Outcomes {
				if oldOutcome.Outcome == outcome.Outcome {
					outcome.ID = oldOutcome.ID
					break
				}
			}
		}

		outcomes = append(outcomes, outcome)
	}
	issue.Outcomes = outcomes

	attachments := []model.IssueAttachment{}
	for _, attachment := range issue.Attachments {
		attachment.ID = util.GenerateUUID()

		// Keep the ID of unchanged attachments to prevent old hyperlinks from breaking
		if oldIssue != nil {
			for _, oldAttachment := range oldIssue.Attachments {
				if oldAttachment.Attachment == attachment.Attachment {
					attachment.ID = oldAttachment.ID
					break
				}
			}
		}

		attachments = append(attachments, attachment)
	}
	issue.Attachments = attachments

	roles := []model.IssueRole{}
	for _, role := range issue.Roles {
		role.ID = util.GenerateUUID()

		// Keep the ID roles if the user's the same to prevent old hyperlinks from breaking
		if oldIssue != nil {
			for _, oldRole := range oldIssue.Roles {
				if oldRole.UserID == role.UserID {
					role.ID = oldRole.ID
					break
				}
			}
		}

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
		Title: "Summary Of Event and Questions For Ecosystem",
	},
}
