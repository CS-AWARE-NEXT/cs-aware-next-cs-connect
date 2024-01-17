package repository

import (
	"database/sql"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config/db"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

type PolicyRepository struct {
	db           *db.DB
	queryBuilder sq.StatementBuilderType
}

func NewPolicyRepository(db *db.DB) *PolicyRepository {
	return &PolicyRepository{
		db:           db,
		queryBuilder: db.Builder,
	}
}

func (r *PolicyRepository) GetPoliciesByOrganization(organizationId string) ([]model.PolicyTemplate, error) {
	policiesSelect := r.queryBuilder.
		Select("*").
		From("CSFDP_Policy").
		Where(sq.Eq{"OrganizationID": organizationId})
	var policiesResults []model.PolicyTemplate
	err := r.db.SelectBuilder(r.db.DB, &policiesResults, policiesSelect)
	if err == sql.ErrNoRows {
		return nil, errors.Wrap(util.ErrNotFound, "no policy found for the given id")
	} else if err != nil {
		return nil, errors.Wrap(err, "failed to get policy for the given id")
	}

	policies := []model.PolicyTemplate{}
	for _, policy := range policiesResults {
		r.getPolicyWithPurpose(&policy)
		r.getPolicyWithElements(&policy)
		r.getPolicyWithNeed(&policy)
		r.getPolicyWithRoles(&policy)
		r.getPolicyWithReferences(&policy)
		policies = append(policies, policy)
	}

	return policies, nil
}

func (r *PolicyRepository) GetPolicyByID(id string) (model.PolicyTemplate, error) {
	policyByIDSelect := r.queryBuilder.
		Select("*").
		From("CSFDP_Policy").
		Where(sq.Eq{"ID": id})
	var policy model.PolicyTemplate
	err := r.db.GetBuilder(r.db.DB, &policy, policyByIDSelect)
	if err == sql.ErrNoRows {
		return model.PolicyTemplate{}, errors.Wrap(util.ErrNotFound, "no issue found for the given id")
	} else if err != nil {
		return model.PolicyTemplate{}, errors.Wrap(err, "failed to get issue for the given id")
	}

	r.getPolicyWithPurpose(&policy)
	r.getPolicyWithElements(&policy)
	r.getPolicyWithNeed(&policy)
	r.getPolicyWithRoles(&policy)
	r.getPolicyWithReferences(&policy)

	return policy, nil
}

func (r *PolicyRepository) getPolicyWithPurpose(policy *model.PolicyTemplate) error {
	purposeSelect := r.queryBuilder.
		Select("Purpose").
		From("CSFDP_Policy_Purpose").
		Where(sq.Eq{"PolicyID": policy.ID})
	var purpose []string
	err := r.db.SelectBuilder(r.db.DB, &purpose, purposeSelect)
	if err == sql.ErrNoRows {
		return errors.Wrap(util.ErrNotFound, "no purpose found for the section")
	} else if err != nil {
		return errors.Wrap(err, "failed to get purpose for the section")
	}
	policy.Purpose = purpose
	return nil
}

func (r *PolicyRepository) getPolicyWithElements(policy *model.PolicyTemplate) error {
	elementsSelect := r.queryBuilder.
		Select("Element").
		From("CSFDP_Policy_Element").
		Where(sq.Eq{"PolicyID": policy.ID})
	var elements []string
	err := r.db.SelectBuilder(r.db.DB, &elements, elementsSelect)
	if err == sql.ErrNoRows {
		return errors.Wrap(util.ErrNotFound, "no elements found for the section")
	} else if err != nil {
		return errors.Wrap(err, "failed to get elements for the section")
	}
	policy.Elements = elements
	return nil
}

func (r *PolicyRepository) getPolicyWithNeed(policy *model.PolicyTemplate) error {
	needSelect := r.queryBuilder.
		Select("Need").
		From("CSFDP_Policy_Need").
		Where(sq.Eq{"PolicyID": policy.ID})
	var need []string
	err := r.db.SelectBuilder(r.db.DB, &need, needSelect)
	if err == sql.ErrNoRows {
		return errors.Wrap(util.ErrNotFound, "no need found for the section")
	} else if err != nil {
		return errors.Wrap(err, "failed to get need for the section")
	}
	policy.Need = need
	return nil
}

func (r *PolicyRepository) getPolicyWithRoles(policy *model.PolicyTemplate) error {
	rolesSelect := r.queryBuilder.
		Select("Role").
		From("CSFDP_Policy_Role").
		Where(sq.Eq{"PolicyID": policy.ID})
	var roles []string
	err := r.db.SelectBuilder(r.db.DB, &roles, rolesSelect)
	if err == sql.ErrNoRows {
		return errors.Wrap(util.ErrNotFound, "no roles found for the section")
	} else if err != nil {
		return errors.Wrap(err, "failed to get roles for the section")
	}
	policy.RolesAndResponsibilities = roles
	return nil
}

func (r *PolicyRepository) getPolicyWithReferences(policy *model.PolicyTemplate) error {
	referencesSelect := r.queryBuilder.
		Select("Reference").
		From("CSFDP_Policy_Reference").
		Where(sq.Eq{"PolicyID": policy.ID})
	var references []string
	err := r.db.SelectBuilder(r.db.DB, &references, referencesSelect)
	if err == sql.ErrNoRows {
		return errors.Wrap(util.ErrNotFound, "no roles found for the section")
	} else if err != nil {
		return errors.Wrap(err, "failed to get roles for the section")
	}
	policy.References = references
	return nil
}

func (r *PolicyRepository) SavePolicy(policy model.PolicyTemplate) (model.PolicyTemplate, error) {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return model.PolicyTemplate{}, errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	if _, err := r.db.ExecBuilder(tx, sq.
		Insert("CSFDP_Policy").
		SetMap(map[string]interface{}{
			"ID":             policy.ID,
			"Name":           policy.Name,
			"Description":    policy.Description,
			"OrganizationID": policy.OrganizationId,
		})); err != nil {
		return model.PolicyTemplate{}, errors.Wrap(err, "could not create the new issue")
	}
	if err := r.savePolicyPurpose(tx, policy); err != nil {
		return model.PolicyTemplate{}, err
	}
	if err := r.savePolicyElements(tx, policy); err != nil {
		return model.PolicyTemplate{}, err
	}
	if err := r.savePolicyNeed(tx, policy); err != nil {
		return model.PolicyTemplate{}, err
	}
	if err := r.savePolicyRoles(tx, policy); err != nil {
		return model.PolicyTemplate{}, err
	}
	if err := r.savePolicyReferences(tx, policy); err != nil {
		return model.PolicyTemplate{}, err
	}
	if err := tx.Commit(); err != nil {
		return model.PolicyTemplate{}, errors.Wrap(err, "could not commit transaction")
	}
	return policy, nil
}

func (r *PolicyRepository) savePolicyPurpose(tx *sqlx.Tx, policy model.PolicyTemplate) error {
	for _, purpose := range policy.Purpose {
		if _, err := r.db.ExecBuilder(tx, sq.
			Insert("CSFDP_Policy_Purpose").
			SetMap(map[string]interface{}{
				"Purpose":  purpose,
				"PolicyID": policy.ID,
			})); err != nil {
			return errors.Wrap(err, "could not save purpose")
		}
	}
	return nil
}

func (r *PolicyRepository) savePolicyElements(tx *sqlx.Tx, policy model.PolicyTemplate) error {
	for _, element := range policy.Elements {
		if _, err := r.db.ExecBuilder(tx, sq.
			Insert("CSFDP_Policy_Element").
			SetMap(map[string]interface{}{
				"Element":  element,
				"PolicyID": policy.ID,
			})); err != nil {
			return errors.Wrap(err, "could not save element")
		}
	}
	return nil
}

func (r *PolicyRepository) savePolicyNeed(tx *sqlx.Tx, policy model.PolicyTemplate) error {
	for _, need := range policy.Need {
		if _, err := r.db.ExecBuilder(tx, sq.
			Insert("CSFDP_Policy_Need").
			SetMap(map[string]interface{}{
				"Need":     need,
				"PolicyID": policy.ID,
			})); err != nil {
			return errors.Wrap(err, "could not save need")
		}
	}
	return nil
}

func (r *PolicyRepository) savePolicyRoles(tx *sqlx.Tx, policy model.PolicyTemplate) error {
	for _, role := range policy.RolesAndResponsibilities {
		if _, err := r.db.ExecBuilder(tx, sq.
			Insert("CSFDP_Policy_Role").
			SetMap(map[string]interface{}{
				"Role":     role,
				"PolicyID": policy.ID,
			})); err != nil {
			return errors.Wrap(err, "could not save role")
		}
	}
	return nil
}

func (r *PolicyRepository) savePolicyReferences(tx *sqlx.Tx, policy model.PolicyTemplate) error {
	for _, reference := range policy.References {
		if _, err := r.db.ExecBuilder(tx, sq.
			Insert("CSFDP_Policy_Reference").
			SetMap(map[string]interface{}{
				"Reference": reference,
				"PolicyID":  policy.ID,
			})); err != nil {
			return errors.Wrap(err, "could not save reference")
		}
	}
	return nil
}

func (r *PolicyRepository) DeletePolicyByID(id string) error {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	if _, err := r.db.ExecBuilder(tx, sq.
		Delete("CSFDP_Policy").
		Where(sq.Eq{"ID": id})); err != nil {
		return errors.Wrap(err, fmt.Sprintf("could not delete the policy with id %s", id))
	}
	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}

	return nil
}
