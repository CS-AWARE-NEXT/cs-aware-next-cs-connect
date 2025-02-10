package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config/db"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
)

type IssueRepository struct {
	db           *db.DB
	queryBuilder sq.StatementBuilderType
}

func NewIssueRepository(db *db.DB) *IssueRepository {
	return &IssueRepository{
		db:           db,
		queryBuilder: db.Builder,
	}
}

// Returns non deleted issues.
func (r *IssueRepository) GetIssues() ([]model.Issue, error) {
	issuesSelect := r.queryBuilder.
		Select("*").
		From("CSFDP_Issue").
		Where(sq.Eq{"DeleteAt": 0})
	var issuesResults []model.Issue
	err := r.db.SelectBuilder(r.db.DB, &issuesResults, issuesSelect)
	if err == sql.ErrNoRows {
		return nil, errors.Wrap(util.ErrNotFound, "no issue found for the given id")
	} else if err != nil {
		return nil, errors.Wrap(err, "failed to get issue for the given id")
	}

	issues := []model.Issue{}
	for _, issue := range issuesResults {
		r.getIssueWithOutcomes(&issue)
		r.getIssueWithRoles(&issue)
		r.getIssueWithElements(&issue)
		r.getIssueWithAttachments(&issue)
		issues = append(issues, issue)
	}

	return issues, nil
}

func (r *IssueRepository) GetIssueByID(id string) (model.Issue, error) {
	issueByIDSelect := r.queryBuilder.
		Select("*").
		From("CSFDP_Issue").
		Where(sq.Eq{"ID": id})
	var issue model.Issue
	err := r.db.GetBuilder(r.db.DB, &issue, issueByIDSelect)
	if err == sql.ErrNoRows {
		return model.Issue{}, errors.Wrap(util.ErrNotFound, "no issue found for the given id")
	} else if err != nil {
		return model.Issue{}, errors.Wrap(err, "failed to get issue for the given id")
	}

	r.getIssueWithOutcomes(&issue)
	r.getIssueWithRoles(&issue)
	r.getIssueWithElements(&issue)
	r.getIssueWithAttachments(&issue)

	return issue, nil
}

func (r *IssueRepository) ExistsIssueByName(name string) bool {
	issueByNameSelect := r.queryBuilder.
		Select("*").
		From("CSFDP_Issue").
		Where(sq.Eq{"Name": name})
	var issues []model.Issue = []model.Issue{}
	err := r.db.SelectBuilder(r.db.DB, &issues, issueByNameSelect)
	if err != nil {
		return true
	}
	return len(issues) > 0
}

func (r *IssueRepository) getIssueWithOutcomes(issue *model.Issue) error {
	outcomesSelect := r.queryBuilder.
		Select("*").
		From("CSFDP_Outcome").
		Where(sq.Eq{"IssueID": issue.ID})
	var outcomes []model.IssueOutcome
	err := r.db.SelectBuilder(r.db.DB, &outcomes, outcomesSelect)
	if err == sql.ErrNoRows {
		return errors.Wrap(util.ErrNotFound, "no outcomes found for the section")
	} else if err != nil {
		return errors.Wrap(err, "failed to get outcomes for the section")
	}
	issue.Outcomes = outcomes
	return nil
}

func (r *IssueRepository) getIssueWithRoles(issue *model.Issue) error {
	rolesSelect := r.queryBuilder.
		Select("*").
		From("CSFDP_Role").
		Where(sq.Eq{"IssueID": issue.ID})
	var rolesEntities []model.IssueRoleEntity
	err := r.db.SelectBuilder(r.db.DB, &rolesEntities, rolesSelect)
	if err == sql.ErrNoRows {
		return errors.Wrap(util.ErrNotFound, "no roles found for the section")
	} else if err != nil {
		return errors.Wrap(err, "failed to get roles for the section")
	}
	roles := []model.IssueRole{}
	for _, roleEntity := range rolesEntities {
		roles = append(roles, model.IssueRole{
			ID:      roleEntity.ID,
			UserID:  roleEntity.UserID,
			Roles:   strings.Split(roleEntity.Roles, ","),
			IssueID: roleEntity.IssueID,
		})
	}
	issue.Roles = roles
	return nil
}

