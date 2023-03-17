package route

import (
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/tizianocitro/csa-server/controller"
)

func UseRoutes(app *fiber.App) {
	csaServer := app.Group("/cs-data-provider")
	useOrganizations(csaServer)
	useEcosystem(csaServer)
}

func useOrganizations(csaServer fiber.Router) {
	organizations := csaServer.Group("/organizations")
	organizations.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /organizations called")
		return controller.GetOrganizations(c)
	})
	organizations.Get("/no_page", func(c *fiber.Ctx) error {
		log.Printf("GET /organizations/no_page called")
		return controller.GetOrganizationsNoPage(c)
	})
	organizations.Get("/:organizationId", func(c *fiber.Ctx) error {
		log.Printf("GET /organizations/:organizationId called")
		return controller.GetOrganization(c)
	})
	useOrganizationsIncidents(organizations)
	useOrganizationsStories(organizations)
	useOrganizationsPolicies(organizations)
}

func useOrganizationsIncidents(organizations fiber.Router) {
	incidents := organizations.Group("/:organizationId/incidents")
	incidents.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents called")
		return controller.GetIncidents(c)
	})
	incidentsWithId := incidents.Group("/:incidentId")
	incidentsWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId called")
		return controller.GetIncident(c)
	})
	incidentsWithId.Get("/graph", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId/graph called")
		return controller.GetIncidentGraph(c)
	})
	incidentsWithId.Get("/table", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId/table called")
		return controller.GetIncidentTable(c)
	})
	incidentsWithId.Get("/text_box", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId/text_box called")
		return controller.GetIncidentTextBox(c)
	})
}

func useOrganizationsPolicies(organizations fiber.Router) {
	policies := organizations.Group("/:organizationId/policies")
	policies.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies called")
		return controller.GetPolicies(c)
	})
	policiesWithId := policies.Group("/:policyId")
	policiesWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId called")
		return controller.GetPolicy(c)
	})
	policiesWithId.Get("/dos", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId/dos called")
		return controller.GetPolicyDos(c)
	})
	policiesWithId.Get("/donts", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId/donts called")
		return controller.GetPolicyDonts(c)
	})
}

func useOrganizationsStories(organizations fiber.Router) {
	stories := organizations.Group("/:organizationId/stories")
	stories.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/stories called")
		return controller.GetStories(c)
	})
	stories.Post("/", func(c *fiber.Ctx) error {
		log.Printf("POST /:organizationId/stories called")
		return controller.SaveStory(c)
	})
	storiesWithId := stories.Group("/:storyId")
	storiesWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/stories/:storyId called")
		return controller.GetStory(c)
	})
	storiesWithId.Get("/timeline", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/stories/:storyId/timeline called")
		return controller.GetStoryTimeline(c)
	})
}

func useEcosystem(csaServer fiber.Router) {
	ecosystem := csaServer.Group("/issues")
	ecosystem.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /issues called")
		return controller.GetIssues(c)
	})
	ecosystem.Get("/:issueId", func(c *fiber.Ctx) error {
		log.Printf("GET /issues/:issueId called")
		return controller.GetIssue(c)
	})
	ecosystem.Post("/", func(c *fiber.Ctx) error {
		log.Printf("POST /issues called")
		return controller.SaveIssue(c)
	})
}
