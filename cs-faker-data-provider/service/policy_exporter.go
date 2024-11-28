package service

import (
	"log"
	"strings"
	"time"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
)

type PolicyExporter interface {
	ExportPolicy(policy model.PolicyTemplate, firstMessageTime int64, organizationName string) (model.JSONPolicy, error)
}

type JSONPolicyExporter struct {
	postRepository repository.PostRepository
	ecosystemId    string
}

func NewJSONPolicyExporter(postRepository repository.PostRepository, ecosystemId string) *JSONPolicyExporter {
	return &JSONPolicyExporter{
		postRepository: postRepository,
		ecosystemId:    ecosystemId,
	}
}

func (pe *JSONPolicyExporter) ExportPolicy(
	policyTemplate model.PolicyTemplate,
	organizationName string,
) (model.JSONPolicy, error) {
	jsonPolicyTemplate, err := pe.toJSONPolicyTemplate(
		policyTemplate,
		organizationName,
	)
	if err != nil {
		return model.JSONPolicy{}, err
	}

	return model.JSONPolicy{
		Policy: jsonPolicyTemplate,
		Tags:   pe.getTags(policyTemplate),
	}, nil
}

func (pe *JSONPolicyExporter) toJSONPolicyTemplate(
	policyTemplate model.PolicyTemplate,
	organizationName string,
) (model.JSONPolicyTemplate, error) {
	return model.JSONPolicyTemplate{
		ID:           policyTemplate.ID,
		Name:         policyTemplate.Name,
		Organization: organizationName,

		// EcosystemID:  pe.ecosystemId,

		DateCreated: util.ConvertUnixMilliToUTC(pe.getFirstMessageTime(policyTemplate)),
		LastUpdated: util.ConvertUnixMilliToUTC(time.Now().UnixMilli()),

		Purpose:                  pe.getPurpose(policyTemplate),
		Elements:                 pe.getElements(policyTemplate),
		Need:                     pe.getNeed(policyTemplate),
		RolesAndResponsibilities: pe.getRoles(policyTemplate),
		References:               pe.getReferences(policyTemplate),
		Tags:                     pe.getTags(policyTemplate),
	}, nil
}

func (pe *JSONPolicyExporter) getPurpose(policyTemplate model.PolicyTemplate) string {
	purposes := []string{}
	for _, purpose := range policyTemplate.Purpose {
		post, err := pe.postRepository.GetPostByID(purpose)
		if err != nil {
			continue
		}
		purposes = append(purposes, post.Message)
	}
	purpose := strings.Join(purposes, "\n")
	return purpose
}

func (pe *JSONPolicyExporter) getNeed(policyTemplate model.PolicyTemplate) string {
	needs := []string{}
	for _, n := range policyTemplate.Need {
		post, err := pe.postRepository.GetPostByID(n)
		if err != nil {
			continue
		}
		needs = append(needs, post.Message)
	}
	need := strings.Join(needs, "\n")
	return need
}

func (pe *JSONPolicyExporter) getElements(policyTemplate model.PolicyTemplate) string {
	elements := []string{}
	for _, e := range policyTemplate.Elements {
		post, err := pe.postRepository.GetPostByID(e)
		if err != nil {
			continue
		}
		elements = append(elements, post.Message)
	}
	element := strings.Join(elements, "\n")
	return element
}

func (pe *JSONPolicyExporter) getRoles(policyTemplate model.PolicyTemplate) string {
	roles := []string{}
	for _, r := range policyTemplate.RolesAndResponsibilities {
		post, err := pe.postRepository.GetPostByID(r)
		if err != nil {
			continue
		}
		roles = append(roles, post.Message)
	}
	role := strings.Join(roles, "\n")
	return role
}

func (pe *JSONPolicyExporter) getReferences(policyTemplate model.PolicyTemplate) string {
	references := []string{}
	for _, r := range policyTemplate.References {
		post, err := pe.postRepository.GetPostByID(r)
		if err != nil {
			continue
		}
		references = append(references, post.Message)
	}
	reference := strings.Join(references, "\n")
	return reference
}

func (pe *JSONPolicyExporter) getTags(policyTemplate model.PolicyTemplate) []string {
	tags := []string{}
	for _, tag := range policyTemplate.Tags {
		post, err := pe.postRepository.GetPostByID(tag)
		if err != nil {
			log.Printf("Skipping post with ID %s because of %s", tag, err)
			continue
		}
		tags = append(tags, post.Message)
	}
	return tags
}

func (pe *JSONPolicyExporter) getFirstMessageTime(policyTemplate model.PolicyTemplate) int64 {
	posts := []model.Post{}
	for _, purpose := range policyTemplate.Purpose {
		post, err := pe.postRepository.GetPostByID(purpose)
		if err != nil {
			continue
		}
		posts = append(posts, post)
	}
	for _, element := range policyTemplate.Elements {
		post, err := pe.postRepository.GetPostByID(element)
		if err != nil {
			continue
		}
		posts = append(posts, post)
	}
	for _, need := range policyTemplate.Need {
		post, err := pe.postRepository.GetPostByID(need)
		if err != nil {
			continue
		}
		posts = append(posts, post)
	}
	for _, role := range policyTemplate.RolesAndResponsibilities {
		post, err := pe.postRepository.GetPostByID(role)
		if err != nil {
			continue
		}
		posts = append(posts, post)
	}
	for _, reference := range policyTemplate.References {
		post, err := pe.postRepository.GetPostByID(reference)
		if err != nil {
			continue
		}
		posts = append(posts, post)
	}
	for _, tag := range policyTemplate.Tags {
		post, err := pe.postRepository.GetPostByID(tag)
		if err != nil {
			continue
		}
		posts = append(posts, post)
	}

	var firstMessageTime int64
	for _, post := range posts {
		if post.CreateAt < firstMessageTime || firstMessageTime == 0 {
			firstMessageTime = post.CreateAt
		}
	}

	return firstMessageTime
}