func (r *IssueRepository) getIssueWithElements(issue *model.Issue) error {
	elementsSelect := r.queryBuilder.
		Select("*").
		From("CSFDP_Element").
		Where(sq.Eq{"IssueID": issue.ID})
	var elements []model.IssueElement
	err := r.db.SelectBuilder(r.db.DB, &elements, elementsSelect)
	if err == sql.ErrNoRows {
		return errors.Wrap(util.ErrNotFound, "no elements found for the section")
	} else if err != nil {
		return errors.Wrap(err, "failed to get elements for the section")
	}
	issue.Elements = elements
	return nil
}

func (r *IssueRepository) getIssueWithAttachments(issue *model.Issue) error {
	attachmentsSelect := r.queryBuilder.
		Select("*").
		From("CSFDP_Attachment").
		Where(sq.Eq{"IssueID": issue.ID})
	var attachments []model.IssueAttachment
	err := r.db.SelectBuilder(r.db.DB, &attachments, attachmentsSelect)
	if err == sql.ErrNoRows {
		return errors.Wrap(util.ErrNotFound, "no attachments found for the section")
	} else if err != nil {
		return errors.Wrap(err, "failed to get attachments for the section")
	}
	issue.Attachments = attachments
	return nil
}

func (r *IssueRepository) SaveIssue(issue model.Issue) (model.Issue, error) {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return model.Issue{}, errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	if _, err := r.db.ExecBuilder(tx, sq.
		Insert("CSFDP_Issue").
		SetMap(map[string]interface{}{
			"ID":                        issue.ID,
			"Name":                      issue.Name,
			"ObjectivesAndResearchArea": issue.ObjectivesAndResearchArea,
		})); err != nil {
		return model.Issue{}, errors.Wrap(err, "could not create the new issue")
	}
	if err := r.saveIssueOutcomes(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := r.saveIssueRoles(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := r.saveIssueElements(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := r.saveIssueAttachments(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := tx.Commit(); err != nil {
		return model.Issue{}, errors.Wrap(err, "could not commit transaction")
	}
	return issue, nil
}

func (r *IssueRepository) UpdateIssue(id string, issue model.Issue) (model.Issue, error) {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return model.Issue{}, errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	if _, err := r.db.ExecBuilder(tx, sq.
		Update("CSFDP_Issue").
		Where(sq.Eq{"ID": issue.ID}).
		SetMap(map[string]interface{}{
			"Name":                      issue.Name,
			"ObjectivesAndResearchArea": issue.ObjectivesAndResearchArea,
		})); err != nil {
		return model.Issue{}, errors.Wrap(err, "could not create the new issue")
	}

	// Clean up old linked data
	if err := r.deleteIssueOutcomes(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := r.deleteIssueRoles(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := r.deleteIssueElements(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := r.deleteIssueAttachments(tx, issue); err != nil {
		return model.Issue{}, err
	}

	// And recreate it
	if err := r.saveIssueOutcomes(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := r.saveIssueRoles(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := r.saveIssueElements(tx, issue); err != nil {
		return model.Issue{}, err
	}
	if err := r.saveIssueAttachments(tx, issue); err != nil {
		return model.Issue{}, err
	}

	if err := tx.Commit(); err != nil {
		return model.Issue{}, errors.Wrap(err, "could not commit transaction")
	}

	return issue, nil
}

func (r *IssueRepository) saveIssueOutcomes(tx *sqlx.Tx, issue model.Issue) error {
	for _, outcome := range issue.Outcomes {
		var outcomeMap map[string]interface{}
		outcomeJson, _ := json.Marshal(outcome)
		json.Unmarshal(outcomeJson, &outcomeMap)
		outcomeMap["IssueID"] = issue.ID

		if _, err := r.db.ExecBuilder(tx, sq.
			Insert("CSFDP_Outcome").
			SetMap(outcomeMap)); err != nil {
			return errors.Wrap(err, "could not save outcome")
		}
	}
	return nil
}

func (r *IssueRepository) deleteIssueOutcomes(tx *sqlx.Tx, issue model.Issue) error {
	if _, err := r.db.ExecBuilder(tx, sq.
		Delete("CSFDP_Outcome").
		Where(sq.Eq{"IssueID": issue.ID})); err != nil {
		return errors.Wrap(err, "could not delete issue outcomes")
	}
	return nil
}

func (r *IssueRepository) saveIssueRoles(tx *sqlx.Tx, issue model.Issue) error {
	for _, role := range issue.Roles {
		if _, err := r.db.ExecBuilder(tx, sq.
			Insert("CSFDP_Role").
			SetMap(map[string]interface{}{
				"ID":      role.ID,
				"UserID":  role.UserID,
				"Roles":   strings.Join(role.Roles, ","),
				"IssueID": issue.ID,
			})); err != nil {
			return errors.Wrap(err, "could not save role")
		}
	}
	return nil
}

func (r *IssueRepository) deleteIssueRoles(tx *sqlx.Tx, issue model.Issue) error {
	if _, err := r.db.ExecBuilder(tx, sq.
		Delete("CSFDP_Role").
		Where(sq.Eq{"IssueID": issue.ID})); err != nil {
		return errors.Wrap(err, "could not delete issue roles")
	}
	return nil
}

func (r *IssueRepository) saveIssueElements(tx *sqlx.Tx, issue model.Issue) error {
	for _, element := range issue.Elements {
		var elementMap map[string]interface{}
		elementJson, _ := json.Marshal(element)
		json.Unmarshal(elementJson, &elementMap)
		elementMap["IssueID"] = issue.ID

		if _, err := r.db.ExecBuilder(tx, sq.
			Insert("CSFDP_Element").
			SetMap(elementMap)); err != nil {
			return errors.Wrap(err, "could not save element")
		}
	}
	return nil
}

func (r *IssueRepository) deleteIssueElements(tx *sqlx.Tx, issue model.Issue) error {
	if _, err := r.db.ExecBuilder(tx, sq.
		Delete("CSFDP_Element").
		Where(sq.Eq{"IssueID": issue.ID})); err != nil {
		return errors.Wrap(err, "could not delete issue elements")
	}
	return nil
}

func (r *IssueRepository) saveIssueAttachments(tx *sqlx.Tx, issue model.Issue) error {
	for _, attachment := range issue.Attachments {
		var attachmentMap map[string]interface{}
		attachmentJson, _ := json.Marshal(attachment)
		json.Unmarshal(attachmentJson, &attachmentMap)
		attachmentMap["IssueID"] = issue.ID

		if _, err := r.db.ExecBuilder(tx, sq.
			Insert("CSFDP_Attachment").
			SetMap(attachmentMap)); err != nil {
			return errors.Wrap(err, "could not save attachment")
		}
	}
	return nil
}

func (r *IssueRepository) deleteIssueAttachments(tx *sqlx.Tx, issue model.Issue) error {
	if _, err := r.db.ExecBuilder(tx, sq.
		Delete("CSFDP_Attachment").
		Where(sq.Eq{"IssueID": issue.ID})); err != nil {
		return errors.Wrap(err, "could not delete issue attachments")
	}
	return nil
}

func (r *IssueRepository) DeleteIssueByID(id string) error {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	if _, err := r.db.ExecBuilder(tx, sq.
		Update("CSFDP_Issue").
		Where(sq.Eq{"ID": id}).
		SetMap(map[string]interface{}{
			"DeleteAt": time.Now().UnixMilli(),
		})); err != nil {
		return errors.Wrap(err, fmt.Sprintf("could not delete the issue with id %s", id))
	}
	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}

	return nil
}